// import mongoose, { Schema } from "mongoose";
// import mailSender from "../utils/mailSender.js";
// import emailTemplate from "../mail/emailVerificationTemplate.js"

// const otpSchema = new Schema({
//   email: {
//     type: String,
//     required: true,
//   },
//   otp: {
//     type: String,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//     expires: 60 * 5,
//   },
// });

// async function sendVerificationEmail(email, otp) {
//   try {
//     const mailResponse = await mailSender(
//       email,
//       "Verification Email",
//       emailTemplate(otp)
//     );
//     console.log("Email sent successfully: ", mailResponse.response);
//   } catch (error) {
//     console.log("Error occurred while sending email: ", error);
//     throw error;
//   }
// }

// otpSchema.pre("save", async function (next) {
//   console.log("New document saved to database");

//   if (this.isNew) {
//     await sendVerificationEmail(this.email, this.otp);
//   }
//   next();
// });

// export const OTP = mongoose.model("OTP", otpSchema);



import mongoose, { Schema } from "mongoose";
import mailSender from "../utils/mailSender.js";
import emailTemplate from "../mail/emailVerificationTemplate.js";

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    // required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // OTP expires in 5 minutes
  },
});

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification OTP",
      emailTemplate(otp)
    );
    // console.log("Email sent successfully to:", email);
    console.log("SMTP Response:", mailResponse.response);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send OTP email");
  }
}

otpSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

export const OTP = mongoose.model("OTP", otpSchema);
