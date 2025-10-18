# HabitGrid


A modern, grid-based habit tracker app inspired by GitHub contribution graphs. Track your daily habits, visualize progress, and build streaks with a beautiful, responsive UI.

---

<p align="center">
  <a href="https://github.com/nagaoo0/HabitGrid" target="_blank"><img src="https://img.shields.io/github/stars/nagaoo0/HabitGrid?style=social" alt="GitHub stars"></a>
  <a href="https://github.com/nagaoo0/HabitGrid" target="_blank"><img src="https://img.shields.io/github/license/nagaoo0/HabitGrid?color=blue" alt="MIT License"></a>
  <a href="https://git.mihajlociric.com/count0/HabitGrid" target="_blank"><img src="https://img.shields.io/badge/Mirror-git.mihajlociric.com-orange?logo=gitea" alt="Gitea Mirror"></a>
</p>

---

**Source code:**

- [GitHub Repository](https://github.com/nagaoo0/HabitGrid)
- [Self-hosted Mirror (Gitea)](https://git.mihajlociric.com/count0/HabitGrid)



## Features
- GitHub-style habit grid (calendar view)
- Streak tracking and personal bests
- Custom habit colors
- Dark mode and light mode
- Data export/import (JSON backup)
- Responsive design (desktop & mobile)
- **Cross-device sync with Supabase (cloud save)**
- **Offline-first:** works fully without login, syncs local habits to cloud on login
- Built with React, Vite, Tailwind CSS, Radix UI, and Framer Motion

---


## How Sync Works

- By default, all habits are stored locally and work offline.
- When you log in (via the call to action button), your local habits are synced to Supabase and available on all devices.
- Any changes (including categories, order, completions) are automatically pushed to the cloud when logged in.

## Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm

### Installation
```powershell
# Clone the repository
git clone https://github.com/nagaoo0/habitgrid.git
cd habitgrid

# Install dependencies
npm install
```

### Development
```powershell
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```powershell
npm run build
```
The production build will be in the `dist` folder.

## Project Structure
```
src/
  App.jsx
  main.jsx
  index.css
  components/
  lib/
  pages/
```


## Cloud Sync Setup

To enable cross-device sync, you need a free [Supabase](https://supabase.com/) account:

1. Create a Supabase project and set up a `habits` table with the following schema:
   ```sql
   create table habits (
     id uuid primary key default gen_random_uuid(),
     user_id uuid not null,
     name text not null,
     color text,
     category text,
     completions jsonb default '[]'::jsonb,
     current_streak int default 0,
     longest_streak int default 0,
     sort_order int default 0,
     created_at timestamptz default now(),
     updated_at timestamptz default now()
   );
   ```
2. Add your Supabase project URL and anon key to the app's environment/config.
3. Deploy as usual (see below).

You can easily deploy your own instance of HabitGrid using [Cloudflare Pages](https://pages.cloudflare.com/):

1. Fork or clone this repository to your GitHub account.
2. Go to Cloudflare Pages and create a new project, connecting your GitHub repo.
3. Use the **Vite** preset when prompted for the build configuration.
4. Set the build command to:
   ```sh
   npm run build
   ```
   and the output directory to:
   ```sh
   dist
   ```
5. Deploy and enjoy your own habit tracker online!


## Offline-First Guarantee

- You can use HabitGrid without ever logging in everything works locally.
- If you decide to log in later, all your local habits (including categories and order) will be synced to the cloud and available on all devices.

---

**Project Links:**

- [Live Demo](https://myhabitgrid.com/)
- [GitHub](https://github.com/nagaoo0/HabitGrid)
- [Mirror (Gitea)](https://git.mihajlociric.com/count0/HabitGrid)

---

*Built with ❤️ by [Mihajlo Ciric](https://mihajlociric.com/)*
