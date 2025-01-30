import { Router } from "express";
import {
  addComment,
  assignBlogToEditor,
  createBlog,
  deleteBlog,
  deleteComment,
  getAllBlogs,
  getBlogById,
  updateBlog
} from "../controllers/blog.controller.js";
import { isAdmin, isEditor, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/all-blogs").get(getAllBlogs);
router.route("/:blogId").get(getBlogById);

// Secured routes
router.route("/create-blog").post(verifyJWT, isAdmin, createBlog);
router.route("/update-blog/:blogId").put(verifyJWT, isAdmin, updateBlog);
router.route("/delete-blog/:blogId").delete(verifyJWT, isAdmin, deleteBlog);

// Admin assigns blog to editor
router.route("/assign").post(verifyJWT, isAdmin, assignBlogToEditor);

// Comment routes
router.route("/:blogId/comments").post(verifyJWT, addComment);
router.route("/comments/:commentId").delete(verifyJWT, deleteComment);


export default router