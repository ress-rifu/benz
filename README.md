# Benz Automobile - Garage Management System

A production-ready web application for vehicle garage management with customizable invoices and inventory management.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript, Server Components)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with RLS
- **Caching**: Redis
- **UI**: shadcn/ui (Radix + Tailwind CSS)

## Features

- **Authentication & Roles**
  - Email/password authentication
  - Role-based access (super_admin, admin)
  - Protected routes with middleware

- **Inventory Management**
  - CRUD operations for parts
  - Stock tracking with quantity alerts
  - Immutable inventory logs
  - Reason-based stock adjustments

- **Invoice System**
  - Customer and vehicle details
  - Services and parts billing
  - Tax and discount calculations
  - Transaction-safe stock deduction
  - Print-optimized layout

- **Invoice Customization** (Super Admin)
  - Logo upload
  - Header/footer text
  - Theme colors
  - Field visibility toggles

## Getting Started

### Prerequisites

- Node.js 18+
- Redis server
- Supabase project

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run the SQL files in order in your Supabase SQL editor:

1. `supabase/schema.sql` - Tables and functions
2. `supabase/rls.sql` - Row Level Security policies
3. `supabase/storage.sql` - Storage bucket and policies

### Installation

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, register)
│   ├── dashboard/       # Protected dashboard routes
│   │   ├── inventory/   # Inventory management
│   │   ├── invoices/    # Invoice management
│   │   └── settings/    # Invoice customization
│   └── globals.css
├── components/
│   ├── skeletons/       # Loading skeletons
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/
│   ├── auth/           # Authentication utilities
│   ├── redis/          # Redis client and caching
│   ├── supabase/       # Supabase clients
│   ├── validations/    # Zod schemas
│   └── utils.ts        # Utility functions
└── types/              # TypeScript types
```

## Security

- Row Level Security (RLS) on all tables
- Role-based access control in both DB and app layers
- Rate limiting on authentication endpoints
- Input validation with Zod

## Performance

- Redis caching for inventory, settings, and dashboard
- Server Components for minimal client JS
- Skeleton loaders for perceived performance
- Optimistic UI updates
- Edge middleware for auth

## License

MIT

