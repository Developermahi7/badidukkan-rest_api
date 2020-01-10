import mongoose from "mongoose";
import user from "./user";
import { send_otp } from "../helpers/sms";

const otpSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  otp: {
    type: String,
    max_length: 4,
    min_length: 4,
    required: true
  },

  mobile: {
    type: String,
    max_length: 10,
    match: /^[6-9]{1}[\d]{9}$/,
    unique: true
  },

  reason: {
    required: true,
    uppercase: true,
    default: "VERIFICATION",
    type: String,
    enum: ["RESET_PASSWORD", "VERIFICATION"]
  },

  status: {
    uppercase: true,
    type: String,
    required: false,
    enum: ["SENT", "PENDING", "FAILED"]
  }
});

export default mongoose.model("Otp", otpSchema);
