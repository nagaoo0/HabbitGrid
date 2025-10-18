import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.habitgrid.app',
  appName: 'HabitGrid',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
