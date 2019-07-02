const express = require('express');
const router = express.Router();
const bcryto = require('bcryptjs');
const {selectDbExecute} = require('../com/utils_function');

router.get('/', function (req, res, next) {
  let loggedIn = req.session.loggedIn;
  if (loggedIn) {
    res.redirect('/');
  } else {
    res.render('login', {layout: false, status : 'true'});
  }
});

router.get('/logout', function (req, res, next) {
  delete req.session.username;
  delete req.session.loggedIn;
  res.redirect('/auth');
});

router.post('/login', async function(request, response) {

  let username = request.body.username;
  let password = request.body.password;

  if (username && password) {
    let results =  await selectDbExecute(`SELECT * FROM users WHERE user_id = '${username}'`);

    let psw = results[0].password;

    await bcryto.compare(password, psw, async (err, res) => {
      if (res) {
        request.session.loggedIn = true;
        request.session.username = username;
        response.json({msg: "로그인 되었습니다.", status: 200});
      }
      else {
        response.json({msg: "아이디와 비밀번호를 확인해주세요."});
      }
    });
  } else {
    response.json({msg: "아이디와 비밀번호를 확인해주세요."});
  }
});

module.exports = router;