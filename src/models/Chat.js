const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatSchema = new Schema(
    {
        sender: { type: String, required: true },
        receiver: { type: String, required: true },
        message: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Chat", chatSchema);
