import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  user: string;
  pass: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASS || "",
    };

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: 587,
      secure: false,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async sendAssessmentInvitation(
    candidateEmail: string,
    candidateName: string,
    assessmentTitle: string,
    assessmentLink: string,
    expiryHours: number = 48
  ) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: candidateEmail,
      subject: `Assessment Invitation: ${assessmentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="font-size: 24px;">📋</span>
            </div>
            <h1 style="color: #ffffff; margin: 0;">MCQ Assessment Platform</h1>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #10b981; margin-top: 0;">Dear ${candidateName},</h2>
            
            <p style="color: #cbd5e1; line-height: 1.6;">
              You have been invited to take the <strong>${assessmentTitle}</strong> assessment. This assessment will help us evaluate your skills and qualifications for the position.
            </p>
            
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #10b981; margin-top: 0;">Assessment Details:</h3>
              <ul style="color: #cbd5e1; padding-left: 20px;">
                <li>This link is valid for ${expiryHours} hours from the time it was generated</li>
                <li>Once you start the assessment, you cannot pause or restart it</li>
                <li>Make sure you have a stable internet connection</li>
                <li>Complete the assessment in a quiet environment</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${assessmentLink}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Start Assessment
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 0;">
              If you have any questions, please contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #10b981;">${process.env.EMAIL_USER}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #64748b; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendCompletionConfirmation(
    candidateEmail: string,
    candidateName: string,
    assessmentTitle: string,
    score: number,
    totalQuestions: number
  ) {
    const percentage = Math.round((score / totalQuestions) * 100);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: candidateEmail,
      subject: `Assessment Completed: ${assessmentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="font-size: 24px;">✅</span>
            </div>
            <h1 style="color: #ffffff; margin: 0;">Assessment Completed!</h1>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 30px;">
            <h2 style="color: #10b981; margin-top: 0;">Dear ${candidateName},</h2>
            
            <p style="color: #cbd5e1; line-height: 1.6;">
              Thank you for completing the <strong>${assessmentTitle}</strong> assessment. Your responses have been submitted successfully.
            </p>
            
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <h3 style="color: #10b981; margin-top: 0;">Your Score</h3>
              <div style="font-size: 24px; font-weight: bold; color: #ffffff; margin: 10px 0;">
                ${score}/${totalQuestions} (${percentage}%)
              </div>
            </div>
            
            <div style="color: #cbd5e1;">
              <h3 style="color: #ffffff;">What happens next?</h3>
              <ul style="padding-left: 20px;">
                <li>Our recruitment team will review your assessment results</li>
                <li>You'll receive feedback within 2-3 business days</li>
                <li>If successful, we'll contact you for the next interview round</li>
              </ul>
            </div>
          </div>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
