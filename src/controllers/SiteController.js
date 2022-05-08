const User = require("../models/User");

const {
    multipleMongooseToObject,
    mongooseToObject,
} = require("../util/mongoose");
const { use } = require("../routes/site");

class SiteController {
    // [GET] /
    getIndexView(req, res, next) {
        // console.log(req.session.username);
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

    // [POST] /register
    registerNewUser(req, res, next) {
        const file = req.file;
        const body = req.body;
        if (file && body) {
            const username = body.username;
            const password = body.password;
            const avatar = file.filename;
            const user = new User({ username, password, avatar });
            user.save()
                .then(() => {
                    res.redirect("/login");
                })
                .catch(next);
        } else {
            res.render("register");
        }
    }

    // [POST] /login
    handleLogin(req, res, next) {
        // console.log(req.body);
        if (req.body) {
            User.findOne({
                username: req.body.username,
                password: req.body.password,
            })
                .then((user) => {
                    if (user) {
                        req.session.user = user;
                        return res.redirect("/");
                    } else {
                        res.render("login");
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
