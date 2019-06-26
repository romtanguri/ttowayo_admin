let signUpListQuery = `SELECT * 
                                ,DATE_FORMAT(completed_date, "%Y년 %m월 %d일 %r") AS completed_date
                                ,DATE_FORMAT(reg_date, "%Y년 %m월 %d일 %r") AS reg_date
                                ,DATE_FORMAT(up_date, "%Y년 %m월 %d일 %r") AS up_date
                                FROM tb_store_signup 
                                ORDER BY reg_date DESC`;

let signUpListSearchQuery = (data) => {
  // sn=&st=C&svt=S&ed=&sd=

  let statusTypeCon = '';
  let savingTypeCon = '';
  let regDateCon = '';
  if (data.st !== '') {
    statusTypeCon =  `AND store_signup_status_type = '${data.st}'`;
  }

  if (data.svt !== '') {
    savingTypeCon = `AND store_saving_type = '${data.svt}'`;
  }

  if (data.sd !== '' && data.ed !== '') {
    regDateCon = `AND DATE(reg_date) BETWEEN  DATE('${data.sd}') AND DATE('${data.ed}')`
  }

  return `SELECT * 
            ,DATE_FORMAT(completed_date, "%Y년 %m월 %d일 %r") AS completed_date
            ,DATE_FORMAT(reg_date, "%Y년 %m월 %d일 %r") AS reg_date
            ,DATE_FORMAT(up_date, "%Y년 %m월 %d일 %r") AS up_date
            FROM tb_store_signup 
            WHERE store_full_name like '%${data.sn}%'
            ${statusTypeCon}
            ${savingTypeCon}
            ${regDateCon}
            ORDER BY reg_date DESC`;
};

let signUpDetailQuery = function (id) {
  console.log(`${id}`);
  return `SELECT * FROM tb_store_signup WHERE store_signup_no = ${id} ORDER BY reg_date DESC`;
};

let signUpStoreIdQuery = `SELECT MAX(store_no) + 1 as no
                          FROM tb_store`;

let storeInsertQuery = (data) => {
  return `INSERT INTO tb_store (
              store_id,
              store_app_operation_yn,
              store_partner_yn,
              store_partner_share_yn,
              store_name,
              store_branch_name,
              store_full_name,
              store_saving_desc,
              store_list_event_yn,
              store_list_event_title,
              store_description,
              store_president_name,
              store_zip_code,
              store_address,
              store_address_detail,
              store_business_number,
              store_business_file_url,
              store_contract_status_type,
              store_contract_begindate,
              store_contract_finishdate,
              store_contract_file_url,
              store_contract_step,
              store_operator_name,
              store_operator_email,
              store_operator_phone,
              store_email,
              store_phone,
              store_bank_name,
              store_account,
              store_use_fees,
              store_shopping_fees,
              store_latitude,
              store_longitude,
              store_logo_url,
              store_image_url,
              store_service_type,
              store_introduction,
              store_holiday_day,
              store_simple_address,
              store_homepage_url,
              store_add_info,
              reg_id,
              update_id
      ) VALUES (
              '${data.store_id}',
              'N',
              'N',
              'N',
              '${data.store_name}',
              '${data.store_branch_name}',
              '${data.store_name} ${data.store_branch_name}',
              '-',
              'N',
              '-',
              '-',
              '-',
              '${data.store_zip_code}',
              '${data.store_address}',
              '${data.store_address_detail}',
              '${data.store_business_number}',
              '-',
              'CY',
              NOW(),
              DATE_ADD(NOW(), INTERVAL 1 YEAR),
              '-',
              '1',
              '${data.store_operator_name}',
              '${data.store_operator_email}',
              '${data.store_operator_phone}',
              '-',
              '${data.store_tel}',
              '${data.store_bank_name}',
              '${data.store_account}',
              ${data.store_use_fees},
              ${data.store_shopping_fees},
              ${data.store_latitude},
              ${data.store_longitude},
              '-',
              '-',
              '${data.store_service_type}',
              '-',
              '-',
              '${data.store_address}',
              '-',
              '-',
              'admin',
              'admin'
              )`;
};

let signUpUpdateQuery = (data) => {
  console.log('data', data);
  return `UPDATE tb_store_signup 
            SET 
            store_signup_status_type = '${data.store_signup_status_type}',
            store_name = '${data.store_name}',
            store_branch_name = '${data.store_branch_name}',
            store_business_type_name = '${data.store_business_type_name}',
            store_tel = '${data.store_tel}',
            store_business_number = '${data.store_business_number}',
            store_corporation_number= '${data.store_corporation_number}',
            store_zip_code = '${data.store_zip_code}',
            store_address = '${data.store_address}',
            store_address_detail = '${data.store_address_detail}',
            store_operator_name = '${data.store_operator_name}',
            store_operator_position = '${data.store_operator_position}',
            store_operator_phone = '${data.store_operator_phone}',
            store_operator_tel = '${data.store_operator_tel}',
            store_operator_email = '${data.store_operator_email}',
            store_contact_period = ${data.store_contact_period},
            store_account_name = '${data.store_account_name}',
            store_bank_name = '${data.store_bank_name}',
            store_account = '${data.store_account}',
            store_use_fees = ${data.store_use_fees},
            store_shopping_fees = ${data.store_shopping_fees},
            store_saving_type = '${data.store_saving_type}',
            store_saving_cnt = ${data.store_saving_cnt},
            saving_coupon_name = '${data.saving_coupon_name}',
            point_use_cnt = ${data.point_use_cnt},
            msg_ss_yn = '${data.msg_ss_yn}',
            msg_sc_yn = '${data.msg_sc_yn}',
            msg_ps_yn = '${data.msg_ps_yn}',
            msg_pd_yn = '${data.msg_pd_yn}',
            msg_cu_yn = '${data.msg_cu_yn}',
            msg_ga_yn = '${data.msg_ga_yn}',
            msg_gb_yn = '${data.msg_gb_yn}',
            msg_ce_yn = '${data.msg_ce_yn}',
            msg_ge_yn = '${data.msg_ge_yn}',
            update_id =  'admin'
          WHERE store_signup_no = ${data.store_signup_no}`
};

let signUpCompleteUpdateQuery = (data) => {
  console.log('data', data);
  return `UPDATE tb_store_signup 
            SET 
            store_signup_status_type = 'C',
            store_name = '${data.store_name}',
            store_branch_name = '${data.store_branch_name}',
            store_business_type_name = '${data.store_business_type_name}',
            store_tel = '${data.store_tel}',
            store_business_number = '${data.store_business_number}',
            store_corporation_number= '${data.store_corporation_number}',
            store_zip_code = '${data.store_zip_code}',
            store_address = '${data.store_address}',
            store_address_detail = '${data.store_address_detail}',
            store_operator_name = '${data.store_operator_name}',
            store_operator_position = '${data.store_operator_position}',
            store_operator_phone = '${data.store_operator_phone}',
            store_operator_tel = '${data.store_operator_tel}',
            store_operator_email = '${data.store_operator_email}',
            store_contact_period = ${data.store_contact_period},
            store_account_name = '${data.store_account_name}',
            store_bank_name = '${data.store_bank_name}',
            store_account = '${data.store_account}',
            store_shopping_fees = ${data.store_shopping_fees},
            store_saving_type = '${data.store_saving_type}',
            store_saving_cnt = ${data.store_saving_cnt},
            saving_coupon_name = '${data.saving_coupon_name}',
            point_use_cnt = ${data.point_use_cnt},
            msg_ss_yn = '${data.msg_ss_yn}',
            msg_sc_yn = '${data.msg_sc_yn}',
            msg_ps_yn = '${data.msg_ps_yn}',
            msg_pd_yn = '${data.msg_pd_yn}',
            msg_cu_yn = '${data.msg_cu_yn}',
            msg_ga_yn = '${data.msg_ga_yn}',
            msg_gb_yn = '${data.msg_gb_yn}',
            msg_ce_yn = '${data.msg_ce_yn}',
            msg_ge_yn = '${data.msg_ge_yn}',
            completed_date = NOW(),
            update_id =  'admin'
          WHERE store_signup_no = ${data.store_signup_no}`
};

let userInsertQuery = (data) => {
  return `INSERT INTO users (
                user_id,
                store_id,
                name,
                password,
                created_at,
                updated_at
          ) VALUES  (
                '${data.manager_id}',
                '${data.store_id}',
                '${data.store_name} ${data.store_branch_name}',
                '${data.manager_password}',
                NOW(),
                NOW()
          )`
};

let posIdQuery = `SELECT MAX(socket_no) + 1 as no
                          FROM tb_store_qrsocket`;

let posIdInsertQuery = (data, socketNo) => {
  console.log(socketNo)
  return `INSERT INTO tb_store_qrsocket (
                      store_id,
                      socket_name,
                      socket_qrcode_val,
                      socket_qrcode_url,
                      socket_qrcode_img_url,
                      socket_public_id,
                      socket_mobile_id,
                      socket_pos_id,
                      socket_desc,
                      active_yn,
                      reg_id,
                      update_id,
                      reg_date,
                      up_date
          ) VALUES (
                   '${data.store_id}',
                   CONCAT('${data.store_name}', ' ', '${data.store_branch_name}'),
                   '${data.socket_qrcode_val}',
                   '${data.socket_qrcode_url}',
                   '-',
                   CONCAT('SPU', ${socketNo}),
                   CONCAT('SMO', ${socketNo}),
                   CONCAT('SPO', ${socketNo}),
                   '-',
                   'N',
                   'admin',
                   'admin',
                   NOW(),
                   NOW()
          )`;
};

let msgListQuery = `SELECT * FROM tb_msg_template WHERE active_yn = 'Y'`;

let storeMsgInsertQuery = (data) => {
  return `INSERT INTO tb_store_msg (
                      store_id,
                      msg_type_name,
                      msg_type,
                      msg_purpose_name,
                      msg_purpose,
                      msg_message,
                      active_yn,
                      reg_id,
                      update_id
                      ) VALUES (
                       '${data.store_id}',
                       '${data.msg_type_name}',
                       '${data.msg_type}',
                       '${data.msg_purpose_name}',
                       '${data.msg_purpose}',
                       "${data.msg_message}",
                       '${data.active_yn}',
                       'admin',
                       'admin'
                      )`;
};

let storeSavingInsertQuery = (data) => {
  return `INSERT INTO tb_store_saving_info (
                      store_id,
                      store_saving_type,
                      store_saving_val,
                      store_saving_vip_goal,
                      store_saving_rate,
                      reg_id,
                      update_id
                      ) VALUES (
                       '${data.store_id}',
                       '${data.store_saving_type}',
                       ${data.store_saving_cnt},
                       0,
                       ${data.store_saving_rate},
                       'admin',
                       'admin'
                      )`;
};

let storeSavingCouponInsertQuery = (data) => {
  return `INSERT INTO tb_store_saving_coupon (
                      store_id,
                      coupon_type,
                      save_count_goal,
                      save_coupon_title,
                      save_coupon_image_url,
                      save_coupon_discount_type,
                      save_coupon_discount_value,
                      save_coupon_valid_period,
                      active_yn
                      ) VALUES (
                       '${data.store_id}',
                       '${data.store_saving_type}',
                        ${data.store_saving_cnt},
                       '${data.saving_coupon_name}',
                       'https://kr.object.ncloudstorage.com/ttowayo/common/default-coupon01.jpeg',
                       'DR',
                       100,
                       365,
                       'Y'
                      )`;
};
let campaignListQuery = `SELECT * FROM tb_campaign`;

let storeCampaignInsertQuery = (data) => {
  return `INSERT INTO tb_store_campaign (
                      campaign_type,
                      campaign_type_name,
                      campaign_title,
                      coupon_image_url,
                      store_id,
                      active_yn,
                      reg_id,
                      update_id
                      ) VALUES (
                        '${data.campaign_type}',
                        '${data.campaign_title}',
                        '${data.campaign_title}',
                        'https://kr.object.ncloudstorage.com/ttowayo/common/default-coupon01.jpeg',
                        '${data.store_id}',
                        'N',
                        'admin',
                        'admin'
                      )`
};

module.exports = {
  signUpListQuery, signUpListSearchQuery, signUpDetailQuery, signUpStoreIdQuery,
  storeInsertQuery, signUpUpdateQuery, signUpCompleteUpdateQuery,
  userInsertQuery, posIdQuery, posIdInsertQuery, msgListQuery, storeMsgInsertQuery,
  storeSavingInsertQuery, storeSavingCouponInsertQuery, campaignListQuery, storeCampaignInsertQuery
};