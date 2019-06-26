let storeListQuery = `SELECT *
                FROM tb_store
                ORDER BY store_no DESC`;

let partnerIdQuery = (id) => {
  return `SELECT partner_id FROM tb_partner_store WHERE store_id = '${id}'`;
};

let partnerSavingTypeQuery = (id) => {
  return `SELECT partner_saving_type FROM tb_partner_saving_info WHERE partner_id = '${id}'`
};

let storeSavingTypeQuery = (id) => {
  return `SELECT store_saving_type FROM tb_store_saving_info WHERE store_id = '${id}'`
};

let fnConditionCoupon = (couponType) => {
  let returnVal = '';
  switch (couponType) {
    case 'S':   // 적립 쿠폰
      returnVal = `AND cb.coupon_type in ('S')`;
      break;
    case 'M':   // 마케팅 쿠폰
      returnVal = `AND cb.coupon_type not in ('S')`;
      break;
    case 'A':   // 모든 쿠폰
      returnVal = ``;
      break;
  }
  return returnVal;
};

let fnConditionPeriod = (columnName, startDate, endDate) => {
  let returnVal = '';
  if (startDate === undefined && endDate === undefined) {
    returnVal = '';
  } else {
    returnVal = `AND DATE(${columnName}) BETWEEN DATE('${startDate}') AND DATE('${endDate}')`;
  }
  return returnVal;
};

let couponPublishCntQuery = (id, couponType, startDate, endDate) => {
  let conditionCouponTypeQuery = fnConditionCoupon(couponType);
  let conditionPeriodQuery = fnConditionPeriod('cb.reg_date', startDate, endDate);

  return `SELECT
  count(*) AS couponPublishCnt
  FROM tb_coupon_box cb
  JOIN tb_store s ON cb.store_id = s.store_id
  WHERE cb.customer_uid not in ('83f8bf96-7f79-49a1-a3e2-3bebbdf21c83', '74170e0c-1ad9-4107-96c5-86f10559574f', 'ee7fe090-77d8-45bb-a51d-8dad609c5d35', '_i60d4okp9', '3941cc1d-3343-4c45-a682-bbe92cad5ae6')
  and cb.store_id = '${id}'
  ${conditionCouponTypeQuery}
  ${conditionPeriodQuery}`;
};

let couponUseCntQuery = (id, couponType, startDate, endDate) => {
  let conditionCouponTypeQuery = fnConditionCoupon(couponType);
  let conditionPeriodQuery = fnConditionPeriod('cb.coupon_usedate', startDate, endDate);
  return `SELECT count(*) AS couponUseCnt
            FROM tb_coupon_box cb
            JOIN tb_store s ON cb.store_id = s.store_id
            WHERE cb.customer_uid not in ('83f8bf96-7f79-49a1-a3e2-3bebbdf21c83', '74170e0c-1ad9-4107-96c5-86f10559574f', 'ee7fe090-77d8-45bb-a51d-8dad609c5d35', '_i60d4okp9', '3941cc1d-3343-4c45-a682-bbe92cad5ae6')
                and cb.active_yn = 'N'
                and cb.coupon_use_type = '1'
                and cb.store_id = '${id}'
                ${conditionCouponTypeQuery}
                ${conditionPeriodQuery}`;
};

let stampSavingCntQuery = (id, startDate, endDate) => {
  let conditionPeriodQuery = fnConditionPeriod('sh.reg_date', startDate, endDate);
  return `SELECT
  IFNULL(SUM(sh.stamp_saving_cnt), 0) AS savingCnt,
  COUNT(sh.stamp_history_no) AS savingHistoryCnt
  FROM tb_stamp_history sh
  JOIN tb_customer wc ON wc.customer_uid = sh.customer_uid
  JOIN tb_store s ON sh.saving_store_id = s.store_id
  where sh.customer_uid not in ('83f8bf96-7f79-49a1-a3e2-3bebbdf21c83', '74170e0c-1ad9-4107-96c5-86f10559574f', 'ee7fe090-77d8-45bb-a51d-8dad609c5d35', '_i60d4okp9', '3941cc1d-3343-4c45-a682-bbe92cad5ae6')
  AND sh.saving_store_id = '${id}'
  ${conditionPeriodQuery}`;
};

let pointSavingCntQuery = (id, startDate, endDate) => {
  let conditionPeriodQuery = fnConditionPeriod('ph.reg_date', startDate, endDate);

  return `SELECT
  IFNULL(SUM(ph.point_saving_cnt),0) AS savingCnt,
  COUNT(ph.point_history_no) AS savingHistoryCnt
  FROM tb_point_history ph
  JOIN tb_customer wc ON wc.customer_uid = ph.customer_uid
  JOIN tb_store s ON ph.saving_store_id = s.store_id
  where ph.customer_uid not in ('83f8bf96-7f79-49a1-a3e2-3bebbdf21c83', '74170e0c-1ad9-4107-96c5-86f10559574f', 'ee7fe090-77d8-45bb-a51d-8dad609c5d35', '_i60d4okp9', '3941cc1d-3343-4c45-a682-bbe92cad5ae6')
  AND ph.saving_store_id = '${id}'
  ${conditionPeriodQuery}`;
};

let newMembershipCntQuery = (id, startDate, endDate) => {
  let conditionPeriodQuery = fnConditionPeriod('m.reg_date', startDate, endDate);

  return `SELECT count(*) AS newMembershipCnt
  FROM tb_customer wc 
  JOIN tb_membership m ON wc.customer_uid = m.customer_uid
  JOIN tb_store s ON s.store_id = m.store_id
  WHERE m.customer_uid not in ('83f8bf96-7f79-49a1-a3e2-3bebbdf21c83', '74170e0c-1ad9-4107-96c5-86f10559574f', 'ee7fe090-77d8-45bb-a51d-8dad609c5d35', '_i60d4okp9', '3941cc1d-3343-4c45-a682-bbe92cad5ae6')
  and m.store_id = '${id}'
  ${conditionPeriodQuery}`
};

let storeCampaignQuery = `SELECT * FROM tb_store_campaign WHERE active_yn = 'Y'`;

let storeMembershipQuery = (storeId) => {
  return `SELECT tc.*,
  tm.membership_no,
  tm.membership_purchase_cnt,
  tm.birth_coupon_give_year 
  FROM tb_membership tm
  JOIN tb_customer tc ON  tm.customer_uid = tc.customer_uid
  WHERE tm.store_id = '${storeId}'`;
};

module.exports = {
  storeListQuery, partnerIdQuery, partnerSavingTypeQuery,
  storeSavingTypeQuery, couponPublishCntQuery, couponUseCntQuery,
  stampSavingCntQuery, pointSavingCntQuery, newMembershipCntQuery,
  storeCampaignQuery, storeMembershipQuery
};