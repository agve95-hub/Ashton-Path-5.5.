import React, { useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { User, Mail, ArrowRight, LogIn, Sparkles } from 'lucide-react';

interface Props {
  onRegister: (name: string, email: string) => void;
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<Props> = (props) => {
  const { onRegister, onSwitchToLogin } = props;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API latency
    setTimeout(() => {
      setIsLoading(false);
      onRegister(name, email);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-midnight-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500 text-midnight-950 font-bold text-3xl mb-8 shadow-glow-teal">
            A
          </div>
          <h2 className="text-5xl sm:text-6xl font-serif text-slate-100 tracking-tight mb-2 leading-none">Create account</h2>
          <p className="text-slate-400 text-lg">Start your personalized tapering plan</p>
        </div>

        <Card className="shadow-2xl shadow-black/20 border-white/5">
          <CardContent className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                icon={<User className="w-4 h-4" />}
                autoComplete="name"
              />

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

              <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20 flex gap-3 items-start">
                  <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-indigo-200/80 leading-relaxed">
                      We use <strong>Magic Links</strong> for secure, passwordless access. We'll send a registration link directly to your inbox.
                  </p>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed px-1 text-center">
                By continuing, you agree to our <a href="#" className="underline hover:text-slate-300">Terms of Service</a> and medical disclaimer.
              </div>

              <Button type="submit" size="lg" className="w-full mt-2 shadow-lg shadow-black/20 h-14" isLoading={isLoading}>
                Send Registration Link
                {!isLoading && <ArrowRight className="w-4 h-4 ml-1 opacity-60" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button 
            onClick={onSwitchToLogin}
            className="text-teal-400 font-bold hover:text-teal-300 transition-all flex items-center justify-center gap-2 mx-auto inline-flex"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};