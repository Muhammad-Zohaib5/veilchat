

import nodemailer from 'nodemailer';
import { ApiResponse } from '@/types/ApiResponse';

export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'muhammadzohaib4852@gmail.com',
        pass: 'rkiixyzbwpbncico' // Note: App password me spaces nahi honge, is liye yahan spaces hata diye
      },
    });

    const mailOptions = {
      from: '"VeilChat" <muhammadzohaib4852@gmail.com>',
      to: email,
      subject: 'VeilChat | Verification Code',
      text: `Hello ${username},\n\nYour verification code is: ${verifyCode}\n\nThanks,\nVeilChat Team`,
    };

    await transporter.sendMail(mailOptions);

    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, message: 'Failed to send verification email' };
  }
}


