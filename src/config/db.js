const mongoose = require("mongoose");
require("dotenv").config();

const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

async function connect() {
    try {
        await mongoose.connect(DB_CONNECTION_STRING);
        console.log(">>> Connect to mongodb successed");
    } catch (error) {
        console.log(">>> Connect mongodb failed");
    }
}

module.exports = { connect };
