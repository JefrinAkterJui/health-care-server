# Health Care Server

[](https://nodejs.org/) [](https://www.typescriptlang.org/) [](https://www.prisma.io/) [](https://expressjs.com/)

This is a robust, secure, and modular backend system designed to power a modern healthcare platform. It provides a complete API for managing interactions between three distinct user roles: **Patients**, **Doctors**, and **Admins**.

The standout feature of this project is its **AI-powered doctor suggestion engine**, which analyzes patient symptoms to recommend the most suitable medical specialists.

-----

## 🌟 Core Features

### 1. Role-Based Authentication & Security

The system is built with a secure, role-based authentication flow.

  * **Three User Roles:** `ADMIN`, `DOCTOR`, and `PATIENT`.
  * **Secure JWT Authentication:** Uses `accessToken` and `refreshToken` for secure session management.
  * **HttpOnly Cookies:** Tokens are stored in secure `httpOnly` cookies, protecting against XSS attacks.
  * **Protected Routes:** Each endpoint is protected by an `auth` middleware that verifies user roles for proper access control.

### 2. Admin Module

Admins have full oversight and management capabilities.

  * **User Management:** Admins can create new `ADMIN` and `DOCTOR` accounts.
  * **View All Users:** Ability to fetch and filter a list of all users in the system.
  * **Specialty Management:** Admins can create, delete, and manage all available medical specialties (e.g., Cardiology, Neurology), including uploading icons.
  * **Schedule Generation:** Admins can generate all available time slots (e.g., 30-minute intervals from 9 AM to 5 PM for a given date range) into the main `Schedule` table.

### 3. Doctor Module

Doctors have the tools to manage their profiles and schedules.

  * **Profile Management:** Doctors can update their professional details, such as experience, qualifications, and appointment fees.
  * **Manage Specialties:** Doctors can add or remove specialties (created by the Admin) to their own profiles.
  * **Schedule Management:** Doctors can "claim" available slots from the main `Schedule` table, assigning them to their personal `DoctorSchedule` to make them bookable by patients.

### 4. Patient (User) Module

Patients are the primary consumers of the service.

  * **Registration:** Patients can create new accounts with profile photo uploads.
  * **Browse Doctors:** Patients can fetch a list of all doctors, with advanced filtering and searching (by name, specialty, etc.).

### 5. 💡 AI Doctor Suggestions (Smart Feature)

This is the core intelligent feature of the platform.

1.  A patient provides their symptoms as a string (e.g., "headache and blurred vision").
2.  The `aiService` sends these symptoms to an AI model (via OpenRouter).
3.  The AI analyzes the symptoms and returns a list of relevant medical specialties (e.g., `["Neurology", "Ophthalmology"]`).
4.  The system then queries the database for the top-rated or most experienced doctors who match those specific specialties.
5.  A curated list of the most suitable doctors is returned to the patient.

### 6. Atomic Appointment & Payment Workflow

The booking process is robust and ensures data integrity using database transactions.

1.  A patient selects a `doctorId` and an available `scheduleId` to book an appointment.
2.  The system first verifies that the requested slot is not already booked (`isBooked: false`) to prevent double-booking and gracefully handle errors.
3.  A `prisma.$transaction` is initiated to perform multiple database operations as a single, atomic unit:
      * An `Appointment` record is created.
      * The `DoctorSchedule` slot is updated to `isBooked: true`.
      * A `Payment` record is created, capturing the doctor's `appointmentFee`.
      * A unique `videoCallingId` is generated for the appointment.
4.  If any step fails, the entire transaction is rolled back, ensuring no partial or corrupt data is left in the database.

-----

## ⚙️ Tech Stack

  * **Core:** Node.js, Express.js, TypeScript
  * **Database (ORM):** Prisma
  * **Validation:** Zod
  * **Authentication:** `bcryptjs` (Hashing), JSON Web Token (JWT)
  * **File Uploads:** Multer, Cloudinary
  * **AI:** OpenRouter (OpenAI)
  * **Utilities:** `cookie-parser`, `cors`, `date-fns`, `http-status`

-----

## 🏗️ Project Architecture

The project follows a clean, scalable, and modular architecture. All logic is separated by concern into distinct modules (e.g., `user`, `doctor`, `appointment`), and each module contains its own `routes`, `controller`, `service`, and `validation` files. This makes the codebase highly maintainable and easy to extend.

```
src
│
├── app
│   ├── modules
│   │   ├── admin
│   │   ├── appointment
│   │   ├── auth
│   │   ├── doctor
│   │   ├── doctorSchedule
│   │   ├── schedule
│   │   ├── specialties
│   │   └── user
│   │       ├── user.controller.ts
│   │       ├── user.routes.ts
│   │       ├── user.service.ts
│   │       └── user.validation.ts
│   │
│   ├── middlewares
│   │   ├── auth.ts
│   │   ├── globalErrorHandler.ts
│   │   ├── notFound.ts
│   │   └── validateRequest.ts
│   │
│   ├── helper
│   │   ├── aiService.ts
│   │   ├── fileUploder.ts
│   │   ├── jwt.ts
│   │   └── paginationHelper.ts
│   │
│   ├── shared
│   │   ├── catchAsync.ts
│   │   ├── prisma.ts
│   │   └── sendResponse.ts
│   │
│   └── routes
│       └── index.ts
│
├── config
│   └── index.ts
│
├── error
│   └── ApiError.ts
│
├── app.ts
└── server.ts
```


-----

## 🚀 Getting Started

### Prerequisites

  * [Node.js](https://nodejs.org/) (v18 or newer)
  * A running PostgreSQL database (or any database compatible with Prisma)
  * [Cloudinary](https://cloudinary.com/) account (for file uploads)
  * [OpenRouter](https://openrouter.ai/) account (for the AI feature)

### 1. Installation

Clone the repository and install the dependencies.

```bash
git clone https://github.com/your-username/health-care-server.git
cd health-care-server
npm install
```

### 2. Environment Variables (.env)

Create a .env file in the root directory and add the following variables:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="your-database-connection-string"

# Auth
BCRYPT_SALTROUND=12
JWT_SECRET="your-strong-jwt-secret"

# AI Service
OPENROUTER_API_KEY="your-openrouter-api-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Database Migration

Run the Prisma commands to sync your database schema and generate the Prisma Client.

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run the Server

Start the server in development mode (with auto-reloading).

```
npm run dev
```
The server will be running on http://localhost:5000.

## Endpoints (API)

All API routes are prefixed with /api/v1.

| Module              | Base Path         | Description                                     |
| :------------------ | :---------------- | :---------------------------------------------- |
| **User (Patient)**  | `/user`           | Patient registration.                           |
| **Auth**            | `/auth`           | Handles user login and authentication.          |
| **Admin**           | `/admin`          | Admin-specific routes for user management.      |
| **Doctor**          | `/doctor`         | Browsing doctors, profiles, and AI suggestions. |
| **Specialties**     | `/specialties`    | Managing medical specialties.                   |
| **Schedule**        | `/schedule`       | Admin routes for creating available time slots. |
| **Doctor Schedule** | `/doctorSchedule` | Doctor routes for claiming their schedules.     |
| **Appointment**     | `/appointments`   | Patient routes for booking appointments.        |

