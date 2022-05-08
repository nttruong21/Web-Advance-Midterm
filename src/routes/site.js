const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const siteController = require("../controllers/SiteController");

const fileStorage = multer.diskStorage({
    destination: "src/public/avatar",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const fileUpload = multer({
    storage: fileStorage,
    // limits: {
    //     fileSize: 1000000, // 1000000 Bytes = 1 MB
    // },
});

router.get("/", siteController.getIndexView);
router.get("/login", siteController.getLoginView);
router.get("/register", siteController.getRegisterView);
router.post(
    "/register",
    fileUpload.single("avatar"),
    siteController.registerNewUser
);
router.post("/login", siteController.handleLogin);

module.exports = router;
