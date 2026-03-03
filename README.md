<div align="center">
  <h1>🧑‍🍳 HACCP Pro</h1>
  <p><strong>Modern Kitchen Management & Compliance SaaS</strong></p>

  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Prisma_v7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
</div>

<br />

## 📖 The Story: Bridging Culinary Arts & Software Engineering

_As a former Sous Chef with 8+ years of experience in high-pressure kitchens, I intimately understand the pain points of culinary operations._ One of the biggest bottlenecks in any professional kitchen is **HACCP (Hazard Analysis and Critical Control Points) compliance**. Traditionally, this involves piles of paper logs, manual temperature checks, and easily lost delivery records. **HACCP Pro** was built to solve this exact real-world problem. It digitizes the entire compliance workflow into a fast, reliable, and type-safe web application, allowing chefs to focus on cooking, not paperwork.

---

## ✨ Key Features

- **🌡️ Equipment Temperature Monitoring:** Real-time logging for fridges and freezers to ensure food safety standard compliance.
- **📦 Delivery Management:** Comprehensive tracking of supplier deliveries, including batch codes, use-by dates, and vehicle temperature validation.
- **🧹 Cleaning Rotas:** Automated weekly cleaning schedules assigning specific tasks to kitchen personnel.
- **📱 Mobile-First Dashboard:** Fully responsive UI designed specifically to be used on kitchen tablets and mobile devices during busy services.

---

## 🏗️ Architecture & Tech Stack

This project is built using a modern decoupled architecture, emphasizing type safety and high performance:

### Frontend

- **Framework:** Next.js 15 (App Router) & React 19
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Icons:** Lucide React

### Backend

- **Runtime:** Node.js with Express.js
- **Database:** SQLite (via `better-sqlite3`)
- **ORM:** Prisma v7 (Utilizing modern Driver Adapters for Edge readiness)
- **Language:** TypeScript

---

## 📸 Screenshots

<br/>

<table align="center">
  <tr>
    <td align="center"><b>📊 Dashboard</b></td>
    <td align="center"><b>🌡️ Daily Temperatures</b></td>
  </tr>
  <tr>
    <td align="center"><img src="./docs/dashboard.png" width="100%" alt="Dashboard" /></td>
    <td align="center"><img src="./docs/daily-temperature.png" width="100%" alt="Temperatures" /></td>
  </tr>
  <tr>
    <td align="center"><b>📦 Recent Deliveries</b></td>
    <td align="center"><b>✨ Cleaning Rotas</b></td>
  </tr>
  <tr>
    <td align="center"><img src="./docs/recent-deliveries.png" width="100%" alt="Deliveries" /></td>
    <td align="center"><img src="./docs/cleaning.png" width="100%" alt="Cleaning" /></td>
  </tr>
</table>

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

- Node.js (v18.17.0 or higher)
- npm or pnpm

### 1. Clone the repository

```bash
git clone https://github.com/williampgdias/haccp-system.git
cd haccp-system
```

### 2. Backend Setup

Navigate to the backend directory, install dependencies, and initialize the database.

```bash
cd backend
npm install

# Initialize the SQLite database and generate the Prisma Client
npx prisma migrate dev --name init

# Start the development server (runs on http://localhost:3001)
npm run dev
```

### 3. Frontend Setup

Open a new terminal window/tab, navigate to the frontend directory, and start the app.

```bash
cd frontend
npm install

# Start the frontend application (runs on http://localhost:3000)
npm run dev
```

---

## 🗺️ Roadmap (Upcoming Features)

- [ ] User Authentication & Role-Based Access Control (Clerk/NextAuth).
- [ ] **Voice Commands:** Integration of an AI voice assistant allowing chefs to log temperatures hands-free while cooking.
- [ ] Export to PDF/CSV for health inspector audits.

---

## 👨‍💻 Author

**William Dias**

- Full Stack Developer | Domain-Driven Design Enthusiast
- [LinkedIn](https://www.linkedin.com/in/williampgdias/)
- [GitHub](https://github.com/williampgdias)

---

_If you found this project interesting or helpful, please consider leaving a ⭐ on the repository!_
