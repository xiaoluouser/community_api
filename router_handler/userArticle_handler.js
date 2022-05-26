const db = require("../db/index.js");
const QS = require("qs");
//let articleId;


//发表文章
exports.postArticle = (req, res) => {
    let insertArticle = 'insert into user_article set ?';
    let articleImages = 'insert into article_images (image,article_id,user_id) values ?' //依次插入多行数据
    let articleInfo = {
        ...QS.parse(req.body),
        user_id: req.auth.id
    }
    delete articleInfo.images;
    let images = [];
    //添加文章的内容
    new Promise((resolve, reject) => {
        db.query(insertArticle, articleInfo, (error, Aresult) => {
            if (error) {
                reject(error);
                return;
            }
            if (Aresult.affectedRows !== 1) {
                reject("文章添加失败！");
                return;
            }
            resolve(Aresult);
        })
    }).then(value => {
        if (QS.parse(req.body).images === undefined) {
            req.body.images = [];
        }
        for (let i = 0; i < QS.parse(req.body).images.length; i++) {
            images[i] = [QS.parse(req.body).images[i], value.insertId, req.auth.id];
        }
        return images;
    }, err => {
        res.cc(err);
    }).then(value => {
        return new Promise((resolve, reject) => {
            db.query(articleImages, [value], (error, Iresult) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (Iresult.affectedRows !== 1) {
                    reject("图片添加失败！");
                    return;
                }
                resolve("发布成功！");
            })
        })
    }).then(value => {
        res.send({
            status: 0,
            message: value,
        })
    }, err => {
        res.cc(err);
    })
}

//获取文章的列表
exports.getArticle = (req, res) => {
    let total = 0
    if (req.query.num !== 'undefined') {
        total = req.query.num;
    }
    let selectArticle = `select * from user_article where is_delete=0 order by id desc limit ${total},5`;
    new Promise((resolve, reject) => {
        db.query(selectArticle, (error, Aresult) => {
            if (error) {
                reject(error);
                return;
            }
            if (Aresult.length < 1) {
                reject("获取文章失败！");
                return;
            }
            resolve(Aresult);
        })
    }).then(value => {
        let aId = [];
        value.forEach(item => {
            aId.push(item.id);
        });
        return new Promise((resolve, reject) => {
            let selectImages = `select * from article_images where article_id in (${[...aId]})`;
            db.query(selectImages, (error, Iresult) => {
                if (error) {
                    reject(error);
                    return;
                }
                for (let i = 0; i < value.length; i++) {
                    value[i].images = [];
                    for (let j = 0; j < Iresult.length; j++) {
                        if (value[i].id === Iresult[j].article_id) {
                            value[i].images.push(Iresult[j].image);
                        }
                    }
                }
                resolve(value);
            })
        })
    }, err => {
        res.cc(err);
    }).then(value => {
        let uId = [];
        value.forEach(item => {
            uId.push(item.user_id);
        })
        return new Promise((resolve, reject) => {
            let selectUsers = `select id,username,user_avatar from api_users where id in (${[...uId]})`;
            db.query(selectUsers, (error, Uresult) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (Uresult.length < 1) {
                    reject("获取文章的用户信息失败！");
                    return;
                }
                for (let i = 0; i < value.length; i++) {
                    for (let j = 0; j < Uresult.length; j++) {
                        if (value[i].user_id === Uresult[j].id) {
                            value[i].username = Uresult[j].username;
                            value[i].avatar = Uresult[j].user_avatar;
                        }
                    }
                }
                resolve(value);
            })
        })
    }, err => {
        res.cc(err);
    }).then(value => {
        res.send({
            status: 0,
            message: "获取文章相关的信息成功！",
            article: value,
        })
    }, err => {
        res.cc(err);
    })
}

//获取文章内容的详情
exports.getDetailArticle = (req, res) => {
    let selectUsers = `select id,username,user_avatar from api_users where id=?`;
    let selectArticle = `select * from user_article where id=? and user_id=? and is_delete=0`;
    let selectImages = 'select * from article_images where article_id=?';
    let imagesArr = [];
    const Aresult = new Promise((resolve, reject) => {
        db.query(selectArticle, [req.query.id, req.query.user_id], (error, Aresult) => {
            if (error) {
                reject(error);
                return;
            }
            if (Aresult.length < 1) {
                reject("获取文章失败！");
                return;
            }
            resolve(Aresult);
        })
    }).then(value => {
        return new Promise((resolve, reject) => {
            db.query(selectImages, req.query.id, (error, Iresult) => {
                if (error) {
                    reject(error);
                    return;
                }
                for (let i = 0; i < Iresult.length; i++) {
                    imagesArr.push(Iresult[i].image);
                }
                value[0].images = imagesArr;
                resolve(value[0]);
            })
        })
    }, err => {
        res.cc(err);
    }).then(value => {
        return new Promise((resolve, reject) => {
            db.query(selectUsers, value.user_id, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (value.length < 1) {
                    reject("获取文章的用户信息失败！");
                    return;
                }
                value.username = result[0].username;
                value.avatar = result[0].user_avatar;
                resolve(value);
            })
        })
    }).then(value => {
        res.send({
            status: 0,
            message: "获取文章详情成功！",
            data: value
        })
    })
}

//文章的点赞以及点击量
exports.updateLikes = (req, res) => {
    let {
        views,
        likes,
        id,
        user_id
    } = req.body;
    let updateviews = `update user_article set views=?,likes=? where id=? and user_id=?`;
    new Promise((resolve, reject) => {
        db.query(updateviews, [views, likes, id, user_id], (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            if (result.affectedRows !== 1) {
                reject("更新失败！");
                return;
            }
            resolve("更新成功！");
        })
    }).then(value => {
        res.cc(value, 0);
    })
}

//发表文章评论
exports.postComment = (req, res) => {
    let insertComment = `insert into article_comment set ?`;
    let {
        time,
        comment,
        article_id,
    } = req.body;
    let commentInfo = {
        time,
        comment,
        article_id,
        user_id: req.auth.id
    }
    new Promise((resolve, reject) => {
        db.query(insertComment, commentInfo, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            if (result.affectedRows !== 1) {
                reject("评论添加失败！");
                return;
            }
            resolve("成功评论！");
        })
    }).then(value => {
        res.cc(value, 0);
    })
}

//获取文章的评论
exports.getComment = (req, res) => {
    let selectComment = `select * from article_comment where is_delete=0 and article_id=? order by id desc`;
    new Promise((resolve, reject) => {
        db.query(selectComment, req.query.article_id, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(result);
        })
    }).then(value => {
        let uId = [];
        value.forEach(item => {
            uId.push(item.user_id)
        })
        if (uId.length === 0) {
            uId = [4]; //随便弄一个mysql中有的用户信息的id
        }
        return new Promise((resolve, reject) => {
            let selectUsers = `select id,username,user_avatar from api_users where id in (${[...uId]})`;
            db.query(selectUsers, (error, Uresult) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (Uresult.length < 1) {
                    reject("获取评论的用户信息失败！");
                    return;
                }
                for (let i = 0; i < value.length; i++) {
                    for (let j = 0; j < Uresult.length; j++) {
                        if (value[i].user_id === Uresult[j].id) {
                            value[i].username = Uresult[j].username;
                            value[i].avatar = Uresult[j].user_avatar;
                        }
                    }
                }
                resolve(value);
            })
        })
    }).then(value => {
        res.send({
            status: 0,
            message: "评论成功！",
            data: value,
            UserId:req.auth.id
        })
    })
}