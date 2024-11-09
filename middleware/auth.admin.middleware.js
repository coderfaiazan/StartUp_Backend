import UserModel from "../model/User.Model.js";
import AppError from "../utils/error.utils.js";

const isAdmin=(...roles)=>async (req,res,next)=>{

const {id}=req.body.user;

const user=await UserModel.findById(id);

const userRole=user.role;
console.log("user>>",user);
console.log("userRole>>",userRole);

if(!roles.includes(userRole)){
    return next(new AppError("You are not an Admin",400));
}

next();


}

export default isAdmin;