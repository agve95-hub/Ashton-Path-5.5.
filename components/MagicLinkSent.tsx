import React, { useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Mail, ArrowRight, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Props {
  email: string;
  onResend: () => void;
  onConfirm: () => void;
  onBack: () => void;
}

export const MagicLinkSent: React.FC<Props> = ({ email, onResend, onConfirm, onBack }) => {
  const [isResending, setIsResending] = useState(false);
  const [hasResent, setHasResent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
        setIsResending(false);
        setHasResent(true);
        onResend();
    }, 1500);
  };

  const handleSimulateClick = () => {
    setIsVerifying(true);
    // Simulate network delay for better UX
    setTimeout(() => {
        setIsVerifying(false);
        onConfirm();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-midnight-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center space-y-4">
            <div className="relative inline-block">
                <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full"></div>
                <div className="relative w-20 h-20 bg-midnight-800 rounded-2xl border border-teal-500/30 flex items-center justify-center shadow-2xl shadow-teal-500/10">
                    <Mail className="w-10 h-10 text-teal-400" strokeWidth={1.5} />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-500 rounded-full border-4 border-midnight-900 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-midnight-950" />
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-3xl sm:text-4xl font-serif text-slate-100 mb-2">Check your inbox</h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                    We sent a sign-in link to <br/>
                    <strong className="text-slate-200">{email}</strong>
                </p>
            </div>
        </div>

        <Card className="shadow-2xl shadow-black/40 border-white/5 bg-midnight-800/80 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            
            <Button 
                onClick={() => window.open(`mailto:`, '_blank')}
                variant="outline" 
                size="lg" 
                className="w-full h-14 border-slate-700 hover:bg-slate-800 text-slate-300"
            >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Email App
            </Button>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-midnight-800 px-3 text-slate-500 font-bold tracking-widest">Demo Mode</span>
                </div>
            </div>

            <div className="bg-teal-500/5 rounded-xl p-5 border border-teal-500/20 text-center space-y-3">
                <p className="text-xs text-teal-200/70 leading-relaxed">
                    Since this is a demo environment, we can't send real emails. Click below to simulate tapping the link.
                </p>
                <Button 
                    onClick={handleSimulateClick}
                    variant="solid" 
                    size="lg" 
                    isLoading={isVerifying}
                    className="w-full h-14"
                >
                    Simulate Click
                    {!isVerifying && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
            </div>

          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-4 text-sm">
            <button 
                onClick={handleResend}
                disabled={isResending || hasResent}
                className="text-slate-500 hover:text-slate-300 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
                {isResending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                {hasResent ? 'Link resent successfully' : 'Click to resend email'}
            </button>
            
            <button 
                onClick={onBack}
                className="text-slate-600 hover:text-slate-400 transition-colors text-xs font-bold uppercase tracking-wider"
            >
                Use a different email
            </button>
        </div>
      </div>
    </div>
  );
};