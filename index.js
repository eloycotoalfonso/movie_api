// Requiring necesary libraries and framewors and assign them to variables
const bodyParser = require('body-parser');
const express = require ('express');
const { get } = require('express/lib/response');
const http = require ('http'),
    morgan = require ('morgan'),
    fs = require('fs'),
    path = require ('path'),
    uuid = require('uuid');

const app = express();



//Creating variable that allow the requests done by the client into a logfile "log.txt. this requests will be append to the file instead of overwriting them"

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'),{flags:'a'});

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

//Middlewares
// app.use(myLogger); //This will log the client request manually
// app.use(requestTime); //This will log the current time manually
app.use(morgan('combined',{stream: accessLogStream})); //This will log in a file (calling accesLogStream) and using Morgan to log the client request
app.use(express.static('public')); ////This allows using the express static resources exposed to avoid calling them one by one
app.use(bodyParser.json());

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
app.get('/secreturl',(req, res) =>{
    res.send('This is a secret url with super top-secret content.');
});

//Response to the /movies request (this is returning a JSON)
app.get('/movies',(req, res)=>{
    res.json(topMovies);
});

//Return data about a movie by title
app.get('/movies/:name',(req, res)=>{
    res.json(topMovies.find((movie)=>{
        return movie.title === req.params.name;
    }));
});

//
app.get('/movies/genre/:name',(req, res) =>{
    res.send('The info about that genre was successfully responded');
});

//
app.get('/movies/directors/:name',(req, res)=> {
    res.send('The info about that director was successfully responded');
});

//
app.post('/users/new', (req, res) => {
    res.send('The user has been successfully registered.');
});

//
app.put('/users/:name', (req, res) => {
    res.send('The current user info has been successfully updated.');
});

//
app.post('/movies/:name', (req, res) => {
    res.send("The movie has been added succesfully");
});

//
app.delete('/movies/:name', (req, res) => {
    res.send('The movie has been succesfully removed.');
});

//
app.delete('/users/:name', (req, res) => {
    res.send('The user has been successfully removed.');
});



app.use((err, req, res, next) =>{
    console.error(err.stack);
    res.status(500).send('Something has failed. Please try it later!');
});

//Allowing the app via dot notation to listen the port 8080 and loging a message in the console
app.listen(8080, ()=>{
    console.log('Your app is listening on port 8080.');
});