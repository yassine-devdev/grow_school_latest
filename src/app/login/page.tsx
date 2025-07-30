'use client';

import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  const handleLoginSuccess = () => {
    router.push('/dashboard');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-content)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">GROW YouR NEED</h1>
          <p className="text-[var(--color-text-secondary)]">SaaS School Provider</p>
        </div>
        
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}