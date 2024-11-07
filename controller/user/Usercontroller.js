import express from "express"
import Users from "../../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/generateToken.js";
import jwt from "jsonwebtoken"
import Address from "../../models/addressMode.js";




import nodemailer from 'nodemailer';

import {google} from "googleapis"
import axios from "axios"



import crypto from "crypto"
import dotenv from 'dotenv';
import { error } from "console";
dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

console.log('llll')
console.log(GOOGLE_CLIENT_SECRET)
console.log(GOOGLE_CLIENT_ID)




const oauth2client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  'postmessage'
  
  
  
  )



  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'paulsaji201@gmail.com',
      pass: 'jrtlewsenpjmizvi'
    }
  });
  
  
  const otpDatabase = {};
  
  
  export const sendOtp  =   async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
  
  
    const otp = crypto.randomInt(100000, 999999).toString();
    otpDatabase[email] = otp;
  

    const mailOptions = {
      from: '"Your Name" <paulsaji201@gmail.com>',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
      html: `<p>Your OTP code is <strong>${otp}</strong></p>`,
    };
       console.log(otp)
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ message: 'Failed to send OTP', error });
    }
  }
  
 
  export const verifyOtp =  async (req, res) => {
    console.log("otp....")
    console.log(otpDatabase)
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
  
    if (otpDatabase[email] === otp) {
      delete otpDatabase[email]; // OTP is valid, remove it from the database
      res.status(200).json({ message: 'OTP verified successfully' });
    } else {
      res.status(401).json({ message: 'Invalid OTP' });
    }
  };




  export const googleReg = async (req, res) => {
    console.log("Google OAuth process started...");
    try {
      const { code } = req.query;
  
      if (!code) {
        return res.status(400).json({ message: 'Authorization code is missing' });
      }
  
     
      const googleRes = await oauth2client.getToken(code);
      const { tokens } = googleRes;
  
      if (!tokens || !tokens.access_token) {
        throw new Error('Failed to obtain access token');
      }
  
      // Set credentials for future API calls
      oauth2client.setCredentials(tokens);
  
      // Fetch user info from Google
      const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`);
      const { email, name } = userRes.data;
  
      if (!email || !name) {
        throw new Error('Failed to obtain user information from Google');
      }
  
      console.log(email, name);
  
      // Find or create user in the database
      let user1 = await Users.findOne({ email });
      if (!user1) {
        user1 = await Users.create({
          email,
          name
        });
        console.log("New user created: ", user1);
      }
  
      generateToken(res, user1);
  
      res.status(200).json({
        message: 'Google OAuth successful',
        user: {
          _id: user1._id,
          name: user1.name,
          email: user1.email,
        }
      });
  
    } catch (error) {
      console.error("Google OAuth error:", error);
  
      if (error.response) {
        // Handle errors returned from Google API
        console.error("Google API Error:", error.response.data);
      }
  
      res.status(500).json({
        message: 'OAuth error',
        error: error.message || 'An error occurred during the OAuth process'
      });
    }
  };
  


export const Login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  
  try {
    const userData = await Users.findOne({ email: email });

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const matchPassword =  await bcrypt.compare(password, userData.password);

    if (!matchPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (userData.blocked) {
      return res.status(403).json({ message: "You are a blocked user" });
    }
    
    generateToken(res, userData);
    return res.status(200).json({
      message: "Login successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Failed to login", error });
  }
};

const userRegister = async (req, res) => {
  const { name, email, phoneNumber, password } = req.body;
  try {
    const existingUser = await Users.findOne({ email: email });

    if (existingUser) {
      return res.status(400).json({ message: "user alreday exists" });
    }
    console.log(password, email, typeof password);
    const hashedPassword = await bcrypt.hash(password, 10);
    const users = new Users({
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      password: hashedPassword,
      blocked: false,
    });
    const udata = await users.save();
    console.log(udata._id);
    generateToken(res, udata);

    res.status(200).json({ message: "register Succesfully", user: udata });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "failed registeration", error });
  }
};

export const verifyUser = async (req, res) => {
  console.log("mo");
  try {
    const user = req.user;
    console.log(user);
    const userData = await Users.findById(user.id);
    if (!userData) {
      return res.status(401).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User verifed", user: userData });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Fail to verifyUse", error });
  }
};
export const logoutUser = async (req, res) => {
  try {
    console.log("Logging out user...");

    
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0) // Set the cookie to expire in the past
    });

    // Send a success response
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error);

    // Send an error response
    res.status(500).json({ message: "Failed to log out user" });
  }
};


export const addAddress = async (req, res) => {
  const userId = req.user.id;
  console.log(userId)
  try {
    const {
      name,
      city,
      state,
      address,
      pincode,
      addressType,
      landmark,
      mobile,
      email,
      alternate,
    } = req.body.data;

    
    const newAddress = new Address({
      userId: userId,
      name,
      city,
      state,
      address,
      pincode,
      addressType,
      landmark,
      mobile,
      email,
      alternate,
    });

    await newAddress.save();

    res.status(201).json(newAddress);
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: error.message });
  }
};

export const getAddress = async (req, res) => {
  const userId = req.user.id;

  try {
    const addresses = await Address.find({ userId: userId });

    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteAddress = async (req, res) => {
  const addressId = req.params.id;  
  const userId = req.user.id; 

  try {
   
    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      return res.status(404).json({ message: 'Address not found or not authorized' });
    }

    await Address.findByIdAndDelete(addressId);

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

export const editAddress =  async (req, res) => {
   
  console.log(req.body)
  const { id } = req.params;
  const updatedData = req.body;

  try {
  
    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    
    

    const updatedAddress = await Address.findByIdAndUpdate(id, updatedData, { new: true });
    
    res.status(200).json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const forgetpassword = async(req,res)=>{
const {email}= req.body
  
  console.log(req.body.email);

  const udata = await Users.findOne({email:email})
  console.log(udata.name)
  if(!udata){
    return res.status(401).send({message:"email not found"})

  }
 

  const token = jwt.sign({user_id:udata._id,email:udata.email}, "secretKey", {expiresIn: "1h"})  
  const resetUrl = ` http://localhost:5173/reset-password?user_id=${udata._id}&token=${token}`;      
  
  
  
  
  const sendOtpResest =  async () => {
  
  
  

    const mailOptions = {
      from: '"Your Name" <paulsaji201@gmail.com>',
      to: email,
      subject: 'Password Reset Request',
      text: `You requested to reset your password. Use the link below to reset it:\n${resetUrl}`,
      html: `
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link is valid for 1 hour.</p>
      `,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Password reset link sent successfully' });
    } catch (error) {
      console.error('Error sending password reset link:', error);
      res.status(500).json({ message: 'Failed to send password reset link', error });
    }
  };
  sendOtpResest()

}
export const resetpassword = async (req, res) => {
  console.log("hello")
  const { user_id, token, password } = req.body;

console.log({ user_id, token, password })
  



  try {
    
    const decoded = jwt.verify(token, "secretKey");
    
    if (decoded.user_id !== user_id) {
      console.log(1)
      return res.status(401).json({ message: 'Invalid token or user' });
    }

    
    const user = await Users.findById(user_id);
    if (!user) {
      console.log(2)
      return res.status(404).json({ message: 'User not found' });
      
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully', user });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};



export const userProfile = async (req, res) => {
  console.log("Fetching user profile...");
  const userId = req.user.id; 

  try {
    
    const data = await Users.findById(userId);

    if (!data) {
      return res.status(400).send({ message: "No user found" });
    }

    return res.status(200).json(data); 
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).send({ message: "Server error" }); 
  }
};

export const editProfile = async (req, res) => {
  const userId = req.user.id; // Assuming req.user contains the authenticated user data
  const { email, name, phoneNumber } = req.body;

  try {
   
    const updatedUser = await Users.findByIdAndUpdate(
      userId, 
      { $set: { email, phoneNumber, name } },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ message: "An error occurred while updating the profile" });
  }
};
export default userRegister;
