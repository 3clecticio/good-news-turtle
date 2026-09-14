import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [turtleHandle, setTurtleHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setLoading(true);
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName || email.split('@')[0],
              turtle_handle: turtleHandle || email.split('@')[0],
            },
          },
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-slate-700/80 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl turtle-gradient-bg flex items-center justify-center text-3xl shadow-lg">
            🐢
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isSignUp ? 'Create Turtle Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp
              ? 'Join the community & start your positivity streak'
              : 'Sign in to share good news and connect'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display Name (e.g. Sunny Turtle)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="relative">
                <span className="text-slate-500 text-xs font-bold absolute left-3.5 top-2.5">@</span>
                <input
                  type="text"
                  value={turtleHandle}
                  onChange={(e) => setTurtleHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="turtle_handle"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full turtle-gradient-bg text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{isSignUp ? 'Create Profile' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-emerald-400 font-semibold hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
