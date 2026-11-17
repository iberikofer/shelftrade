# Book Exchange Service (ShelfTrade) — Requirements Specification

## Goal

Develop a full-stack web application for book exchange where users can list their personal books, search and filter books offered by other users, view book details, and send exchange requests via email.

---

## Functional Requirements (MVP)

### 1. Authentication & Authorization (JWT)

- `/register`: User account creation (Default role: `User`).
- `/login`: User authentication returning JWT token.
- Secure token persistence and authenticated session handling on the client.
- Protected routes on both backend API and frontend navigation.

### 2. My Books Management (`/me/books`)

- View a list of user's own books.
- Add new book:
  - `name` (title)
  - `author`
  - `photo` (URL or uploaded file)
- Delete book (with confirmation).

### 3. Public Book Discovery (`/books`)

- Search by `name` (title) or `author`.
- Alphabetical sorting (A-Z / Z-A).
- Server-side pagination.
- Detailed view for each book (`/books/:id`).

### 4. Exchange Requests

- Dedicated "Request Exchange" button on book detail page (`/books/:id`).
- On click: Sends an automated email to the book's owner with:
  - Requester's name and email address.
  - List of books currently owned by the requester available for trade.
- Constraint: Users cannot send exchange requests for their own books.

### 5. Role-Based Access Control (RBAC)

- **Admin**:
  - Full CRUD operations over all users (`/admin`).
  - Delete any book from the platform.
- **User**:
  - CRUD operations over own books.
  - Send and receive exchange requests.

---

## Minimum Required Pages / Routes

1. `/register` & `/login` — Auth pages with client validation.
2. `/books` — Catalog with real-time search, sorting, and pagination.
3. `/books/:id` — Book details, owner information, and "Request Exchange" action.
4. `/me/books` — Personal inventory dashboard with book creation and deletion.
5. `/admin` — Administration console managing registered users and moderation.

---

## Bonus Features (Time Permitting)

- `/profile` — Edit user profile (name, email, avatar), view book stats and exchange history.
- `/forgot-password` — Password reset flow via email tokens.

---

## Technology Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend**: Express + TypeScript + Prisma ORM + PostgreSQL
- **State Management & Data Fetching**: TanStack Query (React Query v5)
- **Forms & Validation**: React Hook Form + Zod
- **Mailing**: Nodemailer (SMTP / Ethereal for dev)
- **Auth**: JWT (jsonwebtoken) + bcryptjs
