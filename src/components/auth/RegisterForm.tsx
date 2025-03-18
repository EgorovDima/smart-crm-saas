
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signUp, loading } = useAuth();

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePassword()) {
      await signUp(email, password);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-subtle border border-border animate-scale-in">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="text-brand-blue text-5xl font-bold">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
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
        <h2 className="text-2xl font-bold text-foreground mb-1">Create an Account</h2>
        <p className="text-muted-foreground">Sign up for AI Smart Logistics</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full"
          />
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
            </>
          ) : (
            'Sign Up'
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/" className="font-medium text-brand-blue hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};
