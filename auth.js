const jwtSecret = 'your_jwt_secret';

const jwt = require ('jsonwebtoken'),
    passport = require('passport');

require ('./passport'); //Local passport file

let generateJWTToken = (user) =>{
    // console.log("The user in generateJWTToken function is: " + user.username);
    return jwt.sign(user, jwtSecret, {
        subject: user.username, //This is the username that is being encoding in the JWT
        expiresIn: '7d', //This specifies that the token will expire in 7 days
        algorithm: 'HS256' //This is the algorithm used to sign or encode the values of the JWT
    })
}

// Now we create the POST logic to Authenticate the Users

        // POST LOGIC

module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', {session: false}, (err, user, info)=> {
            if (err || !user){
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user,
                    error: err
                });
            }
            req.login(user, {session: false}, (err) =>{
                if (err){
                    res.send(err);
                }
                let token = generateJWTToken (user.toJSON());
                return res.json({user, token});
            });
        })(req, res);
    });
}
