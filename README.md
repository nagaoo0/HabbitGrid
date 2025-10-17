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
- Built with React, Vite, Tailwind CSS, Radix UI, and Framer Motion

---

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

**Project Links:**

- [Live Demo](https://myhabitgrid.com/)
- [GitHub](https://github.com/nagaoo0/HabitGrid)
- [Mirror (Gitea)](https://git.mihajlociric.com/count0/HabitGrid)

---

---

*Built with ❤️ by [Mihajlo Ciric](https://mihajlociric.com/)*
