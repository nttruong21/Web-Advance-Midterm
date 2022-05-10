const multiparty = require("multiparty");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const {
    multipleMongooseToObject,
    mongooseToObject,
} = require("../util/mongoose");

const imageStorage = multer.diskStorage({
    destination: "src/public/avatar",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const imageUpload = multer({
    storage: imageStorage,
}).single("avatar");

class SiteController {
    // [GET] /
    getIndexView(req, res, next) {
        if (!req.session.user) {
            return res.redirect("/login");
        }
        User.find({})
            .then((users) => {
                users = multipleMongooseToObject(users);
                users = users.filter(
                    (user) => user.username !== req.session.user.username
                );
                const userSession = req.session.user;
                const firstUser = users[0];
                // console.log(">>> Users: ", users);
                return res.render("home", {
                    users,
                    firstUser,
                    userSession,
                });
            })
            .catch((error) => {
                console.log(error);
                next();
            });
    }

    // [GET] /login
    getLoginView(req, res) {
        return res.render("login");
    }

    // [GET] /register
    getRegisterView(req, res) {
        return res.render("register");
    }

    // [GET] /logout
    logout(req, res) {
        req.session.destroy();
        res.redirect("/login");
    }

    // [POST] /register
    async registerNewUser(req, res, next) {
        imageUpload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                console.log(">>> Error when upload image");
            } else if (err) {
                // An unknown error occurred when uploading.
                console.log(">>> Error when upload image");
            } else {
                const file = req.file;
                const body = req.body;
                if (file && body) {
                    const username = body.username;
                    const password = body.password;
                    const avatar = file.filename;
                    if (!username || username.length === 0) {
                        res.locals.errorMessage = "Please enter your username";
                        return res.render("register");
                    }
                    if (!password || password.length === 0) {
                        res.locals.errorMessage = "Please enter your password";
                        return res.render("register");
                    }
                    if (password.length < 6) {
                        res.locals.errorMessage =
                            "Your password must contain at least 6 characters";
                        return res.render("register");
                    }
                    if (!file || file.size === 0) {
                        res.locals.errorMessage =
                            "Please choose image to set your avatar";
                        return res.render("register");
                    }
                    User.findOne({ username })
                        .then(async (user) => {
                            // CHECK USERNAME EXISTED
                            if (user) {
                                res.locals.errorMessage =
                                    "This username was existed, please enter a different one";
                                return res.render("register");
                            } else {
                                // SAVE USER
                                const bcryptPassword = await bcrypt.hash(
                                    password,
                                    8
                                );
                                const user = new User({
                                    username,
                                    password: bcryptPassword,
                                    avatar,
                                });
                                user.save()
                                    .then(() => {
                                        res.status(302).redirect("/login");
                                    })
                                    .catch(next);
                            }
                        })
                        .catch((error) => console.log(error));
                } else {
                    res.render("register");
                }
            }
        });
    }

    // [POST] /login
    handleLogin(req, res, next) {
        // console.log(req.body);
        if (req.body) {
            const username = req.body.username;
            const password = req.body.password;
            if (!username || username.length === 0) {
                res.locals.errorMessage = "Please enter your username";
                return res.render("login");
            }
            if (!password || password.length === 0) {
                res.locals.errorMessage = "Please enter your password";
                return res.render("login");
            }
            User.findOne({
                username,
            })
                .then(async (user) => {
                    if (user) {
                        const bcryptResult = await bcrypt.compare(
                            password,
                            user.password
                        );
                        if (bcryptResult) {
                            req.session.user = user;
                            return res.redirect("/");
                        } else {
                            res.locals.errorMessage =
                                "Wrong password, please check and enter again";
                            return res.render("login");
                        }
                    } else {
                        res.locals.errorMessage =
                            "Wrong username, please check and enter again";
                        return res.render("login");
                    }
                })
                .catch((error) => {
                    console.log(error);
                    next();
                });
        } else {
            res.render("login");
        }
    }
}

module.exports = new SiteController();
