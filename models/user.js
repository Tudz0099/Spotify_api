const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    }, 
    phone: {
        type: Number
    },
    avatar: {
        type: String
    },
    dob: {
        type: String
    },
    gender: {
        type: String
    },
    favorite: {
        type: String
    },
    playList: {
        type: String
    }
})

module.exports = mongoose.model('User', UserSchema);