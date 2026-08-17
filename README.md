# PrivateHospitalSystem — Hospital Management Platform

A full-stack portfolio project built to handle the operational complexities of a private hospital — from patient admissions and emergency cases to clinical workflows and invoicing.

`.NET` `C#` `SQL Server` `React` `TypeScript`

## Why this project

Hospital management looks simple until you have to handle real clinical constraints: allocating beds in specific rooms, linking prescriptions and medical exams to appointments, managing insurance coverages, and ensuring role-based access for doctors versus administrative staff. This project was built to solve that full picture, end to end, in a realistic relational domain.

## Key features

**For patients**
- Book and manage appointments
- Submit patient feedback

**For medical staff**
- Manage surgeries, emergency cases, and medical exams
- Issue prescriptions and record discharge summaries
- Handle informed consents and internal/external referrals

**For administrators**
- Control patient admissions and allocate rooms and beds
- Manage invoices, procedure prices, and insurance providers
- View system dashboards and manage system notifications

## Architecture & business logic

| Concern | Solution |
|---|---|
| Access control | ASP.NET Core Identity with JWT and refresh tokens for secure session management |
| Traceability | Audit logs entity to track critical data changes across the system |
| Background tasks | Background services (`ReminderJobService`) handle asynchronous operations |
| Billing & Insurance | Invoices are generated based on dynamic procedure prices and linked to patient insurance coverages |

## Tech stack

**Backend:** ASP.NET Core Web API · Entity Framework Core · SQL Server

**Frontend:** React · TypeScript · Vite · Tailwind CSS (configured via index.css)

**Tools:** .NET SDK · Node.js

## Project structure

```text
Controllers/    # API endpoints (e.g., AdmissionsController.cs)
Services/       # Business logic layer (e.g., AdmissionService.cs)
Entities/       # Database models (e.g., Patient.cs, Appointment.cs)
DTOs/           # Data Transfer Objects
frontend/src/   # React SPA source code
