const { ObjectId } = require('bson');
const mongoose = require('mongoose');

const categoryList = ["Classical", "Electronic", "Rap", "Unknown"];

const AudioSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    music: {
        type: String,
        required: true
    },
    singer: {
        type: String
    },
    size: {
        type: String
    },
    image: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now()
    },
    lyric: {
        type: String
    },
    owner: {
        type: String
    },
    description: {
        type: String
    },
    time: {
        type: String
    },
    category: {
        type: String,
        enum: {
            values: categoryList,
            message: "Invalid category !"
        },
    },
    likes:[]
})

module.exports = mongoose.model('Audio', AudioSchema);