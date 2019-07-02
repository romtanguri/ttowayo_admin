const express = require('express');
const router = express.Router();
const {selectDbExecute} = require('../com/utils_function');
const AWS = require('aws-sdk');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, 'uploads');
  },
  filename(req, file, callback) {
    let array = file.originalname.split('.');
    array[0] = array[0] + '_';
    array[1] = '.' + array[1];
    array.splice(1, 0, Date.now().toString());
    const result = array.join('');
    callback(null, result);
  }
});

const upload = multer({
  storage,
  limits:{
    file:1
  }
});

router.post('/upload', upload.array('photo',2) , async function(req, res, next) {
  const files = req.files;
  let originalName = '';
  let fileName = '';
  let mimeType = '';
  let size = 0;

  if(Array.isArray(files)) {
    originalName = files[0].originalname;
    fileName = files[0].filename;
    mimeType = files[0].mimetype;
    size = files[0].size;
  } else {
    originalName = files[0].originalname;
    fileName = files[0].filename;
    mimeType = files[0].mimetype;
    size = files[0].size;
  }

  const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
  const region = 'kr-standard';
  const access_key = 'P5w3l6219Z6OulFzDzav';
  const secret_key = 'remJQdCbQgzwQngsbRft5vbhNDVpvI4lNODipg4o';

  AWS.config.update({
    accessKeyId: access_key,
    secretAccessKey: secret_key
  });

  const S3 = new AWS.S3({
    endpoint,
    region
  });

  const bucket_name = 'testBucket';
  const local_file_path = `./uploads/${fileName}`;

  (async () => {

    let object_name = 'sample-folder/';
    // create folder
    await S3.putObject({
      Bucket: bucket_name,
      Key: object_name
    }).promise();

    object_name = `sample-folder/${fileName}`;

    // upload file
    await S3.putObject({
      Bucket: bucket_name,
      Key: object_name,
      ACL: 'public-read',
      // ACL을 지우면 전체공개가 되지 않습니다.
      Body: fs.createReadStream(local_file_path)
    }).promise();

  })();
  res.send('success');
});

router.get('/', async function (req, res, next) {
  let loggedIn = req.session.loggedIn;
  if (!loggedIn) {
    res.redirect('/auth');
  } else {
    let eventMsgListQuery = `SELECT *, DATE_FORMAT(tsm.up_date, "%Y-%m-%d %r") AS up_date FROM tb_store_msg tsm
                                     JOIN tb_store ts 
                                       ON ts.store_id = tsm.store_id 
                                     JOIN tb_event te 
                                     ON te.store_id = tsm.store_id 
                                     WHERE tsm.msg_purpose = 'EP'
                                       AND tsm.active_yn = 'Y'
                                       AND te.active_yn = 'Y'`;
    let eventMsgListResult = await selectDbExecute(eventMsgListQuery);

    res.render('event/eventMsgList', {eventMsgList: eventMsgListResult});
  }
});

router.get('/eventMsgDetail', async function (req, res, next) {
  let eventNo = req.query.eventNo;
  let eventMsgDetailQuery = `SELECT * FROM tb_event te
                                     JOIN tb_store ts 
                                       ON ts.store_id = te.store_id 
                                     WHERE te.event_no = ${eventNo}
                                      AND te.active_yn = 'Y'`;
  let eventMsgDetailResult = await selectDbExecute(eventMsgDetailQuery);
  res.render('event/eventMsgDetail', {detail : eventMsgDetailResult});
});

router.post('/eventURLChange', async function (req, res, next) {
  let originalUrl = req.body['originalUrl'];
  let client_id = 'fll6h7s92x';
  let client_secret = 'ewjBqfqDTAcJxd9ankCpH38PcQqPeqbTaCopEvop';
  let query = encodeURI(originalUrl);
  let api_url = 'https://naveropenapi.apigw.ntruss.com/util/v1/shorturl';
  let request = require('request');
  let options = {
    uri: api_url,
    method: 'POST',
    body:{
      url: query,
    },
    json:true,
    headers: { 'X-NCP-APIGW-API-KEY-ID': client_id, 'X-NCP-APIGW-API-KEY': client_secret },
  };
  request.post(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      // res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
      // res.end(body);
      res.send(body);
    } else {
      res.status(response.statusCode).end();
    }
  });
});


router.post('/eventDetailImageUpload', async function (req, res, next) {
});

router.post('/eventMsgInsert', async function (req, res, next) {
  console.log('등록');
});

router.post('/eventMsgUpdate', async function (req, res, next) {
  console.log('수정');
});

module.exports = router;
