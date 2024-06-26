const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.Controller")
// const utility = require("../controllers/otp.Controller")
const Middleware= require("../middleware/middleware")
const userValidation = require("../validations/validations");

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage:storage});


router.post('/signup',upload.fields([
    { name:"photograph"}
    ]),userController.userSignup)

router.post('/login', userController.userlogin)


// router.post('/forget', utility.sendEmailVerificationOTP)
// //otp
// router.post('/forgot-password',utility.forgetPassword)
// router.post('/forgot-password/verify-otp',utility.verifyOtpForForgetPassword)
// router.post('/verify-otp', utility.verifyOtp)


router.use(Middleware.authentication)

// router.post('/profile', userController.CreateUserProfile)
router.get('/users', userController.getAllUsers)
router.get('/user', userController.getUser)

router.put('/update',upload.fields([
    { name:"photograph"}
    ]), userController.updateUserProfile)
    
router.delete('/delete', userController.deleteUser)
router.post('/update-password', userController.updatePassword)
router.get('/prices',userController.pricesList)
router.post('/subscription',userController.subscription)
router.get('/user-events',userController.getAllEvents);
router.get('/members', userController.getCommunityMembers)


module.exports=router;