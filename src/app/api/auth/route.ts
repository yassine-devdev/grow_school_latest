import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import PocketBase from 'pocketbase';
import { authRateLimit } from '@/lib/rate-limit';
import { generateCsrfToken } from '@/lib/csrf';
import { getAuthCookieOptions } from '@/lib/secure-cookie';

// Initialize PocketBase
const pb = new PocketBase('http://127.0.0.1:8090');

export async function POST(request: Request) {
    try {
        // Apply rate limiting for authentication requests
        const rateLimitResponse = authRateLimit(request as any);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }
        
        const { action, email, password, name, role } = await request.json();
        
        if (action === 'login') {
            if (!email || !password) {
                return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
            }
            
            const authData = await pb.collection('users').authWithPassword(email, password);
            
            // Generate a new CSRF token
            const csrfToken = generateCsrfToken();
            
            // Set auth cookie with secure options
            cookies().set('pb_auth', pb.authStore.exportToCookie(), getAuthCookieOptions());
            
            return NextResponse.json({ 
                user: authData.record,
                csrfToken // Return the CSRF token to the client
            });
        } 
        else if (action === 'register') {
            if (!email || !password || !name || !role) {
                return NextResponse.json({ error: 'Email, password, name, and role are required' }, { status: 400 });
            }
            
            const data = {
                email,
                password,
                passwordConfirm: password,
                name,
                role,
                department: role // For simplicity, use role as department
            };
            
            const user = await pb.collection('users').create(data);
            
            // Generate a new CSRF token
            const csrfToken = generateCsrfToken();
            
            return NextResponse.json({ 
                user,
                csrfToken // Return the CSRF token to the client
            });
        } 
        else if (action === 'logout') {
            pb.authStore.clear();
            cookies().delete('pb_auth');
            cookies().delete('csrf_token'); // Also clear the CSRF token
            return NextResponse.json({ success: true });
        } 
        else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ error: 'Authentication failed', details: message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        // Get auth cookie
        const authCookie = cookies().get('pb_auth')?.value;
        
        if (authCookie) {
            // Load the auth store from the cookie
            pb.authStore.loadFromCookie(`pb_auth=${authCookie}`);
        }
        
        // Check if user is authenticated
        const isAuthenticated = pb.authStore.isValid;
        const user = pb.authStore.model;
        
        // Generate a new CSRF token if authenticated
        const csrfToken = isAuthenticated ? generateCsrfToken() : null;
        
        return NextResponse.json({ 
            isAuthenticated, 
            user,
            csrfToken // Return the CSRF token to the client
        });
    } catch (error) {
        console.error('Authentication check error:', error);
        return NextResponse.json({ isAuthenticated: false, user: null });
    }
}