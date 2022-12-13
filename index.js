// Requiring necesary libraries and framewors and variables definition
const bodyParser = require("body-parser");
const express = require("express");
const res = require("express/lib/response");
const { get } = require("express/lib/response");
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path"),
  mongoose = require("mongoose"),
  userModel = require("./models/users.js");
  movieModel = require('./models/movies.js')

const cors = require("cors");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

const Movies = movieModel.Movie;
const Users = userModel.User;

const app = express();

//Creating variable that allow the requests done by the client into a logfile "log.txt. this requests will be append to the file instead of overwriting them"
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

//Middlewares
app.use(morgan("combined", { stream: accessLogStream })); //This will log in a file (calling accesLogStream) and using Morgan to log the client request
app.use(express.static("public")); ////This allows using the express static resources exposed to avoid calling them one by one
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

const auth = require("./routes/auth")(app);

const usersRoutes = require('./routes/users.js')(app);
const generalRoutes = require('./routes/general.js')(app);
const moviesRoutes = require('./routes/movies.js')(app);
const passport = require("passport");
require("./passport");

//Connecting the API tu the DB. There are two options the first one connects it to the local DB (testing and development purposes). The second is to connect it to the deployed DB.
mongoose.connect('mongodb://localhost:27017/myFlixDB',{
  // mongoose.connect('mongodb+srv://eloycoal:1234567890_Xx@myclouddb.armdees.mongodb.net/?retryWrites=true&w=majority',{
    useNewUrlParser: true, useUnifiedTopology: true});

// mongoose.connect(process.env.CONNECTION_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

app.use((err, req, res, next) => {
  console.error(err.stack);
  console.log(err);
  res.status(500).send("Something has failed. Please try it later!");
});

// //Allowing the app via dot notation to listen the port 8080 and loging a message in the console
// app.listen(8080, ()=>{
// console.log('Your app is listening on port 8080.');
// });

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
