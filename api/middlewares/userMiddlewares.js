import "dotenv/config";
import User from "../models/user";
import jwt from "jsonwebtoken";

export const requireUser = (req, res, next) => {
  const temp = jwt.verify(
    req.headers.authorization.split(" ")[0],
    process.env.JWT_KEY
  );
  User.find({ mobile: temp.mobile, _id: temp.id })
    .exec()
    .then(users => {
      if (users.length !== 1) {
        return res.status(401).json({
          message: "Auth Failed"
        });
      } else {
        if (users[0].active === false || users[0].verified === false) {
          return res.status(401).json({
            message: "Account Disabled or Verification required"
          });
        }
        req.user = users[0];
        next();
      }
    })
    .catch(err => {
      return res.status(500).json({
        error: err
      });
    });
};
