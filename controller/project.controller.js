import Project from "../model/Project.Model.js";
const projectmodel = Project;
import Reward from "../model/Reward.Model.js";
const rewardmodel = Reward;
import User from "../model/User.Model.js";
const usermodel = User;
import Post from "../model/Post.Model.js";
const postmodel = Post;
import Comment from "../model/Comments.Model.js";
const commentmodel = Comment;
import cloudinary from "cloudinary";
import fs from "fs/promises";
import AppError from "../utils/error.utils.js";

async function projectRegisteration(req, res, next) {
  try {
    const {
      title,
      description,
      category,
      fundingGoal,
      amountRaised,
      deadline,
    } = req.body;
    console.log("Request", req.body);
    // Check for missing fields
    if (
      !title ||
      !description ||
      !category ||
      !fundingGoal ||
      !amountRaised ||
      !deadline
    ) {
      return next(new AppError("All fields are required", 400));
    }

    // Check if user is logged in
    const { userid } = req.params;
    const user = await usermodel.findById(userid);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if project already exists
    const projectExist = await projectmodel.findOne({ title });
    if (projectExist) {
      return next(new AppError("Project already exists", 400));
    }

    // Create initial project data
    const project = await projectmodel.create({
      title,
      description,
      category,
      fundingGoal,
      amountRaised,
      deadline,
      mediaurls: {
        public_id: user.email,
        secure_url:
          "https://tse2.mm.bing.net/th?id=OIP.rBroxJeka0Jj81uw9g2PwAHaHa&pid=Api&P=0&h=220",
      },
    });

    if (!project) {
      return next(
        new AppError("Project not registered, please try again", 500)
      );
    }

    // Check if file is provided
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "STARTUP",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });

        // Update project mediaurls with Cloudinary result
        project.mediaurls.public_id = result.public_id;
        project.mediaurls.secure_url = result.secure_url;
        console.log("File Uploaded!!");
        // Remove file from server
        await fs.rm(`uploads/${req.file.filename}`);
      } catch (err) {
        return next(
          new AppError(
            err.message || "File not uploaded, please try again",
            404
          )
        );
      }
    }

    // Add project to user's projects array and save user
    project.creatorId = userid;
    project.collaborators.push(userid);
    await project.save();
    user.projects.push(project._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Project registered successfully",
      project,
    });
  } catch (err) {
    console.log("Error>>", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
async function deleteProject(req, res, next) {
  try {
    // Extract title from request parameters
    const { projectId } = req.params;

    // Check if the project exists in the database using the title
    const project = await projectmodel.findById(projectId);
    if (!project) {
      return next(new AppError("Project does not exist", 404));
    }

    // Check if the project has media URLs and delete the associated Cloudinary resource if present
    if (
      project.mediaurls &&
      // project.mediaurls.length > 0 &&
      project.mediaurls.public_id
    ) {
      const publicId = project.mediaurls.public_id;
      try {
        await cloudinary.v2.uploader.destroy(publicId);
      } catch (error) {
        return next(new AppError("Cannot delete file from Cloudinary", 403));
      }
    }

    // Delete the project from the database by title
    await projectmodel.findOneAndDelete({ title });

    // Respond with success message
    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
async function getProject(req, res, next) {
  try {
    var { title } = req.params;
    title = title.replace(/-/g, " ");
    const project = await projectmodel
      .findOne({ title })
      .populate("rewards")
      .populate("creatorId")
      .populate({
        path: "posts",
        populate: {
          path: "comments",
          select: "content createdAt updatedAt userName", // Select content and timestamps fields from comments
        },
      });
    if (!project) {
      return next(new AppError("Project does not exist", 400));
    }
    return res.status(200).json({
      success: true,
      message: "project details",
      project,
    });
  } catch (err) {
    console.log("Error>>", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
async function getProjects(req, res, next) {
  try {
    // Extract category from query parameters, if present
    const { category } = req.params;

    // Check if category is specified and retrieve projects accordingly
    let projects;
    if (category) {
      if (category == "All") {
        // If no category specified, retrieve all projects
        projects = await projectmodel.find();
        res.status(200).json({
          success: true,
          data: projects,
        });
      } else {
        // Ensure the category is valid
        const validCategories = [
          "Technology",
          "Art",
          "Education",
          "Health",
          "Film",
          "Games",
          "Music",
          "Food",
        ];
        if (!validCategories.includes(category)) {
          return next(new AppError("Invalid category", 400));
        }
        // Find projects with the specified category
        projects = await projectmodel.find({ category });
        res.status(200).json({
          success: true,
          data: projects,
        });
      }
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function updateProject(req, res, next) {
  try {
    const {
      title,
      description,
      category,
      fundingGoal,
      amountRaised,
      deadline,
    } = req.body;
    const { id } = req.params;
    //note always take id because we define route like
    //router.put('/update/:id',upload.single('mediaurls'),isloggedin,updateProject );
    console.log("Project Id:", id);
    console.log("Route Params:", req.params);
    console.log("Route Params:", req.body);
    const project = await projectmodel.findById(id);

    if (!project) {
      return next(new AppError("Project does not exist", 401));
    }

    // Update fields
    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (fundingGoal) project.fundingGoal = Number(fundingGoal);
    if (amountRaised) project.amountRaised = Number(amountRaised) + Number(project.amountRaised);
    if (deadline) project.deadline = deadline;

    if (req.file) {
      try {
        // Initialize mediaurls array if not already defined
        if (!project.mediaurls) project.mediaurls = {};

        // Delete existing media if present
        if (project.mediaurls.public_id) {
          await cloudinary.v2.uploader.destroy(project.mediaurls.public_id);
        }

        // Upload new file to Cloudinary
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "STARTUP",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });

        // Update project mediaurls with Cloudinary result
        project.mediaurls.public_id = result.public_id;
        project.mediaurls.secure_url = result.secure_url;

        // Remove file from server
        await fs.rm(`uploads/${req.file.filename}`);
      } catch (err) {
        // Handle file upload error
        return next(
          new AppError(
            err.message || "File not uploaded, please try again",
            404
          )
        );
      }
    }

    // Save updated project to database
    await project.save();

    res.status(201).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (err) {
    console.log("Error>>", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function addReward(req, res, next) {
  try {
    const {
      projectId,
      title,
      description,
      minContribution,
      available,
      estimatedDate,
    } = req.body;
    console.log(req.body);

    //Validate required fields
    if (
      !projectId ||
      !title ||
      !description ||
      !minContribution ||
      !available ||
      !estimatedDate
    ) {
      return next(new AppError("All fields are required", 400));
    }

    // Check if the project exists
    const project = await projectmodel.findById(projectId);
    if (!project) {
      return next(new AppError("Enter a valid Project", 401));
    }

    // Check if reward already exists
    const exist = await rewardmodel.findOne({ title });
    if (exist) {
      if (exist.projectId == projectId) {
        return next(new AppError("Reward already exists", 400));
      }
    }

    // Register reward
    const reward = await rewardmodel.create({
      projectId,
      title,
      description,
      minContribution,
      available,
      estimatedDate,
    });
    project.rewards.push(reward._id);
    await project.save();
    // Send response
    res.status(201).json({
      success: true,
      message: "Reward added successfully",
      reward,
    });
  } catch (err) {
    console.log("Error>>", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function posts(req, res, next) {
  try {
    const { projectId, userId, content } = req.body;
    if (!projectId || !userId || !content) {
      return next(new AppError("All fields are required", 400));
    }
    //project exist or not
    const project = await projectmodel.findById(projectId);
    if (!project) {
      return next(new AppError("Project does not exist", 401));
    }
    if (project) {
      if (!project.collaborators.includes(userId)) {
        return next(new AppError("Only creators only can post", 403));
      }
    }

    const user = await User.findById(userId);

    const post = await postmodel.create({
      userId,
      userName: user.name,
      projectId,
      content,
    });
    if (!post) {
      return next(new AppError("Cant register your post", 403));
    }
    await post.save();
    project.posts.push(post._id);
    await project.save();
    res.status(201).json({
      success: true,
      message: "post register successfully",
      post,
    });
  } catch (err) {
    console.log("Error>>", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function AddComents(req, res, next) {
  try {
    const { postId, content } = req.body;
    if (!postId || !content) {
      return next(new AppError("All fields are required", 400));
    }
    const userId = req.body.user.id;
    const user = await usermodel.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    const post = await postmodel.findById(postId);
    if (!post) {
      return next(new AppError("Post does not exist", 404));
    }
    const comment = await commentmodel.create({
      userId: userId,
      userName: user.name,
      postId,
      content,
    });
    if (!comment) {
      return next(new AppError("Comment not Register"), 500);
    }
    post.comments.push(comment._id);
    await post.save();
    res.status(201).json({
      success: true,
      message: "comment register successfully",
      comment,
    });
  } catch (err) {
    console.log("Error>>", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function removeComments(req, res, next) {
  try {
    const { postId, commentId } = req.body;
    if (!postId || !commentId) {
      return next(new AppError("All fields are required", 400));
    }
    const userId = req.body.user.id;
    const user = await usermodel.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    const post = await postmodel.findById(postId);
    if (!post) {
      return next(new AppError("Post does not exist", 404));
    }
    const comment = await commentmodel.findById(commentId);
    if (!comment) {
      return next(new AppError("Comment not Register"), 500);
    }
    // Filter out the comment with the specified commentId
    post.comments = post.comments.filter(
      (comment) => comment.toString() !== commentId
    );

    // Save the updated post
    await post.save();
    console.log("Comment removed successfully.");
    await commentmodel.findByIdAndDelete(commentId);
    res.status(201).json({
      success: true,
      message: "comment deleted successfully",
      comment,
    });
  } catch (err) {
    console.log("Error>>", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export {
  projectRegisteration,
  addReward,
  posts,
  AddComents,
  updateProject,
  deleteProject,
  getProject,
  getProjects,
  removeComments,
};
