

function errorMiddleware(err,req,res,next){
    err.statusCode=err.statusCode||500;
    err.message=err.message||"something went wrong";
    
        //is format me problem yeh hai ki agar err object me status code n diya aur message ki spelling galat ho gyi
      return   res.status(err.statusCode).json({
    success:false,
    message:err.message,
    Stack:err.Stack
    
        })
    

}

export default errorMiddleware;