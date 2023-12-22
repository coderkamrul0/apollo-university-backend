import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: config.NODE_ENV === 'production',
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: 'kh70926@gmail.com',
      pass: 'htkj ifmj hfsj xcyb',
    },
  });

  await transporter.sendMail({
    from: 'kh70926@gmail.com', 
    to, 
    subject: 'Password Change Mail!!!!', 
    text: 'Please note that this link is only valid for 10 minutes. After this period, you will need to submit another password reset request.', 
    html,
  });
};
