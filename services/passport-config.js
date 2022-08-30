const passport =  require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { validatePwd, initMongoUserModel }  = require("../services").users;

const User =  initMongoUserModel();

passport.use('localStrategy', new LocalStrategy(
    {
        usernameField: 'emailAddress',
        passwordField: 'password'
    },
    function(username, password, done) {
        User.findOne({emailAddress: username}, function ( err, user ) {
            if(err) return done(err);
            if(!user) {
                return done(null, false, {message: 'Invalid username or password'})
            }
            if(user) {
                validatePwd(password, user.password).then(
                    success => {return done(null, user)},
                    error => { return done(null, false, {message: 'Invalid username or password'})}
                )
            }
        });
    }
));


passport.use('facebook', new strategyFB({
    clientID: config.get('facebookApp')['appId'],
    clientSecret: config.get('facebookApp')['appSecret'],
    callbackURL: 'http://localhost:3001/api/v1/redirects/fbredirect'
    },
    async function (accessToken, refreshToken, profile, cb) {
        if ( profile) {
            console.log('User profile received from FB', profile);
            const newUserData = {
                userId: profile.id + '',
                profileName: profile.username + '',
                emailAddress: 'xyz@example.com',
                provider: profile.provider + ''
            };
            console.log('New User Data', {...newUserData});
            try {
                await userSvc.createFederateUser(newUserData);
            } catch(err) {
                return cb(err);
            }
            console.log('User authenticated');
            return cb(null, newUserData);
        }
        return cb(null, false);
    }
));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, (err, user) => {
        if(err) return done(err);
        return done(null, {user: user});
    });
});