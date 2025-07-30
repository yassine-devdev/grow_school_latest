// Validation schemas for API requests
import { z } from 'zod';

// Define proper types for validation
interface MessageThreadData {
  title?: string;
  participants?: unknown[];
  [key: string]: unknown;
}

interface EmailData {
  to?: string | string[];
  subject?: string;
  text?: string;
  html?: string;
  [key: string]: unknown;
}

interface UserData {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Thread schemas
export const threadMessageCreateSchema = z.object({
  content: z.string().min(1).max(5000),
  parentMessageId: z.string().optional(),
  attachments: z.array(z.string()).optional()
});

export const messageThreadSchema = {
  validate(data: MessageThreadData): ValidationResult {
    const errors: string[] = [];
    
    if (!data.title || typeof data.title !== 'string') {
      errors.push('Title is required and must be a string');
    }
    
    if (!data.participants || !Array.isArray(data.participants)) {
      errors.push('Participants is required and must be an array');
    }
    
    if (data.participants && data.participants.length < 2) {
      errors.push('At least 2 participants are required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export const emailSchema = {
  validate(data: EmailData): ValidationResult {
    const errors: string[] = [];

    if (!data.to || (typeof data.to !== 'string' && !Array.isArray(data.to))) {
      errors.push('To field is required and must be a string or array');
    }

    if (!data.subject || typeof data.subject !== 'string') {
      errors.push('Subject is required and must be a string');
    }

    if (!data.text && !data.html) {
      errors.push('Either text or html content is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export const userSchema = {
  validate(data: UserData): ValidationResult {
    const errors: string[] = [];

    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email is required and must be a string');
    }

    if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
      errors.push('Password is required and must be at least 6 characters');
    }

    if (!data.name || typeof data.name !== 'string') {
      errors.push('Name is required and must be a string');
    }

    if (!data.role || !['student', 'teacher', 'admin', 'parent'].includes(data.role)) {
      errors.push('Role is required and must be one of: student, teacher, admin, parent');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
