var router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Security tester',
  });
});

router.get('/sql_injection', function (req, res, next) {
  res.render('sql_injection', {
    title: 'Sql injection'
  });
});

module.exports = router;
