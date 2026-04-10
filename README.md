# Gymverse - Personal Celebrity Physique Web App

Custom app built from your exact coaching chat:

- Landing page with cartoon-gym vibe and animated sections
- Firebase auth (email/password login + signup)
- Personal dashboard for your 6-day aesthetic split
- Vegetarian recomp diet plan
- Daily tracker saved to Firestore

## 1) Setup

1. Copy `.env.example` to `.env`
2. Fill Firebase web config values in `.env`
3. Install dependencies:

```bash
npm install
```

4. Start dev server:

```bash
npm run dev
```

## 2) Firebase Requirements

Enable in Firebase console:

- Authentication -> Email/Password
- Firestore Database (production or test mode)

Data path used by app:

- `users/{uid}/dailyLogs/{yyyy-mm-dd}`

## 3) Personalization Included

- Goal mode: Body recomposition at 63kg
- Calories: 2100 kcal
- Protein: 110-120g/day (target stored as 115g)
- Whey: 2 scoops/day flow
- Cardio: 20 min incline walk, 3x/week
- Split:
  - Push
  - Pull
  - Shoulders + Abs
  - Legs
  - Upper Pump
  - Weak Point
  - Rest

## 4) Tracking Fields

Dashboard lets you track daily:

- Weight
- Waist
- Calories
- Protein
- Sleep hours
- Water liters
- Workout done
- Cardio done
- Mirror/strength notes

## 5) Deploy on Render

This repo includes `render.yaml`, so you can deploy in one flow.

1. Push latest code to GitHub.
2. In Render, click **New +** -> **Blueprint**.
3. Select this repository and branch (`main`).
4. In service env vars, add:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Deploy.

Notes:
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- SPA routing is handled with a rewrite from `/*` to `/index.html`.
