const nodemailer = require('nodemailer');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendEmailOTP = async (email, code) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"B.Y.H - Build Your Home" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Votre code de verification B.Y.H',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0F172A; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; font-size: 28px; margin: 0;">B.Y.H</h1>
          <p style="color: #94A3B8; margin: 8px 0 0;">Build Your Home</p>
        </div>
        <div style="background: #F8FAFC; padding: 40px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #0F172A;">Votre code de verification</h2>
          <p style="color: #64748B;">Utilisez ce code pour confirmer votre inscription :</p>
          <div style="background: #2563EB; color: #fff; font-size: 36px; font-weight: 900; text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 24px 0;">
            ${code}
          </div>
          <p style="color: #94A3B8; font-size: 13px;">Ce code expire dans 10 minutes.</p>
          <p style="color: #94A3B8; font-size: 13px;">Si vous n avez pas demande ce code, ignorez cet email.</p>
          <div style="border-top: 1px solid #E2E8F0; margin-top: 24px; padding-top: 16px;">
            <p style="color: #CBD5E1; font-size: 12px; text-align: center;">B.Y.H - www.byh-cm.com</p>
          </div>
        </div>
      </div>
    `
  });
};

const sendSMSOTP = async (phone, code) => {
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: `Votre code de verification B.Y.H est : ${code}\nValide 10 minutes.`,
    from: process.env.TWILIO_PHONE,
    to: phone
  });
};

module.exports = { generateOTP, sendEmailOTP, sendSMSOTP };
