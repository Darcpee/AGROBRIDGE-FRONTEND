const express = require ("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose")
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const User =require("../model/user");
const user = require("../model/user");
const blacklistedTokens = require("./blacklist");





exports.registerUser = async (req, res) => {
  try {

    const { name, email, password, phone, role } = req.body;

    // validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // check existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // validate role
    const validRoles = ["buyer", "farmer"];
    const userRole = validRoles.includes(role) ? role : "buyer";

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role: userRole
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      role: newUser.role
    });

  } catch (error) {

    res.status(500).json({
      message: "Error creating user",
      error: error.message
    });

  }
};

//USER LOGIN
exports.login = async (req,res)=>{
    const { email, password }=req.body;

    try {
       const user = await User.findOne({ email:email});
       if (!user) {
        return res.status(400).json({
            status:"user not found",
            message:"user does not exist"
        });
       }
       
       const ispasswordvalid = await bcrypt.compare(password,user.password);
       if (!ispasswordvalid) {
         return res.status(400).json({
        status: "fail",
        message: "Invalid credentials"
      });
       }
         console.log( "JWT_SECRET", process.env.JWT_SECRET);
         const token = jwt.sign({ id:user._id}, process.env.JWT_SECRET, {expiresIn:"7h"});
          return res.status(200).json({
                status:"login successful",
                message:"login successful",
                token:token,
                user:{
                    email:user.email,
                    role:user.role
                   
                }
            });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            status:"login failed",
            message:"An error occurred during login"
        });
    }
}


//get user profile
exports.getUserprofile = async (req, res) =>{
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
           return res.status(404).json({ message: "User not found" }); 
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Error fetching user profile", error });
    }
}

//update user profile
exports.updateUser = async(req,res) =>{
    const { username, newusername } = req.body;

     try {
    const updatedUser = await User.findOneAndUpdate(
      { username }, // Find by name
      { $set: newusername }, // Apply updates
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found with the specified name",
      });
    }

    console.log("Updated user:", updatedUser); // For debugging (optional)

    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error during user update",
    });
  }
};

//update user by id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;        // Get user ID from URL
     console.log("Received ID:", id);

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Validate fields based on schema
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

//delete user
exports.deleteUse = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error deleting user", error });
    }
}

//delete user by username
exports.deleteUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {

    const deletedUser = await User.findOneAndDelete({ username });

    if (!deletedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
      user: deletedUser
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: "error",
      message: "Server error while deleting user"
    });
  }
};

//get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        res.status(200).json({
      status: "success",
      totalUsers: users.length,
      data: users
    })
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ message: "Error fetching all users", error });
    }
}

// logout user
exports.logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    blacklistedTokens.add(token);
  }

  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};