let eventMsgListQuery = () => {
  let eventMsgListQuery = `SELECT * FROM tb_store_msg WHERE msg_purpose = 'EP'`;
  console.log(eventMsgListQuery)
  return eventMsgListQuery;
};


module.exports = { eventMsgListQuery }