
import mongoose, { now, Schema } from "mongoose";
import bcrypt, { hash } from "bcrypt";
import JWT from "jsonwebtoken";

import crypto from "crypto";
// import {Schema,model} from "mongoose"; this is also a


//const userSchema=new Schema 
const userSchema= new mongoose.Schema({
 
    name:{
        type:String,
        trim:true,
        required:[true,'Name is required'],
        lowercase:true
    },
    email:{
        type:String,
        trim:true,
        required:[true,'Email is required'],
        unqiue:true,
        match:[/^(?:(?:[\w`~!#$%^&*\-=+;:{}'|,?\/]+(?:(?:\.(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)*"|[\w`~!#$%^&*\-=+;:{}'|,?\/]+))*\.[\w`~!#$%^&*\-=+;:{}'|,?\/]+)?)|(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)+"))@(?:[a-zA-Z\d\-]+(?:\.[a-zA-Z\d\-]+)*|\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])$/gim,'please set avalid email']
        //we give regular expression to match the email
    },
    password:{
        type:String,
        trim:true,
        required:[true,'password is required'],
        
        select:false,// meana jab tak explicitely password nhi manga jaega tab tak password mat dena
      
    },
    // role yeh bataega ki authority kya kya hai
    role:{
    type:String,
    enum:["USER", "ADMIN"],//return object {USER:'USER',ADMIN:'ADMIN};
    default:"USER"//by default user is a normal user
    },
    avatar:{
      //is id ke though avatar ko uniquely identify kara jaega
    public_id:{
      type:String
    },
    //is url ke throuh avatar ko access kar ajaega yeh clodnary la url hai jahan image store hogi
    secure_url:{
      type:String
    },
  },
    profile: {
      bio: {
        type:String
      },
      location: {
        type:String
      },
      website: {
        type:String
      }, //below two string used for forget password
    },
    createdAt: {
      type:Date,
    },
    updatedAt: {
      type:Date,
    },
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project' // Reference to Project collection
  }],
  backedProjects: [{
      projectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Project' // Reference to Project collection
      },
      amount: Number,
      rewardId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Reward' // Reference to Reward collection
      }
  }]
  
   
  },{
    timestamps:true
})

userSchema.methods={
  generateJWTToken: async function(){
return await JWT.sign(
  {id:this._id,name:this.name,email:this.email,role:this.role},
  process.env.SECRET,
  {expiresIn:process.env.EXPIRY}
)

  },
  comparepassword:async function(password){


console.log("password>",password);
console.log("this.passsword",this.password);
// await bcrypt.compare(password, user.password)
   const match=await bcrypt.compare(password,this.password);
 console.log("match>",match);
return match;

  },
generatepasswordresettoken:async function(){
    //yahan reset token hum crypto se banaenge jwt se nhi kyunki yahan token me humko apni information nhi deni sirf yeh validate karna hai ki jab hum yeh token user ko bejen aur user wapsi me humko new password ke sath token bheje to humo sirf validate karna hai ki kya yeh whi token hai
    const resetToken=crypto.randomBytes(20).toString('hex');//yeh 20 byte ka ek token bna dega and then us token ko hex string me badal dega
    //ab is token ko hume database me store karana hai
    // this.forgetPasswordToken=resetToken; is tarah se bhi token daal sakte hai but agar database me security se related koi cheez rakhen to use as it is na daalen
    console.log("reset token>>",resetToken);
    this.forgetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');
//isko hum crypto se encrypt kar rhe hain;
//sha256=>is an encrypting algorithm
//update(resetToken) ko encrypt karna hai
//digest('hex') means hex me digest kar dena hai

    this.forgetPasswordExpiry=Date.now()+15*60*100;//jab humne token generate kiya tabse 15 minute tak valid hoga uske baad expire hojaega yahan hum miliseconds me dete hai

return resetToken;

  }


}

//save karne se pehle callback execute kardo
// userSchema.pre('save',async function(next){//yeh code asal me controller me likhna hai
// //ismodified btata hai ki password ko modifird karne ki zarurat hai ya nhi true meana password need to be modified
// if(this.isModified('password')){
//   next();
// }

// this.password=await bcrypt.hash('password',10);

// })

const User= mongoose.model("User",userSchema);//database me User->Users ho jaega
export default User;
