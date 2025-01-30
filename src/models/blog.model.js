import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  assignedEditor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
},
  {
    timestamps: true
  }
);

export const Blog = mongoose.model("Blog", blogSchema);