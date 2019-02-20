var express = require('express');
var router = express.Router();
var user = require('../models/user');
var crypto = require('crypto');
// var movie = require('../models/movie');
// var comment = require('../models/comment');
const init_token = 'TKL02o';
/* GET users listing. */
//用户登录接口
router.post('/login',function(req,res,next){
    if(!req.body.username){
      res.json({status:0,message:'用户名为空'}); 
    }
    if(!req.body.password){
      res.json({status:0,message:'密码为空'});
    }
    user.findUserLogin(req.body.username,req.body.password,function(err,userSave){
      if(userSave.length != 0){
         var token_after = getMD5Password(userSave[0]._id)
         res.json({status:1,data:{token:token_after,user:userSave},message:'用户登录成功'});
      }else{
         res.json({status:0,message:'用户名或密码错误'})
      }
    });
});
//用户注册接口
router.post('/register',function(req,res,next){
    if(!req.body.username){
      res.json({status:0,message:'用户名为空'})
    }
    if(!req.body.password) {
      res.json({ status: 0, message: '密码为空' })
    }
    const regex_mail = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
    if(!req.body.userMail){
      res.json({status:0,message: '用户邮箱为空'})
    }
    if(!regex_mail.test(req.body.userMail)){
      res.json({ status:0, message: '用户邮箱格式错误' })
    }
    const regex_phone = /^1[3|4|5|8][0-9]\d{4,8}$/;
    if(!req.body.userPhone){
      res.json({status:0,message:'用户手机为空'}); 
    }
    if(!regex_phone.test(req.body.userPhone)) {
      res.json({ status: 0, message: '用户手机格式错误' })
    } 
    user.findByUsername(req.body.username,function(err,userSave){
        if(userSave.length != 0 ){
           //返回错误信息
          res.json({status:0,message:"用户已注册"});
        }else{
          var registerUser = new user({
                username:req.body.username,
                password:req.body.password,
                userMail:req.body.userMail,
                userPhone:req.body.userPhone,
                userAdmin:0,
                userPower:0,
                userStop:0
            });
          registerUser.save(function(){
                res.json({status:1,message:'注册成功'});
          });
        }
   });
});
//用户注册评论
router.post('/postComment',function(req,res,next){
});
//用户点赞
router.post('/support',function(req,res,next){
});
//用户找回密码
router.post('/findPassword',function(req,res,next){
//需要输入用户的邮箱和手机信息,同时可以更新密码
//这里需要两个返回情况,一个是req.body.repassword存在时,另一个是req.repassword不存在时
//这个接口同时用于密码的重置,需要用户登录
  if(req.body.repassword){
    //当存在时,需要验证其登录登录情况或者验证其code
    if(req.body.token){
      //当存在code登录状态时,验证其状态
      if(!req.body.user_id){
        res.json({status:0,message:'用户登录错误'});
      }
      if(!req.body.password){
        res.json({status:0,message:'用户旧密码错误'})
      }
      if(req.body.token == getMD5Password(req.body.user_id)){
         user.findOne({_id:req.body.user_id,password:req.body.password},function(err,checkUser){
            if(checkUser){
              user.update({_id:req.body.user_id},{password:req.body.repassword},function(err,userUpdate){
                if(err){
                  res.json({status:0,message:'更改错误',data:err})
                }
                res.json({status:1,message:'更改成功',data:userUpdate})
              })
            }else{
              res.json({status:0,message:'用户旧密码错误'});
            }
        });
      }else{
        res.json({status:0,message:'用户登录错误'});
      }
    }else{
      //不存在code时,直接验证mail和phone
      user.findUserPassword(req.body.username,req.body.userMail,req.body.userPhone,function(err,userFound){
        if(userFound.length != 0){
          user.update({_id:userFound[0]._id},{password:req.body.repassword},function(err,userUpdate){
            if(err){
              res.json({status:0,message:'更新错误',data:err})
            }
            res.json({status:1,message:'更新成功',data:userUpdate});  
          });
        }else{
          res.json({status:0,message:'信息错误'})
        }
      })
    }
  }else{
    //这里只是验证mail和phone,返回验证成功提示和提交的字段,用于之后的改密码操作
    if(!req.body.username){
      res.json({status:0,message:'用户名称为空'});
    }
    if(!req.body.userMail){
      res.json({status:0,message:'用户邮箱为空'});
    }
    if(!req.body.userPhone){
      res.json({status:0,message:'用户手机为空'});
    }
    user.findUserPassword(req.body.username,req.body.userMail,req.body.userPhone,function(err,userFound){
      if(userFound.length != 0){
        res.json({status:1,message:'验证成功,请修改密码',data:{userMail:req.body.userMail,userPhone:req.body.userPhone}})
      }else{
        res.json({status:0,message:'信息错误'});
      }
    })
  }
});
//用户发送站内信
router.post('/sendEmail',function(req,res,next){
})
//用户显示站内信,其中的receive参数为1时是发送的内容,为2时是收到的内容
router.post('/showEmail',function(req,res,next){
});
//获取MD5的值
function getMD5Password(id){
   var md5 = crypto.createHash('md5');
   var token_before = id + init_token;
   return md5.update(token_before).digest('hex')
}
module.exports = router;
