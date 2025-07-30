import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import PocketBase from 'pocketbase';
import { authRateLimit } from '@/lib/rate-limit';
import { generateCsrfToken } from '@/lib/csrf';
import { getAuthCookieOptions } from '@/lib/secure-cookie';

// Initialize PocketBase
const pb = new PocketBase('http://127.0.0.1:8090');

export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting for authentication requests
        const rateLimitResponse = authRateLimit(request as any);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
        
        const body = await request.json();
        const { email, password } = body;
        
        // Validate input
        if (!email) {
            return NextResponse.json({ 
                success: false, 
                error: 'Email is required' 
            }, { status: 400 });
        }
        
        if (!password) {
            return NextResponse.json({ 
                success: false, 
                error: 'Password is required' 
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
        
        try {
            const authData = await pb.collection('users').authWithPassword(email, password);
            
            // Generate a new CSRF token
            const csrfToken = generateCsrfToken();
            
            // Set auth cookie with secure options
            cookies().set('pb_auth', pb.authStore.exportToCookie(), getAuthCookieOptions());
            
            // Remove sensitive data from user object
            const { password: _, ...userWithoutPassword } = authData.record;
            
            return NextResponse.json({ 
                success: true,
                user: userWithoutPassword,
                token: 'mock-jwt-token', // In real implementation, generate proper JWT
                csrfToken
            });
        } catch (authError) {
            // Handle specific authentication errors
            if (authError instanceof Error) {
                if (authError.message.includes('Too many attempts')) {
                    return NextResponse.json({ 
                        success: false, 
                        error: 'Too many attempts. Please try again later.' 
                    }, { status: 429 });
                }
                
                return NextResponse.json({ 
                    success: false, 
                    error: 'Invalid credentials' 
                }, { status: 401 });
            }
            
            throw authError;
        }
    } catch (error) {
        console.error('Authentication error:', error);
        
        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid JSON in request body' 
            }, { status: 400 });
        }
        
        // Handle database connection errors
        if (error instanceof Error && error.message.includes('Database connection failed')) {
            return NextResponse.json({ 
                success: false, 
                error: 'Internal server error' 
            }, { status: 500 });
        }
        
        return NextResponse.json({ 
            success: false, 
            error: 'Internal server error' 
        }, { status: 500 });
    }
}