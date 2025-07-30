import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { authRateLimit } from '@/lib/rate-limit';
import { generateCsrfToken } from '@/lib/csrf';

// Initialize PocketBase
const pb = new PocketBase('http://127.0.0.1:8090');

export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting for registration requests
        const rateLimitResponse = authRateLimit(request as any);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
        
        const body = await request.json();
        const { email, password, firstName, lastName, role } = body;
        
        // Validate required fields
        if (!email || !password || !firstName || !lastName || !role) {
            return NextResponse.json({ 
                success: false, 
                error: 'Email, password, first name, last name, and role are required' 
            }, { status: 400 });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid email format' 
            }, { status: 400 });
        }
        
        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json({ 
                success: false, 
                error: 'Password must be at least 8 characters long' 
            }, { status: 400 });
        }
        
        // Validate role
        const validRoles = ['student', 'teacher', 'parent', 'admin'];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid role specified' 
            }, { status: 400 });
        }
        
        const userData = {
            email,
            password,
            passwordConfirm: password,
            name: `${firstName} ${lastName}`,
            firstName,
            lastName,
            role,
            department: role // For simplicity, use role as department
        };
        
        try {
            const user = await pb.collection('users').create(userData);
            
            // Generate a new CSRF token
            const csrfToken = generateCsrfToken();
            
            // Remove sensitive data from user object
            const { password: _, passwordConfirm: __, ...userWithoutPassword } = user;
            
            return NextResponse.json({ 
                success: true,
                user: userWithoutPassword,
                csrfToken
            }, { status: 201 });
        } catch (dbError) {
            // Handle specific database errors
            if (dbError instanceof Error) {
                if (dbError.message.includes('email')) {
                    return NextResponse.json({ 
                        success: false, 
                        error: 'Email already exists' 
                    }, { status: 409 });
                }
            }
            
            throw dbError;
        }
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid JSON in request body' 
            }, { status: 400 });
        }
        
        return NextResponse.json({ 
            success: false, 
            error: 'Internal server error' 
        }, { status: 500 });
    }
}