import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]{1}[\d]{9}$/
  },

  // whether mobile number is verified or not (using OTP,CALL etc)
  verified: {
    type: Boolean,
    required: true,
    default: false
  },

  full_name: {
    type: String,
    required: true,
    min_length: 3
  },

  active: {
    type: Boolean,
    default: true
  },

  email: {
    sparse:true,
    type: String,
    required: false,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  password: {
    type: String,
    required: true
  },

  wallet: {
    type: Number,
    required: true,
    default: 0
  },

  dob:{
    type:Date,
    required:false,
    min:'1950-01-01',
    max:'2020-01-01' // TODO: fix later
  },

  address: [{
    pincode:{
      type:String,
      match:/^[\d]{6}$/,
      required:true,
    },
    detail: {
      type:String,
      required:true,
    },
    landmark:{
      type:String,
      required:false,
    },
    lat:{
      type:String,
      required:false,
    },
    lng:{
      type:String,
      required:false,
    },
  }]
});

export default mongoose.model("User", userSchema);
