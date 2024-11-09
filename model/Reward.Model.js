import mongoose, { Schema } from "mongoose";

const rewardSchema= new mongoose.Schema({
    projectId:{
       type:String,
       required:true

    },
    title:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },
    description:{
        type:String
    },
    minContribution:{
        type:Number,
        required:true,   
    },
    available:{
        type:Number,
        required:true
    },
    backersClaimed:[{
        type:String,
       
    }],
    estimatedDate:{
        type:Date
    },
    createdAt:Date,
    updatedAt:Date
},{
    timestamps:true
})
 
const Reward = mongoose.model("Reward", rewardSchema);
export default Reward;