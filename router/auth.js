const router = require('express').Router();
const {upload} = require('../config/upload');
const { Register, Login, Authenticate, UpdateProfile, UpdateAvatar} = require('../middleWares/auth');
const User = require('../models/user')



router.post('/register', Register);
router.post('/login', Login);
router.post('/update/:userId', UpdateProfile);
router.post('/avatar/:userId',upload.single("avatar"), UpdateAvatar);

router.get('/', Authenticate, async (req, res) => {
    try {
		const user = await User.findById(req.userId)
		if (!user)
			return res.json({ success: false, message: 'User not found' })
		res.json({ user })
	} catch (error) {
		console.log(error)
		res.json({ success: false, message: error.message })
	}
})



module.exports = router;