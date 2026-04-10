export const weeklySplit = [
  {
    day: 'Day 1 - Push',
    focus: 'Chest + Triceps',
    exercises: [
      'Bench Press - 4 x 6-10',
      'Incline Dumbbell Press - 4 x 8-12',
      'Cable Fly - 3 x 12-15',
      'Dips - 3 x 8-12',
      'Triceps Pushdown - 3 x 10-12',
      'Overhead Triceps Extension - 3 x 10-12',
    ],
  },
  {
    day: 'Day 2 - Pull',
    focus: 'Back + Biceps',
    exercises: [
      'Pull-ups - 4 sets (aim 6-12)',
      'Lat Pulldown - 3 x 8-12',
      'Barbell Row - 3 x 8-10',
      'Face Pull - 3 x 12-15',
      'Dumbbell Curl - 3 x 10-12',
      'Hammer Curl - 3 x 10-12',
    ],
  },
  {
    day: 'Day 3 - Shoulders + Abs',
    focus: 'Aesthetic priority',
    exercises: [
      'Overhead Shoulder Press - 4 x 6-10',
      'Lateral Raise - 5 x 15-20',
      'Rear Delt Fly - 3 x 12-15',
      'Upright Row - 3 x 10-12',
      'Shrugs - 3 x 12-15',
      'Hanging Leg Raise - 3 x 12-15',
      'Cable Crunch - 3 x 12-15',
    ],
  },
  {
    day: 'Day 4 - Legs',
    focus: 'Strength + balance',
    exercises: [
      'Squat - 4 x 6-10',
      'Leg Press - 3 x 10-12',
      'Romanian Deadlift - 3 x 8-10',
      'Hamstring Curl - 3 x 10-12',
      'Leg Extension - 3 x 12-15',
      'Calf Raise - 4 x 12-15',
    ],
  },
  {
    day: 'Day 5 - Upper Pump',
    focus: 'V-taper + symmetry',
    exercises: [
      'Incline Bench - 3 x 8-12',
      'Pull-ups - 3 sets',
      'Lateral Raise - 4 x 15-20',
      'Cable Fly - 3 x 12-15',
      'Seated Row - 3 x 10-12',
      'Barbell Curl + Pushdown superset - 3 x 10-12',
    ],
  },
  {
    day: 'Day 6 - Weak Point',
    focus: 'Shoulder bias',
    exercises: [
      'Dumbbell Shoulder Press - 3 x 8-12',
      'Lateral Raise - 5 x 15-20',
      'Rear Delt Fly - 3 x 12-15',
      'Cable Lateral Raise - 3 x 12-15',
      'Optional arms finisher - 2 sets each',
    ],
  },
  {
    day: 'Day 7 - Rest',
    focus: 'Recovery',
    exercises: ['Sleep 7-8 hrs', 'Light walk', 'Meal prep and progress check'],
  },
]

export const dietPlan = [
  {
    id: 'breakfast',
    label: 'Breakfast: Oats (50g) + milk + 1 tbsp peanut butter + whey (1 scoop)',
    calories: 520,
    protein: 34,
  },
  {
    id: 'mid_meal',
    label: 'Mid meal: Banana + roasted chana',
    calories: 220,
    protein: 8,
  },
  {
    id: 'lunch',
    label: 'Lunch: 2 roti + dal + 50g raw soy chunks (cooked) or 100g paneer + salad',
    calories: 560,
    protein: 32,
  },
  {
    id: 'pre_workout',
    label: 'Pre-workout: Banana + optional black coffee',
    calories: 120,
    protein: 1,
  },
  {
    id: 'post_workout',
    label: 'Post-workout: Whey (1 scoop)',
    calories: 120,
    protein: 24,
  },
  {
    id: 'dinner',
    label: 'Dinner: 2 roti/small rice + paneer/tofu/soy + vegetables',
    calories: 430,
    protein: 26,
  },
  {
    id: 'before_bed',
    label: 'Before bed: 1 glass milk',
    calories: 150,
    protein: 8,
  },
]

export const baselineTargets = {
  calories: 2100,
  protein: 115,
  cardio: '20 min incline walk x 3/week',
  waterLiters: 3,
}
