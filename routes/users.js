//Variables declaration
const express = require ('express');
const router = express.Router();
const { check, validationResult } = require("express-validator");
const passport = require("passport");
require("./../passport");

const Users = userModel.User;

module.exports = (router) =>{

    //Add a new User
    /*We'll expect JSON in this format
        {
        "username": String,
        "password": String,
        "email": String,
        "birthday": Date
        }
    */
    router.post("/users",[
        check("username", "Username is required").isLength({ min: 5 }),
        check(
        "username",
        "Username contains non alphanumeric characters - not allowed"
        ).isAlphanumeric(),
        check("password", "Paswword is required").not().isEmpty(),
        check("email", "Email does not appear to be valid").isEmail(),
    ], (req, res) => {
        //Check the validation object for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
        }

        const hashedPassword = Users.hashPassword(req.body.password);
        Users.findOne({ username: req.body.username })
        .then((user) => {
            if (user) {
            return res.status(400).send(req.body.username + "already exists");
            } else {
            Users.create({
                username: req.body.username,
                password: hashedPassword,
                email: req.body.email,
                birth: req.body.birthday,
            })
                .then((user) => {
                res.status(201).json(user);
                })
                .catch((error) => {
                console.error(error);
                res.status(500).send("Error: " + error);
                });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
        });
    }
    );

    //Get all users
    router.get("/users", (req, res) => {
        Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
    });
	 //Get a user by its username
    router.get(
		"/users/:username",
		passport.authenticate("jwt", { session: false }),
		(req, res) => {
			Users.find({ username: req.params.username })
			.then((user) => {
				res.status(201).json(user);
			})
			.catch((err) => {
				console.error(err);
				res.status(500).send("Error: " + err);
			});
    });

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
    router.put("/users/:username", [
        check("Username", "Username is required").isLength({ min: 5 }),
        check(
        "Username",
        "Username contains non alphanumeric characters - not allowed"
        ).isAlphanumeric(),
        check("Password", "Paswword is required").not().isEmpty(),
        check("Email", "Email does not appear to be valid").isEmail(),
    ],
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
        }
        const hashedPassword = Users.hashPassword(req.body.password);
        Users.findOneAndUpdate(
        { username: req.params.username },
        {
            $set: {
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birth: req.body.birthday,
            },
        },
        { new: true }, // This line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
            console.error(err);
            res.status(500).send("Error: " + err);
            } else {
            res.json(updatedUser);
            }
        }
        );
    }
    );

    // Allow users to add a movie to their favorites
    router.post(
        "/users/:username/movies/:movieID",
        passport.authenticate("jwt", { session: false }),
        (req, res) => {
        Users.findOneAndUpdate(
            { username: req.params.username },
            {
            $push: {
                FavoriteMovies: req.params.movieID,
            },
            },
            { new: true },
            (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error: " + err);
            } else {
                res.json(updatedUser);
            }
            }
        );
        }
    );

    
    //Allow users to remove a movie from their favorites
    router.delete("/users/:username/movies/:movieID", passport.authenticate("jwt", { session: false }), (req, res) => {
        Users.findOneAndUpdate(
            { username: req.params.username },
            {
            $pull: {
                FavoriteMovies: req.params.movieID,
            },
        },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send("Error: " + err);
            } else {
                res.status(200).json(updatedUser);
            }
        }
        );
    });
}