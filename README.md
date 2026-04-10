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
