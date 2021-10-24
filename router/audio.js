const router = require('express').Router();
const {upload} = require('../config/upload');
const { PostAudio, 
        getAllAudio, 
        getOneAudio, 
        searchAudio, 
        getAudioByUser,
        getAudioByCategory,
        UpdateImage,
        LikeAudio,
        unLikeAudio,
        getLikeAudio,
        DeleteAudio } = require('../middleWares/audio');

const { Authenticate } = require('../middleWares/auth')

router.post('/post/:userId', upload.single("music"),PostAudio);
router.post('/updateImage/:audioId', upload.single("image"),Authenticate,UpdateImage);
router.get('/getAll', getAllAudio);
router.get('/audioByUser/:userId', getAudioByUser)
router.get('/getOne/:audioId', getOneAudio)
router.get('/search', searchAudio)
router.get('/audioByCategory/:category', getAudioByCategory)
router.put('/like/:audioId',Authenticate, LikeAudio)
router.put('/unLike/:audioId',Authenticate, unLikeAudio)
router.get('/getLikeAudio', Authenticate, getLikeAudio)
router.delete('/delete/:audioId', Authenticate, DeleteAudio)

module.exports = router    