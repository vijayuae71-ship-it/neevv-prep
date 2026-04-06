import React, { useState } from 'react';
import { LogIn, User, Mail, GraduationCap } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (name: string, email: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onLogin(name.trim(), email.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-3">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              neevv Prep
            </h1>
            <p className="text-sm text-base-content/60 mt-1">Your AI Interview Coach</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <User size={14} /> Full Name
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g., Priya Sharma"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </span>
              </label>
              <input
                type="email"
                placeholder="you@email.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label className="label">
                <span className="label-text-alt text-base-content/40">
                  Your progress is saved locally by email
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full gap-2"
              disabled={!name.trim() || !email.trim()}
            >
              <LogIn size={18} />
              Start Practicing
            </button>
          </form>

          <div className="divider text-xs text-base-content/30">OR</div>

          <button
            className="btn btn-ghost btn-sm text-base-content/50"
            onClick={() => onLogin('Guest', 'guest@neevv.local')}
          >
            Continue as Guest
          </button>

          <p className="text-xs text-center text-base-content/30 mt-4">
            🔒 All data stays in your browser. No server storage.
          </p>
        </div>
      </div>
    </div>
  );
};
