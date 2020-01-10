import "dotenv/config";
import Axios from "axios";

export const otp_generator = length => {
  return new Promise(resolve => {
    var otp = "";
    for (var i = 0; i < length; i++) {
      otp+=(`${Math.floor(Math.random() * 10)}`);
    }
    resolve(otp);
  });
};

export const send_sms = (mobile, otp) => {
  Axios.get(
    `${process.env.SMS_ENDPOINT}${mobile}/${otp}/${process.env.SMS_TEMPLATE_NAME}`
  )
    .then(response => {
      if (response.data.status === "Success") {
        return true;
      }
    })
    .catch(err => {
      console.log({ error: err });
      return false;
    });
  return true;
};

export const send_otp = otp => {
  return new Promise(resolve => {
    send_sms(otp.mobile, otp.otp);
    resolve(otp.otp);
  });
};
