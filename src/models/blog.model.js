import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema({
  title: {
    type: String,
    required: [true, "Blog title is required"]
  },
  content: {
    type: String,
    required: [true, "Blog content is required"]
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,  // To ensure a blog is assigned to only one editor
    sparse: true
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
},
  {
    timestamps: true
  }
);

export const Blog = mongoose.model("Blog", blogSchema);