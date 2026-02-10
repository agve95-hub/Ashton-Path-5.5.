import React, { useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Mail, ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';

interface Props {
  onLogin: (email: string) => void;
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<Props> = (props) => {
  const { onLogin, onSwitchToRegister } = props;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API latency
    setTimeout(() => {
      setIsLoading(false);
      onLogin(email);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-midnight-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500 text-midnight-950 font-bold text-3xl mb-8 shadow-glow-teal">
            A
          </div>
          <h2 className="text-5xl sm:text-6xl font-serif text-slate-100 tracking-tight mb-2 leading-none">Welcome back</h2>
          <p className="text-slate-400 text-lg">Sign in to continue your journey</p>
        </div>

        <Card className="shadow-2xl shadow-black/20 border-white/5">
          <CardContent className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                  <Input
                    label="Email address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    icon={<Mail className="w-4 h-4" />}
                    autoComplete="email"
                  />
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                      <span>Secure passwordless login via Magic Link</span>
                  </div>
              </div>

              <div className="pt-2">
                <Button type="submit" size="lg" className="w-full shadow-lg shadow-black/20 h-14" isLoading={isLoading}>
                    Send Login Link
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-1 opacity-60" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <button 
            onClick={onSwitchToRegister}
            className="text-teal-400 font-bold hover:text-teal-300 transition-all flex items-center justify-center gap-2 mx-auto inline-flex"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};