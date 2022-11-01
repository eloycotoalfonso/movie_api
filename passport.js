const passport = require ('passport'),
    LocalStrategy = require ('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
JWTStrategy = passportJWT.Strategy,
ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
}, (username, password, callback) =>{
        console.log(username + ' ' + password);
        Users.findOne({username: username}, (error, user) => {
            if(error){
                console.log(error);
                return callback(error);
            }
            if(!user){
                console.log('incorrect username');
                return callback(null, false, {message: 'Incorrect username or password.'});
            }
            if(!user.validatePassword(password)){
                console.log('incorret password');
                return callback (null, false, {message: 'Incorrect password'});
            }
            
            console.log('finished');
            console.log('After finished the user is: ', user);
            return callback (null, user);
        });
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
    .then((user) => {
        console.log(user);
        return callback (null, user);
    })
    .catch((err) =>{
        console.log(err);
        return callback(err);
    });
}));