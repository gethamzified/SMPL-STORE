# SMPL Studios

Elevated minimalist fashion commerce platform built with Next.js 15, Supabase, and Tailwind CSS.

## ?? Key Features

- **Storefront**: High-performance, SEO-optimized product catalog and collection management.
- **Admin Panel**: Comprehensive dashboard for product management, order tracking, and design customization.
- **Authentication**: Secure JWT-based auth with OTP verification.
- **Optimized Experience**:
  - Image optimization with AVIF support and dynamic blur placeholders.
  - Server-side rendering (SSR) and Incremental Static Regeneration (ISR).
  - Global middleware for admin route protection.
  - Advanced animations with Framer Motion.

## ?? Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Turbopack)
- **Database / Backend**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State/Data**: Context API, Server Actions
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Verification**: OTP via Nodemailer

## ?? Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

1. Clone the repository:
   "git clone https://github.com/gethamzified/SMPL.git"
   "cd SMPL"

2. Install dependencies:
   "npm install"

3. Setup environment variables:
   Create a .env.local file with the following keys:
   "NEXT_PUBLIC_SUPABASE_URL=..."
   "NEXT_PUBLIC_SUPABASE_ANON_KEY=..."
   "ADMIN_PASS=..."
   "SMTP_HOST=..."
   "SMTP_PORT=..."
   "SMTP_USER=..."
   "SMTP_PASS=..."

4. Run the development server:
   "npm run dev"

## ?? Project Structure

- src/app: Application routes and layouts.
- src/components: Reusable UI modules (Admin, Store, Layout).
- src/lib: Core utilities, API clients, and constants.
- src/services: Business logic and data fetchers.
- supabase/: Database migrations and seed data.

## ?? License

Proprietary. All rights reserved.
