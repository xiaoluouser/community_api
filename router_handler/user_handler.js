const db = require("../db/index.js");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const {nanoid}=require("nanoid");

const {
    jwtSecretKey,
    expiresIn
} = require("../config.js");

exports.getCode = (req, res) => {
    let userPhone = req.query;
    let selectUser = 'select * from api_users where phone=?';
    let arrRandom = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let code = '';
    db.query(selectUser, userPhone.phone, (error, result) => {
        if (error) {
            res.cc(error);
            return;
        }
        if (result.length > 0) {
            res.cc("用户已被占用！");
            return;
        }
        for (let i = 0; i < 6; i++) {
            let codeIndex = Math.floor(Math.random() * 6);
            code += arrRandom[codeIndex];
        }
        res.send({
            status: 0,
            message: "验证码是：",
            data: Number(code),
        })
    })
}

exports.register = (req, res) => {
    let userInfo = req.body;
    if (!userInfo.phone || !userInfo.password) {
        res.send("用户信息错误,请重新填写！");
        return;
    }
    let selectUser = 'select * from api_users where phone=?';
    let insertUser = 'insert into api_users set ?';
    db.query(selectUser, userInfo.phone, (error, result) => {
        if (error) {
            res.cc(error);
            return;
        }
        if (result.length > 0) {
            res.cc("用户已被占用！");
            return;
        }
        userInfo.password = bcrypt.hashSync(userInfo.password, 10);
        //用户的初始化信息。
        let user = {
            password: userInfo.password,
            phone: userInfo.phone,
            username:nanoid(),
            user_avatar:userInfo.user_avatar,
        }
        db.query(insertUser, user, (error, result) => {
            if (error) {
                res.cc(error);
                return;
            }
            if (result.affectedRows !== 1) {
                res.cc("用户注册失败！");
                return;
            }
            res.cc("注册成功！", 0);
        })

    })
}

exports.login = (req, res) => {
    let userInfo = req.body;
    if (!userInfo.phone || !userInfo.password) {
        res.send("用户信息错误,请重新填写！");
        return;
    }
    let selectUser = 'select * from api_users where phone=?';
    db.query(selectUser, userInfo.phone, (error, result) => {
        if (error) {
            res.cc(error);
            return;
        }
        if (result.length != 1) {
            res.cc("该用户不存在！");
            return;
        }
        let isPassword = bcrypt.compareSync(userInfo.password, result[0].password);
        if (!isPassword) {
            res.cc("登录密码错误！");
            return;
        }
        //token的生成与验证
        /* 通过扩展运算符展开对象，让后面的相同的属性覆盖前面的，
            置空password和user_avatar */
        let user = {
            ...result[0],
            password: '',
            user_avatar: ''
        }
        //对用户信息进行加密，生成token字符串
        let tokenUser = jwt.sign(user, jwtSecretKey, {
            expiresIn
        });
        //将token响应给客户端
        res.send({
            status: 0,
            message: "登录成功！",
            token: 'Bearer ' + tokenUser,
        })
        //console.log(result.length);
    })
}

exports.loginOut = (req, res) => {
    res.send("ok");
}