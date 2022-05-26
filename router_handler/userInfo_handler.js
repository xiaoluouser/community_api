const db = require("../db/index.js");

const bcrypt = require("bcryptjs");

//获取用户基本信息的处理函数
exports.getUserInfo = (req, res) => {
    //console.log(req.auth) //这里通过req中的auth可以拿到解析后token的信息，而不是通过req中的user获取
    const userinfo = ['id', 'phone', 'username','sex','user_avatar','sign'];
    let selectUserInfo = `select ${userinfo} from api_users where id=?`;
    db.query(selectUserInfo, req.auth.id, (error, result) => {
        //执行sql语句失败
        if (error) {
            res.cc(error);
            return;
        }
        //执行sql语句成功，但查询结果为空
        if (result.length != 1) {
            res.cc("获取用户信息失败！");
            return;
        }
        res.send({
            status: 0,
            message: "查询用户成功！",
            data: result[0],
        })
    })
}

//更新用户基本信息的处理函数
exports.updateUserInfo = (req, res) => {
    let updateUser = 'update api_users set ? where id=?';
    db.query(updateUser, [req.body, req.auth.id], (error, result) => {
        if (error) {
            res.cc(error);
            return;
        }
        if (result.changedRows != 1) {
            res.cc("修改用户信息失败！");
            return;
        }
        res.send({
            status: 0,
            message: "修改成功！",
            data: req.auth,
        });
    })
}

//修改用户密码的处理函数
exports.updateUserPassword = (req, res) => {
    let selectUser = 'select * from api_users where id=?';
    let updateUserPw = 'update api_users set password=? where id=?';
    db.query(selectUser, req.auth.id, (error, result) => {
        if (error) {
            res.cc(error);
            return;
        }
        let isPassword = bcrypt.compareSync(req.body.oldPassword, result[0].password);
        if (!isPassword) {
            res.cc("原密码错误！");
            return;
        }
        let new_old_passwprd = bcrypt.compareSync(req.body.newPassword, result[0].password);
        if (new_old_passwprd) {
            res.cc("新密码不能和旧密码相同！");
            return;
        }
        let updatedPassword = bcrypt.hashSync(req.body.newPassword, 10);
        db.query(updateUserPw, [updatedPassword, req.auth.id], (error, result) => {
            if (error) {
                res.cc(error);
                return;
            }
            if (result.changedRows != 1) {
                res.cc("修改密码失败！");
                return;
            }
            res.send({
                status: 0,
                message: "修改密码成功",
            })
        })
    })
}

//修改用户头像的处理函数
exports.updateUserAvatar = (req, res) => {
    let updateAvatar = 'update api_users set user_avatar=? where id=?';
    db.query(updateAvatar, [req.body.avatar, req.auth.id], (error, result) => {
        if (error) {
            res.cc(error);
            return;
        }
        if (result.changedRows!=1) {
            res.cc("修改头像不成功！");
            return;
        }
        res.send({
            status:0,
            message:"修改头像成功",
        })
    })
}