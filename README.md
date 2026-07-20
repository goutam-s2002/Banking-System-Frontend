# 🏦 Banking Management System - Frontend

A modern, responsive, and secure single-page application (SPA) client for the Banking Management System. Built using React, Vite, Bootstrap, and Axios, this application provides an intuitive user interface for managing accounts, performing transactions, viewing statements, and monitoring system audit logs.

---

# 🚀 Features

## 🔐 User & Admin Authentication
- Login and Register screens.
- Protected routes based on roles (`USER` vs `ADMIN`).
- JWT-based authentication with automatic silent token refresh via Axios interceptors.

## 💼 User Portal
- **Dashboard:** Overview of accounts and balances.
- **Transactions:** Perform deposits, withdrawals, and bank transfers.
- **Statements:** View mini-statements or filter detailed bank statements by date range.

## 🛠 Admin Portal
- **Dashboard:** Visual reporting and account statistics.
- **User Management:** Search, update, and delete users.
- **Account Management:** Create new bank accounts, update status (ACTIVE / BLOCKED / CLOSED), or delete accounts.
- **System Logs:** View system-wide audit logs.

---

# 🛠 Tech Stack

- **Framework:** React 19 (Hooks, Context API)
- **Routing:** React Router DOM v7
- **Styling:** Bootstrap 5 & React-Bootstrap
- **HTTP Client:** Axios (Interceptors for token refresh & Authorization headers)
- **Build Tool:** Vite
- **Code Linting:** Oxlint

---

# 📂 Project Structure

```text
src/
├── admin/        # Admin portal pages (AuditLogs, UserList, UserDetail, etc.)
├── api/          # Axios client and interceptors configuration
├── assets/       # Static assets and images
├── auth/         # AuthContext and login/registration flows
├── components/   # Shared layout components (Header, Sidebar, ProtectedRoutes)
├── user/         # User portal pages (Dashboard, Deposit, Withdraw, Transfer, Statement)
├── App.jsx       # App routing configuration
└── main.jsx      # React entrypoint
```

---

# 🖼 Application Screenshots

Below is an overview of the application interface:

![Application Interface](src/assets/hero.png)

---

# 🏁 How to Run Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Install Dependencies
Run the following command in the project directory:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the project to configure the backend API endpoint:
```env
VITE_API_BASE_URL=https://localhost:8080
```

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
The production-ready build will be generated in the `dist/` directory.

---

# 👨‍💻 Developer

**Goutam Soni** - Java FullStack Developer..
**Lavkesh Khare** - Java Backend Developer

```
React | Vite | Bootstrap | REST API | Git
```
