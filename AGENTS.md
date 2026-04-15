# Agents Guide

This repository is a Next.js App Router project (Next 16 + React 19) using TypeScript, Tailwind CSS, shadcn/ui, and Zustand.

## Commands

```bash
npm install
npm run dev   # http://localhost:1111
npm run lint
```

## Structure

- `app/` — App Router routes (Server Components by default)
- `components/`
  - `components/ui/` — shadcn/ui primitives
  - `components/mall/` — mall domain components
- `lib/`
  - `lib/mall/server/` — API clients grouped by feature
  - `lib/utils.ts` — `cn()` + shared utilities
- `types/`
  - `types/api.ts` — API DTOs and shared response shapes
- `content/posts/` — Markdown blog posts

## API Layer

- Use `apiRequest()` from `lib/mall/server/request.ts`. It returns `ApiResponse<T>` and throws `ApiError` when `code !== 200` or HTTP is not ok.
- Prefer importing API clients via `@/lib/api` (re-export layer) or directly from `@/lib/mall/server`.
- List endpoints may return either a plain array or a paginated shape:
  - `T[]` or `{ data: T[]; pagination: { page; pageSize; total; totalPages } }`
  - Use `PaginatedResponse<T>`, `ProductListResponse`, `OrderListResponse` from `types/api.ts`.

## UI + Styling

- Tailwind-only styling; use `cn()` from `lib/utils.ts` for conditional class names.
- Do not edit shadcn/ui primitive files unless you are upgrading them deliberately. Prefer wrappers in `components/` (e.g. `components/ui/paged-pagination.tsx`).

## Next.js App Router Notes

- Add `"use client"` only when needed (hooks, state, event handlers).
- In Next.js 16, dynamic APIs like `params` / `searchParams` are async. In Client Components, accept `params` as a `Promise` and unwrap via `React.use()`:

```tsx
"use client";
import { use as usePromise } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  return <div>{id}</div>;
}
```

## Type Conventions

- Keep request/response DTOs centralized in `types/api.ts` and import them in `lib/mall/server/*` rather than duplicating inline object types.
- Keep feature constants (labels, enums, mapping helpers) in `lib/mall/` (e.g. `lib/mall/order-constants.ts`) and reuse across pages.
