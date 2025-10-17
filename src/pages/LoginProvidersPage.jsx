
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const PROVIDERS = [
  { id: 'github', label: 'GitHub' },
  { id: 'discord', label: 'Discord' },
  { id: 'google', label: 'Google' },
  // Add more providers here if needed
];


const LoginProvidersPage = () => {
  const navigate = useNavigate();

  // Ensure theme is correct on mount
  React.useEffect(() => {
    const theme = localStorage.getItem('theme');
    document.documentElement.classList.remove('light', 'dark');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }
  }, []);

  const handleLogin = async (provider) => {
    if (!isSupabaseConfigured()) return alert('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-extrabold mb-2 text-center bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent drop-shadow-lg">Sync Your Habits</h1>
          <p className="text-center text-base text-slate-600 dark:text-slate-300 mb-6 animate-fadeIn">
            Log in to securely sync your habits across all your devices. Choose your preferred provider below.<br/>
            <span className="text-xs text-blue-500">(No posts or data will be shared without your consent.)</span>
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
          }}
          className="flex flex-col gap-4 mb-4"
        >
          {PROVIDERS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 180 }}
            >
              <Button
                onClick={() => handleLogin(p.id)}
                className="w-full py-3 text-lg font-semibold tracking-wide shadow-md hover:scale-105 transition-transform duration-150"
              >
                {`Login with ${p.label}`}
              </Button>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button variant="ghost" className="mt-4 w-full" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </motion.div>
        {/* Decorative animated background shapes */}
        <motion.div
          className="absolute -top-10 -left-10 w-32 h-32 bg-blue-200 dark:bg-blue-900 rounded-full opacity-30 blur-2xl animate-pulse"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-200 dark:bg-indigo-900 rounded-full opacity-20 blur-2xl animate-pulse"
          animate={{ scale: [1, 1.15, 1], rotate: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
};

export default LoginProvidersPage;
