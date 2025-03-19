
import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-green-50">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="text-brand-blue">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mx-auto"
              >
                <path d="M22 12v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8" />
                <rect x="6" y="9" width="12" height="12" rx="2" />
                <path d="M12 3v6" />
                <path d="m8 7 4-4 4 4" />
              </svg>
            </div>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Index;
