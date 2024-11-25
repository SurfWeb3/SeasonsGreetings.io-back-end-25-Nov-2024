import * as SibApiV3Sdk from '@sendinblue/client';
import dotenv from 'dotenv';
import { nftsImages } from '../common/nfts';

dotenv.config();

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

interface EmailResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

// Generate HTML content for the email
const generateClaimEmailHTML = (claimLink: string, message?: string, nftImageUrl?: string): string => {
    return `
        <h1 style="color: blue;">You have received a free NFT gift from a friend or family member!</h1>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
                <td style="padding: 20px 0;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                            <td width="50%" style="vertical-align: middle; padding-right: 20px;">
                                ${message ? `
                                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                        <p style="font-weight: bold; font-size: 28px;">Message from sender:</p>
                                        <p style="font-weight: bold; font-size: 24px;">${message}</p>
                                    </div>
                                ` : ''}
                            </td>
                            <td width="50%" style="vertical-align: middle; padding-left: 20px;">
                                ${nftImageUrl ? `<img src="${nftImageUrl}" alt="NFT" style="width: 100%; max-width: 300px;">` : ''}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <p style="font-size: 18px; margin: 0 0 20px 0;">You have received an NFT! Click the link below to claim it:</p>
            <a href="${claimLink}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Claim Your NFT
            </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${claimLink}</p>
    `;
};

// Generic send email function using Brevo
export const sendEmail = async (options: {
    to: string;
    subject: string;
    html: string;
    isSeasonGreeting?: boolean;
}): Promise<EmailResponse> => {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = options.subject;
        sendSmtpEmail.htmlContent = options.html;
        sendSmtpEmail.sender = {
            name: options.isSeasonGreeting ? "Season's Greetings" : process.env.MAIL_FROM_NAME || 'Tokenzone',
            email: options.isSeasonGreeting ? "no-reply@seasonsgreetings.xyz" : process.env.MAIL_FROM_EMAIL || 'nixon.bagui.dev@gmail.com'
        };
        sendSmtpEmail.to = [{
            email: options.to
        }];

        // Add tracking settings
        sendSmtpEmail.tags = ['NFT-Claim'];

        console.log('Attempting to send email:', {
            to: options.to,
            subject: options.subject,
            timestamp: new Date().toISOString()
        });

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log('Email sent successfully:', {
            messageId: response.body.messageId,
            to: options.to,
            timestamp: new Date().toISOString()
        });

        return {
            success: true,
            messageId: response.body.messageId
        };

    } catch (error: any) {
        console.error('Email sending failed:', {
            error: error.message,
            to: options.to,
            timestamp: new Date().toISOString()
        });

        return {
            success: false,
            error: error.message
        };
    }
};

// Specific function for sending NFT claim emails
export const sendNFTClaimEmail = async (email: string, claimAuthToken: string, message?: string, contractAddress?: string, isSeasonGreeting?: boolean): Promise<EmailResponse> => {
    const claimLink = isSeasonGreeting ? `https://seasonsgreetings.xyz/claim/${claimAuthToken}` : `${process.env.FRONTEND_URL}/claim/${claimAuthToken}`;

    return await sendEmail({
        to: email,
        subject: 'Your FREE NFT Claim Link',
        html: generateClaimEmailHTML(claimLink, message, nftsImages[contractAddress as keyof typeof nftsImages]),
        isSeasonGreeting
    });
};