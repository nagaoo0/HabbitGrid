import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Bell, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/use-toast';
import { exportData, importData, clearAllData } from '../lib/storage';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = (enabled) => {
    setDarkMode(enabled);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitgrid-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "✅ Data exported",
      description: "Your habits have been exported successfully.",
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            importData(event.target.result);
            toast({
              title: "✅ Data imported",
              description: "Your habits have been imported successfully.",
            });
            setTimeout(() => navigate('/'), 500);
          } catch (error) {
            toast({
              title: "Import failed",
              description: "Invalid backup file format.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete all habits? This action cannot be undone.')) {
      clearAllData();
      toast({
        title: "✅ Data cleared",
        description: "All habits have been deleted.",
      });
      setTimeout(() => navigate('/'), 500);
    }
  };

  const handleNotificationToggle = (enabled) => {
    setNotifications(enabled);
    toast({
      title: "🚧 Feature coming soon",
      description: "Daily reminders will be available in a future update!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-lg font-semibold mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <div>
                  <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5" />
                <div>
                  <Label htmlFor="notifications" className="text-base">Daily Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded to track habits</p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3"
          >
            <h2 className="text-lg font-semibold mb-4">Data Management</h2>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleImport}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleClearData}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-lg font-semibold mb-2">About HabitGrid</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Version 1.0.0 • Built with ❤️ for habit builders
            </p>
            <p className="text-xs text-muted-foreground">
              Track your habits with a beautiful GitHub-style contribution grid. 
              Build streaks, visualize progress, and commit to yourself daily.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
