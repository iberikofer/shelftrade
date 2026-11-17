# ShelfTrade 📚

> Modern, full-stack peer-to-peer book exchange service built with **Next.js**, **Express**, **Prisma**, and **PostgreSQL**.

For complete task requirements, see [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md).

---

## 🎨 Design & Aesthetic

ShelfTrade features a warm, editorial design crafted specifically for book lovers:

- **Warm, tactile palette**: Warm cream (`#F5F0D0`), deep crimson (`#8B2020`), amber orange (`#E06000`), olive green (`#3D5C2A`), and dark charcoal text.
- **Fluid micro-interactions**: Natural spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`), tactile button depression (`active:scale-[0.97]`), and staggered grid reveals.
- **Comprehensive state handling**: Full state coverage for all interactive elements (default, hover, active, focus-visible, loading skeletons, disabled, empty).
- **Hairline precision**: 1px crisp borders, zero layout shift (CLS = 0) with fixed aspect ratios and matching skeleton loaders.
- **Editorial typography**: Crimson Pro serif for bookish headings paired with Inter for clear interface readability.

---

## 🚀 Tech Stack

### Frontend (`client/`)

- **Framework**: Next.js 16+ (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Data Fetching & Caching**: TanStack Query (React Query v5)
- **Form Management**: React Hook Form + Zod resolvers
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Backend (`server/`)

- **Runtime**: Node.js + Express
- **Language**: TypeScript (`tsx`)
- **ORM & Database**: Prisma ORM with PostgreSQL
- **Security & Auth**: JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Email Notifications**: Nodemailer (Ethereal test accounts & SMTP)
- **File Uploads**: Multer

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL instance running (or Docker container)

### Setup & Installation

```bash
# Clone the repository
git clone <repo-url>
cd shelftrade

# Install all dependencies (workspaces)
npm install

# Setup backend environment & database
cd server
cp .env.example .env
npx prisma migrate dev
npx prisma db seed

# Run full-stack development environment (concurrently)
cd ..
npm run dev
```

The frontend will be available at `http://localhost:3000` and the API server at `http://localhost:5000`.
