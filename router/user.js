const express = require("express");
const {
    getCode,
    register,
    login,
    loginOut
} = require("../router_handler/user_handler.js");

const route = express.Router();


route.get('/getcode', getCode);
route.post('/register', register);
route.post('/login', login);
route.get('/loginout', loginOut);

module.exports = route;