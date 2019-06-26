const {isEmptyCheck, dbInsertId, dbAffectedRows, selectDbExecute,filter,jsonStringify} = require('./utils_function');
const {storeListQuery, storeSavingTypeQuery, partnerIdQuery,
  partnerSavingTypeQuery, storeCampaignQuery, storeMembershipQuery} = require('../sql/com');

let storeList = async () => {
  let stores = await selectDbExecute(storeListQuery);
  let storeInfos = [];
  for (const store of stores) {
    // 적립타입 담기
    let saving_type = '';
    let partner_id = store.store_id;
    if (store.store_partner_yn === 'Y') {
      let partnerIdResult = await selectDbExecute(partnerIdQuery(store.store_id));
      partner_id = partnerIdResult[0].partner_id;
      let savingTypeResult = await selectDbExecute(partnerSavingTypeQuery(partner_id));
      saving_type = savingTypeResult[0].partner_saving_type;
    } else {
      let savingTypeResult = await selectDbExecute(storeSavingTypeQuery(store.store_id));
      saving_type = savingTypeResult[0].store_saving_type;
    }

    store.partner_id = partner_id;
    store.saving_type = saving_type;
    storeInfos.push(store);
  }
  return storeInfos;
};

let storeCampaignList = async () => {
  return await selectDbExecute(storeCampaignQuery);
};

let storeMembershipList = async (storeId) => {
  return await selectDbExecute(storeMembershipQuery(storeId));
};

module.exports = {storeList, storeCampaignList, storeMembershipList};