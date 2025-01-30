import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens")
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password, otp } = req.body;

  if ([username, email, fullname, password, otp].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(400, "User already exists")
  }

  // Find the most recent OTP for the email
  const response = await User.find({ email }).sort({ createdAt: -1 }).limit(1)
  console.log(response)

  if (response.length === 0) {
    throw new ApiError(400, "OTP not found")
  } else if (otp !== response[0].otp) {
    throw new ApiError(400, "Invalid OTP")
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullname,
    password
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )

});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(email || username)) {
    throw new ApiError(400, "Email or username is required")
  }

  const user = await User.findOne({
    $or: [{ email }, { username }]
  })

  if (!user) {
    throw new ApiError(404, "User not found")
  };

  const isPasswordValid = await user.isCorrectPassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password")
  };

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser, accessToken, refreshToken
      },
        "User logged in successfully")
    )


});

const logoutUser = asyncHandler(async (req, res) => {
  User.findOneAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))

});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired")
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed successfully"
      ))
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }


});

const sendVerificationEmail = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const existedUser = await User.findOne({
      $or: [{ username }, { email }]
    })

    if (existedUser) {
      throw new ApiError(400, "User already exists")
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const result = await User.findOne({ otp: otp });
    console.log("OTP", otp)
    console.log("Result", result)

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      })
    }

    const otpPayload = { email, otp }
    const otpBody = await User.create(otpPayload)
    console.log("OTP Body", otpBody)

    return res.status(200).json(
      new ApiResponse(200, otpBody, "OTP sent successfully")
    )

  } catch (error) {
    throw new ApiError(500, "Something went wrong while sending email")
  }
});


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  sendVerificationEmail
};