# Split-Sync | Group Expense Management

**SplitSync** is a premium, full-stack expense tracking application designed for teams, roommates, and friend groups. It simplifies the headache of splitting bills, tracking who owes whom, and settling debts with a sleek, high-performance interface.

🚀 **Live App:** [split-sync-group-expense-tracker.vercel.app](https://split-sync-group-expense-tracker.vercel.app)

---

## Key Features

- ** Intelligent Dashboard**: Gain an instant overview of your net balance, active groups, and recent spending trends.
- ** Group Collaboration**: Create dedicated spaces for trips, households, or events. Manage members and track shared costs seamlessly.
- ** Automated Splitting**: Add expenses and let Split-Sync handle the math. Supports equal splits with high financial precision.
- ** Smart Settlements**: Our internal engine calculates the most efficient way to pay back your peers with minimal transactions.
- ** Security by Design**: Built with **HttpOnly Cookies** and **JWT** to ensure your session is always safe from XSS attacks.
- ** Premium UX**: A responsive, modern design system built with **Tailwind CSS 4** and **Plus Jakarta Sans**.

---

##  Tech Stack

### Frontend
- **React 19 (Vite)**: Lightning-fast, component-based architecture.
- **TypeScript**: Robust type safety across all components and services.
- **Tailwind CSS 4**: Modern styling with a custom design system.
- **Axios**: Centralized API orchestration with Vercel Proxy support.

### Backend
- **Node.js (Express)**: Scalable, high-performance server logic.
- **Prisma ORM**: Type-safe database management with Postgres 17.
- **Neon DBMS**: Serverless PostgreSQL for reliable, high-availability storage.
- **JSON Web Tokens**: Secure, stateless authentication.

---

##  Architecture

Split-Sync leverages a **Secure Proxy Architecture** to ensure production stability:
1. **Frontend (Vercel)** serves the UI and proxies API requests to the backend.
2. **Backend (Railway)** handles business logic and persistent data.
3. **Database (Neon)** stores relations via UUID primary keys for maximum privacy and scalability.

---

##  Getting Started (Local Development)

### 1. Prerequisites
- Node.js (v20+)
- A PostgreSQL database (Local or Neon.tech)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Bilal0876/Split-Sync--Group-Expense-Management-.git
cd Split-Sync

# Install Backend dependencies
cd server
npm install

# Install Frontend dependencies
cd ../Client
npm install
```

### 3. Environment Setup
Create a `.env` file in the `server` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/neondb"
DIRECT_URL="postgresql://user:password@localhost:5432/neondb"
JWT_SECRET="your_secure_random_key"
FRONTEND_URL="http://localhost:5173"
PORT=5000
```

### 4. Database Initialization
```bash
cd server
npx prisma generate
npx prisma db push
```

### 5. Running Locally
```bash
# From the root directory
npm run dev
```

---

##  Security Note
The production deployment uses a **Vercel Proxy** to bridge the frontend and backend. This allows for **HttpOnly Cookies** to be used across domains, which is the industry standard for preventing session hijacking.

---

##  License
This project is for educational and personal use. Feel free to build upon it! ✨

