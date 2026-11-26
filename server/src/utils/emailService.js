import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded even if cwd differs
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getTransporter = () => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT) || 587;

    if (!user || !pass) {
        throw new Error('Missing SMTP_USER or SMTP_PASS environment variables.');
    }

    // For Gmail, service: 'gmail' automatically uses port 465 with SSL, avoiding cloud STARTTLS port 587 blocks
    if (host.includes('gmail') || process.env.SMTP_SERVICE === 'gmail') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
        });
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: {
            rejectUnauthorized: false,
        },
    });
};

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const transporter = getTransporter();
        const info = await transporter.sendMail({
            from: `"Hackflow AI" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("✅ Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Error sending email:", error.message || error);
        throw error;
    }
};
