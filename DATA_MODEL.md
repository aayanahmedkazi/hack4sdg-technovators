# MediFlow Data Model (DATA_MODEL.md)

This document defines the exact Firestore collections, documents, field names, and types used throughout MediFlow.

> **CRITICAL RULE**: Do not invent alternative field names. All modules (`queue`, `records`, `reminders`) and shared services must adhere strictly to the schema below.

---

## Collections & Schemas

### 1. `users`
Accounts registered in the system (linked to Firebase Auth UID).

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID (matches Firebase Auth `uid`) |
| `name` | `string` | Full name of the user |
| `role` | `string` | Exactly `'patient'` \| `'receptionist'` \| `'doctor'` |
| `phone` | `string` | Contact phone number |

---

### 2. `hospitals`
Hospital or clinic branch details.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID (e.g. `'hospital-main'`) |
| `name` | `string` | Hospital name (e.g. `'City General Hospital'`) |

---

### 3. `doctors`
Doctor professional profile linked to a user account and hospital.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID |
| `userId` | `string` | Reference to `users.id` |
| `hospitalId` | `string` | Reference to `hospitals.id` |
| `name` | `string` | Doctor's display name (e.g. `'Dr. Sameer Khan'`) |
| `speciality` | `string` | Medical speciality (e.g. `'Cardiology'`) |

---

### 4. `patients`
Patient profiles registered by receptionists or online.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID |
| `userId` | `string?` | Optional reference to `users.id` (if patient has an online account) |
| `name` | `string` | Patient full name |
| `age` | `number` | Age in years |
| `gender` | `string` | Gender (e.g. `'Male'` \| `'Female'` \| `'Other'`) |
| `phone` | `string` | Mobile phone number |
| `address` | `string` | Home residential address |
| `hasSmartphone` | `boolean` | `true` if patient has smartphone (app alerts), `false` for SMS only |
| `registeredBy` | `string` | User ID or role that registered this patient |

---

### 5. `queues` (One per doctor per day)
Live queue session managing a doctor's clinic consultation line.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID (e.g. `'queue_doc123_2026-10-25'`) |
| `doctorId` | `string` | Reference to `doctors.id` |
| `date` | `string` | Date string in `'YYYY-MM-DD'` format |
| `maxTokens` | `number` | Maximum tokens permitted for the day |
| `currentNumber` | `number` | Current token number being served |
| `status` | `string` | Exactly `'open'` \| `'stopped'` \| `'on_hold'` \| `'ended'` |
| `holdNote` | `string` | Optional note explaining why doctor is on hold (e.g. `'In emergency OT'`) |

---

### 6. `tokens`
Individual consultation queue tickets issued to patients.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID |
| `doctorId` | `string` | Reference to `doctors.id` |
| `patientId` | `string` | Reference to `patients.id` |
| `number` | `number` | Sequential token number (e.g. `1`, `2`, `3`) |
| `date` | `string` | Date string in `'YYYY-MM-DD'` format |
| `status` | `string` | Exactly `'waiting'` \| `'serving'` \| `'done'` \| `'skipped'` |
| `source` | `string` | Exactly `'online'` \| `'desk'` \| `'phone'` |
| `createdAt` | `string` / `Timestamp` | Creation timestamp |

---

### 7. `prescriptions`
Prescriptions written by doctors following a consultation.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID |
| `patientId` | `string` | Reference to `patients.id` |
| `doctorId` | `string` | Reference to `doctors.id` |
| `hospitalId` | `string` | Reference to `hospitals.id` |
| `date` | `string` | Date string in `'YYYY-MM-DD'` format |
| `medicines` | `Array<MedicineItem>` | List of prescribed medicines (see below) |
| `tests` | `Array<TestItem>` | List of suggested diagnostic tests (see below) |

#### MedicineItem Object:
- `name`: string (e.g. `'Amoxicillin 500mg'`)
- `dose`: string (e.g. `'1 capsule'`)
- `timesPerDay`: number (e.g. `2`)
- `timings`: string[] (list of 24h clock times, e.g. `["08:00", "20:00"]`)
- `durationDays`: number (e.g. `5`)
- `remarks`: string (e.g. `'Take after food'`)

#### TestItem Object:
- `name`: string (e.g. `'Complete Blood Count'`)
- `date`: string (e.g. `'2026-10-26'`)

---

### 8. `reports`
Medical visit summaries, lab reports, and clinical notes.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID |
| `patientId` | `string` | Reference to `patients.id` |
| `doctorId` | `string` | Reference to `doctors.id` |
| `hospitalId` | `string` | Reference to `hospitals.id` |
| `date` | `string` | Date string in `'YYYY-MM-DD'` format |
| `title` | `string` | Report title (e.g. `'Routine Cardiac Followup'`) |
| `notes` | `string` | Detailed clinical observations or recommendations |

---

### 9. `doseLogs`
Medication tracking records for each scheduled dose.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID |
| `patientId` | `string` | Reference to `patients.id` |
| `prescriptionId`| `string` | Reference to `prescriptions.id` |
| `medicineName` | `string` | Name of the medicine |
| `scheduledTime` | `string` | Date & time or timing (e.g. `'2026-10-25 08:00'`) |
| `status` | `string` | Exactly `'pending'` \| `'taken'` \| `'missed'` |

---

### 10. `smsMessages`
Demo simulation collection used to inspect mock SMS messages sent to patients.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID |
| `patientId` | `string` | Reference to `patients.id` |
| `text` | `string` | Full text message body |
| `createdAt` | `string` / `Timestamp` | Timestamp when SMS was dispatched |
