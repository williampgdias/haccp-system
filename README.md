<div align="center">
  <h1>HACCP Pro</h1>
  <p><strong>Modern Kitchen Management & Compliance SaaS</strong></p>

  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Prisma_v7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</div>

<br />

## The Story: Bridging Culinary Arts & Software Engineering

_As a former Sous Chef with 8+ years of experience in high-pressure kitchens, I intimately understand the pain points of culinary operations._ One of the biggest bottlenecks in any professional kitchen is **HACCP (Hazard Analysis and Critical Control Points) compliance**. Traditionally, this involves piles of paper logs, manual temperature checks, and easily lost delivery records. **HACCP Pro** was built to solve this exact real-world problem. It digitizes the entire compliance workflow into a fast, reliable, and type-safe web application, allowing chefs to focus on cooking, not paperwork.

---

## Key Features

- **Equipment Temperature Monitoring:** Real-time logging for fridges and freezers to ensure food safety standard compliance. Prevents duplicate entries per shift (Morning/Afternoon).
- **Delivery Management:** Comprehensive tracking of supplier deliveries, including batch codes, invoice numbers, and vehicle temperature validation.
- **Cleaning Rotas:** Area-based cleaning schedules with sign-off tracking and completion rate reporting.
- **Cooking & Cooling Logs:** Full lifecycle tracking of cooked items — initial cook phase through to cooling finish — to prevent bacterial growth.
- **PDF Export with Date Range Filter:** Compliance-ready PDF reports for any date range across all modules, ready for health inspector audits.
- **Edit Functionality:** Update existing records across all modules without needing to delete and re-create entries.
- **Team Management:** Invite staff via email, assign roles (ADMIN/STAFF), and manage permissions per restaurant.
- **Mobile-First Dashboard:** Fully responsive UI designed for kitchen tablets and mobile devices during busy service.

---

## Authentication & Security

- **JWT Authentication:** Token-based authentication middleware protecting all API routes.
- **Role-Based Access Control (RBAC):** Kitchen staff and admins each see and manage only what they need.
- **User Onboarding Flow:** Guided setup experience for new users joining a team — creates the restaurant and the first admin account.
- **Password Recovery:** Forgot password and reset password flows powered by [Resend](https://resend.com) email service, with single-use expiring tokens.
- **User Profile & Settings:** Each user can update their name and password independently.
- **Rate Limiting:** API rate limiter middleware to prevent brute-force attacks.

---

## Architecture & Tech Stack

This project is built using a modern decoupled architecture, emphasizing type safety and high performance:

### Frontend

| Technology              | Purpose             |
| ----------------------- | ------------------- |
| Next.js 15 (App Router) | Framework & routing |
| React 19                | UI library          |
| Tailwind CSS            | Styling             |
| TypeScript              | Type safety         |
| NextAuth.js             | Session management  |
| Lucide React            | Icons               |

### Backend

| Technology             | Purpose                  |
| ---------------------- | ------------------------ |
| Node.js + Express.js 5 | Runtime & HTTP server    |
| PostgreSQL             | Primary database         |
| Prisma v7              | ORM with Driver Adapters |
| TypeScript             | Type safety              |
| JWT + bcryptjs         | Auth & password hashing  |
| Zod                    | Request validation       |
| PDFKit                 | PDF report generation    |
| Resend                 | Transactional email      |
| express-rate-limit     | Rate limiting            |

---

## Project Structure

```
haccp-system/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database models
│   └── src/
│       ├── middleware/
│       │   ├── auth.ts            # JWT verification
│       │   └── rateLimiter.ts     # Rate limiting
│       ├── routes/
│       │   ├── authRoutes.ts      # Register, login, password reset, profile
│       │   ├── dashboardRoutes.ts # Aggregated stats
│       │   ├── logRoutes.ts       # Temperatures, deliveries, cooking, cleaning
│       │   ├── reportRoutes.ts    # PDF generation
│       │   └── teamRoutes.ts      # Staff management
│       ├── services/
│       │   └── emailService.ts    # Resend email integration
│       ├── prisma.ts              # Prisma client singleton
│       └── server.ts              # Express app entry point
│
└── frontend/
    └── src/
        ├── app/
        │   ├── cleaning/          # Cleaning rota page
        │   ├── cooking/           # Cooking & cooling page
        │   ├── deliveries/        # Delivery log page
        │   ├── forgot-password/   # Password recovery
        │   ├── login/             # Authentication
        │   ├── onboarding/        # New restaurant setup
        │   ├── profile/           # User profile
        │   ├── reset-password/    # Password reset
        │   ├── settings/          # App settings
        │   ├── setup/             # Initial configuration
        │   ├── temperatures/      # Equipment temperature log
        │   └── page.tsx           # Dashboard
        ├── components/
        │   ├── dashboard/         # Dashboard summary cards
        │   ├── layout/            # Header, navigation
        │   ├── providers/         # NextAuth session provider
        │   └── ui/                # Shared UI (ExportPDF, etc.)
        ├── services/
        │   └── api.ts             # API client
        └── types/                 # TypeScript interfaces
```

---

## Database Schema

```
Restaurant
├── id, name
├── → users (User[])
├── → equipments (Equipment[])
├── → temperatureLogs (TemperatureLog[])
├── → deliveryLogs (DeliveryLog[])
├── → cleaningAreas (CleaningArea[])
├── → cleaningLogs (CleaningLog[])
└── → cookingLogs (CookingLog[])

User
├── id, name, email, password (hashed), role (ADMIN | STAFF)
├── → restaurant (Restaurant)
└── → resetTokens (ResetToken[])

ResetToken
└── id, token, expiresAt, used, → user

Equipment
├── id, name, type
└── → temperatureLogs (TemperatureLog[])

TemperatureLog
└── id, temperature, timeChecked (Morning | Afternoon), initials, → equipment, → restaurant

DeliveryLog
└── id, category, productName, supplier, invoiceNumber, temperature, initials, comments, → restaurant

CookingLog
└── id, foodItem, initials, cookTemp, cookTime, reheatTemp, reheatTime,
    coolingStartTime/Temp, coolingMiddleTime/Temp, coolingFinishTime/Temp, → restaurant

CleaningArea
└── id, name, → restaurant, → cleaningLogs

CleaningLog
└── id, area, status, initials, comments, → cleaningArea, → restaurant
```

---

## API Endpoints

All endpoints are prefixed with `http://localhost:3001`.

### Auth — `/auth`

| Method  | Endpoint                      | Description                            |
| ------- | ----------------------------- | -------------------------------------- |
| `GET`   | `/auth/users/by-email/:email` | Fetch user by email (used by NextAuth) |
| `POST`  | `/auth/register`              | Create restaurant + admin account      |
| `POST`  | `/auth/forgot-password`       | Send password reset email              |
| `POST`  | `/auth/reset-password`        | Set new password via token             |
| `PATCH` | `/auth/profile`               | Update name or password (JWT required) |

### Logs — `/logs`

| Method   | Endpoint                             | Description                   |
| -------- | ------------------------------------ | ----------------------------- |
| `POST`   | `/logs/temperatures`                 | Record equipment temperature  |
| `GET`    | `/logs/temperatures/:restaurantId`   | Fetch all temperature logs    |
| `PATCH`  | `/logs/temperatures/:id`             | Edit a temperature record     |
| `POST`   | `/logs/delivery`                     | Log a new delivery            |
| `GET`    | `/logs/delivery/:restaurantId`       | Fetch delivery logs (last 10) |
| `PATCH`  | `/logs/delivery/:id`                 | Edit a delivery record        |
| `POST`   | `/logs/cooking`                      | Log a new cooking record      |
| `GET`    | `/logs/cooking/:restaurantId`        | Fetch cooking/cooling logs    |
| `PATCH`  | `/logs/cooking/:id`                  | Edit a cooking record         |
| `PUT`    | `/logs/cooking/:id/cooling`          | Add cooling phase data        |
| `POST`   | `/logs/cleaning`                     | Log a cleaning task           |
| `GET`    | `/logs/cleaning/:restaurantId`       | Fetch cleaning logs           |
| `POST`   | `/logs/cleaning-areas`               | Create a cleaning area        |
| `GET`    | `/logs/cleaning-areas/:restaurantId` | Fetch cleaning areas          |
| `DELETE` | `/logs/cleaning-areas/:id`           | Remove a cleaning area        |
| `POST`   | `/logs/equipment`                    | Register new equipment        |
| `GET`    | `/logs/equipment/:restaurantId`      | Fetch equipment list          |
| `DELETE` | `/logs/equipment/:id`                | Remove equipment              |

### Reports — `/reports` (PDF)

| Method | Endpoint                              | Description                                             |
| ------ | ------------------------------------- | ------------------------------------------------------- |
| `GET`  | `/reports/temperatures/:restaurantId` | Temperature PDF (supports `?startDate=&endDate=`)       |
| `GET`  | `/reports/deliveries/:restaurantId`   | Delivery PDF (supports `?startDate=&endDate=`)          |
| `GET`  | `/reports/cleaning/:restaurantId`     | Cleaning PDF (supports `?startDate=&endDate=`)          |
| `GET`  | `/reports/cooking/:restaurantId`      | Cooking & Cooling PDF (supports `?startDate=&endDate=`) |

### Dashboard — `/dashboard`

| Method | Endpoint                         | Description                                                                          |
| ------ | -------------------------------- | ------------------------------------------------------------------------------------ |
| `GET`  | `/dashboard/stats/:restaurantId` | Aggregated stats (temps, cooking, deliveries, cleaning, equipment count, user count) |

### Team — `/team`

| Method   | Endpoint              | Description                                 |
| -------- | --------------------- | ------------------------------------------- |
| `POST`   | `/team`               | Add a new team member (sends welcome email) |
| `GET`    | `/team/:restaurantId` | List all staff                              |
| `DELETE` | `/team/:id`           | Remove a team member                        |
| `PATCH`  | `/team/:id/role`      | Update staff role (ADMIN / STAFF)           |

---

## Screenshots

<table align="center">
  <tr>
    <td align="center"><b>Dashboard</b></td>
    <td align="center"><b>Daily Temperatures</b></td>
  </tr>
  <tr>
    <td align="center"><img src="./docs/dashboard.png" width="100%" alt="Dashboard" /></td>
    <td align="center"><img src="./docs/daily-temperature.png" width="100%" alt="Temperatures" /></td>
  </tr>
  <tr>
    <td align="center"><b>Recent Deliveries</b></td>
    <td align="center"><b>Cleaning Rotas</b></td>
  </tr>
  <tr>
    <td align="center"><img src="./docs/recent-deliveries.png" width="100%" alt="Deliveries" /></td>
    <td align="center"><img src="./docs/cleaning.png" width="100%" alt="Cleaning" /></td>
  </tr>
</table>

---

## Getting Started

### Prerequisites

- Node.js (v18.17.0 or higher)
- npm or pnpm
- A PostgreSQL database (local or hosted — e.g. [Neon](https://neon.tech))

### 1. Clone the repository

```bash
git clone https://github.com/williampgdias/haccp-system.git
cd haccp-system
```

### 2. Environment Variables

> **Never commit `.env` files.** Both are listed in `.gitignore`.

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://user:password@host:5432/haccp_db

JWT_SECRET=your_jwt_secret_here

RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3000
```

Create a `.env.local` file in the `frontend/` directory:

```env
NEXTAUTH_SECRET=your_next_auth_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Backend Setup

```bash
cd backend
npm install

# Run database migrations and generate the Prisma Client
npx prisma migrate dev --name init

# Start the development server (runs on http://localhost:3001)
npm run dev
```

### 4. Frontend Setup

Open a new terminal window/tab:

```bash
cd frontend
npm install

# Start the frontend application (runs on http://localhost:3000)
npm run dev
```

---

## Roadmap

- [x] User Authentication & Role-Based Access Control (ADMIN / STAFF)
- [x] JWT-secured API with rate limiting
- [x] PDF export with custom date range filter for all modules
- [x] Cooking & Cooling full lifecycle tracking
- [x] Edit functionality across all modules
- [x] Team management with welcome emails
- [x] Password recovery with expiring reset tokens
- [ ] **Voice Commands:** AI voice assistant for hands-free temperature logging
- [ ] CSV export support
- [ ] Audit log for all record changes

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

**William Dias**

- Full Stack Developer | Former Sous Chef
- [LinkedIn](https://www.linkedin.com/in/williampgdias/)
- [GitHub](https://github.com/williampgdias)

---

_If you found this project interesting or helpful, please consider leaving a star on the repository!_
