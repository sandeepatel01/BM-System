import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid access token")
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }

});

export const isUser = asyncHandler(async (req, _, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    if (userDetails.role !== "user") {
      throw new ApiError(401, "This is a protected route for users only")
    }

    next();
  } catch (error) {
    throw new ApiError(500, error?.message || "User Role Can't be Verified")
  }
});

export const isAdmin = asyncHandler(async (req, _, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    if (userDetails.role !== "admin") {
      throw new ApiError(401, "This is a protected route for admin only")
    }

    next();
  } catch (error) {
    throw new ApiError(500, error?.message || "Admin Role Can't be Verified")
  }
});

export const isEditor = asyncHandler(async (req, _, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    if (userDetails.role !== "editor") {
      throw new ApiError(401, "This is a protected route for editor only")
    }

    next();
  } catch (error) {
    throw new ApiError(500, error?.message || "Editor Role Can't be Verified")
  }
});
