---
type: decision
id: dec-2026-03-13-react-vite-stack
date: 2026-03-13
status: accepted
decided_by: jp
---

# Decision: React + Vite + Tailwind + shadcn/ui Tech Stack

## Context

Choosing the frontend framework, build tool, and component library for the Prospect Dashboard.

## Decision

- **Framework:** React 18 with TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **Component library:** shadcn/ui
- **State management:** Zustand
- **Key libraries:** dnd-kit (Kanban), FullCalendar (calendar), Recharts (charts), PapaParse (CSV), Fuse.js (fuzzy search), Dexie.js (IndexedDB)

## Reasoning

- **React:** Largest ecosystem, best Claude Code support (Claude has deep knowledge of React patterns), most hiring flexibility if the team grows. TypeScript for type safety on the data model.
- **Vite:** Fast dev server, fast builds, excellent React support, simpler config than webpack. Industry standard for new React projects.
- **Tailwind + shadcn/ui:** shadcn/ui gives us pre-built, accessible components (tables, forms, dialogs, dropdowns) that look professional out of the box. Tailwind handles custom styling. Both are well-known to Claude Code, which means faster iteration.
- **Zustand over React Context:** Zustand is simpler than Redux, more scalable than Context for complex state. The dashboard has multiple interconnected data types (opportunities, leads, tasks, matches) that need shared state — Context would get unwieldy.
- **dnd-kit over react-beautiful-dnd:** react-beautiful-dnd is in maintenance mode. dnd-kit is actively maintained, lighter weight, and more flexible.

## Alternatives considered

- **Next.js:** Adds server-side rendering complexity we don't need for an internal SPA. Would be useful if we were building a public-facing site.
- **Vue/Svelte:** Smaller ecosystems, less Claude Code familiarity, fewer available component libraries at this quality level.
- **Material UI / Ant Design:** Heavier, more opinionated, less customizable than shadcn/ui. Would constrain our ability to build a distinctive interface.
- **Redux:** Overkill for this project's state management needs. Zustand does everything we need with less boilerplate.

## Risks

- **Library churn:** Some of these libraries could see major version changes. Mitigation: pin versions in package.json, update deliberately.
- **Bundle size:** Multiple libraries could bloat the bundle. Mitigation: Vite tree-shaking handles this well. Monitor with `vite-plugin-visualizer` if needed.

## Follow-up

- Initialize project with `npm create vite@latest prospect-dashboard -- --template react-ts`
- Install and configure all libraries before writing feature code
- Set up ESLint + Prettier for consistent formatting
