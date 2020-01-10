import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/user";
import Otp from "../models/otp";
import { requireUser } from "../middlewares/userMiddlewares";
import { otp_generator, send_otp } from "../helpers/sms";

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  // check for if already registered
  const users = await User.find({ mobile: req.body.mobile });
  if (users.length !== 0)
    return res.status(401).json({ message: "Mobile number registered." });
  else {
    // new registration request
    try {
      const hash = await bcrypt.hash(req.body.password, 10);
      const saved_user = await User({
        _id: mongoose.Types.ObjectId(),
        mobile: req.body.mobile,
        password: hash,
        email: req.body.email || null,
        full_name: req.body.full_name,
        dob: req.body.dob
      }).save();

      await Otp.deleteMany({ mobile: saved_user.mobile });
      const otp_object = await Otp({
        _id: mongoose.Types.ObjectId(),
        mobile: saved_user.mobile,
        otp: await otp_generator(4),
        reason: "VERIFICATION"
      }).save();
      await send_otp(otp_object);
    } catch (err) {
      //cleanup on error
      await User.deleteMany({ mobile: req.body.mobile });
      await Otp.deleteMany({ mobile: req.body.mobile });
      return res.status(500).json({
        error: err
      });
    }
  }
});

router.post("/login", async (req, res, next) => {
  const user = await User.findOne({ mobile: req.body.mobile });
  if (!user)
    return res.status(401).json({
      message: "Auth Failed"
    });

  if (user.verified === false || user.active === false) {
    return res.status(401).json({
      detail: "Verification required or Account Disabled",
      message: "Auth Failed"
    });
  }

  const match = await bcrypt.compare(req.body.password, user.password);
  if (match) {
    const token = jwt.sign(
      {
        mobile: user.mobile,
        id: user._id
      },
      process.env.JWT_KEY
    );
    return res.status(200).json({
      message: "Auth successful",
      token: token
    });
  }
  return res.status(401).json({
    message: "Auth failed"
  });
});

router.post("/verify", async (req, res, next) => {
  try {
    const otp = await Otp.findOne({ mobile: req.body.mobile });
    if (!otp)
      return res.status(401).json({ message: "Doesn't require verification." });

    const user = await User.findOne({ mobile: req.body.mobile });
    if (user === null && user.active === false)
      return res
        .status(401)
        .json({ message: "Account disable or doesn't exist." });

    if (otp.otp === req.body.otp) {
      user.verified = true;
      await user.save();
      const token = jwt.sign(
        {
          mobile: user.mobile,
          id: user._id
        },
        process.env.JWT_KEY
      );
      return res.status(200).json({
        token: token,
        message: "success",
        detail: otp.reason
      });
    } else {
      return res.status(401).json({ message: "Verification failed" });
    }
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

router.post("/reset_password", async (req, res, next) => {
  try {
    const user = await User.findOne({ mobile: req.body.mobile });
    if (!user) return res.status(404).json({ message: "user doesn't exist" });

    await Otp.deleteMany({ mobile: req.body.mobile });
    const otp_object = await Otp({
      _id: mongoose.Types.ObjectId(),
      mobile: req.body.mobile,
      otp: await otp_generator(4),
      reason: "RESET_PASSWORD"
    }).save();
    await send_otp(otp_object);
    return res.status(200).json({ message: "Otp sent successfully" });
  } catch (err) {
    return res.status(500).json({
      error: err
    });
  }
});

router.get("/profile", requireUser, (req, res, next) => {
  return res.status(200).json({
    mobile: req.user.mobile,
    email: req.user.email || "No email provided.",
    full_name: req.user.full_name,
    wallet: req.user.wallet || 0,
    address: req.user.address
  });
});

router.post("/change_password", requireUser, (req, res, next) => {
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err
      });
    }
    req.user.password = hash;
    req.user
      .save()
      .then(result => {
        return res.status(204).json({
          message: "Password updated."
        });
      })
      .catch(err => {
        return res.status(500).json({
          message: failed,
          error: err
        });
      });
  });
});

export default router;
