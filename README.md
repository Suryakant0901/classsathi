# ClassSathi — Class 9 & 10 Attendance Management System 📚

A professional, full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** attendance management system designed specifically for school administrators and teachers to manage **Class 9 and Class 10** students, record daily attendance, view school register matrices, and download PDF & Excel attendance sheets.

---

## 🌟 Key Features

1. **Secure Admin Authentication**:
   - Only the administrator (your father) can manage students and mark attendance.
   - Protected by JWT authentication and bcrypt password hashing.
   - Default Administrator Credentials:
     - **Email:** `admin@classsathi.com`
     - **Password:** `admin123`
     *(Credentials can be changed anytime in the Settings & Profile page)*

2. **Add Students Manually (Zero Pre-Populated Records)**:
   - Starts **100% empty** with zero demo records.
   - Add students with **Roll Number, Student Name, Father's Name, Class (9 or 10), and Contact Phone**.
   - Includes a **Bulk Import** tool allowing pasting entire class rosters in one go (`Roll, Name, Father's Name, Phone`).

3. **Daily Attendance Marking**:
   - Select **Class 9 or Class 10**, and Date.
   - Quick one-click **Mark All Present** and **Mark All Absent** buttons.
   - Individual touch-friendly status badges: **Present (P)**, **Absent (A)**, **Late (L)**, and **Leave (LV)** with optional remarks.
   - Real-time attendance rate calculation.

4. **Permanent MongoDB Storage & Duplicate Prevention**:
   - All records are saved in a unified MongoDB database (`classsathi_attendance`).
   - Prevents accidental duplicates for the same class and date.
   - When modifying past records, an **Audit Trail** logs who edited it, when, the reason, and the changes made.

5. **Traditional School Attendance Register**:
   - **Monthly Register Matrix:** Formatted exactly like an Indian school attendance register, with columns for Days 1 to 31, student roll numbers, names, fathers' names, totals for P/A/L/LV, and overall attendance percentage.
   - **Daily Register Sheet:** View detailed day sheets with remarks and audit logs.
   - **Student Drilldown:** Click any student to view their complete attendance timeline and profile.

6. **Download Reports (PDF & Excel)**:
   - **Daily Attendance PDF:** Official A4 print layout with school header, student list, father names, remarks, summary stats, and teacher/principal signature spaces.
   - **Daily Attendance Excel:** Formatted `.xlsx` spreadsheet.
   - **Monthly Attendance PDF:** Landscape A4 register with days 1–31, student records, and monthly statistics.
   - **Monthly Attendance Excel:** Complete 31-day school register workbook.

7. **Interactive Dashboard**:
   - Displays real statistics calculated directly from saved database records.
   - Live metrics: Total Students, Class 9 vs 10 counts, Today's Present, Absent, Late, Leave, and Attendance Percentage.
   - **Low Attendance Watchlist:** Automatically alerts teachers about students falling below the mandatory **75% attendance threshold**.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017` (or MongoDB Atlas URI)

### Running the Application

From the root directory (`class sathi`), run:

```bash
npm run dev
```

This single command starts both the backend server and frontend development server simultaneously using `concurrently`:
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Frontend Web App:** [http://localhost:5173](http://localhost:5173)

---

## 📂 Project Architecture

```
class sathi/
├── server/                    # Node.js + Express + MongoDB Backend
│   ├── config/
│   │   └── db.js              # Mongoose database connection
│   ├── controllers/
│   │   ├── authController.js       # Admin authentication & password management
│   │   ├── studentController.js    # Student CRUD & bulk addition
│   │   ├── attendanceController.js # Daily saving, monthly matrix, audit trail
│   │   └── dashboardController.js  # Real-time analytics & 75% alert computation
│   ├── models/
│   │   ├── User.js            # Admin user schema
│   │   ├── Student.js         # Student schema (Class 9 & 10)
│   │   └── Attendance.js      # Attendance register schema with audit log
│   ├── routes/                # Express API routes
│   ├── middleware/auth.js     # JWT protection middleware
│   ├── .env                   # Server environment configuration
│   └── server.js              # Express app entry point
│
├── client/                    # React.js + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/        # Navbar, Sidebar, modals
│   │   ├── context/           # AuthContext (login state & session)
│   │   ├── pages/
│   │   │   ├── Login.jsx              # Admin login page
│   │   │   ├── Dashboard.jsx          # Live statistics & summary cards
│   │   │   ├── TakeAttendance.jsx     # Daily attendance sheet
│   │   │   ├── AttendanceRegister.jsx # Monthly 1-31 matrix & daily registers
│   │   │   ├── Students.jsx           # Student directory & bulk import
│   │   │   ├── Reports.jsx            # PDF and Excel download center
│   │   │   └── Settings.jsx           # School name & password settings
│   │   ├── services/api.js    # API service client
│   │   └── utils/exportHelpers.js # jsPDF & SheetJS (XLSX) generators
│   └── package.json
│
└── package.json               # Root launcher with concurrently
```

---

## 🔑 Administrator Login

| Field | Default Value |
| :--- | :--- |
| **Email** | `admin@classsathi.com` |
| **Password** | `admin123` |
| **Access** | Administrator (Headmaster / Class Teacher) |
