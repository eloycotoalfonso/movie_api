// Requiring necesary libraries and framewors and variables definition
const bodyParser = require('body-parser');
const express = require ('express');
const res = require('express/lib/response');
const { get } = require('express/lib/response');
const http = require ('http'),
    morgan = require ('morgan'),
    fs = require('fs'),
    path = require ('path'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js');
const { isBuffer } = require('util');
const cors = require ('cors');
const bcrypt = require('bcrypt');
const {check, validationResult} = require ('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

const app = express();

//Creating variable that allow the requests done by the client into a logfile "log.txt. this requests will be append to the file instead of overwriting them"
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'),{flags:'a'});

//Middlewares
app.use(morgan('combined', {stream: accessLogStream})); //This will log in a file (calling accesLogStream) and using Morgan to log the client request
app.use(express.static('public')); ////This allows using the express static resources exposed to avoid calling them one by one
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// This will let or not access to the API from a specific origin
// let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
/*app.use(cors({
    origin: (origin, callback) =>{
        if(!origin) return callback (null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            let message = "The CORS policy for this app aplication doesn't allow access from origin" + origin;
            return callback (new Error (message), false);
        }
    return callback(null, true);
    }
}));*/
app.use(cors());

let auth = require('./auth')(app);
const passport = require ('passport');
require ('./passport');

//Connecting the API tu the DB. There are two options the first one connects it to the local DB (testing and development purposes). The second is to connect it to the deployed DB.
// mongoose.connect('mongodb://localhost:27017/myFlixDB',{
//     useNewUrlParser: true, useUnifiedTopology: true});

 mongoose.connect('process.env.CONNECTION_URI',{
    useNewUrlParser: true, useUnifiedTopology: true});
    


//General response to the '/' requests
app.get('/',(req, res) => {
    let responseText = 'Welcome to my Movies app!';
    res.send(responseText);
});

app.get('/documentation',(req, res)=>{
    res.sendFile('public/documentation.html', {root: __dirname});
});

// Response to the '/secreturl' request
app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
});

//Response to the /movies request (this is returning a JSON)
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
    .then((movies) => {
        res.status(200).json(movies);
    })
    .catch((err)=>{
        if(err){
            console.error(err);
            res.status(500).send("Error: " + err);
        }
    });
});

//Return data about a movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }),(req, res)=>{
    Movies.find({Title: req.params.title})
    .then((movie) => {
        res.status(200).json(movie);
    })
    .catch((err)=>{
        console.error(err);
        res.status(500).send('Error: '+ err);
    });
});

//Return data about a genre by name/title
app.get('/movies/genre/:name', passport.authenticate('jwt', { session: false }), (req, res) =>{
    Movies.findOne({"Genre.Name": req.params.name})
    .then((movies) =>{
        res.status(200).json(movies.Genre);
    })
    .catch((err) =>{
        console.error(err);
        res.status(500).send('Error: '+ err);
    })
});

// Return data about a director
app.get('/movies/director/:name', passport.authenticate('jwt', { session: false }),(req, res)=> {
    Movies.findOne({"Director.Name": req.params.name})
    .then((movie) => {
        res.status(200).json(movie.Director);

    })
    .catch((err) =>{
        console.error(err);
        res.status(500).send('Error: '+ err);
    });
});

//Add a new User
/*We'll expect JSON in this format
    {
    "username": String,
    "password": String,
    "email": String,
    "birthday": Date
    }
*/
app.post('/users',[
                    check('username', 'Username is required').isLength({min: 5}),
                    check('username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
                    check('password', 'Paswword is required').not().isEmpty(), 
                    check('email', 'Email does not appear to be valid').isEmail()
                ], (req, res) => {
   
    //Check the validation object for errors
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({errors: errors.array()});
    }
    
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({username: req.body.username}).then((user) => {
        if (user) {
            return res.status(400).send(req.body.username + 'already exists');
        }else{
            Users.create({
                username: req.body.username,
                password: hashedPassword,
                email: req.body.email,
                birth: req.body.birthday
            })
            .then((user) => {res.status(201).json(user)})
            .catch((error) =>{
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch((error) => { 
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

//Get all users
app.get('/users', (req,res)=>{
    Users.find()
    .then((users) =>{
        res.status(201).json(users);
    })
    .catch((err)=>{
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Get a user by username
app.get('/users/:username', (req,res) =>{
    Users.find({username: req.params.username})
    .then((user) =>{
        res.json(user);
    })
    .catch((err) =>{
        console.error(err);
        res.status(500).send('Error: '+ err);
    });
})

//Allow users to update their info
/*We'll expect JSON in this format
    {
        username: String,
        (required)
        password: String,
        (required)
        email: String,
        (required)
        birthday: Date
    }
*/
app.put('/users/:username', [
        check('Username', 'Username is required').isLength({min:5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
    check('Password', 'Paswword is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
    ],passport.authenticate('jwt', { session: false }), (req, res) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({errors:errors.array()});
    }
    Users.findOneAndUpdate({username: req.params.username}, {$set:
        {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            birth: req.body.birthday
        }
    },
    {new: true}, // This line makes sure that the updated document is returned
    (err, updatedUser) =>{
        if(err){
            console.error(err);
            res.status(500).send('Error: ' + err);
        }else{
            res.json(updatedUser);
        }
    });
});

// Allow users to add a movie to their favorites
app.post('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({username: req.params.username}, {$push:
        {
            FavoriteMovies: req.params.movieID
        }
    },
    {new: true},
    (err, updatedUser)=> {
        if(err){
            console.error(err);
            res.status(500).send('Error: '+ err);
        }else{
            res.json(updatedUser);
        }
    });
});
    
//Allow users to remove a movie from their favorites
app.delete('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({username: req.params.username}, {$pull:
        {
            FavoriteMovies: req.params.movieID
        }
    },
    {new: true},
    (err, updatedUser) =>{
        if(err){
            console.error(err);
            res.status(500).send('Error: ' + err);
        }else{
            res.status(200).json(updatedUser);
        }
    }
    )
});

//Allow existing user to deregister
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({username: req.params.username})
    .then((user) => {
        if(!user){
            res.status(400).send(req.params.username + 'was not found');
        }else{
            res.status(200).send(req.params.username + 'was deleted');
        }
    })
    .catch((err) =>{
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

app.use((err, req, res, next) =>{
    console.error(err.stack);
    console.log(err);
    res.status(500).send('Something has failed. Please try it later!');
});

// //Allowing the app via dot notation to listen the port 8080 and loging a message in the console
// app.listen(8080, ()=>{
    // console.log('Your app is listening on port 8080.');
// });

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
    console.log('Listening on Port ' + port);
});