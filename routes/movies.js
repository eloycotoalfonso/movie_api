//Variables declaration
const express = require ('express');
const router = express.Router();
const passport = require("passport");
require("./../passport");

const Movies = movieModel.Movie;



module.exports = (router) =>{

    //Response to the /movies request (this is returning a JSON)
    router.get("/movies", passport.authenticate("jwt", { session: false }), (req, res) => {
        // app.get("/movies", function (req, res) { //Here we don't have the token autentification for developing purposes. MUST be restored once we have the developed completed!!!!!
        movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            if (err) {
            console.error(err);
            res.status(500).send("Error: " + err);
            }
        });
    }
    );

    //Return data about a movie by title
    router.get(
        "/movies/:title",
        passport.authenticate("jwt", { session: false }),
        (req, res) => {
        movies.find({ Title: req.params.title })
            .then((movie) => {
            console.log(movie[0]);
            res.status(200).json(movie[0]);
            })
            .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
            });
        }
    );

    //Return data about a genre by name/title
    router.get(
        "/movies/genre/:name",
        passport.authenticate("jwt", { session: false }),
        (req, res) => {
        movies.findOne({ "Genre.Name": req.params.name })
            .then((movies) => {
            res.status(200).json(movies.Genre);
            })
            .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
            });
        }
    );

    // Return data about a director
    router.get("/movies/director/:name", passport.authenticate("jwt", { session: false }), (req, res) => {
            movies.findOne({ "Director.Name": req.params.name })
            .then((movie) => {
            res.status(200).json(movie.Director);
            })
            .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
            });
        }
    );

    //Get a user by username
    router.get("/users/:username", (req, res) => {
        Users.find({ username: req.params.username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
    });
}
