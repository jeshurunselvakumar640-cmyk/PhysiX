export const QUIZ_DATA = {
  experiment: "Effect of Launch Angle on Projectile Range",
  description: "Pre/post quiz for a projectile motion simulator experiment. Assumes ideal projectile motion with no air resistance and launch and landing at the same height.",
  questions: [
    {
      id: 1,
      question: "What happens to the horizontal range when the launch angle is increased from 30° to 45°, assuming the launch speed remains constant?",
      options: [
        "It increases",
        "It decreases",
        "It remains zero",
        "It remains unchanged"
      ],
      answer: "It increases",
      explanation: "Since R = (v₀² sin(2θ)) / g, sin(2 × 30°) = sin(60°) ≈ 0.866, whereas sin(2 × 45°) = sin(90°) = 1.0 (the maximum). Thus, range increases as angle moves toward 45°."
    },
    {
      id: 2,
      question: "For a projectile launched and landing at the same height, which angle gives the maximum horizontal range?",
      options: [
        "30°",
        "45°",
        "60°",
        "90°"
      ],
      answer: "45°",
      explanation: "Range R = (v₀² sin(2θ)) / g is maximized when sin(2θ) reaches its maximum value of 1, which occurs at 2θ = 90°, or θ = 45°."
    },
    {
      id: 3,
      question: "Which force acts on an ideal projectile after it has been launched, if air resistance is ignored?",
      options: [
        "Gravity",
        "Friction",
        "Magnetic force",
        "Applied force"
      ],
      answer: "Gravity",
      explanation: "In ideal projectile motion, once released, the only force acting on the body is the downward force of gravity (F = mg)."
    },
    {
      id: 4,
      question: "What is the horizontal acceleration of a projectile when air resistance is neglected?",
      options: [
        "0 m/s²",
        "9.8 m/s²",
        "-9.8 m/s²",
        "Depends only on the launch angle"
      ],
      answer: "0 m/s²",
      explanation: "Since no horizontal force exists (ΣFx = 0) when air drag is neglected, horizontal acceleration ax = 0 m/s², maintaining constant horizontal speed."
    },
    {
      id: 5,
      question: "If the initial launch speed is increased while the launch angle remains the same, what generally happens to the horizontal range?",
      options: [
        "It increases",
        "It decreases",
        "It becomes zero",
        "It stays exactly the same"
      ],
      answer: "It increases",
      explanation: "Range R is proportional to the square of initial velocity (R ∝ v₀²). Higher initial speed increases both flight duration and horizontal velocity."
    },
    {
      id: 6,
      question: "At the highest point of an ideal projectile's path, what is true about its vertical velocity?",
      options: [
        "It is zero",
        "It is maximum",
        "It equals the horizontal velocity",
        "It is always 9.8 m/s"
      ],
      answer: "It is zero",
      explanation: "At the peak apex of the trajectory, the vertical velocity momentarily passes through zero (vy = 0 m/s) before reversing direction downwards."
    },
    {
      id: 7,
      question: "A projectile is launched at 20 m/s at 45° on level ground. Using g = 10 m/s², approximately how far does it travel horizontally?",
      options: [
        "20 m",
        "30 m",
        "40 m",
        "50 m"
      ],
      answer: "40 m",
      explanation: "R = (v₀² sin(2θ)) / g = (20² × sin(90°)) / 10 = (400 × 1) / 10 = 40 meters."
    },
    {
      id: 8,
      question: "Two projectiles are launched with the same speed at 30° and 60° from the same height. Under ideal conditions, how do their horizontal ranges compare?",
      options: [
        "The 30° projectile travels farther",
        "The 60° projectile travels farther",
        "They have the same range",
        "Both have zero range"
      ],
      answer: "They have the same range",
      explanation: "By the Complementary Angle Theorem, sin(2 × 30°) = sin(60°) = sin(120°) = sin(2 × 60°) = √3/2 ≈ 0.866. Complementary angles with equal initial speed have identical range on level ground."
    },
    {
      id: 9,
      question: "Which quantity primarily determines how long an ideal projectile remains in the air when launched from and landing at the same height?",
      options: [
        "Vertical component of initial velocity",
        "Horizontal component of initial velocity",
        "Projectile mass",
        "Horizontal acceleration"
      ],
      answer: "Vertical component of initial velocity",
      explanation: "Total flight time T = (2 × v₀y) / g = (2 v₀ sinθ) / g is determined solely by the initial vertical velocity component against gravity."
    },
    {
      id: 10,
      question: "In a projectile simulator, which parameter should be changed to study the effect of launch angle while keeping the initial speed constant?",
      options: [
        "Launch angle",
        "Initial speed",
        "Gravity",
        "Projectile mass"
      ],
      answer: "Launch angle",
      explanation: "To isolate the effect of angle, you vary the independent variable (launch angle θ) while keeping control variables (launch speed v₀ and gravity g) fixed."
    }
  ]
};
