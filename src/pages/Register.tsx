
import React from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-green-50">
      <div className="max-w-md w-full px-4">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
