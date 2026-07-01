import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "587");
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFrom = process.env.SMTP_FROM || `"CynexCloud Security" <${smtpUser}>`;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
});

const loadTemplate = (templateName: string, replacements: Record<string, string>): string => {
  const filePath = path.join(process.cwd(), "server", "emails", templateName);
  let html = "";
  try {
    html = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.warn(`Template ${templateName} not found. Using fallback text.`);
    // Basic fallback HTML in case file reading fails
    html = `
      <html>
        <body style="background: #09090b; color: #fff; font-family: sans-serif; padding: 20px;">
          <h2>CynexCloud Notification</h2>
          <p>${templateName.replace(".html", "").toUpperCase()}</p>
          <div style="margin: 20px 0; font-family: monospace;">
            ${Object.entries(replacements).map(([k, v]) => `<strong>${k}:</strong> ${v}`).join("<br/>")}
          </div>
        </body>
      </html>
    `;
    return html;
  }

  Object.keys(replacements).forEach(key => {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
  });
  return html;
};

export const sendMail = async (params: {
  to: string;
  subject: string;
  templateName: string;
  replacements: Record<string, string>;
}) => {
  if (!smtpUser || !smtpPass) {
    console.warn("SMTP credentials are not configured in environment variables. Email printing to terminal instead:");
    console.log(`================ EMAIL OUTBOX ================`);
    console.log(`TO: ${params.to}`);
    console.log(`SUBJECT: ${params.subject}`);
    console.log(`TEMPLATE: ${params.templateName}`);
    console.log(`REPLACEMENTS:`, params.replacements);
    console.log(`==============================================`);
    return;
  }

  const html = loadTemplate(params.templateName, params.replacements);

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: params.to,
      subject: params.subject,
      html
    });
    console.log(`Email successfully sent to ${params.to} regarding ${params.subject}`);
  } catch (err) {
    console.error("Nodemailer failed to dispatch email:", err);
  }
};
