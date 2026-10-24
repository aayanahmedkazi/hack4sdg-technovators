# MediFlow 🏥

Smart hospital flow and outpatient queue management system built with **React**, **Vite**, **Tailwind CSS**, and **Firebase** (Authentication & Firestore).

---

## 🚀 How to Run the App

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18 or newer).

### 2. Install Dependencies
Open your terminal inside this folder and run:

```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to create your local `.env` file:

```bash
cp .env.example .env
```

*(On Windows PowerShell: `Copy-Item .env.example .env`)*

Fill in your Firebase credentials in `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note:** If you do not have Firebase credentials yet, you can run the app immediately in **Demo Mode**. The app will automatically enable one-click demo logins!

### 4. Start the Local Server
```bash
npm run dev
```

Open your browser and navigate to:
**`http://localhost:3000`** (or the port shown in your terminal).

---

## 🔑 Portals & Roles

MediFlow features 3 distinct role-based portals with route protection:

| Portal | URL | Tabs | Allowed Role |
| :--- | :--- | :--- | :--- |
| **Patient** | `/patient` | Queue, Medicines, Records | `patient` |
| **Receptionist** | `/receptionist` | Tokens, Patients, Display board | `receptionist` |
| **Doctor** | `/doctor` | Today, Patients, Dev Stubs | `doctor` |

### One-Click Demo Logins
On the `/login` screen, you can click any of the 3 large demo buttons to instantly test each role:
- **Demo Patient** → jumps to `/patient`
- **Demo Receptionist** → jumps to `/receptionist`
- **Demo Doctor** → jumps to `/doctor`

Users are automatically blocked from accessing other roles' portals and redirected to their assigned screen.

---

## 📁 Project Folder Structure

```text
src/
├── auth/                 # Login screen, AuthContext, role protection
│   ├── AuthContext.jsx
│   ├── LoginPage.jsx
│   └── ProtectedRoute.jsx
├── portals/              # Portals for each hospital role
│   ├── patient/
│   │   └── PatientPortal.jsx
│   ├── receptionist/
│   │   └── ReceptionistPortal.jsx
│   └── doctor/
│       └── DoctorPortal.jsx
├── modules/              # Pluggable team feature modules
│   ├── queue/            # BookTokenPage, PatientQueueCard, ReceptionTokenDesk, DoctorQueueControls, QueueDisplayBoard
│   ├── records/          # RegisterPatientForm, PatientSearch, RecordFolders, PrescriptionForm, CurrentPatientSheet, PatientRecordsPage
│   ├── reminders/        # TodayReminders, ReminderAlarm, DoseLogTable, TestReminders, DemoClockControl, SmsMockPanel
│   └── demo/             # Demo users and mock helpers
├── shared/               # Shared reusable components, Firebase client, hooks
│   ├── firebase.js
│   ├── hooks.js
│   └── Navbar.jsx
├── App.jsx               # Router & routes configuration
├── main.jsx              # Application entry point
└── index.css             # Tailwind CSS styles
```

---

## 🧩 Module Stubs for Teammates

Each module exports named stubs from its `index.js` file so team members can work inside their designated folder without modifying outside code:

- **Queue (`src/modules/queue/index.js`)**:
  - `<BookTokenPage />`
  - `<PatientQueueCard />`
  - `<ReceptionTokenDesk />`
  - `<DoctorQueueControls />`
  - `<QueueDisplayBoard />`

- **Records (`src/modules/records/index.js`)**:
  - `<RegisterPatientForm />`
  - `<PatientSearch />`
  - `<RecordFolders />`
  - `<PrescriptionForm />`
  - `<CurrentPatientSheet />`
  - `<PatientRecordsPage />`

- **Reminders (`src/modules/reminders/index.js`)**:
  - `<TodayReminders />`
  - `<ReminderAlarm />`
  - `<DoseLogTable />`
  - `<TestReminders />`
  - `<DemoClockControl />`
  - `<SmsMockPanel />`