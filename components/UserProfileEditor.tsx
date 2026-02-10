import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Save } from 'lucide-react';

export const UserProfileEditor: React.FC = () => {
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
        alert("New passwords do not match.");
        return;
    }
    // Mock save functionality
    alert("Password updated successfully.");
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-midnight-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-white/5">
            <h3 className="text-base font-bold text-slate-100">
                Security
            </h3>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-10">
            <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-lg">
                <Input 
                    label="Current Password"
                    type="password" 
                    value={passwordData.current}
                    onChange={e => setPasswordData(prev => ({...prev, current: e.target.value}))}
                    placeholder="••••••••••••"
                />
                <Input 
                    label="New Password"
                    type="password" 
                    value={passwordData.new}
                    onChange={e => setPasswordData(prev => ({...prev, new: e.target.value}))}
                    placeholder="••••••••••••"
                />
                <Input 
                    label="Confirm New Password"
                    type="password" 
                    value={passwordData.confirm}
                    onChange={e => setPasswordData(prev => ({...prev, confirm: e.target.value}))}
                    placeholder="••••••••••••"
                />
                
                <div className="pt-4">
                    <Button 
                        type="submit" 
                        variant="primary" 
                        className="bg-midnight-950 border-slate-700 text-teal-400 hover:bg-slate-900 hover:border-teal-500/50 hover:shadow-glow-teal transition-all w-auto px-8"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Update Password
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
};