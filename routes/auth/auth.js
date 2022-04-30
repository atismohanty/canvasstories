const express = require('express');
const router = express.Router();
const passport = require("passport");
const userSchema = require("../../mongoSchema/userSchema");


/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  passport.authenticate('localStrategy', function (err, user){
    if(err) return res.status(500).json({error: err});
    if(!user) return res.status(401).json({message : 'Username or password incorrect.'});
    userSchema.generateJsWebToken({id: user._id, email: user.emailAddress}).then(
      token => res.status(200).json({'accesstoken': token}).send(),
      err => res.status(500).json({'message': 'Something went wrong. Please try again later', 'err': err}).send()
    ).catch((err) => res.status(500).json({'message': 'Something went wrong. Please try again later', 'err': err}).send())
  })(req, res, next)
})
module.exports = router;
