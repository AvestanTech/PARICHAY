const userModel = require("../models/user.Model")
const eventModel =require("../models/event.model")
const communityModel  =require("../models/comminityModel")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config({ path: '.env' })
const { validationResult } = require('express-validator');
const cloudinary =require('../.config/cloudinary')



const userSignup = async (req, res) => {
    try {
        // const { email, phoneNumber, password, title, fullName, gender, dateOfBirth, address, profession,
        //     education, maritalStatus, religion, caste, age, height, income, languages, aboutMe, hobbiesAndInterests,
        //     PartnerPreferences
        // } = req.body;
        const {
            email,
            password,
            title,
            fullName,
            fathersName,
            phoneNumber,
            gender,
            dateOfBirth,
            birthTime,
            nativePlace,
            height,
            education,
            profession,
            monthlyIncome,
            companyName,
            fathersProfession,
            numberOfSiblings,
            nameOfMaternalUncle,
            address,
            correspondingAddress,
            maritalStatus,
            age,
            religion,
            caste,
            languages,
            aboutMe,
  
        } = req.body;



        if (!email)  return res.status(400).json({ message: 'Email is required' });
        if (!password) return res.status(400).json({ message: 'Password is required' });
        if (!title) return res.status(400).json({ message: 'Title is required' });
        if (!fullName) return res.status(400).json({ message: 'Full name is required' });
        if (!fathersName) return res.status(400).json({ message: 'Father\'s name is required' });
        if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required' });
        if (!gender) return res.status(400).json({ message: 'Gender is required' });
        if (!dateOfBirth) return res.status(400).json({ message: 'Date of birth is required' });
        if (!birthTime) return res.status(400).json({ message: 'Birth time is required' });
        if (!nativePlace) return res.status(400).json({ message: 'Native place is required' });
        if (!height) return res.status(400).json({ message: 'Height is required' });
        if (!education) return res.status(400).json({ message: 'Education is required' });
        if (!profession) return res.status(400).json({ message: 'Profession is required' });
        if (!monthlyIncome) return res.status(400).json({ message: 'Monthly income is required' });
        if (!companyName) return res.status(400).json({ message: 'Company name is required' });
        if (!fathersProfession) return res.status(400).json({ message: 'Father\'s profession is required' });
        if (!numberOfSiblings) return res.status(400).json({ message: 'Number of siblings is required' });
        if (!nameOfMaternalUncle) return res.status(400).json({ message: 'Name of maternal uncle is required' });
        if (!address) return res.status(400).json({ message: 'Address is required' });
        if (!correspondingAddress) return res.status(400).json({ message: 'Corresponding address is required' });
        if (!maritalStatus) return res.status(400).json({ message: 'Marital status is required' });
        if (!age) return res.status(400).json({ message: 'Age is required' });

        
   
        // if (!req.files || !req.files.photograph) {
        //     return res.status(400).json({ message: 'Photograph is required' });
        // }

        // if (!req.files || !req.files.photograph) {
        //     return res.status(400).json({ message: 'Photograph is required' });
        // }



        const photographs = [];
        if (req.files && req.files.photograph) {
            for (const photo of req.files.photograph) {
                const photographFile = await cloudinary(photo.buffer);
                photographs.push(photographFile.secure_url);
            }
        }
        // let photograph 
        // if(req.files){
        // //   let{photograph} = req.files
        //   photograph=req.files.photograph
        // }

       

        // Check for validation errors

        // const {errors}=validationresult(req)

        // const {errors} = validationResult(req);
        // if(errors. length > 0) res.send(errors[0].msg)
 

        //const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({ errors: errors.array() });
        // // }
        // Const {errors}=validation result(req)

        const existingUser = await userModel.findOne({ email: email })
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' })
        }
        // Hashing the password
        const hashedPassword = await bcrypt.hash(password, 10)

        //  let photographFile=[];

        // if (photograph) {
        //     photographFile = await cloudinary(photograph[0].buffer);
        // };

        const newUser = await userModel.create({
            email,
            password: hashedPassword,
            title,
            fullName,
            fathersName,
            phoneNumber,
            gender,
            dateOfBirth,
            birthTime,
            nativePlace,
            height,
            education,
            profession,
            monthlyIncome,
            companyName,
            fathersProfession,
            numberOfSiblings,
            nameOfMaternalUncle,
            address,
            correspondingAddress,
            maritalStatus,
            age,
            religion,
            caste,
            languages,
            aboutMe,
            // photograph:photographFile?.secure_url
            photograph: photographs
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
        return res.status(200).json({message: 'User log successfully',user:user,token:token});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}





// Route to get all users
const getAllUsers = async (req, res) => {
    try {
        const {
            minAge,maxAge,
            minSalary,maxSalary,
            // minHeight,maxHeight,
            // caste,
            gender,
            // maritalStatus
        } = req.query
        
       let data ={};
       if(minAge && maxAge ){
        data.age ={$gte:minAge,$lte :maxAge}
       };

        
       if(minSalary && maxSalary ){
        data.monthlyIncome ={$gte:minSalary,$lte :maxSalary}
       };

    
    //    if(minHeight && maxHeight ){
    //     data.height ={$gte:minHeight,$lte :maxHeight}
    //    };

    //    if(caste){
    //     data.caste=caste
    //    };
       
       if(gender){
        data.gender=gender
       };
    //    if(maritalStatus){
    //     data.maritalStatus=maritalStatus
    //    };
    //    if(education){
    //     data.education= { $in: education };
    //    
    //    };

    // if (education && Array.isArray(education)) {
    //     // Filter users where the education field matches any value in the provided array
    //     data.education = { $in: education };
    //     console.log(data.education);
    // }

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
        let { 
            // email, password, phoneNumber, title, fullName, gender, dateOfBirth, address, profession,
            // education, caste, age, height, income
            title,
            fullName,
            fathersName,
            phoneNumber,
            gender,
            dateOfBirth,
            birthTime,
            nativePlace,
            height,
            education,
            profession,
            monthlyIncome,
            companyName,
            fathersProfession,
            numberOfSiblings,
            nameOfMaternalUncle,
            address,
            correspondingAddress,
            maritalStatus,
            age
        } = req.body

            // const {photograph} = req.files
            const photographs = [];
            if (req.files && req.files.photograph) {
                for (const photo of req.files.photograph) {
                    const photographFile = await cloudinary(photo.buffer);
                    photographs.push(photographFile.secure_url);
                }
            }
   
        // let photograph 
        // if(req.files){
        // //   let{photograph} = req.files
        //   photograph=req.files.photograph
        // }
        //     let photographFile;

        //     if (photograph) {
        //         photographFile = await cloudinary(photograph[0].buffer);
        //     };
    
        // if (Object.keys(req.body).length === 0) return res.status(400).send({ status: false, message: "Enter some Data to update" })

        // update blog document
        let update = await userModel.findOneAndUpdate({ _id: userId },
            {
                $set:
                // email, password, phoneNumber, title, fullName, gender, dateOfBirth, address, profession,
           
            // education, caste, age, height, income, 
                title,
                fullName,
                fathersName,
                phoneNumber,
                gender,
                dateOfBirth,
                birthTime,
                nativePlace,
                height,
                education,
                profession,
                monthlyIncome,
                companyName,
                fathersProfession,
                numberOfSiblings,
                nameOfMaternalUncle,
                address,
                correspondingAddress,
                maritalStatus,
                age,
                photograph: photographs
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

// const updatePassword = async (req, res) => {
//     try {
//         const userId = req.userId; // Assuming you have middleware to extract userId from token

//         // Retrieve the current password, new password, and confirm password from the request body
//         const { currentPassword, newPassword, confirmPassword } = req.body;

//         // Check if all required fields are present
//         // if (!currentPassword || !newPassword || !confirmPassword) {
//         //     return res.status(400).json({ message: 'Please provide currentPassword, newPassword, and confirmPassword' });
//         // }

//         // Find the user in the database based on userId
//         const user = await userModel.findById(userId);

//         // Check if the user exists
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Check if the current password matches the password stored in the database
//         const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
//         if (!isPasswordMatch) {
//             return res.status(400).json({ message: 'Current password is incorrect' });
//         }

//         // Check if the new password matches the confirm password
//         if (newPassword !== confirmPassword) {
//             return res.status(400).json({ message: 'New password and confirm password do not match' });
//         }

//         // Hash the new password
//         const hashedPassword = await bcrypt.hash(newPassword, 10);

//         // Update the user's password in the database
//         user.password = hashedPassword;
//         await user.save();

//         return res.status(200).json({ message: 'Password updated successfully' });
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// };

const updatePassword = async (req, res) => {
    try {
        const userId = req.userId;

        const { currentPassword, newPassword, confirmPassword } = req.body;

        // if (!currentPassword || !newPassword || !confirmPassword) {
        //     return res.status(400).json({ message: 'Please provide currentPassword, newPassword, and confirmPassword' });
        // }

        // Find the user in the database based on userId
        const user = await userModel.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the current password matches the password stored in the database
        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Check if the new password matches the confirm password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};




const pricesList = async (req, res) => {
    try {
      const prices = [
        {plan:'Basic', price:200, subscriptionTiming:'10 days' ,profileVisits:100 },
        {plan:'Economy' ,price:400, subscriptionTiming:'30 days' ,profileVisits:200},
        { plan:'Premium',price:1000, subscriptionTiming:'90 days' ,profileVisits:1000},
      
      ];

    const admin_name = "Project Name"
    const  admin_desc = "Description"
    const admin_contact = "Mobile Number"
    const  admin_email = "test@email.com"
    const admin_key = "rzp_test_1DP5mmOlF5G5ag" 

      return res.status(200).json({ status: true, prices: prices,admin_name:admin_name,admin_desc:admin_desc,admin_contact:admin_contact,
        admin_email:admin_email, admin_key:admin_key})
    } catch (err) {
      return res.status(500).send({ status: false, message: err.message});
  }
  }

  const subscription = async (req, res) => {
    try {
        const user = req.userId
        const findUser = await userModel.findById(user);
        if (!findUser) {
            return res.status(404).json({ msg: 'user not found' });
        }
       findUser.isSubscribed = "true" 
             await findUser.save()

       const {paymentId,price}=req.body
       const subscription = await userSubscriptionModel.create(
        {
            userId:user,
            paymentId,
            price,
        }
       )
         return res.status(200).json({message:'Subscription added for user',subscription:subscription});

    } catch (err) {
      return res.status(500).send({ status: false, message: err.message});
  }
  }


  const getAllEvents = async (req, res) => {
    try {

        
        // Find all events that are not deleted
        const events = await eventModel.find({ isDeleted: false });

        return res.status(200).json({total:events.length, events:events });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


const getCommunityMembers = async (req, res) => {
    try {

        const user = req.userId
        const findUser = await userModel.findById(user);
        if (!findUser) {
            return res.status(404).json({ msg: 'user not found' });
        }
        // Retrieve all community members that have not been marked as deleted
        const members = await communityModel.find({ isDeleted: false });

        // Return the list of community members in the response
        return res.status(200).json({ total: members.length, members });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


  
module.exports = {
    userSignup,
    userlogin,
    // CreateUserProfile,
    getAllUsers,
    getUser,
    updateUserProfile,
    deleteUser,
    updatePassword,
    pricesList,
    subscription,
    getAllEvents,
    getCommunityMembers
}



