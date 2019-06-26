const express = require('express');
const router = express.Router();
const pool = require('../config/db_connection');
const moment = require('moment');
const {dbAffectedRows, selectDbExecute, fnLatLong, filter, shortUrl, createLog} = require('../com/utils_function');
const {
  signUpListQuery, signUpListSearchQuery, signUpDetailQuery, signUpStoreIdQuery, storeInsertQuery, signUpCompleteUpdateQuery,
  signUpUpdateQuery, userInsertQuery, posIdQuery, posIdInsertQuery, msgListQuery,
  storeMsgInsertQuery, storeSavingInsertQuery, storeSavingCouponInsertQuery, campaignListQuery, storeCampaignInsertQuery
} = require('../sql/signup');
const {storeList} = require('../com/com_function');
const uuidv4 = require('uuid/v4');

/**
 * 가입신청 리스트
 */
router.get('/signUpL', async function (req, res, next) {
  let loggedIn = req.session.loggedIn;
  if (loggedIn) {
    let signUpListResult = await selectDbExecute(signUpListQuery);
    res.render('signup/signUpList', {signUpListResult: signUpListResult, username: req.session.username});
  } else {
    res.redirect('/auth');
  }
});

/**
 * 가입신청 검색 리스트
 */
router.get('/signUpLS', async function (req, res, next) {
  let data = req.query;
  let signUpListResult = await selectDbExecute(signUpListSearchQuery(data));
  res.render('signup/signUpList', {
    signUpListResult: signUpListResult,
    searchData: data,
    username: req.session.username
  });
});

/**
 * 가입신청 상세
 */
router.get('/signUpD', async function (req, res, next) {
  let signUpDetailResult = await selectDbExecute(signUpDetailQuery(req.query.id));
  res.render('signup/signUpDetail', {signUpDetail: signUpDetailResult})
});

/**
 * 가입신청 수정
 */
router.post('/signUpU', async function (req, res, next) {
  let data = req.body;

  if (data.store_saving_type === 'P') {
    data.store_saving_cnt = data.store_point_cnt;
  }

  let passwordResult = await selectDbExecute(signUpDetailQuery(data.store_signup_no));
  data.manager_password = passwordResult[0].manager_password;
  let result = await dbAffectedRows(signUpUpdateQuery(data));

  if (result) {
    res.json({msg: "가입신청서가 수정되었습니다.", status: 200});
  } else {
    res.json({msg: "에러가 발생했습니다."});
  }

});

/**
 * 가입신청 등록
 */
router.post('/signUpStoreI', async function (req, res, next) {

  let data = req.body;

  if (data.store_signup_status_type === 'C') {
    res.json({success: "매장 등록이 완료된 매장입니다.", status: 200});
  } else {
    let storeNo = await selectDbExecute(signUpStoreIdQuery);
    let storeId = 'TSC' + storeNo[0].no;
    let address = req.body.store_address;
    let latLong = await fnLatLong(address);
    let store_latitude = latLong.lat;
    let store_longitude = latLong.long;
    let savingType = data.store_saving_type;

    if (savingType === 'S') {
      data.store_service_type = 'SG';
    } else if (savingType === 'P') {
      data.store_service_type = 'PG';
    }

    data.store_id = storeId;
    data.store_latitude = store_latitude;
    data.store_longitude = store_longitude;

    const connection = await pool.getConnection(async conn => conn);
    await connection.beginTransaction();
    try {
      //0. 가입신청서 업데이트
      let signUpUpdateResult = await connection.query(signUpCompleteUpdateQuery(data));
      if (signUpUpdateResult[0].affectedRows > 0) {
        //1. 매장 등록
        let storeInsertResult = await connection.query(storeInsertQuery(data));
        if (storeInsertResult[0].affectedRows > 0) {
          //2. 아이디 / 패스워드 생성
          let userInsertResult = await connection.query(userInsertQuery(data));
          if (userInsertResult[0].affectedRows > 0) {
            //3. 적립 정보 저장
            if (savingType === 'P') {
              data.store_saving_rate = data.store_point_cnt;
              data.store_saving_cnt = data.point_use_cnt;
            } else {
              data.store_saving_rate = 1;
            }

            let storeSavingInfoInsertResult = await connection.query(storeSavingInsertQuery(data));

            if (storeSavingInfoInsertResult[0].affectedRows > 0) {
              //4. 적립 쿠폰 저장
              let storeSavingCouponResult = 0;

              if (savingType === 'S') {
                let storeSavingCouponInsertResult = await connection.query(storeSavingCouponInsertQuery(data));
                storeSavingCouponResult = storeSavingCouponInsertResult[0].affectedRows;
              } else {
                storeSavingCouponResult = 1;
              }

              if (storeSavingCouponResult > 0) {
                //5. POS 아이디 패스워드 생성
                let [posIdResult] = await connection.query(posIdQuery);
                data.socket_qrcode_val = await uuidv4();
                data.socket_qrcode_url = await shortUrl(`https://a.ttowayo.com/${data.store_id}/qr/${data.socket_qrcode_val}?qrscan=ok`);
                let posIdInsertResult = await connection.query(posIdInsertQuery(data, posIdResult[0].no));

                //6. 문자 메시지 등록
                if (posIdInsertResult[0].affectedRows > 0) {
                  let msgListResult = await connection.query(msgListQuery);

                  let msgInsertResult = [];
                  for (let i = 0; i < msgListResult[0].length; i++) {
                    let msgListData = msgListResult[0][i];
                    switch (msgListData.msg_purpose) {
                      case 'SS':
                        msgListData.active_yn = data.msg_ss_yn;
                        break;
                      case 'SC':
                        msgListData.active_yn = data.msg_sc_yn;
                        break;
                      case 'PS':
                        msgListData.active_yn = data.msg_ps_yn;
                        break;
                      case 'PD':
                        msgListData.active_yn = data.msg_pd_yn;
                        break;
                      case 'CU':
                        msgListData.active_yn = data.msg_cu_yn;
                        break;
                      case 'GA':
                        msgListData.active_yn = data.msg_ga_yn;
                        break;
                      case 'GB':
                        msgListData.active_yn = data.msg_gb_yn;
                        break;
                      case 'ce':
                        msgListData.active_yn = data.msg_ce_yn;
                        break;
                      case 'ge':
                        msgListData.active_yn = data.msg_ge_yn;
                        break;
                    }
                    msgListData.store_id = storeId;
                    let storeMsgInsertResult = await connection.query(storeMsgInsertQuery(msgListData));
                    msgInsertResult.push(storeMsgInsertResult[0].affectedRows);
                  }

                  for (const result of msgInsertResult) {
                    if (result === 0) {
                      res.json({msg: "문자메시지 등록 시 에러가 발생했습니다."});
                      return;
                    }
                  }

                  //7. 기본 캠페인 등록
                  let campaignListResult = await connection.query(campaignListQuery);
                  let campaignInsertResult = [];
                  for (let i = 0; i < campaignListResult[0].length; i++) {
                    let campaignListData = campaignListResult[0][i];
                    campaignListData.store_id = storeId;
                    let storeCampaignInsertResult = await connection.query(storeCampaignInsertQuery(campaignListData));
                    campaignInsertResult.push(storeCampaignInsertResult[0].affectedRows);
                  }
                  for (const result of campaignInsertResult) {
                    if (result === 0) {
                      res.json({msg: "캠페인 등록 시 에러가 발생했습니다."});
                      return;
                    }
                  }

                } // if posId 등록여부
              } // if 적립 쿠폰 저장

            } else {
              createLog('err','적립정보 등록 시 에러가 발생했습니다.');
              res.json({msg: "적립정보 등록 시 에러가 발생했습니다."});
            }
          } else {
            createLog('err','유저 등록 시 에러가 발생했습니다.');
            res.json({msg: "유저 등록 시 에러가 발생했습니다."});
          }
        } else {
          createLog('err','매장 등록 시 에러가 발생했습니다.');
          res.json({msg: "매장 등록 시 에러가 발생했습니다."});
        }

        await connection.commit();
        res.json({msg: '매장 등록 성공', status: 200});
      } else {
        await connection.rollback();
        createLog('err','가입신청서 업데이트 에러가 발생했습니다');
        res.json({msg: "가입신청서 업데이트 에러가 발생했습니다."});
        return;
      }
    } catch (e) {
      await connection.rollback();
      createLog('err',"에러가 발생했습니다.", e);
      res.json({msg: "에러가 발생했습니다.", status: 500});
    }
    connection.release();
  }
});

router.get('/bizInfoStoreL', async function (req, res, next) {

  let loggedIn = req.session.loggedIn;
  if (loggedIn) {
    let storeListResult = await storeList();
    let storesResult = filter(store => store.store_app_operation_yn === 'N', storeListResult);
    let bizInfoStores = filter(store => (parseInt(store.store_contract_step) > 1 && parseInt(store.store_contract_step) < 4), storesResult);
    res.render('signup/bizInfoStoreList', {bizInfoStores: bizInfoStores})
  } else {
    res.redirect('/auth');
  }

});


module.exports = router;