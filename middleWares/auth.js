const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require("fs");

//register

async function Register(req, res, next){
    try{
        const {email, password, fullName, dob, gender} = req.body;
        const newEmail = await User.findOne({email: email}).exec();
        const encryptedPassword = await bcrypt.hash(password, 10);
        if(newEmail){
            
            throw new Error("email already exists !")
        }
        if(password.length < 6){
          
            throw new Error("password is too short")
        }
        const user = new User ({
            email: email.toLowerCase(), //convert email to lowercase
            password: encryptedPassword,
            fullName: fullName,
            dob: dob,
            gender: gender
       })
       await user.save();

       const PRIVATE_TOKEN = jwt.sign(
        {userId: user._id},
        process.env.ACCESS_TOKEN_SECRET,
       
    );

       return res.json({
                message: 'Register successfully !',
                user: user.toJSON(),
                success: true,
                PRIVATE_TOKEN
            });
    } catch(err){
        res.json(err.message)
    }
}


// Login

async function Login(req, res, next){
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        if(!user) {
            throw new Error('Unregistered email')
        }
        if(user && (await bcrypt.compare(password, user.password))) {
            const PRIVATE_TOKEN = jwt.sign(
                {userId: user._id},
                process.env.ACCESS_TOKEN_SECRET,
                
            );

            return res.json({
                message: 'Login successfully !',
                user: user.toJSON(),
                success: true,
                PRIVATE_TOKEN
            });
        }
        res.json('wrong password !');
    } catch(err){
        res.json(err.message)
    }
}

// update profile
async function UpdateProfile(req, res, next) {
    try {
        const {userId} = req.params;
        const { newPhone, newName } = req.body;

        const user = await User.findById(_id = userId)
        const name = newName.length > 2 ? newName : user.fullName
        const phone = newPhone.length > 2 ? newPhone : user.phone

        const update = {
            phone : phone,
            fullName: name
        }
        await User.findOneAndUpdate( _id = userId, update )
            .then((updateData) => {
                res.json({
                    message: "Update successfully !",
                    user: updateData
                })
            })
            .catch((err) => {
                throw err;
            })
    }
    catch (err) {
        res.status(400).json(err.message);
    }
}

// upload avatar

async function  UpdateAvatar(req, res, next) {
    const {userId} = req.params;
    try{
        const changeAvatar = {
            avatar: req.file.path 
        }
        const checkAvatarUser = await User.findById(userId)
        await User.findOneAndUpdate( {_id : userId}, changeAvatar )
        .then((UpdateAvatar) => {
            res.json({
                message: "avatar change successfully",
                user: UpdateAvatar
            })
        })
        .catch((err) => {
            throw err;
        })
        if (checkAvatarUser.avatar) {
            await fs.stat(checkAvatarUser.avatar, function (err, data) { 
                if (err) {
                    console.error(err);
                } 
                fs.unlink(checkAvatarUser.avatar,function(err){
                    if(err) return console.log(err);
                }); 
            })
        }
    } catch (err){
        res.status(400).json(err.message)
    }
} 



// authenticate
async function Authenticate(req, res, next){
    const authHeader = req.header('Authorization').split(" ")[1]

    if (!authHeader){
        return res.json('Token not found !')
    }
   
    try {
		const decoded = jwt.verify(authHeader, process.env.ACCESS_TOKEN_SECRET)
		req.userId = decoded.userId
		next()
	} catch (error) {
		console.log(error)
		return res.status(403).json({ success: false, message: error.message })
	}
}

module.exports = {
    Register,
    Login,
    Authenticate,
    UpdateProfile,
    UpdateAvatar
}
