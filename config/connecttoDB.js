import mongoose from "mongoose";

mongoose.set('strictQuery',false);

async function connecttoDB(){

    try{
      const connection=await  mongoose.connect(process.env.MONGO_URL);
      console.log(`server is connected to databse at ${connection.connection.host}`);

    }
    catch(err){
console.log("Error in mongo connection ",err);
        process.exit(1);

    }


}
export default connecttoDB;

