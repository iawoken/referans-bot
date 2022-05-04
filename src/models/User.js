const { Schema, model } = require("mongoose");

const Returned = new Schema({
    Id: String,
    Admin: String,
    Joined: Number,
    Verified: Boolean
})

module.exports = model("User", Returned);