const express = require("express");

const route = express.Router();

const {
    postArticle,
    getArticle,
    getDetailArticle,
    updateLikes,
    postComment,
    getComment
} = require("../router_handler/userArticle_handler.js");

route.post('/postarticle', postArticle);
route.get('/getarticle', getArticle);
route.get('/getdetailarticle', getDetailArticle);
route.post('/updatelikes', updateLikes);
route.post('/postcomment', postComment);
route.get('/getcomment', getComment);

module.exports = route;