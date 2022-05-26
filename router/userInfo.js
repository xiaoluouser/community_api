const express = require("express");

const {
    getUserInfo,
    updateUserInfo,
    updateUserPassword,
    updateUserAvatar,
} = require("../router_handler/userInfo_handler.js");
const route = express.Router();


route.get('/userinfo',getUserInfo);
route.post('/userinfo',updateUserInfo);
route.post('/updateUserPw',updateUserPassword);
route.post('/update/avatar',updateUserAvatar);

module.exports = route;