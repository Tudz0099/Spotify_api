const { query } = require("express");
const getMP3Duration = require('get-mp3-duration');
const fs = require("fs");
const Sequelize = require('sequelize');
const Audio = require('../models/audio');
const { find, findById } = require("../models/audio");
const audio = require("../models/audio");

//post audio
async function PostAudio(req, res, next) {
    try{
        const {userId} = req.params;
        const buffer = fs.readFileSync(req.file.path)
        const duration = getMP3Duration(buffer)
        const min =Math.floor((duration/1000/60) << 0);
        const secTime = Math.floor((duration/1000) % 60);
        const sec = secTime >=10 ? secTime : '0'+secTime
        const time = min + ':' + sec       
        
        const {title, lyric, singer, description, category} = req.body;
        function getFileSize(filename) {
            let stats = fs.statSync(filename);
            let fileSizeInBytes = stats.size;
            let size = fileSizeInBytes / (1024*1024);
            return size.toFixed(2) + "mb" ;
        }

        const audio = new Audio ({
            title: title,
            lyric: lyric,
            owner: userId, 
            singer: singer,
            description: description,
            category: category,
            music: req.file.path,
            size: getFileSize(req.file.path),
            time: time
        })   
        

        await audio.save()
        .then((audio) => {
            return res.json({ 
                    message: "Successfully !", 
                    audio: audio
                    })
        }) 
        .catch((err) => {
            throw err;
        }) 
    } catch (err) {
        return res.json({
            message: err.message
        })
    }
}

// update image

async function  UpdateImage(req, res, next) {
    const {audioId} = req.params;
    const userId = req.userId
    try{
        const changeImage = {
            image: req.file.path
        }
        const audio = await Audio.findById(audioId)
        if(audio.owner !== userId) {
            return res.json('You are not the owner')
        }

        await Audio.findOneAndUpdate( {_id : audioId}, changeImage )
        if(audio.image) {
            await fs.stat(audio.image, function (err, data) { 
                if (err) {
                    console.error(err);
                } 
                fs.unlink(audio.image,function(err){
                    if(err) return console.log(err);
                }); 
            })
        }    
            
        const rs = await Audio.findById(audioId)
        return res.json({
            message: "image update successfully",
            audio: rs
        })
    } catch (err){
        res.status(400).json(err.message)
    }
}  

// delete audio

async function DeleteAudio(req, res, next) {
    const {audioId} = req.params
    const userId = req.userId

   //check owner
    const audio = await Audio.findById(audioId)
    if(!audio) {
        return res.status(404).json("Audio not found!");
    }

    if(audio.owner !== userId) {
        return res.status(404).json("You are not the owner");
    }

    
   //delete
    await Audio.findOneAndDelete({_id:audioId})
        .then(() => {
            res.json({ 
                message: 'delete audio successfully',
                success: true
            })
        })
        .catch((err) => {
            res.json(err.message)
        })
    await fs.stat(audio.music, function (err, data) { 
        if (err) {
            return console.error(err);
        } 
        fs.unlink(audio.music,function(err){
            if(err) return console.log(err);
        }); 
    })
    await fs.stat(audio.image, function (err, data) {
        if (err) {
            return console.error(err);
        }
        fs.unlink(audio.image,function(err){
            if(err) return console.log(err);
        }); 
    })
    return res.json({
        message: 'delete audio successfully'
    })
}

// get all audio

async function getAllAudio(req, res, next) {
    try {
        let audios = await Audio.find().lean();
        res.json({
            count: audios.length, 
            audios: audios
        })
    } catch (err) { 
        res.json(err.message);
    }
}

// get one audio

async function getOneAudio(req, res, next) {
    const audio_id = req.params.audioId
    try {
        const audio = await Audio.findOne({_id:audio_id});
        if (!audio) {
            throw new Error('No audio with such id!')
        }
        res.json(audio)
    } catch (err) {
        res.json(err.message)
    }
}

// get audio by user

async function getAudioByUser(req, res, next) {
    const { userId } = req.params
    try {
        const audio = await Audio.find({owner:userId});
        if (!audio) {
            res.json({message: "You haven't posted any songs yet"})
        }
        return res.json({
            quantity: audio.length,
            audio: audio
        })
    } catch (err) {
        res.json(err.message)
    }
}

// get audio by category

async function getAudioByCategory(req, res, next) {
    const { category } = req.params
    try {
        const audio = await Audio.find({category:category})
        if (!audio) {
            res.json({message: "not found"})
        }
        return res.json({
            quantity: audio.length,
            audio: audio
        })
    } catch (err) {}
}  

// search audio

async function searchAudio(req, res, next) {
    let keyWord = req.query.title;
    try {
        await Audio.find({title:{$regex: keyWord, $options: '$i'}})
            .then((data) => {
                res.json({audio: data})
            })
            .catch((err) => {
                res.json(err.message)
            })
    } catch (err) {
        res.json(err.message)
    }
}

// like audio

async function LikeAudio(req, res, next) {
    const {audioId} = req.params
    const userId = req.userId
    try {
        const audio = await Audio.findById(audioId)

        if(audio.likes.filter(like => like.user.toString() === userId).length > 0
        ) {
            return res.json({
                message: "Audio already liked !"
            })    
        }

        audio.likes.unshift({user: userId})

        await audio.save();
        return res.json({
            message: "You liked !",
            likes: audio.likes
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
}

// unLike

async function unLikeAudio(req, res, next) {
    const {audioId} = req.params
    const userId = req.userId
    try {
        const audio = await Audio.findById(audioId)

        if(audio.likes.filter(like => like.user.toString() === userId).length === 0
        ) {
            return res.status(400).json({
                message: "Audio has not yet been liked !"
            })     
        }

        // remove index
        const removeIndex = audio.likes
            .map(like => like.user.toString())
            .indexOf(userId);

        audio.likes.splice(removeIndex, 1)

        await audio.save();
        return res.json({
            message: "You unliked !",
            likes: audio.likes
        })
    } catch (err) {
        res.status(500).json(err.message)
    }
}

// get like audio

async function getLikeAudio(req, res, next) {
    const userId = req.userId
    try {
        const audio = await Audio.find({likes: {$elemMatch: {user: userId}}})
        if (audio.length < 1) {
            return res.json({
                message: "You don't like any audio yet?"
            })
        }
        return res.json({
            message: '',
            audio: audio
        })
    } catch(err) {
        res.json(err.message)
    }
}

module.exports = {
    PostAudio,
    getAllAudio,
    getOneAudio,
    searchAudio,
    getAudioByUser,
    getAudioByCategory,
    UpdateImage,
    LikeAudio,
    unLikeAudio,
    getLikeAudio,
    DeleteAudio
}