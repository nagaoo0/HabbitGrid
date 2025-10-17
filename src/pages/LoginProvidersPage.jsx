import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/ui/button';

const PROVIDERS = [
  { id: 'github', label: 'GitHub' },
  { id: 'discord', label: 'Discord' },
  // Add more providers here if needed
];

const LoginProvidersPage = () => {
  const navigate = useNavigate();

  const handleLogin = async (provider) => {
    if (!isSupabaseConfigured()) return alert('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold mb-6 text-center">Choose Login Provider</h1>
        <div className="flex flex-col gap-4">
          {PROVIDERS.map(p => (
            <Button key={p.id} onClick={() => handleLogin(p.id)} className="w-full">
              {`Login with ${p.label}`}
            </Button>
          ))}
        </div>
        <Button variant="ghost" className="mt-8 w-full" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default LoginProvidersPage;
