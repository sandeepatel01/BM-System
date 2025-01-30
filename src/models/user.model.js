import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    unique: true
  },
  role: {
    type: String,
    enum: ["admin", "editor", "user"],
    default: "user",
  },
  refreshToken: {
    types: String
  },
  isVerified: { type: Boolean, default: false },
},
  {
    timestamps: true,
  });