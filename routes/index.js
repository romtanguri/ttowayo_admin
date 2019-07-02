const express = require('express');
const router = express.Router();
const {selectDbExecute, fnDate, formatNumber, createLog, jsonStringify} = require('../com/utils_function');
const {couponPublishCntQuery, couponUseCntQuery, stampSavingCntQuery, pointSavingCntQuery, newMembershipCntQuery} = require('../sql/com');
const {storeList} = require('../com/com_function');
const moment = require('moment');

/* GET home page. */
router.get('/', async function (req, res, next) {
  let currentDay = new Date();
  let dateType = req.query.dateType;
  let dateResult = fnDate(currentDay, dateType);
  let startDate = dateResult.startDate;
  let endDate =  dateResult.endDate;
  let storesResult = await storeList();

  let stores = [];
  for (const store of storesResult) {
    // 적립 쿠폰 카운트
    let [savingCouponCntResult] = await selectDbExecute(couponPublishCntQuery(store.store_id,'S', startDate, endDate));
    store.savingCouponCnt = formatNumber(savingCouponCntResult.couponPublishCnt);

    let [savingCouponUseCntResult] = await selectDbExecute(couponUseCntQuery(store.store_id,'S', startDate, endDate));
    store.savingCouponUseCnt = formatNumber(savingCouponUseCntResult.couponUseCnt);

    // 이벤트 쿠폰 카운트
    let [eventCouponCntResult] = await selectDbExecute(couponPublishCntQuery(store.store_id,'M', startDate, endDate));
    store.eventCouponCnt = formatNumber(eventCouponCntResult.couponPublishCnt);

    let [eventCouponUseCntResult] = await selectDbExecute(couponUseCntQuery(store.store_id,'M', startDate, endDate));
    store.eventCouponUseCnt = formatNumber(eventCouponUseCntResult.couponUseCnt);

    // 적립 수
    if (store.saving_type === 'S') {
      let [stampSavingCntResult] = await selectDbExecute(stampSavingCntQuery(store.store_id,  startDate, endDate));
      store.savingCnt = formatNumber(parseInt(stampSavingCntResult.savingCnt));
      store.savingHistoryCnt = formatNumber(parseInt(stampSavingCntResult.savingHistoryCnt));
      if (store.savingHistoryCnt > 0) {
        store.savingAvg = Number((parseInt(stampSavingCntResult.savingCnt) / parseInt(stampSavingCntResult.savingHistoryCnt)).toFixed(1));
      } else {
        store.savingAvg = 0;
      }
    } else {
      let [pointSavingCntResult] = await selectDbExecute(pointSavingCntQuery(store.store_id, startDate, endDate));
      store.savingCnt = formatNumber(parseInt(pointSavingCntResult.savingCnt));
      store.savingHistoryCnt = formatNumber(parseInt(pointSavingCntResult.savingHistoryCnt));
      if (store.savingHistoryCnt > 0) {
        store.savingAvg = Number((parseInt(pointSavingCntResult.savingCnt) / parseInt(pointSavingCntResult.savingHistoryCnt)).toFixed(1));
      } else {
        store.savingAvg = 0;
      }
    }

    let [newMembershipCntResult] = await selectDbExecute(newMembershipCntQuery(store.store_id,  startDate, endDate));

    store.newMembershipCnt = formatNumber(newMembershipCntResult.newMembershipCnt);
    stores.push(store);
  }

  let loggedIn = req.session.loggedIn;
  if (loggedIn) {
    res.render('index', {
      dateType,
      startDate:moment(startDate).format('YYYY년 MM월 DD일'),
      endDate:moment(endDate).format('YYYY년 MM월 DD일'),
      stores,
      status: 'true',
      username: req.session.username,
      loggedIn: req.session.loggedIn
    });
  } else {
    res.redirect('/auth');
  }
});

module.exports = router;
