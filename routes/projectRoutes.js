import express from "express";
import upload from "../middleware/multer.middleware.js";
import { projectRegisteration ,addReward, posts,AddComents,updateProject
    ,deleteProject, getProject, getProjects
} from "../controller/project.controller.js";
import isloggedin from "../middleware/auth.login.middleware.js";
const router=express.Router();
//route for register project give userid by params and check user is loggedin and then proces
router.put('/register/:userid',isloggedin,upload.single('mediaurls'),projectRegisteration);
//simply add the reward by giving projectid and info by req,body
router.post('/add',addReward);
//simply post by giving the projectid
router.post('/posts',posts);
//take userid by req.body.user.id and postid and content by req.body and process
router.post('/comment',isloggedin,AddComents);
//update project by giving projectid by req.params and updtaed filds by req.body and process
router.put('/update/:id',upload.single('mediaurls'),isloggedin,updateProject );
//simply delete the project by giving projectid by req.params
router.delete('/delete/:projectId',deleteProject )
//get a specific project
router.get('/me/:title', getProject)
//get the projects category wise
router.get('/projects/:category', getProjects)
export default router;