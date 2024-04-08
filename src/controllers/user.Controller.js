const userModel = require("../models/user.Model");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config({ path: '.env' })
const { validationResult } = require('express-validator');
const cloudinary =require('../.config/cloudinary')


const userSignup = async (req, res) => {
    try {
        const { email, phoneNumber, password, title, fullName, gender, dateOfBirth, address, profession,
            education, maritalStatus, religion, caste, age, height, income, languages, aboutMe, hobbiesAndInterests,
            PartnerPreferences
        } = req.body;

        let photograph 
        if(req.files){
        //   let{photograph} = req.files
          photograph=req.files.photograph
        }

       
      

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const existingUser = await userModel.findOne({ email: email })
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' })
        }
        // Hashing the password
        const hashedPassword = await bcrypt.hash(password, 10)

         let photographFile;

        if (photograph) {
            photographFile = await cloudinary(photograph[0].buffer);
        };

        const newUser = await userModel.create({
            email,
            password: hashedPassword,
            phoneNumber,
            title,
            fullName,
            gender,
            dateOfBirth,
            address,
            profession,
            education,
            maritalStatus,
            religion,
            caste,
            age,
            height,
            income,
            languages,
            aboutMe,
            hobbiesAndInterests,
            PartnerPreferences,
            photograph:photographFile?.secure_url
        });
        const token = jwt.sign({ userId: newUser._id }, process.env.SECRET_KEY, { expiresIn: '1d' })
        res.setHeader('token', token);
        return res.status(201).json({ message: 'User created successfully', user: newUser, token:token })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


// Route to handle user sign-in
const userlogin = async (req, res) => {
    try {

        // Extracting user input from request body
        const { email, password } = req.body;
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "Enter Required Data" })

        // Check if the user exists
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email' });
        }

        // Verify the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // If user credentials are valid, generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '24h' } // Token expires in 24 hour
        );
        res.setHeader('Authorization', token);
        return res.status(200).json({data:user,token:token});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await userModel.findOne({ email });

        // Check if user exists and OTP matches
        if (!user || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP or email' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password and clear OTP
        user.password = hashedPassword;
        user.otp = '';
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Route to get all users
const getAllUsers = async (req, res) => {
    try {
        const {minAge,maxAge,minHeight,maxHeight,caste,education} = req.query
        
       let data ={};
       if(minAge && maxAge ){
        data.age ={$gte:minAge,$lte :maxAge}
       };
    
       if(minHeight && maxHeight ){
        data.height ={$gte:minHeight,$lte :maxHeight}
       };

       if(caste){
        data.caste=caste
       };

       if(education){
        data.education= { $in: education };
        console.log(data.education);
       };

        const users = await userModel.find({ isDeleted: false, ...data });
        res.status(200).json({ total: users.length, data: users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Route to get a user by ID
const getUser = async (req, res) => {
    try {
        const user = req.userId

        const findUser = await userModel.findOne({ _id: user, isDeleted: false });
        if (!findUser) {
            return res.status(404).json({ msg: 'user not found' });
        }

        res.status(200).json(findUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//remaning in update 
//1) only able to update to update those fields which  are present in model not other than that
//2} validations

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId;

        // Check if the user exists
        const findUser = await userModel.findById(userId);
        if (!findUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user profile exists
        let userProfile = await userModel.findById(userId);
        if (!userProfile) return res.status(404).json({ message: 'User Profile not found' });
        // If user profile doesn't exist, create a new one


        // If user profile already exists, update it
        let { email, password, phoneNumber, title, fullName, gender, dateOfBirth, address, profession,
            education, caste, age, height, income} = req.body

            const {photograph} = req.files
            let photographFile;

            if (photograph) {
                photographFile = await cloudinary(photograph[0].buffer);
            };
    
        if (Object.keys(req.body).length === 0) return res.status(400).send({ status: false, message: "Enter some Data to update" })

        // update blog document
        let update = await userModel.findOneAndUpdate({ _id: userId },
            {
                $set: email, password, phoneNumber, title, fullName, gender, dateOfBirth, address, profession,
                education, caste, age, height, income, photograph:photographFile?.secure_url
            },
            { new: true })
        return res.status(200).send({ status: true, message: 'User is updated', update })
    }

    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = req.userId

        const findUser = await userModel.findById(user);
        if (!findUser) {
            return res.status(404).json({ msg: 'user not found' });
        }
        if (findUser.isDeleted == true) return res.status(400).send({ status: false, message: "User is already Deleted" })
        //deleting blog by its Id 
        const deleteUser = await userModel.findOneAndUpdate({ _id: user, isDeleted: false }, { $set: { isDeleted: true } })
        return res.status(200).send({ status: true, message: "User is deleted" })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports = {
    userSignup,
    userlogin,
    // CreateUserProfile,
    getAllUsers,
    getUser,
    updateUserProfile,
    deleteUser,
    // forgetPassword,
    resetPassword
}



