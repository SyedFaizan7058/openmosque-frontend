# 🕌 OpenMosque Frontend

[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0.0-646CFF?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?logo=leaflet)](https://leafletjs.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.62.0-FF4154?logo=react-query)](https://tanstack.com/query)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**OpenMosque Frontend** is a modern, responsive web application for discovering mosques globally, tracking accurate prayer and congregational Iqamah times, engaging with community reviews and Q&A, and managing mosque administrative operations.

Backend Repository: [SyedFaizan7058/openmosque-backend](https://github.com/SyedFaizan7058/openmosque-backend)

---

## 🌟 Key Features

### 📍 Geospatial Mosque Discovery & Interactive Map
- **PostGIS Proximity Search**: Auto-detects user GPS location to list mosques within a customizable radius (1–50 km).
- **Interactive Leaflet Map**: Smooth pan/zoom map rendering with custom mosque markers, cluster pins, and immediate route directions.
- **Facility Filtering**: Filter mosques by amenities (Women's section, Parking, Wheelchair accessible, Wudu area, Quran classes, etc.).
- **Global Search**: Filter by mosque name, address, city, or country with instant debounce queries.

### ⏰ Real-Time Prayer Times & Live Iqamah Countdown
- **Dynamic Countdown**: Displays the active prayer slot, live time remaining countdown, and highlights the next upcoming prayer.
- **Congregational Iqamah Timings**: Shows official mosque-specific Iqamah congregation times configured by verified mosque imams.
- **Secondary Fiqh Timings**: Calculates Ishraaq, Chaasht, Zawaal, Sunset, Iftaar, Tahajjud, and Sahoor End times.
- **Multi-Method Support**: Switch between 14 global calculation conventions (MWL, ISNA, Makkah, Egypt, Karachi, etc.) and Hanafi/Shafi'i Asr methods.
- **Annual Schedule**: Interactive modal to view full month-by-month timetable projections.

### 🤝 Community Engagement & Gamification
- **5-Star Category Ratings**: Rate mosques across 5 specific dimensions: Cleanliness, Facilities, Women's Area, Parking, and Overall.
- **Community Q&A**: Public question-and-answer forum with official Imam verification badges on authoritative responses.
- **Abuse Reporting**: Community content flagging system to report spam or defamatory reviews/questions.
- **User Badges & Rewards**: Earn points and badges (Pioneer, Mosque Guide, Community Scholar) by submitting verified listings.

### 📝 Crowdsourced Submissions & Ownership Claims
- **Submit New Mosques**: Interactive modal with map pin placement, image upload, contact details, and facility checklists.
- **Suggest Profile Edits**: Crowdsource updates to existing mosque profiles.
- **Claim Mosque Ownership**: Trustees and committee members can claim administrative governance by submitting official verification documents (PDF/image up to 5 MB).

### 🔔 In-App Notifications & FCM Web Push
- **Notification Bell**: Live unread notification counter badge in top navigation.
- **Real-Time Delivery**: Submitter confirmation notifications, claim status updates, and announcement broadcasts.
- **Firebase Cloud Messaging (FCM)**: Native browser push notification token registration with toggle controls.

### 🛡️ Role-Based Portals & Two-Factor Security
- **Mosque Admin Portal**: Manage prayer calculation settings, Iqamah schedules, upcoming events, and Friday Jumu'ah khutbah shifts.
- **Moderator Dashboard**: Real-time badge counts and approval queues for Submissions, Claims, and Flagged content.
- **Super Admin Panel**: Full platform telemetry, OSM Overpass bulk city ingestion, and user role management.
- **Two-Factor Authentication (2FA)**: TOTP authenticator setup (Google Authenticator, Authy) with QR code generation and emergency backup codes.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/) |
| **Language** | [TypeScript 5.6](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + Tailwind Animate |
| **Routing** | [React Router 7](https://reactrouter.com/) |
| **State & Cache** | [TanStack React Query v5](https://tanstack.com/query) + [Zustand](https://zustand-demo.pmnd.rs/) |
| **Mapping** | [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/) + CartoDB tiles |
| **Authentication** | [Firebase Authentication](https://firebase.google.com/docs/auth) (Google & Email/Password) + Spring Session |
| **Icons & UI** | [Lucide React](https://lucide.dev/) + Radix UI primitives |
| **Form Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **HTTP Client** | [Axios](https://axios-http.com/) with interceptors & HttpOnly cookie support |

---

## 📁 Project Structure

```
d:/OpenMosque-frontend/
├── public/                 # Static assets, icons, manifest
├── src/
│   ├── assets/             # Images and branding assets
│   ├── components/         # Shared UI components (Navbar, Footer, Modals, Buttons)
│   ├── contexts/           # React context providers (AuthContext, ThemeContext)
│   ├── features/           # Modular feature domains
│   │   ├── admin/          # Moderator & Super Admin dashboards, queues, stats
│   │   ├── auth/           # Login, Register, 2FA screens & handlers
│   │   ├── claims/         # Mosque claim forms and verification upload
│   │   ├── community/      # Content flagging and community tools
│   │   ├── events/         # Community events and Friday Khutbahs
│   │   ├── mosqueAdmin/    # Mosque profile editing, prayer config, Iqamah form
│   │   ├── mosques/        # Discovery cards, nearby queries, Leaflet map
│   │   ├── notifications/  # Notification bell, dropdown, FCM device registration
│   │   ├── prayer/         # Prayer times widget, countdown, annual schedule
│   │   ├── questions/      # Community Q&A forum cards and answer forms
│   │   ├── reviews/        # Star rating widgets, review lists, author actions
│   │   ├── submissions/    # Mosque submission forms, location picker modal
│   │   └── user/           # User profile, favorites, badges, security settings
│   ├── hooks/              # Custom reusable hooks (useGeolocation, useDebounce)
│   ├── lib/                # Axios instance, queryClient, constants, date helpers
│   ├── pages/              # Top-level route page components
│   ├── stores/             # Zustand stores (location, UI modal state)
│   ├── styles/             # Global CSS and Tailwind directives
│   ├── App.tsx             # Root component and router tree
│   └── main.tsx            # Application entry point
├── .env.example            # Template for environment configuration
├── .gitignore              # Hardened git ignore rules
├── package.json            # Project scripts and dependencies
├── tailwind.config.js      # Tailwind theme and plugin definitions
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build pipeline and dev server configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher (v20 LTS recommended)
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)
- **Backend Service**: Running instance of [OpenMosque Backend](https://github.com/SyedFaizan7058/openmosque-backend) on `http://localhost:8080`

### 1. Clone the Repository
```bash
git clone https://github.com/SyedFaizan7058/openmosque-frontend.git
cd openmosque-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8080

# Firebase Client Credentials
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_fcm_web_push_vapid_key

# Map Defaults
VITE_MAP_TILE_URL=https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png
VITE_MAP_DEFAULT_LAT=21.3891
VITE_MAP_DEFAULT_LNG=39.8579
VITE_MAP_DEFAULT_ZOOM=12
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```
The optimized production bundle will be output to the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## 🔒 Security Best Practices
- **No Hardcoded Secrets**: All keys are injected at runtime via Vite environment variables.
- **HttpOnly Cookie Support**: Credentials and access tokens are managed using secure, SameSite cookies.
- **Client-Side File Validation**: Proof document and photo uploads enforce strict MIME type checks and a 5 MB maximum size constraint before dispatch.
- **Content Sanitization**: Community user inputs (reviews, questions, answers) are validated and sanitized via Zod schemas to prevent XSS.

---

## 📖 Technical Documentation
For full API contracts, data models, state lifecycle diagrams, and architecture breakdown, consult:
- [`documentation.md`](./documentation.md) — 42-section complete technical manual.
- [`backend-api-contract.md`](./backend-api-contract.md) — Frontend-backend integration specifications.

---

## 📄 License
This project is licensed under the **MIT License**.
