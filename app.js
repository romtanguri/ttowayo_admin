const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash  = require('connect-flash');
const bodyParser = require('body-parser');
const session = require('express-session');

const indexRouter = require('./routes/index');
const eventRouter = require('./routes/event');
const loginRouter = require('./routes/auth');
const bizRouter = require('./routes/biz');
const signupRouter = require('./routes/signup');

const app = express();
const hbs = require('express-handlebars');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: require('./public/js/helpers.js'), // same file that gets used on our client
  partialsDir: __dirname + '/views/partials/', // same as default, I just like to be explicit
  layoutsDir: __dirname + '/views/layouts/' // same as default, I just like to be explicit
}));
app.set("view engine", "hbs");

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

// 라우터 등록
app.use('/', indexRouter);
app.use('/event', eventRouter);
app.use('/auth', loginRouter);
app.use('/biz', bizRouter);
app.use('/signup', signupRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('error/404', {layout: false, status : 'true'});
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error/error');
});

module.exports = app;
