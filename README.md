# Enigma - Next.js SSR Project

A beautifully crafted Next.js application showcasing **Server-Side Rendering (SSR)**.

## Features

- ⚡ **Server-Side Rendering** - Pages are rendered on the server for fast initial loads
- 🔍 **SEO Optimized** - Fully rendered HTML for better search engine crawling
- 🎨 **Modern UI** - Beautiful dark theme with Tailwind CSS
- 📱 **Responsive** - Works on all device sizes
- 🔷 **TypeScript** - Full type safety

## Getting Started

1. **Install dependencies:**

```bash
npm install
```

2. **Run the development server:**

```bash
npm run dev
```

3. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## SSR in This Project

This project demonstrates SSR using Next.js App Router:

- **Server Components**: The main page (`src/app/page.tsx`) is a Server Component that fetches data on the server
- **`cache: 'no-store'`**: Ensures fresh data on every request (true SSR behavior)
- **Server Timestamp**: The page displays when it was rendered on the server

## Project Structure

```
enigma/
├── src/
│   └── app/
│       ├── globals.css    # Global styles with Tailwind
│       ├── layout.tsx     # Root layout
│       └── page.tsx       # SSR home page
├── tailwind.config.ts     # Tailwind configuration
├── next.config.js         # Next.js configuration
└── package.json           # Dependencies
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technologies

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

