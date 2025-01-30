import { Blog } from "../models/blog.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createBlog = asyncHandler(async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      throw new ApiError(400, "Blog title and content is required")
    }

    const blog = await Blog.create({
      title,
      content,
      author: req.user._id
    });

    return res
      .status(201)
      .json(new ApiResponse(201, blog, "Blog created successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Blog can't be created")
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      throw new ApiError(400, "Blog title and content is required")
    }

    const blog = await Blog.findById(req.params.blogId);

    if (!blog) {
      throw new ApiError(404, "Blog not found")
    }

    if (blog.assignedTo && blog.assignedTo.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to update this blog")
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      throw new ApiError(403, "You are not authorized to update this blog")
    }

    blog.title = title;
    blog.content = content;

    await blog.save();

    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog updated successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Blog can't be updated")
  }
});

const assignBlogToEditor = asyncHandler(async (req, res) => {
  try {
    const { blogId, editorId } = req.body;

    const blog = await Blog.findById(blogId);
    const editor = await User.findById(editorId);

    if (!blog || !editor) {
      throw new ApiError(404, "Blog or editor not found")
    }

    if (blog.assignedTo) {
      throw new ApiError(400, "Blog is already assigned to an editor")
    }

    if (editor.role !== "editor") {
      throw new ApiError(400, "Editor is not an editor")
    }

    blog.assignedTo = editor._id;

    await blog.save();

    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog assigned to editor successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Blog can't be assigned to editor")
  }
});

const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("author", "username fullname")
      .populate("assignedTo", "username")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, blogs, "Blogs fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Blogs can't be fetched")
  }
});

const getBlogById = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId)
      .populate("author", "username fullname")
      .populate("assignedTo", "username");

    if (!blog) {
      throw new ApiError(404, "Blog not found")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, blog, "Blog fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Blog can't be fetched")
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.blogId);

    if (!blog) {
      throw new ApiError(404, "Blog not found")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Blog deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Blog can't be deleted")
  }
});

const addComment = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      throw new ApiError(400, "Comment content is required")
    }

    const blog = await Blog.findById(req.params.blogId);

    if (!blog) {
      throw new ApiError(404, "Blog not found")
    }

    const comment = await Comment.create({
      user: req.user._id,
      blog: blog._id,
      content
    });

    blog.comments.push(comment);

    await blog.save();

    return res
      .status(201)
      .json(new ApiResponse(201, comment, "Comment added successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Comment can't be added")
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      throw new ApiError(404, "Comment not found")
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to delete this comment")
    }

    await comment.remove();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error?.message || "Comment can't be deleted")
  }
});

export {
  createBlog,
  updateBlog,
  assignBlogToEditor,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  addComment,
  deleteComment
};