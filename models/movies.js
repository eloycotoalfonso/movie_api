const mongoose = require ('mongoose');
const { deserializeUser } = require('passport');
const bcrypt = require ('bcrypt');

let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Descritption: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});
 
let Movie = mongoose.model('movie', movieSchema);

module.exports.Movie = Movie;