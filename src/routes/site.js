const express = require("express");
const { append } = require("express/lib/response");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const siteController = require("../controllers/SiteController");

router.get("/", siteController.getIndexView);
router.get("/login", siteController.getLoginView);
router.get("/register", siteController.getRegisterView);
router.get("/logout", siteController.logout);
router.post(
    "/register",
    //siteController.registerValidation,
    siteController.registerNewUser
);
router.post("/login", siteController.handleLogin);

module.exports = router;
