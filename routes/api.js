var express = require('express');
var router = express.Router();//
var user = require('./api/users');//路由，用户
router.use('/user', user);
//如果login  product user  不存在，则会走下面这个
// router.use("/", function (req, res) {
//     res.send("api/");
// })

module.exports = router;//暴露模块