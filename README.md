# Cognix — Frontend

The web client for **Cognix**, an AI-powered knowledge management and chat assistant platform. Built with React 19, TypeScript, and Tailwind CSS v4.

---

## Tech Stack

| Layer          | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| Framework      | [React 19](https://react.dev/) + [TypeScript 6](https://www.typescriptlang.org/) |
| Build Tool     | [Vite 8](https://vite.dev/)                                     |
| Styling        | [Tailwind CSS v4](https://tailwindcss.com/) (Vite plugin)       |
| UI Components  | [shadcn/ui](https://ui.shadcn.com/) (Base UI primitives)        |
| Routing        | [React Router v8](https://reactrouter.com/)                     |
| Icons          | [Lucide React](https://lucide.dev/) · [Tabler Icons](https://tabler.io/icons) |
| Typography     | Geist · Nunito Sans (self-hosted via `@fontsource-variable`)    |
| Markdown       | [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) + [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) |
| Linting        | ESLint 10 + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` |

---

## Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- A running instance of the Cognix backend API (default: `http://localhost:8000`)

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional — defaults to localhost:8000)
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## Scripts

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR             |
| `npm run build`     | Type-check with `tsc` and build for production |
| `npm run preview`   | Preview the production build locally           |
| `npm run lint`      | Lint source files with ESLint                  |

---

## Environment Variables

| Variable        | Default                          | Description                    |
| --------------- | -------------------------------- | ------------------------------ |
| `VITE_API_URL`  | `http://localhost:8000/api/v1`   | Base URL for the backend API   |

Create a `.env.local` file in the project root to override defaults:

```env
VITE_API_URL=https://api.example.com/api/v1
```

---

## Project Structure

```
src/
├── api/                   # API client & streaming utilities
│   ├── client.ts          # JWT-authenticated fetch wrapper
│   └── stream.ts          # SSE / streaming response handler
├── assets/                # Static assets (images, SVGs)
├── components/
│   ├── ui/                # shadcn/ui base components (Button, Card, Sheet, etc.)
│   ├── auth/              # Auth-related components (Change Password dialog)
│   ├── chat/              # Chat interface (messages, composer, bubbles)
│   ├── collection/        # Collection management components
│   ├── document/          # Document detail views (hero, tabs, chunks, preview)
│   ├── skeletons/         # Loading skeleton placeholders
│   ├── app-sidebar.tsx    # Collapsible sidebar with navigation
│   ├── header.tsx         # Global header with profile menu & theme toggle
│   └── theme-toggle.tsx   # Dark / Light / System theme switcher
├── context/
│   ├── AuthContext.tsx     # Authentication state provider
│   ├── ChatContext.tsx     # Chat conversations & messages state
│   └── ThemeContext.tsx    # Theme persistence & system preference sync
├── hooks/
│   ├── use-clipboard.ts   # Copy-to-clipboard utility hook
│   ├── use-document-detail.ts  # Document detail data fetching & mutations
│   └── use-mobile.ts      # Responsive breakpoint detection
├── layout/
│   └── app-layout.tsx     # Root layout with sidebar, header, and content area
├── lib/                   # Shared utilities
├── pages/
│   ├── ChatPage.tsx       # AI chat assistant page
│   ├── DocumentsPage.tsx  # Document listing & management
│   ├── DocumentDetailPage.tsx   # Single document detail view
│   ├── CollectionDetailPage.tsx # Collection detail view
│   ├── LoginPage.tsx      # Authentication — login
│   └── RegisterPage.tsx   # Authentication — registration
├── types/                 # TypeScript type definitions
│   ├── index.ts           # Shared types (User, AuthTokens, ChatMessage, etc.)
│   ├── document.types.ts  # Document-related types
│   └── collection.types.ts # Collection-related types
├── utils/                 # General-purpose utilities
├── App.tsx                # Router configuration & app entry
├── main.tsx               # React DOM mount point
└── index.css              # Tailwind CSS v4 config & design tokens
```

---

## Key Features

- **AI Chat Assistant** — Real-time conversational interface with streaming responses, markdown rendering, and syntax highlighting.
- **Document Management** — Upload, organize, and browse documents with collection-based grouping.
- **Dark / Light / System Theme** — Persisted preference with anti-FOUC inline script for instant theme application.
- **Responsive Design** — Mobile-first layout with collapsible sidebar and adaptive content areas.
- **JWT Authentication** — Secure token-based auth with automatic refresh and redirect on expiry.

---

## Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) with the **base-rhea** style and **mist** base color. To add a new component:

```bash
npx shadcn@latest add <component-name>
```

Components are generated into `src/components/ui/` and wrap [@base-ui/react](https://base-ui.com/) primitives. See [`components.json`](./components.json) for the full configuration.

---

## Building for Production

```bash
npm run build
```

Output is written to `dist/`. Serve it with any static file server or deploy to your hosting platform of choice.

```bash
# Quick local preview
npm run preview
```

---

## License

This project is proprietary. All rights reserved.
