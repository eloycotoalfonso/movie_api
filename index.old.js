// Requiring necesary libraries and framewors and assign them to variables
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

const Movies = Models.Movie;
const Users = Models.User;

const app = express();

//Creating variable that allow the requests done by the client into a logfile "log.txt. this requests will be append to the file instead of overwriting them"
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'),{flags:'a'});

//Middlewares
// app.use(myLogger); //This will log the client request manually
// app.use(requestTime); //This will log the current time manually
app.use(morgan('combined', {stream: accessLogStream})); //This will log in a file (calling accesLogStream) and using Morgan to log the client request
app.use(express.static('public')); ////This allows using the express static resources exposed to avoid calling them one by one
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


let auth = require('./routes/auth')(app);
const passport = require ('passport');
require ('./passport');


mongoose.connect('mongodb://localhost:27017/myFlixDB',{
    useNewUrlParser: true, useUnifiedTopology: true});

//Returning an answer via http
/*http.createServer((request, response) =>{
    response.writeHead(200,{'Content-Type': 'text/plain'});
    response.end('Welcome to my book club \n');
}).listen(8080);

console.log('My first Node test server is running on Port 8080');
*/


// JSON that includes the 10 top movies
let topMovies = [
    [
    'My top 10 movies are:'
    ],
    {
        position: 1,
        title: 'Inception',
        director: 'Christopher Nolan',
        genre: 'sci-fi'
    },
    {
        position: 2,
        title: 'Amores perros',
        director: 'Alejandro Gonzalez Iñarritu',
        genre: 'Thriller'
    },
    {
        position: 3,
        title: 'Schlinder\'s list',
        director: 'Stieven Spielberg',
        genre: 'historical drama'
    },
    {
        position: 4,
        title: 'Minority Report',
        director: 'Stieven Spielberg',
        genre: 'sci-fi'
    },
    {
        position: 5,
        title: 'The Hateful Eight',
        director: 'Quentin Tarantino',
        genre: 'Western'
    },
    {
        position: 6,
        title: 'The Departed',
        director: 'Martin Scorsese',
        genre: 'Thriller'
    },
    {
        position: 7,
        title: 'Grand Budapest Hotel',
        director: 'Wes Anderson',
        genre: 'Comedy'

    },
    {
        position: 8,
        title: 'Silver linings playbook',
        director: 'David O. Russell',
        genre: 'romantic/drama'
    },
    {
        position: 9,
        title: 'Gladiator',
        director: 'Ridley Scott',
        genre: 'Adventure'
    },
    {
        position: 10,
        title: 'The kings speech',
        director: 'Tom Hooper',
        genre: 'Historical/drama'
    },
    
];

let users = [
    {
        name: "Peter",
        age: '25'
    }
];

/*let myLogger = (req, res, next) =>{
    console.log(req.url);
    next();
};

let requestTime = (req, res, next) => {
    req.requestTime = Date.now();  
    next();
};*/

/*app.get('/',(req, res)=>{
    res.send('Welcome to my book club!');
});*/

//General response to the '/' requests
app.get('/',(req, res) => {
    let responseText = 'Welcome to my Movies app!';
    res.send(responseText);
});

/*app.get('/documentation',(req, res)=>{
    res.sendFile('public/documentation.html', {root: __dirname});
});
app.get('/books',(req, res) =>{
    res.json(topBooks);
});*/

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
app.post('/users', (req, res) => {
    Users.findOne({username: req.body.username}).then((user) => {
        if (user) {
            return res.status(400).send(req.body.username + 'already exists');
        }else{
            Users.create({
                username: req.body.username,
                password: req.body.password,
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
app.put('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
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

//Allowing the app via dot notation to listen the port 8080 and loging a message in the console
app.listen(8080, ()=>{
    console.log('Your app is listening on port 8080.');
});