//variables definition
const express = require ('express');
const router = express.Router();


module.exports = (router) =>{

    //General response to the '/' requests
    router.get("/", (req, res) => {
        const responseText = "Welcome to my Movies app!";
        res.send(responseText);
    });

    router.get("/documentation", (req, res) => {
        res.sendFile("/public/documentation.html", { root: path.join(__dirname,'..') });
    });

    // Response to the '/secreturl' request
    router.get("/secreturl", (req, res) => {
        res.send("This is a secret url with super top-secret content.");
    });
}





