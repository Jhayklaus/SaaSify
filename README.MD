# 🚀 SaaSify — Multi-Role SaaS Dashboard

A fully responsive and scalable SaaS dashboard built with **Next.js**, **Tailwind CSS**, and **React Query**, simulating multiple user roles (Admin, Manager, and User). The app is powered by `json-server` for realistic mock APIs, making it a perfect demonstration of frontend architecture, dynamic routing, and role-based access control.

---

## 🎯 Purpose

This project showcases:

- Component-driven architecture
- Role-based UI rendering
- API integration using mocked services
- Scalable layout patterns
- Interactive dashboard widgets and modals
- Reusable hooks, utilities, and styling conventions

---

## 👥 Roles and Access

| Role   | Access Level                                              |
|--------|------------------------------------------------------------|
| Admin  | View analytics, manage users, tasks, and notifications     |
| Manager| View team tasks, manage task statuses, moderate activity   |
| User   | View personal tasks and notifications                      |

---

## 🧱 Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Framer Motion
- **State Management**: React Query, Zustand
- **Mock Backend**: `json-server`
- **Tooling**: Eslint, Prettier, Husky, Commitlint, Vercel (for deployment)

---

## 🔧 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Jhayklaus/SaaSify.git
cd saasify
```

### 2. Install dependencies

### -NPM
```bash
npm install 
```

### -YARN
```bash
yarn
```

### 3. Run the mock API server

```bash
json-server --watch db.json --port 3001
```

### 4. Start the frontend app

```bash
npm run dev
```

---


### 📊 Features

🔐 Role-based dashboard rendering

📈 Analytics overview (mocked)

📦 Task and project management

📬 Notification system

🎨 Fully responsive UI

⚡ Optimized with Suspense and skeleton loaders


---


### 🧠 Author

Jamiu Akinlade (Jhay Klaus) — Frontend Engineer.

Let’s connect on [LinkedIn](https://www.linkedin.com/in/jamiu-akinlade-7081b9211/)

