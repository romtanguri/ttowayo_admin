const pool = require('../config/db_connection');
const axios =  require('axios');
const moment = require('moment');
const chalk = require('chalk');
const error = chalk.bold.red;
const warning = chalk.keyword('orange');
const info = chalk.keyword('cyan');
const timeInfo = chalk.keyword('magenta');
const ok = chalk.keyword('green');
let nowDateTime = moment().format('YYYY-MM-DD HH:mm:ss');

function createLog(type, msg) {
  switch (type) {
    case 'info':
      return console.log(timeInfo(nowDateTime), info(msg));
    case 'err':
      return console.log(timeInfo(nowDateTime), error(msg));
    case 'warn':
      return console.log(timeInfo(nowDateTime), warning(msg));
    case 'ok':
      return console.log(timeInfo(nowDateTime), ok(msg));
    default:
      return console.log(timeInfo(nowDateTime), msg);
  }
}

let fnLatLong = async function(addrs) {
  let latLong;
  return await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
    params: { query: addrs },
    headers: { // 요청 헤더
      'Authorization': 'KakaoAK 323452a6cc9dcfcd3860b6b56d48fd5f'
    },
  })
    .then( response => {
      latLong = {
        lat :response.data.documents[0].Y,
        long:response.data.documents[0].x
      };
      return latLong;
    });
};

let shortUrl = async function(url) {
  let postData = { url };
  let axiosConfig = {
    headers: {
      'X-NCP-APIGW-API-KEY-ID': 'fll6h7s92x',
      'X-NCP-APIGW-API-KEY': 'ewjBqfqDTAcJxd9ankCpH38PcQqPeqbTaCopEvop',
      'Content-Type':'application/json'
    }
  };

  return axios.post('https://naveropenapi.apigw.ntruss.com/util/v1/shorturl', postData, axiosConfig)
    .then((res) => {
      console.log("RESPONSE RECEIVED: ", res.data.result.url);
      return res.data.result.url;
    })
    .catch((err) => {
      console.log("AXIOS ERROR: ", err);
    })
  // return await axios.post('https://naveropenapi.apigw.ntruss.com/util/v1/shorturl', {
  //   url: url,
  //   headers: { // 요청 헤더
  //     'X-NCP-APIGW-API-KEY-ID': 'fll6h7s92x',
  //     'X-NCP-APIGW-API-KEY': 'ewjBqfqDTAcJxd9ankCpH38PcQqPeqbTaCopEvop',
  //     'Content-Type':'application/json'
  //   },
  // })
  //   .then( response => {
  //     console.log(response);
  //     return response;
  //   });
};

/*
* 넘어온 값이 빈값인지 체크합니다.
* !value 하면 생기는 논리적 오류를 제거하기 위해
* 명시적으로 value == 사용
* [], {} 도 빈값으로 처리
*/
const isEmptyCheck = function (value) {
  if (value == "" || value == null || value == undefined || (value != null && typeof value == "object" && !Object.keys(value).length)) {
    return true
  } else {
    return false
  }
};

let selectDbExecute = async function (query) {
  try {

    const connection = await pool.getConnection(async conn => conn);

    let [result] = await connection.query(query);

    if (isEmptyCheck(result)) {
      connection.release();
      return false;
    } else {
      connection.release();
      return result;
    }
  } catch (e) {
    console.error('selectDbExecute Error', e);
    return false;
  }
};

let dbAffectedRows = async function (query) {
  try {
    const connection = await pool.getConnection(async conn => conn);
    await connection.beginTransaction();
    let [result] = await connection.query(query);
    if (isEmptyCheck(result.affectedRows)) {
      await connection.rollback();
      connection.release();
      return false;
    } else {
      await connection.commit();
      connection.release();
      return true;
    }
  } catch (e) {
    console.error('dbAffectedRows Error', e);
    return false;
  }
};

let dbInsertId = async function (query) {
  try {
    const connection = await pool.getConnection(async conn => conn);
    await connection.beginTransaction();
    let [result] = await connection.query(query);
    if (isEmptyCheck(result.insertId)) {
      await connection.rollback();
      connection.release();
      return false;
    } else {
      await connection.commit();
      connection.release();
      return result.insertId;
    }
  } catch (e) {
    console.error('dbInsertId Error', e);
    return false;
  }
};

const filter = (f, items) => {
  let res = [];
  for(const item of items) {
    if (f(item)) res.push(item)
  }
  return res;
};

function fnDate(currentDay, dateType) {
  let theYear = currentDay.getFullYear();
  let theMonth = currentDay.getMonth();
  let theDate  = currentDay.getDate();
  let theDayOfWeek = currentDay.getDay();

  let thisWeek = [];
  console.log(moment(currentDay).format('YYYY년 MM월 DD일'));
  for(let i=0; i<7; i++) {
    let resultDay = new Date(theYear, theMonth, theDate + (i - theDayOfWeek));
    let yyyy = resultDay.getFullYear();
    let mm = Number(resultDay.getMonth()) + 1;
    let dd = resultDay.getDate();

    mm = String(mm).length === 1 ? '0' + mm : mm;
    dd = String(dd).length === 1 ? '0' + dd : dd;

    thisWeek[i] = yyyy + '-' + mm + '-' + dd;
  }

  let dates = {};
  if (dateType === 'TO' || dateType === undefined) {
    dates.startDate = moment(currentDay).format('YYYY-MM-DD');
    dates.endDate =  moment(currentDay).format('YYYY-MM-DD');
  } else  if (dateType === 'TW'){
    dates.startDate = thisWeek[0];
    dates.endDate = moment(currentDay).format('YYYY-MM-DD')
  } else  if (dateType === 'LW'){
    let lastWeekMonday = new Date(Date.parse(thisWeek[0]) - 7 * 1000 * 60 * 60 * 24);
    dates.startDate = moment(lastWeekMonday).format('YYYY-MM-DD');
    let lastWeekSunday = new Date(Date.parse(lastWeekMonday) + 6 * 1000 * 60 * 60 * 24);
    dates.endDate = moment(lastWeekSunday).format('YYYY-MM-DD');
  } else  if (dateType === 'TM'){
    dates.startDate = moment(new Date(theYear,theMonth,1)).format('YYYY-MM-DD');
    dates.endDate =  moment(currentDay).format('YYYY-MM-DD');
  }else  if (dateType === 'LM'){
    dates.startDate = moment(new Date(theYear,theMonth-1,1)).format('YYYY-MM-DD');
    dates.endDate = moment(new Date(theYear,theMonth,0)).format('YYYY-MM-DD');
  }
  return dates;
}

//콤마 찍기
function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

const map = (f, items) => {
  let res = [];
  for (const item of items) {
    res.push(f(item))
  }
  return res;
};

function jsonStringify(obj) {
  return JSON.stringify(obj);
}

module.exports = {isEmptyCheck ,selectDbExecute, dbAffectedRows, dbInsertId,
  fnLatLong, shortUrl, filter, map, fnDate, formatNumber, createLog, jsonStringify};
