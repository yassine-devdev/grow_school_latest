import nodemailer from 'nodemailer';

// Define Email interface locally to avoid import issues
interface Email {
  id: string;
  sender: string;
  recipient?: string;
  subject: string;
  body: string;
  folder: string;
  timestamp?: string;
  time?: string;
  isRead?: boolean;
  unread?: boolean;
  snippet?: string;
  attachments?: string[];
}

// Define email sending interfaces
interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

// Enhanced email options interface for advanced sending
interface AdvancedEmailOptions extends EmailOptions {
  priority?: 'high' | 'normal' | 'low';
  deliveryReceipt?: boolean;
  readReceipt?: boolean;
  scheduledSend?: Date;
  template?: string;
  templateData?: Record<string, unknown>;
}

// Create a transporter with SMTP settings from environment variables
if (!process.env.EMAIL_SMTP_HOST || !process.env.EMAIL_SMTP_USER || !process.env.EMAIL_SMTP_PASS) {
  console.warn('Email service not properly configured: Missing required environment variables');
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT || '465'),
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS
  },
  tls: {
    // Ensure proper certificate validation
    rejectUnauthorized: true
  }
});

// Verify connection configuration
// Only verify in development to avoid build-time errors
if (process.env.NODE_ENV === 'development') {
  transporter.verify()
    .then(() => console.log('SMTP connection verified and ready to send emails'))
    .catch((error: Error) => console.error('SMTP connection error:', error));
} else {
  console.log('Email service initialized (verification skipped in production)');
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export const emailService = {
  /**
   * Send an email using the configured SMTP server
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!process.env.EMAIL_SMTP_USER || !process.env.EMAIL_FROM_NAME) {
        throw new Error('Email service not properly configured: Missing required environment variables');
      }
      
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_SMTP_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        attachments: options.attachments
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email'
      };
    }
  },

  /**
   * Format an email for the communications module
   */
  formatEmailForStorage(sentEmail: EmailOptions, recipients: string[]): Omit<Email, 'id'> {
    if (!process.env.EMAIL_SMTP_USER) {
      console.warn('Email service not properly configured: Missing EMAIL_SMTP_USER environment variable');
    }

    // Log recipients for audit trail
    console.log(`Email formatted for storage. Recipients: ${recipients.length} total`, {
      subject: sentEmail.subject,
      recipientCount: recipients.length,
      hasAttachments: Boolean(sentEmail.attachments?.length)
    });

    const emailData: Omit<Email, 'id'> = {
      sender: process.env.EMAIL_SMTP_USER || '',
      recipient: recipients.join(', '), // Store all recipients as comma-separated string
      subject: sentEmail.subject,
      snippet: (sentEmail.text || sentEmail.html || '').substring(0, 100) + '...',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: false,
      body: sentEmail.text || sentEmail.html || '',
      folder: 'Sent' as const
    };
    return emailData;
  },

  /**
   * Send an advanced email with additional options
   */
  async sendAdvancedEmail(options: AdvancedEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Log advanced options for debugging
      console.log('Sending advanced email with options:', {
        priority: options.priority || 'normal',
        hasTemplate: Boolean(options.template),
        scheduledSend: options.scheduledSend?.toISOString(),
        deliveryReceipt: options.deliveryReceipt,
        readReceipt: options.readReceipt
      });

      // For now, delegate to regular sendEmail but log the advanced features
      if (options.scheduledSend && options.scheduledSend > new Date()) {
        console.log(`Email scheduled for future delivery: ${options.scheduledSend.toISOString()}`);
        // In a real implementation, this would queue the email for later sending
      }

      // Convert AdvancedEmailOptions to EmailOptions for sending
      const basicOptions: EmailOptions = {
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        attachments: options.attachments
      };

      return await this.sendEmail(basicOptions);
    } catch (error) {
      console.error('Error sending advanced email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending advanced email'
      };
    }
  }
};

// Define enrollment interface for type safety
interface EnrollmentData {
  id: string;
  studentName: string;
  courseName: string;
  startDate: string;
  endDate?: string;
  status: string;
  parentEmail?: string;
  [key: string]: unknown; // Allow additional properties
}

// Enrollment-specific email functions
export async function sendEnrollmentConfirmation(parentEmail: string, enrollment: EnrollmentData) {
  if (process.env.NODE_ENV === 'test') {
    // Mock implementation for tests
    console.log(`Mock: Sending enrollment confirmation to ${parentEmail}`);
    return Promise.resolve();
  }

  return emailService.sendEmail({
    to: parentEmail,
    subject: 'Enrollment Confirmation - Grow School',
    html: `
      <h2>Enrollment Confirmation</h2>
      <p>Dear Parent/Guardian,</p>
      <p>Thank you for enrolling ${enrollment.firstName} ${enrollment.lastName} at Grow School.</p>
      <p>We have received your enrollment application and will review it shortly.</p>
      <p>Best regards,<br>Grow School Administration</p>
    `
  });
}

export async function sendEnrollmentNotification(enrollment: EnrollmentData) {
  if (process.env.NODE_ENV === 'test') {
    // Mock implementation for tests
    console.log(`Mock: Sending enrollment notification for ${enrollment.firstName} ${enrollment.lastName}`);
    return Promise.resolve();
  }

  return emailService.sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@growschool.com',
    subject: 'New Student Enrollment',
    html: `
      <h2>New Student Enrollment</h2>
      <p>A new student has enrolled:</p>
      <ul>
        <li>Name: ${enrollment.firstName} ${enrollment.lastName}</li>
        <li>Grade: ${enrollment.grade}</li>
        <li>Parent Email: ${enrollment.parentEmail}</li>
      </ul>
    `
  });
}

export default emailService;