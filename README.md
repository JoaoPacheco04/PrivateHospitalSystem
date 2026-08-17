# 🏥 PrivateHospitalSystem — Advanced Clinical & Healthcare Management Platform

An enterprise-grade, full-stack Hospital Information System (HIS) designed to model real-world clinical workflows, patient trajectories, and private healthcare facility administration. Built to demonstrate advanced relational data modeling, clinical decision intelligence, role-based access security, and modern healthcare compliance.

![.NET](https://img.shields.io/badge/.NET-8-512BD4?logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC2927?logo=microsoftsqlserver&logoColor=white)
![i18n](https://img.shields.io/badge/i18n-PT%20%7C%20EN-teal)

---

## 🌟 Why This Project Stands Out

Most portfolio CRUD applications only implement basic tables. **PrivateHospitalSystem** tackles real-world healthcare engineering challenges:
- **Manchester Triage System (MTS)** with real-time Code Red emergency broadcasting.
- **AI-Assisted Clinical Diagnosis & Triage Evaluator** for differential diagnoses and exam workups.
- **Weight-Adjusted Pediatric & Adult Dosage Calculator** ($mg/kg/day$ & $mL$ posology).
- **Physical Bedside Safety**: Thermal barcode wristband generator & verified e-Prescriptions with scannable QR codes.
- **Hospital Waiting Lounge TV Display (`/waiting-room`)** with real-time audio chimes via Web Audio API.
- **Clinical Voice Dictation** (Speech-to-Text in PT 🇵🇹 / EN 🇬🇧) for fast medical charting.

---

## 🩺 Key Features & Clinical Modules

### 🚨 1. Emergency & Inpatient Care
- **Manchester Triage Protocol**: Color-coded queue urgency (🔴 Immediate 0m, 🟠 Very Urgent 10m, 🟡 Urgent 60m, 🟢 Standard 120m).
- **Code Red Broadcast Banner**: Sticky real-time alert across the hospital when a Priority 1 patient arrives in the ER.
- **Interactive Ward Floorplan Map**: Live bed visualizer with occupancy metrics and instant intake/discharge.
- **Barcode Wristband Printing**: Generates standard thermal hospital identification straps (Code 128 barcode + 2D QR).

### 🤖 2. Clinical Intelligence & Medical Tools
- **AI Clinical Assistant**: Analyzes presenting symptoms, ranks differential diagnoses, and recommends diagnostic protocols (ECG, Troponin, CT, CBC).
- **Clinical Dosage Calculator**: Interactive weight-adjusted posology with safety ceiling caps and suspension $mL$ conversion.
- **Biological Reference Range Gauges**: Visual tri-color horizontal gauges for laboratory exams (Hemoglobin, Leukocytes, Glucose, Creatinine).
- **Speech-to-Text Clinical Dictation**: Native voice dictation for consultation notes, exam findings, and intake complaints.

### 🛡️ 3. Patient Portal & Experience
- **Digital Health Profile**: Chronological medical timeline, digital ID QR Pass, and vital signs logger (Blood Pressure, Heart Rate, $SpO_2$, Temp).
- **Comprehensive Medical Dossier (PDF/Print)**: Printable A4 clinical report with diagnoses, active prescriptions, and directorate stamp block.
- **5-Star Consultation Feedback & Informed Consents**: Transparent quality ratings and electronic consent forms.

### 💼 4. Administration, Finance & Security
- **Financial Module**: Invoicing engine with insurance co-payment calculations, procedure tariffs, and claim tracking.
- **Security & Compliance**: 15-minute inactivity session lock (GDPR/HIPAA compliance) and tamper-proof **Audit Logs**.
- **1-Click CSV/Excel Data Export**: Instant reporting across patients, appointments, admissions, pharmacy stock, and billings.
- **Silent JWT Token Rotation**: Axios 401 response interceptor for seamless background session refresh.

---

## 🎨 UI/UX & Design Architecture
- **Multi-Language (i18n)**: Instant zero-reload toggle between Portuguese (🇵🇹) and English (🇬🇧).
- **High-Contrast Dark & Light Modes**: Slate-surfaced dark mode optimized for night-shift readability.
- **Command Palette (`Ctrl + K`)**: Global spotlight search across patients, doctors, appointments, and quick navigation.
- **Visual Analytics**: Pure SVG revenue trend charts and Manchester acuity distribution donuts.

---

## 🏗️ Architecture & Business Logic

| Layer / Concern | Technical Implementation |
|---|---|
| **Identity & Security** | ASP.NET Core Identity + JWT with cryptographic Refresh Token rotation and role-based policies (`Admin`, `Doctor`, `Staff`, `Patient`). |
| **Data Persistence** | Entity Framework Core 8, Relational SQL Server schema with indexed foreign keys and audit triggers. |
| **Asynchronous Jobs** | Background worker services (`ReminderJobService`) handling scheduled appointment reminders and inventory alerts. |
| **Client Architecture** | React 18 + TypeScript + Vite, TanStack Query (React Query) for server-state caching, and Zustand for auth & theme stores. |
| **Styling & Assets** | Tailwind CSS v4, dynamic CSS variables, custom SVG barcode/QR renderers, and Web Audio/Speech APIs. |

---

## 🚀 Getting Started

### Prerequisites
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- SQL Server (LocalDB, Express, or Docker instance)

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/JoaoPacheco04/PrivateHospitalSystem.git
cd PrivateHospitalSystem/PrivateHospitalSystem

# Apply Entity Framework Core database migrations
dotnet ef database update

# Run the API backend (defaults to https://localhost:7183)
dotnet run --launch-profile https
