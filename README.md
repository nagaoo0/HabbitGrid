# HabitGrid

A modern, grid-based habit tracker app inspired by GitHub contribution graphs. Track your daily habits, visualize progress, and build streaks with a beautiful, responsive UI.

## Features
- GitHub-style habit grid (calendar view)
- Streak tracking and personal bests
- Custom habit colors
- Dark mode and light mode
- Data export/import (JSON backup)
- Responsive design (desktop & mobile)
- Built with React, Vite, Tailwind CSS, Radix UI, and Framer Motion

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

## Deployment Tip

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

## License
MIT

---

*Built with ❤️ by Mihajlo Ciric*
````
