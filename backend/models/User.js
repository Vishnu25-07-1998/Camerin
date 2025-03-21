const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
    },
    username: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: false,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    }
})

const User = mongoose.model('User', UserSchema);

module.exports = User;