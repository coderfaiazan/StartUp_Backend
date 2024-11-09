
import express, { urlencoded } from "express";
import morgan from "morgan";
import cors from"cors";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { configDotenv } from "dotenv";
import userroutes from "./routes/userRoutes.js";
import projectroutes from "./routes/projectRoutes.js"
import paymentsroutes from "./routes/paymentsRoutes.js"
import cookieParser from "cookie-parser";
//import articleRoutes from "./routes/articles.routes.js";

const app=express();
configDotenv();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan('dev'));
app.use(cors(
{

    origin:[process.env.FRONTEND_URL1,process.env.FRONTEND_URL2],
credentials:true//cookie set ho jaegi
}

));
app.use(cookieParser());
app.use('/api/v1/user',userroutes);
app.use('/api/v1/project',projectroutes);
app.use('/api/v1/payment',paymentsroutes);
app.post("/api/v1/createCollectionItem", async (req, res) => {
    try {
      const { content, description } = req.body;
  
      const response = await fetch(
        "https://api.vultrinference.com/v1/vector_store/chatbot/items",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.VULTR_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content, description }),
        }
      );
  
      if (!response.ok) {
        throw new Error(
          `Failed to create collection item: ${response.statusText}`
        );
      }
  
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message});
    }
  });
app.use('ping',(req,res,next)=>{
return res.send("pong");
})

app.all('*',(req,res,next)=>{
return res.status(400).send("404 page not found");
})

app.use(errorMiddleware);

export default app;
