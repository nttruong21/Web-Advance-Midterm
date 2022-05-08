const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        avatar: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
