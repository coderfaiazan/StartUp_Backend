
import express from "express";
import upload from "../middleware/multer.middleware.js";
import {register,login,logout,getUser,changepassword,updateuser,forgot,reset} from "../controller/user.controller.js"
import isloggedin from "../middleware/auth.login.middleware.js";
const router=express.Router();
//for registration of user
router.post('/register',upload.single('avatar'),register);
//for login
router.post('/login',login);
//for logout
router.get('/logout',logout);
//for getting profile
router.get('/me',isloggedin,getUser);
//for change the pasword
router.post('/changepassword',isloggedin,changepassword);
//update the user by giving userid by req.params
router.put('/update/:id',upload.single('avatar'),isloggedin,updateuser);
//for forgot password
router.post('/forgot-password',forgot);
//for giving mail for reset password
router.post('/reset-password/:resetToken',reset);


// router.put('/update/:id',upload.single('avatar'),isloggedin,updateuser);

export default router;