# FleetRoute ELD Planner

FleetRoute ELD Planner is a full-stack trip planning application built for the Spotter ELD assessment.

The app allows a driver/carrier to enter trip details, calculate a truck route, generate required stops, and create driver daily log sheets based on Hours of Service rules.

---

## Live Demo

```text
https://spotter-eld-assessment.vercel.app/
```

---

## GitHub Repository

```text
https://github.com/Stackly-X/spotter-eld-assessment/
```

---

## Overview

The application takes:

- Current location
- Pickup location
- Drop-off location
- Current cycle used in hours
- Optional driver, carrier, truck, trailer, shipper, and commodity details

Then it generates:

- Route summary
- Truck route map
- Pickup/drop-off markers
- Break, fuel, and rest stop markers
- Stops timeline
- HOS-compliant daily log sheets

---

## Features

### Trip Planning

- User can enter current location, pickup location, and drop-off location.
- User can enter current cycle used.
- App calculates route distance and estimated drive time.
- App displays a clean route summary.

### Route Map

- Interactive map using Leaflet.
- Shows route line.
- Shows start, pickup, and drop-off locations.
- Shows generated break, rest, and fuel stop markers.

### Hours of Service Logic

The app includes simplified HOS logic based on the assessment requirements:

- 11-hour driving limit per shift.
- 14-hour on-duty window.
- 30-minute break after 8 cumulative driving hours.
- 10-hour rest period.
- 70-hour cycle limit.
- 34-hour restart when cycle limit is reached.
- Fuel stop at least once every 1,000 miles.
- Pickup time is assumed to be 1 hour.
- Drop-off time is assumed to be 1 hour.

### Daily Log Sheets

- Generates daily log sheets for each 24-hour period.
- Shows four duty status rows:
  - Off Duty
  - Sleeper Berth
  - Driving
  - On Duty, not driving
- Draws duty status lines on a 24-hour grid.
- Shows daily totals for each duty status.
- Shows total miles driven per day.
- Shows remarks for duty status changes.
- Shows driver, carrier, vehicle, trailer, shipper, shipping document, and commodity information.
- Log sheet keeps a professional fixed-width layout and scrolls horizontally on smaller screens.

---

## Tech Stack

### Frontend

- React
- Vite
- Material UI
- Axios
- Leaflet
- React Leaflet

### Backend

- Python
- Django
- Django REST Framework
- django-cors-headers
- OpenRouteService API
- Gunicorn for production deployment

---

## Project Structure

```text
spotter-eld-assessment/
│
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   ├── trips/
│   │   ├── services/
│   │   │   ├── hos_service.py
│   │   │   └── route_service.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DailyLogSheet.jsx
│   │   │   └── RouteMap.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

### Backend `.env`

```text
backend/.env
```

Example:

```env
OPENROUTE_API_KEY=your_openroute_api_key_here
```

For deployment, also add:

```env
ALLOWED_HOSTS=your-backend-domain.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

### Frontend `.env`

Create this file:

```text
frontend/.env
```

Example for local development:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Example for production:

```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com/api
```

---

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Stackly-X/spotter-eld-assessment/
cd the-repo-name
```

---

## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env` file:

```env
OPENROUTE_API_KEY=your_openroute_api_key_here
```

Run backend server:

```bash
python manage.py runserver
```

Backend should run at:

```text
http://127.0.0.1:8000
```

Health check endpoint:

```text
http://127.0.0.1:8000/api/trips/health/
```

Trip planning endpoint:

```text
http://127.0.0.1:8000/api/trips/plan/
```

---

## Frontend Setup

Open a new terminal and go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Run frontend:

```bash
npm run dev
```

Frontend should run at:

```text
http://localhost:5173
```

---

## Build Frontend

To create a production build:

```bash
cd frontend
npm run build
```

The build completes successfully, the output will be generated in:

```text
frontend/dist
```

---

## Backend Check

To verify Django backend configuration:

```bash
cd backend
python manage.py check
```

---

## Example Test Inputs

### Test 1: Normal Route

```text
Current Location: Chicago, IL
Pickup Location: Indianapolis, IN
Drop-off Location: Atlanta, GA
Current Cycle Used: 12

Driver Name: Munazza
Carrier Name: FleetRoute
Vehicle / Truck Number: TRK-102
Trailer Number: TRL-88
Shipping Document Number: BOL-12345
Shipper Name: Don's Paper
Commodity: Paper Products
```

Expected:

- Route summary generated.
- Map generated.
- 0 fuel stops because route is under 1,000 miles.
- 1 required break.
- Multiple daily logs.
- Each daily log totals 24 hours.

---

### Test 2: Long Route with Fuel Stop

```text
Current Location: Los Angeles, CA
Pickup Location: Las Vegas, NV
Drop-off Location: Dallas, TX
Current Cycle Used: 10

Driver Name: Munazza
Carrier Name: FleetRoute
Vehicle / Truck Number: TRK-204
Trailer Number: TRL-778
Shipping Document Number: BOL-12045
Shipper Name: Desert Supply Co.
Commodity: Electronics
```

Expected:

- Route over 1,000 miles.
- Fuel stop generated.
- Multiple required breaks.
- Multiple daily log sheets.
- Each daily log totals 24 hours.

---

### Test 3: High Cycle / Restart Case

```text
Current Location: Chicago, IL
Pickup Location: Indianapolis, IN
Drop-off Location: Atlanta, GA
Current Cycle Used: 67
```

Expected:

- App handles cycle limit.
- 34-hour restart appears in logs.
- Remaining cycle is recalculated after restart.
- Each daily log totals 24 hours.

---

## Deployment

### Backend Deployment

The backend is deployed on Vercel.

---

### Frontend Deployment

The frontend is deployed on Vercel.

---

## Important Notes

- Real `.env` files are not included in GitHub.
- API keys should be configured only in local `.env` files or deployment environment variables.
- The daily log sheet uses horizontal scrolling on small screens to preserve the professional 24-hour grid layout.
---

## Assessment Requirements Covered

- User enters current location, pickup location, drop-off location, and current cycle used.
- App calculates route and displays map.
- App calculates required breaks and stops.
- App includes fuel stops every 1,000 miles.
- App generates daily log sheets.
- App shows 24-hour duty status graph.
- App supports multi-day trips.
- App handles high cycle usage and 34-hour restart.
- App includes clean UI.

---

## Author

Munazza Zahid
