# ShelfTrade 📚

**ShelfTrade** is a modern, full-stack peer-to-peer book exchange platform designed with an editorial aesthetic for book lovers. Readers can catalogue their personal shelves, discover books in the community, propose direct exchanges, and coordinate trades with real-time email notifications and robust administrative moderation.

> 📄 **Technical Specification**: Check out the full [Task Requirements](./docs/REQUIREMENTS.md).

---

## ✨ Features

### 📖 Book Catalog & Discovery

- **Live Search & Filter**: Real-time debounced search by book title or author.
- **Sorting Options**: Sort the entire catalogue alphabetically (A–Z or Z–A).
- **Responsive Layout**: Zero Layout Shift (CLS = 0) with fixed aspect ratio book covers and cinematic shimmer skeleton loaders.
- **Detailed Book Pages**: Book overview with cover art, author, listing date, owner details, and owner shelf size.

### 🔄 Peer-to-Peer Book Exchange System

- **1-Click Swap Proposals**: Send exchange requests directly from any book's detail page.
- **Received Requests**: Review incoming trade offers with the ability to **Accept** or **Decline**.
- **Sent Requests Tracker**: Monitor the real-time status of your outgoing proposals (`PENDING` with clock, `ACCEPTED` with checkmark, `REJECTED` with cross).
- **Smart Guards**: Prevents self-exchange requests and duplicate proposals.

### 👤 Reader Profile & Personal Shelf

- **Personal Library Management**: Add books with custom titles, authors, and cover art (via direct image upload or external image URL).
- **Custom Reader Profiles**: Update profile name, upload custom avatars, and track shelf statistics (books listed, trade proposals sent, membership badge).
- **Integrated Navigation**: Seamless header dropdown menu with direct links to Reader Profile and Personal Bookshelf.

### 🛡️ Administrative Moderator Console (`/admin`)

- **Role-Based Access Control**: Protected routes on both client and server for `ADMIN` users.
- **Unified 3-Segment Metric Tabs**: Interactive overview with full active borders and live counters for:
  1. **Registered Users**: User directory with book counts, creation dates, user creation modal, and account deletion with cascade cleanup.
  2. **All Listed Books**: Moderation table listing all catalogue books with thumbnail previews, owner email links, and deletion capability.
  3. **Exchange Requests**: Community-wide swap overview displaying targeted book, author, requester details, owner details, and status.
- **User Library Filter**: Click on any reader's book count in the users table to view and manage only their shelf with breadcrumb navigation.

### 📧 Automated Email Notifications

- **Welcome Email**: Sent automatically upon reader registration.
- **Exchange Request Alert**: Notifies the book owner immediately when another reader requests a swap, highlighting the requester's available books.
- **Trade Acceptance Notification**: Informs the requester when their trade offer is accepted, providing direct contact information.
- **Password Reset**: Secure, time-limited tokenized password recovery flow.
- **Local Console Fallback**: Graceful offline fallback logging in the development terminal if SMTP is unconfigured.

### 🔒 Enterprise Security & Input Hardening

- **SQL Injection Immunity**: 100% parameterized queries powered by Prisma ORM. No raw queries.
- **XSS Protection**: React JSX auto-escaping, safe URL protocol whitelisting (`http:`, `https:`, `/uploads/`), and strict rejection of `javascript:` or `data:` URI schemes.
- **Bcrypt CPU-DoS Mitigation**: Strict 128-character limit on all password inputs across registration, login, and recovery endpoints.
- **File Upload Protection**: Multer upload pipeline with 5MB file limit, MIME-type verification, and strict extension whitelist (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`).
- **Body Parser Limits**: Hardened payload limits on all JSON and URL-encoded requests (`10mb`).

---

## 🎨 Design Craftsmanship

ShelfTrade is crafted with an editorial, publication-grade aesthetic inspired by classic literature:

- **Typography**: **Crimson Pro** serif for warm literary headings, paired with **Inter** for clean UI readability.
- **Color Palette**: Warm paper cream (`#FAF7EE`), deep crimson burgundy (`#8B2020`), parchment gold (`#D4AF37`), and forest olive (`#3D5C2A`).
- **Micro-Interactions**: Natural spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`), tactile button states, and zero-flicker authentication initialization.
- **Demo Access Pass**: High-contrast, 1-click credentials for instant evaluation.

---

## 🏗️ Tech Stack

### Frontend (`client/`)

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State & Data Fetching**: [TanStack Query v5](https://tanstack.com/query) (React Query)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

### Backend (`server/`)

- **Runtime**: Node.js + [Express](https://expressjs.com/)
- **Language**: TypeScript (`tsx`)
- **Database & ORM**: PostgreSQL via [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT (`jsonwebtoken`) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **File Uploads**: [Multer](https://github.com/expressjs/multer)
- **Email Delivery**: [Nodemailer](https://nodemailer.com/)

---

## 📁 Project Structure

```text
shelftrade/
├── client/                     # Next.js 16 frontend application
│   ├── public/                 # Static assets (favicons, SVGs, public images)
│   ├── src/
│   │   ├── app/                # App Router routes and pages
│   │   │   ├── (auth)/         # Auth pages (login, register, forgot/reset password)
│   │   │   ├── admin/          # Administrator moderation dashboard
│   │   │   ├── books/          # Book discovery catalog and detail pages
│   │   │   ├── me/books/       # Personal bookshelf & exchange management
│   │   │   ├── profile/        # Reader profile settings
│   │   │   ├── layout.tsx      # Root layout with providers, fonts, and metadata
│   │   │   └── page.tsx        # Landing / redirect page
│   │   ├── components/         # Reusable UI, book cards, modals, layout components
│   │   ├── context/            # Global React contexts (AuthContext)
│   │   ├── hooks/              # Custom TanStack Query hooks (useBooks, useAdmin, etc.)
│   │   └── lib/                # Axios instance, queryClient, helper utilities
│   └── package.json
│
├── server/                     # Express & Prisma backend API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema definition
│   │   └── seed.ts             # Pre-configured demo seed data
│   ├── src/
│   │   ├── config/             # Mailer and service configurations
│   │   ├── controllers/        # Route controllers (auth, books, exchange, me, admin)
│   │   ├── middleware/         # Auth, role check, upload, and error middlewares
│   │   ├── routes/             # Express API routes
│   │   ├── utils/              # JWT helpers, custom error classes, validation
│   │   └── index.ts            # Server entry point
│   ├── uploads/                # Local storage for uploaded book and avatar images
│   └── package.json
│
├── docs/                       # Specifications and requirements
├── package.json                # Monorepo workspaces definition
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: Local PostgreSQL instance running on port `5432` (or via Docker)

---

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shelftrade.git
cd shelftrade
```

#### 2. Install Dependencies

Install all workspace dependencies from the root directory:

```bash
npm install
```

#### 3. Configure Backend Environment

Navigate to `server/` and create your `.env` file:

```bash
cd server
```

Create a `.env` file with the following variables:

```env
PORT=5000
CLIENT_URL="http://localhost:3000"
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/shelftrade_db"
JWT_SECRET="shelftrade-super-secret-jwt-key-production-ready"

# Optional SMTP configuration for email notifications (defaults to terminal logging if blank)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="ShelfTrade <your_email@gmail.com>"
```

#### 4. Run Database Migrations & Seed Data

Initialize the database schema and populate it with sample readers and classic books:

```bash
# Generate Prisma Client and apply migrations
npx prisma migrate dev --name init

# Populate database with initial users and books
npx prisma db seed
```

#### 5. Configure Frontend Environment (Optional)

If you need custom variables for the client, create `client/.env.local`:

```env
NEXT_PUBLIC_SERVER_URL="http://localhost:5000"
```

---

### Running the Application

From the **root directory**, you can launch both the frontend and backend servers concurrently with a single command:

```bash
# Run both Client (port 3000) and Server (port 5000)
npm run dev
```

Once started:

- **Frontend Web Application**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-seeded Demo Accounts

Use these pre-seeded accounts for testing different user roles:

| Role              | Email                    | Password       | Permissions                                                                                  |
| :---------------- | :----------------------- | :------------- | :------------------------------------------------------------------------------------------- |
| **Administrator** | `admin@shelftrade.local` | `Password123!` | Full platform administration, manage all users, delete any book, view all exchange proposals |
| **Reader Member** | `alice@shelftrade.local` | `Password123!` | Personal shelf owner with listed classic books                                               |
| **Reader Member** | `bob@shelftrade.local`   | `Password123!` | Personal shelf owner with listed books                                                       |

> 💡 **Quick Login**: The Sign-in and Registration pages feature a 1-click **Reader Demo Pass** to fill these credentials instantly.

---

## 📡 Key API Endpoints

| Category      | Method   | Endpoint                           | Description                                   |
| :------------ | :------- | :--------------------------------- | :-------------------------------------------- |
| **Auth**      | `POST`   | `/api/auth/register`               | Register new reader account                   |
|               | `POST`   | `/api/auth/login`                  | Authenticate and obtain JWT token             |
|               | `GET`    | `/api/auth/me`                     | Fetch authenticated user data & counts        |
|               | `POST`   | `/api/auth/forgot-password`        | Request password reset email                  |
|               | `POST`   | `/api/auth/reset-password`         | Set new password with token                   |
| **Books**     | `GET`    | `/api/books`                       | List books with search, sort, and pagination  |
|               | `GET`    | `/api/books/:id`                   | Get individual book details with owner info   |
|               | `POST`   | `/api/books`                       | Add new book (multipart or JSON)              |
|               | `DELETE` | `/api/books/:id`                   | Delete owned book                             |
| **My Shelf**  | `GET`    | `/api/me/books`                    | Fetch books owned by authenticated user       |
|               | `PUT`    | `/api/me/profile`                  | Update reader display name or avatar          |
| **Exchanges** | `POST`   | `/api/exchange/:bookId`            | Propose exchange for another reader's book    |
|               | `GET`    | `/api/exchange/my-requests`        | Retrieve received and sent proposals          |
|               | `PATCH`  | `/api/exchange/:id/status`         | Accept or reject an exchange proposal         |
| **Admin**     | `GET`    | `/api/admin/stats`                 | Platform-wide totals (users, books, requests) |
|               | `GET`    | `/api/admin/users`                 | List all registered users                     |
|               | `POST`   | `/api/admin/users`                 | Create user with specified role               |
|               | `DELETE` | `/api/admin/users/:id`             | Permanently remove user and listed books      |
|               | `DELETE` | `/api/admin/books/:id`             | Moderate and remove any book from catalogue   |
|               | `GET`    | `/api/admin/exchange-requests`     | Overview of all community trade proposals     |
|               | `DELETE` | `/api/admin/exchange-requests/:id` | Delete/cancel an exchange proposal            |

---

## 🧪 Available Scripts

From the root project directory:

- `npm run dev`: Starts both frontend and backend concurrently in development mode.
- `npm run build`: Compiles TypeScript and builds production bundles for both client and server.
- `npm run lint`: Runs ESLint on the frontend and `tsc --noEmit` on the backend.
- `npm run format`: Formats all files across the monorepo using Prettier.
- `npm run format:check`: Verifies code formatting compliance.

---

## 📄 License

This project was built for educational and portfolio purposes as part of the ShelfTrade specification. All rights reserved.
