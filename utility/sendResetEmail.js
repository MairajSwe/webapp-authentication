const nodemailer = require("nodemailer");
const { dev } = require("../config");

exports.sendResetEmail = async(name, email, _id, token) => {

    try {
      // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: dev.app.authEmail, 
      pass: dev.app.authPassword,
    },
  });

    const mailOptions = {
    from: dev.app.authEmail, // sender address
    to: email, // list of receivers
    subject: "Reset password", // Subject line
    // text: "Hello world?", // plain text body
    html: `<p>Welcome ${name}!!! <a href="http://localhost:3008/reset-password?token=${token}"> Click here, verify your email. </a></p>`, // html body
    }
  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions, (error,info) => {
    if(error){
        console.log(error)
    }else {
        console.log("Message sent: %s", info.response);
    }
  });
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  

    } catch (error) {
        console.log(error)
    }
}