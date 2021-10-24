const path = require('path');
const multer = require('multer');
const fileSize = 1024 * 1024 * 5;



let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        if (file.fieldname === 'music') {
            cb(null, 'public/audio')
        } else if (file.fieldname === 'image') {
            cb(null, 'public/image')
        } else {
            cb(null, 'public/avatar')
        }
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '_' + req.params.userId + "_" +Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: fileSize,
    },
    fileFilter: (req, file, cb) => {
        // validate image extension
        const acceptedExt = /jpeg|jpg|png|mp3|mpeg/;
        const extName = acceptedExt
            .test(path.extname(file.originalname).toLowerCase());
        const mimeType = acceptedExt.test(file.mimetype);
        if (extName && mimeType) {
            return cb(null, true);
        }
        cb(new Error('Invalid file extension!'));
    },

 })

module.exports = {upload}