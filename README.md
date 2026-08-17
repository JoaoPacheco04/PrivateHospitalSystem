# 🏥 PrivateHospitalSystem

A full-stack hospital management platform built to demonstrate the implementation of complex clinical workflows and healthcare facility administration. Built as a portfolio project to explore advanced relational data management, role-based access control, and process automation in a realistic domain: running a private hospital.

![.NET](https://img.shields.io/badge/.NET-8%2B-512BD4?logo=dotnet)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?logo=microsoftsqlserver)

## Why this project

Most portfolio CRUD apps don't prove much about handling real-world business rules. This one is built around a deliberately hard problem: **managing a complete hospital ecosystem**, from patient admissions in the ER to bed allocation, insurance management, invoicing, and detailed clinical audit logging. 

## Key features

### For patients
- Book and manage medical appointments
- Submit patient feedback and reviews

### For medical staff
- Manage surgeries, emergency cases, and medical exams
- Issue prescriptions and record discharge summaries
- Handle informed consents and internal/external patient referrals
- Receive internal system notifications for urgent cases

### For administrators
- Control patient admissions and allocate rooms and beds in real-time
- Complete financial module: manage invoices, procedure prices, and insurance providers/coverages
- Live management dashboard for a quick overview of hospital occupancy and operations
- Role-based access control (Doctor vs. Admin vs. Patient)

## Architecture & business logic

| Concern | Solution |
|---|---|
| **Access Control** | ASP.NET Core Identity with JWT (JSON Web Tokens) and a Refresh Token system for secure, long-lived, role-based sessions |
| **Traceability** | Automated Audit Logs entity tracks critical data changes across the system to ensure medical compliance and accountability |
| **Background Tasks** | Background services (`ReminderJobService`) handle asynchronous operations like processing clinical reminders and notifications |
| **Billing & Insurance** | Invoices are generated based on dynamic procedure prices and automatically linked to the patient's specific insurance coverage |
| **Client-Side State** | Modular API services (`api/client.ts`) and centralized Zustand-style state (`authStore.ts`) for efficient data fetching |

## Tech stack

**Backend:** ASP.NET Core Web API · Entity Framework Core · SQL Server 

**Frontend:** React + TypeScript · Vite · Tailwind CSS

**Tools / Architecture:** Repository/Service Layer pattern · .NET SDK · Node.js

## Screenshots

_(add screenshots here — dashboard view, appointment calendar, clinical validation screen, admin invoice panel)_

## Getting started

### Prerequisites
- .NET 8 SDK (or newer)
- Node.js 18+
- SQL Server (Express, full, or via Docker)

### Backend setup

```bash
# Navigate to the main project folder
cd PrivateHospitalSystem

# Update the database using Entity Framework Core
dotnet ef database update

# Run the API
dotnet run
