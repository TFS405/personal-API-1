// -------------- MODULE IMPORTS ----------

const nodeMailer = require('nodemailer');
const catchAsync = require('./catchAsync');

// ---------- FUNCTION --------------------------
const sendEmail = catchAsync(async (options) => {
  // Create a transporter.
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define the email options.
  const mailOptions = {
    from: 'Cameron Lozano <hello@node>',
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  // Actually send the email.
  await transporter.sendMail(mailOptions);
});

// --------- EXPORT FUNCTION ---------------

module.exports = sendEmail;
