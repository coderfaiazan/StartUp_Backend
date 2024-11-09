import dotenv from "dotenv";
dotenv.config({
  path:'./.env'
})

import app from "./app.js"
import connecttoDB from "./config/connecttoDB.js";
import cloudinary from "cloudinary"
import Razorpay from "razorpay"


const PORT=process.env.PORT||7000;

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
    
    });
//razor pay ka configraturation set karna hai
//this is a instance of razor pay
export const razorpay=new Razorpay({
  key_id:process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_SECRET
  })

app.listen(PORT,async ()=>{
    await connecttoDB();
    console.log(`your server is running on http://localhost:${PORT}`);
});