/**
 * PhysiX — Multi-Experiment 50-Question Bank & Dynamic Shuffler
 * 
 * Includes 50 verified physics questions for:
 *  - Experiment 1: 2D Projectile Motion
 *  - Experiment 2: Optical Fibre Numerical Aperture (TIR)
 *  - Experiment 3: Colour Sensor (TCS3200 & RGB Photometry)
 * 
 * Generates dynamic 10-question quizzes with full randomization and option-shuffling
 * so no two attempts have the same question pattern or option ordering.
 */

export const PROJECTILE_QUESTION_BANK = {
  title: "2D Projectile Motion - Question Bank",
  experimentId: "projectile",
  quizId: "projectile-mastery-quiz",
  experimentName: "2D Projectile Motion",
  total_questions: 50,
  questions: [
    {
      id: 1,
      question: "What is projectile motion?",
      options: [
        "Motion of an object under gravity after projection",
        "Motion only in a circle",
        "Motion without gravity",
        "Motion only vertically"
      ],
      answer: "A",
      correct_option: "Motion of an object under gravity after projection",
      difficulty: "easy",
      global_id: 1,
      explanation: "A projectile is an object upon which the only significant acting force is gravity after launch."
    },
    {
      id: 2,
      question: "What is the horizontal acceleration of an ideal projectile?",
      options: [
        "Zero",
        "g",
        "2g",
        "g/2"
      ],
      answer: "A",
      correct_option: "Zero",
      difficulty: "easy",
      global_id: 2,
      explanation: "Neglecting air resistance, no horizontal forces act on the projectile (ΣFx = 0), so ax = 0."
    },
    {
      id: 3,
      question: "What is the vertical acceleration of an ideal projectile?",
      options: [
        "g downward",
        "Zero",
        "g upward",
        "2g upward"
      ],
      answer: "A",
      correct_option: "g downward",
      difficulty: "easy",
      global_id: 3,
      explanation: "Gravity exerts a constant downward force (F = mg), producing a downward acceleration of ay = -g."
    },
    {
      id: 4,
      question: "Which force acts on an ideal projectile after release?",
      options: [
        "Gravity",
        "Friction only",
        "Magnetic force only",
        "Electric force only"
      ],
      answer: "A",
      correct_option: "Gravity",
      difficulty: "easy",
      global_id: 4,
      explanation: "In classical ideal projectile dynamics, gravity is the sole force acting during flight."
    },
    {
      id: 5,
      question: "The path of an ideal projectile is a:",
      "options": [
        "Parabola",
        "Circle",
        "Straight line always",
        "Ellipse always"
      ],
      answer: "A",
      correct_option: "Parabola",
      difficulty: "easy",
      global_id: 5,
      explanation: "The equation y = (tanθ)x - (g/(2v₀²cos²θ))x² is quadratic in x, representing a parabolic trajectory."
    },
    {
      id: 6,
      question: "At the highest point of projectile motion, vertical velocity is:",
      "options": [
        "Zero",
        "Maximum",
        "Equal to g",
        "Negative maximum"
      ],
      answer: "A",
      correct_option: "Zero",
      difficulty: "easy",
      global_id: 6,
      explanation: "At the apex peak, the projectile momentarily transitions between upward rise and downward fall (vy = 0)."
    },
    {
      id: 7,
      question: "Horizontal velocity of an ideal projectile is:",
      "options": [
        "Constant",
        "Zero throughout",
        "Increasing",
        "Decreasing"
      ],
      answer: "A",
      correct_option: "Constant",
      difficulty: "easy",
      global_id: 7,
      explanation: "Because ax = 0, horizontal velocity vx = v₀ cosθ remains constant throughout the entire trajectory."
    },
    {
      id: 8,
      question: "The SI unit of acceleration due to gravity is:",
      "options": [
        "m/s²",
        "m/s",
        "N",
        "J"
      ],
      answer: "A",
      correct_option: "m/s²",
      difficulty: "easy",
      global_id: 8,
      explanation: "Acceleration measures the rate of change of velocity per second, giving units of m/s²."
    },
    {
      id: 9,
      question: "If a projectile is launched horizontally, its initial vertical velocity is:",
      "options": [
        "Zero",
        "Equal to horizontal velocity",
        "g",
        "Maximum"
      ],
      answer: "A",
      correct_option: "Zero",
      difficulty: "easy",
      global_id: 9,
      explanation: "For horizontal launch (θ = 0°), v₀y = v₀ sin(0°) = 0 m/s."
    },
    {
      id: 10,
      question: "For a projectile returning to the same height, time of ascent is:",
      "options": [
        "Equal to time of descent",
        "Twice time of descent",
        "Half time of descent",
        "Always zero"
      ],
      answer: "A",
      correct_option: "Equal to time of descent",
      difficulty: "easy",
      global_id: 10,
      explanation: "Symmetry of constant acceleration under gravity ensures tascent = tdescent = (v₀ sinθ)/g."
    },
    {
      id: 11,
      question: "At the highest point, the acceleration of a projectile is:",
      "options": [
        "g downward",
        "Zero",
        "g upward",
        "Horizontal"
      ],
      answer: "A",
      correct_option: "g downward",
      difficulty: "easy",
      global_id: 11,
      explanation: "Gravity does not disappear at the apex; acceleration remains constant at g downward."
    },
    {
      id: 12,
      question: "Range means:",
      "options": [
        "Horizontal distance travelled",
        "Maximum vertical height",
        "Time taken to rise",
        "Initial speed"
      ],
      answer: "A",
      correct_option: "Horizontal distance travelled",
      difficulty: "easy",
      global_id: 12,
      explanation: "The horizontal range R is the total displacement along the x-axis from launch to landing."
    },
    {
      id: 13,
      question: "Maximum height means:",
      "options": [
        "Greatest vertical displacement above launch level",
        "Horizontal distance",
        "Total distance",
        "Time of flight"
      ],
      answer: "A",
      correct_option: "Greatest vertical displacement above launch level",
      difficulty: "easy",
      global_id: 13,
      explanation: "Hmax is the peak vertical coordinate reached along the trajectory."
    },
    {
      id: 14,
      question: "Time of flight is the:",
      "options": [
        "Total time projectile remains in air",
        "Time to reach maximum height only",
        "Horizontal distance",
        "Initial velocity"
      ],
      answer: "A",
      correct_option: "Total time projectile remains in air",
      difficulty: "easy",
      global_id: 14,
      explanation: "Time of flight T is the total duration between launch and touchdown."
    },
    {
      id: 15,
      question: "The horizontal component of initial velocity is:",
      "options": [
        "u cosθ",
        "u sinθ",
        "u tanθ",
        "u/g"
      ],
      answer: "A",
      correct_option: "u cosθ",
      difficulty: "easy",
      global_id: 15,
      explanation: "By trigonometry on the launch velocity vector, ux = u cosθ."
    },
    {
      id: 16,
      question: "The vertical component of initial velocity is:",
      "options": [
        "u sinθ",
        "u cosθ",
        "u/g",
        "u tanθ"
      ],
      answer: "A",
      correct_option: "u sinθ",
      difficulty: "easy",
      global_id: 16,
      explanation: "By trigonometry on the launch velocity vector, uy = u sinθ."
    },
    {
      id: 17,
      question: "At a launch angle of 0°, the projectile is launched:",
      "options": [
        "Horizontally",
        "Vertically upward",
        "Vertically downward",
        "At 45°"
      ],
      answer: "A",
      correct_option: "Horizontally",
      difficulty: "easy",
      global_id: 17,
      explanation: "0° relative to horizontal represents pure horizontal launch."
    },
    {
      id: 18,
      question: "At a launch angle of 90°, the projectile is launched:",
      "options": [
        "Vertically upward",
        "Horizontally",
        "At 45°",
        "Downward horizontally"
      ],
      answer: "A",
      correct_option: "Vertically upward",
      difficulty: "easy",
      global_id: 18,
      explanation: "90° relative to horizontal corresponds to straight vertical projection."
    },
    {
      id: 19,
      question: "Ignoring air resistance, the trajectory depends on:",
      "options": [
        "Initial velocity and gravity",
        "Mass only",
        "Colour only",
        "Temperature only"
      ],
      "answer": "A",
      "correct_option": "Initial velocity and gravity",
      difficulty: "easy",
      global_id: 19,
      explanation: "Under ideal Newtonian mechanics, mass cancels out in F = mg = ma, leaving motion governed purely by u, θ, and g."
    },
    {
      id: 20,
      question: "The acceleration due to gravity is approximately:",
      "options": [
        "9.8 m/s²",
        "98 m/s²",
        "0.98 m/s²",
        "1 m/s² exactly"
      ],
      "answer": "A",
      "correct_option": "9.8 m/s²",
      difficulty: "easy",
      global_id: 20,
      explanation: "Standard sea-level Earth gravitational acceleration is g ≈ 9.80665 m/s²."
    },
    {
      id: 21,
      question: "Which equation gives horizontal displacement for a projectile?",
      "options": [
        "x = (u cosθ)t",
        "x = ut²",
        "x = gt",
        "x = u sinθ"
      ],
      "answer": "A",
      "correct_option": "x = (u cosθ)t",
      difficulty: "medium",
      global_id: 21,
      explanation: "Since horizontal acceleration is zero, displacement is simply velocity × time: x = (u cosθ)t."
    },
    {
      id: 22,
      question: "Which equation gives vertical displacement from launch level?",
      "options": [
        "y = (u sinθ)t − ½gt²",
        "y = ut",
        "y = u cosθ",
        "y = gt²"
      ],
      "answer": "A",
      "correct_option": "y = (u sinθ)t − ½gt²",
      difficulty: "medium",
      "global_id": 22,
      explanation: "From kinematic equation s = ut + ½at² with a = -g and uy = u sinθ."
    },
    {
      id: 23,
      question: "For a projectile landing at the same height, time of flight is:",
      "options": [
        "2u sinθ/g",
        "u cosθ/g",
        "u² sinθ/g",
        "2u cosθ/g"
      ],
      "answer": "A",
      "correct_option": "2u sinθ/g",
      difficulty: "medium",
      "global_id": 23,
      explanation: "Setting y = 0 gives (u sinθ)t - ½gt² = 0 => t = 2u sinθ / g."
    },
    {
      id: 24,
      question: "For same-level projection, horizontal range is:",
      "options": [
        "u² sin2θ/g",
        "u² cosθ/g",
        "u sinθ/g",
        "2u/g"
      ],
      "answer": "A",
      "correct_option": "u² sin2θ/g",
      difficulty: "medium",
      "global_id": 24,
      explanation: "R = vx × T = (u cosθ)(2u sinθ / g) = (u² / g) (2 sinθ cosθ) = u² sin(2θ) / g."
    },
    {
      id: 25,
      question: "Maximum height for a same-level projectile is:",
      "options": [
        "u²sin²θ/(2g)",
        "u²cos²θ/g",
        "u sinθ/g",
        "u²/g²"
      ],
      "answer": "A",
      "correct_option": "u²sin²θ/(2g)",
      difficulty: "medium",
      "global_id": 25,
      explanation: "From vy² = uy² - 2gH => 0 = (u sinθ)² - 2gH => H = u² sin²θ / (2g)."
    },
    {
      id: 26,
      question: "For a fixed launch speed, maximum range occurs at:",
      "options": [
        "45°",
        "30°",
        "60°",
        "90°"
      ],
      "answer": "A",
      "correct_option": "45°",
      difficulty: "medium",
      "global_id": 26,
      explanation: "sin(2θ) reaches its maximum value of 1.0 when 2θ = 90°, so θ = 45°."
    },
    {
      id: 27,
      question: "Angles θ and (90°−θ) with the same speed give:",
      "options": [
        "Same range",
        "Same maximum height",
        "Same time of flight",
        "Zero range"
      ],
      "answer": "A",
      "correct_option": "Same range",
      difficulty: "medium",
      "global_id": 27,
      explanation: "Since sin(2(90°-θ)) = sin(180°-2θ) = sin(2θ), complementary angles yield identical range."
    },
    {
      id: 28,
      question: "At the highest point, the projectile's speed equals:",
      "options": [
        "Horizontal component of velocity",
        "Vertical component only",
        "Zero always",
        "g"
      ],
      "answer": "A",
      "correct_option": "Horizontal component of velocity",
      "difficulty": "medium",
      "global_id": 28,
      explanation: "At apex, vy = 0, so vtotal = √(vx² + 0) = vx = u cosθ."
    },
    {
      id: 29,
      question: "If initial speed is doubled at the same angle, ideal range becomes:",
      "options": [
        "Four times",
        "Two times",
        "Half",
        "Unchanged"
      ],
      "answer": "A",
      "correct_option": "Four times",
      difficulty: "medium",
      "global_id": 29,
      explanation: "Range is proportional to the square of initial velocity (R ∝ u²). (2u)² = 4u²."
    },
    {
      id: 30,
      question: "If initial speed is doubled at the same angle, maximum height becomes:",
      "options": [
        "Four times",
        "Two times",
        "Half",
        "Unchanged"
      ],
      "answer": "A",
      "correct_option": "Four times",
      difficulty: "medium",
      "global_id": 30,
      explanation: "Hmax is proportional to u² (H ∝ u²). Doubling speed quadruples peak height."
    },
    {
      id: 31,
      question: "If g increases while u and θ stay fixed, time of flight:",
      "options": [
        "Decreases",
        "Increases",
        "Stays exactly same",
        "Becomes infinite"
      ],
      "answer": "A",
      "correct_option": "Decreases",
      difficulty: "medium",
      "global_id": 31,
      explanation: "Since T = 2u sinθ / g, time of flight is inversely proportional to g."
    },
    {
      id: 32,
      question: "If g increases while u and θ stay fixed, maximum height:",
      "options": [
        "Decreases",
        "Increases",
        "Stays same",
        "Becomes infinite"
      ],
      "answer": "A",
      "correct_option": "Decreases",
      difficulty: "medium",
      "global_id": 32,
      explanation: "Hmax = u² sin²θ / (2g); stronger gravity decelerates upward velocity faster, reducing peak height."
    },
    {
      id: 33,
      question: "At the same height during ascent and descent, vertical velocity components are:",
      "options": [
        "Equal in magnitude and opposite in direction",
        "Equal and same direction",
        "Both zero",
        "Always different in magnitude"
      ],
      "answer": "A",
      "correct_option": "Equal in magnitude and opposite in direction",
      difficulty: "medium",
      "global_id": 33,
      explanation: "Conservation of mechanical energy dictates equal speeds at equal elevations, with opposite signs for vy."
    },
    {
      id: 34,
      "question": "The horizontal velocity at landing, neglecting air resistance, is:",
      "options": [
        "Same as initial horizontal velocity",
        "Zero",
        "Double initial horizontal velocity",
        "Opposite initial horizontal velocity"
      ],
      "answer": "A",
      "correct_option": "Same as initial horizontal velocity",
      difficulty: "medium",
      "global_id": 34,
      explanation: "With ax = 0, vx remains unchanged from launch to impact."
    },
    {
      id: 35,
      question: "The velocity of a projectile at any instant has:",
      "options": [
        "Horizontal and vertical components",
        "Only vertical component",
        "Only horizontal component",
        "No components"
      ],
      "answer": "A",
      "correct_option": "Horizontal and vertical components",
      "difficulty": "medium",
      "global_id": 35,
      explanation: "2D motion is resolved into two orthogonal 1D components: vx and vy."
    },
    {
      id: 36,
      question: "For θ = 45° and u = 10 m/s, approximate range using g = 10 m/s² is:",
      "options": [
        "10 m",
        "5 m",
        "20 m",
        "100 m"
      ],
      "answer": "A",
      "correct_option": "10 m",
      difficulty: "medium",
      "global_id": 36,
      explanation: "R = (10² × sin(90°)) / 10 = (100 × 1) / 10 = 10 m."
    },
    {
      id: 37,
      question: "For θ = 90° in same-level range formula, range is:",
      "options": [
        "Zero",
        "Maximum",
        "u²/g",
        "2u²/g"
      ],
      "answer": "A",
      "correct_option": "Zero",
      "difficulty": "medium",
      "global_id": 37,
      explanation: "R = (u² sin(180°)) / g = 0 m, because the projectile travels straight up and down on the spot."
    },
    {
      id: 38,
      question: "A projectile's vertical velocity changes because of:",
      "options": [
        "Gravity",
        "Horizontal motion",
        "Its mass only",
        "Its colour"
      ],
      "answer": "A",
      "correct_option": "Gravity",
      "difficulty": "medium",
      "global_id": 38,
      explanation: "Gravitational force provides the continuous vertical acceleration."
    },
    {
      id: 39,
      question: "The slope of a projectile trajectory at any point represents:",
      "options": [
        "vy/vx",
        "vx/vy",
        "g/u",
        "u/g"
      ],
      "answer": "A",
      "correct_option": "vy/vx",
      "difficulty": "medium",
      "global_id": 39,
      explanation: "dy/dx = (dy/dt) / (dx/dt) = vy / vx = tan(instantaneous angle)."
    },
    {
      id: 40,
      question: "The equation of trajectory for same-origin projection is:",
      "options": [
        "y = x tanθ − gx²/(2u²cos²θ)",
        "y = x + u",
        "y = gt²",
        "y = u²x"
      ],
      "answer": "A",
      "correct_option": "y = x tanθ − gx²/(2u²cos²θ)",
      "difficulty": "medium",
      "global_id": 40,
      explanation: "Eliminating t = x/(u cosθ) from y = (u sinθ)t - ½gt² yields the standard Cartesian trajectory formula."
    },
    {
      id: 41,
      question: "A projectile has maximum range R. If its launch speed is doubled, the new maximum range is:",
      "options": [
        "4R",
        "2R",
        "R/2",
        "R"
      ],
      "answer": "A",
      "correct_option": "4R",
      "difficulty": "hard",
      "global_id": 41,
      explanation: "Rmax = u²/g. Doubling u to 2u yields (2u)²/g = 4(u²/g) = 4R."
    },
    {
      id: 42,
      question: "Two complementary angles have the same range because:",
      "options": [
        "sin(2θ) is the same",
        "cosθ is always zero",
        "Their heights are equal",
        "Their times are always equal"
      ],
      "answer": "A",
      "correct_option": "sin(2θ) is the same",
      "difficulty": "hard",
      "global_id": 42,
      explanation: "sin(2(90°-θ)) = sin(180°-2θ) = sin(2θ)."
    },
    {
      id: 43,
      question: "For a projectile launched and landing at the same height, maximum range occurs when:",
      "options": [
        "sin2θ = 1",
        "cosθ = 1",
        "sinθ = 0",
        "tanθ = 0"
      ],
      "answer": "A",
      "correct_option": "sin2θ = 1",
      "difficulty": "hard",
      "global_id": 43,
      explanation: "Maximum of sin(2θ) is 1, which occurs at 2θ = 90° => θ = 45°."
    },
    {
      id: 44,
      question: "At the highest point of a projectile, which statement is correct?",
      "options": [
        "vy = 0 but acceleration is still g downward",
        "Both velocity and acceleration are zero",
        "vx = 0 and acceleration is zero",
        "Acceleration is horizontal"
      ],
      "answer": "A",
      "correct_option": "vy = 0 but acceleration is still g downward",
      "difficulty": "hard",
      "global_id": 44,
      explanation: "The projectile maintains horizontal velocity vx = u cosθ and experiences constant acceleration g downward."
    },
    {
      id: 45,
      question: "A projectile is launched with u = 20 m/s at 30°, g = 10 m/s². Its time of flight is:",
      "options": [
        "2 s",
        "1 s",
        "4 s",
        "√3 s"
      ],
      "answer": "A",
      "correct_option": "2 s",
      "difficulty": "hard",
      "global_id": 45,
      explanation: "T = 2u sinθ / g = (2 × 20 × sin(30°)) / 10 = (40 × 0.5) / 10 = 2.0 s."
    },
    {
      id: 46,
      question: "For u = 20 m/s, θ = 45°, g = 10 m/s², the range is:",
      "options": [
        "40 m",
        "20 m",
        "10 m",
        "80 m"
      ],
      "answer": "A",
      "correct_option": "40 m",
      "difficulty": "hard",
      "global_id": 46,
      explanation: "R = (20² × sin(90°)) / 10 = (400 × 1) / 10 = 40 m."
    },
    {
      id: 47,
      question: "For u = 20 m/s, θ = 30°, g = 10 m/s², maximum height is:",
      "options": [
        "5 m",
        "10 m",
        "20 m",
        "2.5 m"
      ],
      "answer": "A",
      "correct_option": "5 m",
      "difficulty": "hard",
      "global_id": 47,
      explanation: "H = u² sin²θ / (2g) = (400 × 0.25) / 20 = 100 / 20 = 5 m."
    },
    {
      id: 48,
      question: "If a projectile is launched at θ and its range is maximum, its horizontal and initial vertical velocity components are:",
      "options": [
        "Equal",
        "Opposite",
        "One is zero",
        "Both zero"
      ],
      "answer": "A",
      "correct_option": "Equal",
      "difficulty": "hard",
      "global_id": 48,
      explanation: "At θ = 45°, ux = u cos(45°) = u/√2 and uy = u sin(45°) = u/√2, so ux = uy."
    },
    {
      id: 49,
      question: "A projectile is at the same vertical level at t1 and t2. For same-level motion, the times satisfy:",
      "options": [
        "t1 + t2 = 2u sinθ/g",
        "t1t2 = 0",
        "t1 = t2 always",
        "t1 − t2 = g"
      ],
      "answer": "A",
      "correct_option": "t1 + t2 = 2u sinθ/g",
      "difficulty": "hard",
      "global_id": 49,
      explanation: "From y = (u sinθ)t - ½gt², the sum of the roots of ½gt² - (u sinθ)t + y = 0 is t1 + t2 = (u sinθ)/(½g) = 2u sinθ / g (total flight time)."
    },
    {
      id: 50,
      question: "If the range is kept fixed while g is constant, changing u generally requires changing:",
      "options": [
        "Launch angle",
        "Mass",
        "Colour",
        "Air pressure only"
      ],
      "answer": "A",
      "correct_option": "Launch angle",
      "difficulty": "hard",
      "global_id": 50,
      explanation: "Since R = u² sin(2θ) / g, if u changes, sin(2θ) and hence θ must adjust to maintain constant R."
    }
  ]
};

export const OPTICAL_FIBRE_QUESTION_BANK = {
  title: "Optical Fibre - Question Bank",
  experimentId: "optical",
  quizId: "optical-mastery-quiz",
  experimentName: "Determination of Numerical Aperture of an Optical Fibre",
  total_questions: 50,
  questions: [
    {
      id: 1,
      question: "What is the basic principle of optical fibre transmission?",
      options: [
        "Total internal reflection",
        "Photoelectric effect",
        "Diffraction only",
        "Electromagnetic induction"
      ],
      answer: "A",
      correct_option: "Total internal reflection",
      difficulty: "easy",
      global_id: 51,
      explanation: "Light signals are confined and guided inside an optical fibre by continuous total internal reflections."
    },
    {
      id: 2,
      question: "The central light-guiding region of an optical fibre is called:",
      options: [
        "Core",
        "Cladding",
        "Jacket",
        "Coating"
      ],
      answer: "A",
      correct_option: "Core",
      difficulty: "easy",
      global_id: 52,
      explanation: "The core is the inner cylindrical optical medium through which light travels."
    },
    {
      id: 3,
      question: "The layer surrounding the core is called:",
      options: [
        "Cladding",
        "Anode",
        "Cathode",
        "Terminal"
      ],
      answer: "A",
      correct_option: "Cladding",
      difficulty: "easy",
      global_id: 53,
      explanation: "The cladding wraps around the core with a slightly lower refractive index to facilitate TIR."
    },
    {
      id: 4,
      question: "The refractive index of the core is generally:",
      options: [
        "Greater than that of cladding",
        "Less than cladding",
        "Equal to air always",
        "Zero"
      ],
      answer: "A",
      correct_option: "Greater than that of cladding",
      difficulty: "easy",
      global_id: 54,
      explanation: "TIR requires light to propagate from a medium of higher refractive index (n₁) to lower index (n₂), so n₁ > n₂."
    },
    {
      id: 5,
      question: "TIR stands for:",
      options: [
        "Total Internal Reflection",
        "Total Intensity Radiation",
        "Transmitted Internal Refraction",
        "Total Infrared Response"
      ],
      answer: "A",
      correct_option: "Total Internal Reflection",
      difficulty: "easy",
      global_id: 55,
      explanation: "Total Internal Reflection is the optical phenomenon where 100% of incident light is reflected back into the denser medium."
    },
    {
      id: 6,
      question: "For TIR, light must travel from:",
      options: [
        "Optically denser to optically rarer medium",
        "Rarer to denser medium",
        "Vacuum to vacuum",
        "Any medium at any angle"
      ],
      answer: "A",
      correct_option: "Optically denser to optically rarer medium",
      difficulty: "easy",
      global_id: 56,
      explanation: "TIR can only take place when light travels from higher optical density (core) towards lower optical density (cladding)."
    },
    {
      id: 7,
      question: "The angle of incidence for TIR must be:",
      options: [
        "Greater than the critical angle",
        "Less than critical angle",
        "Always 0°",
        "Always 90°"
      ],
      answer: "A",
      correct_option: "Greater than the critical angle",
      difficulty: "easy",
      global_id: 57,
      explanation: "When θi > θc, refraction into the rarer medium cannot satisfy Snell's law, causing total reflection."
    },
    {
      id: 8,
      question: "Optical fibre is commonly used for:",
      options: [
        "Communication",
        "Measuring mass",
        "Generating mechanical power",
        "Heating rooms"
      ],
      answer: "A",
      correct_option: "Communication",
      difficulty: "easy",
      global_id: 58,
      explanation: "Optical fibres form the backbone of modern global high-speed telecommunications and internet infrastructure."
    },
    {
      id: 9,
      question: "Which material is commonly used to make optical fibres?",
      options: [
        "Glass or plastic",
        "Iron only",
        "Copper only",
        "Wood"
      ],
      answer: "A",
      correct_option: "Glass or plastic",
      difficulty: "easy",
      global_id: 59,
      explanation: "High-purity silica glass (SiO₂) or transparent polymers (PMMA) are standard optical fibre materials."
    },
    {
      id: 10,
      question: "A single-mode fibre has:",
      options: [
        "A very small core and mainly one propagation mode",
        "A very large metal core",
        "No cladding",
        "Only electrical current"
      ],
      answer: "A",
      correct_option: "A very small core and mainly one propagation mode",
      difficulty: "easy",
      global_id: 60,
      explanation: "Single-mode fibres (core diameter ~8-10 µm) guide only the fundamental optical mode, eliminating modal dispersion."
    },
    {
      id: 11,
      question: "Multimode fibre generally has:",
      options: [
        "A larger core",
        "No core",
        "Only one photon",
        "No cladding"
      ],
      answer: "A",
      correct_option: "A larger core",
      difficulty: "easy",
      global_id: 61,
      explanation: "Multimode fibres typically have larger core diameters (50 µm to 62.5 µm), allowing multiple ray propagation paths."
    },
    {
      id: 12,
      question: "Numerical aperture indicates the fibre's:",
      options: [
        "Light-gathering ability",
        "Mass",
        "Length only",
        "Electrical resistance only"
      ],
      answer: "A",
      correct_option: "Light-gathering ability",
      difficulty: "easy",
      global_id: 62,
      explanation: "NA = sin(θmax) characterizes the range of launch angles from which the fibre can accept and guide light."
    },
    {
      id: 13,
      question: "Acceptance angle is related to:",
      options: [
        "Maximum angle for light to enter and remain guided",
        "Fibre mass",
        "Core temperature",
        "Electrical power"
      ],
      answer: "A",
      correct_option: "Maximum angle for light to enter and remain guided",
      difficulty: "easy",
      global_id: 63,
      explanation: "Acceptance angle θmax is the maximum semi-angle of the incident light cone that undergoes TIR at core-cladding boundary."
    },
    {
      id: 14,
      question: "The critical angle depends on:",
      options: [
        "Refractive indices of the two media",
        "Mass only",
        "Colour name only",
        "Fibre length only"
      ],
      answer: "A",
      correct_option: "Refractive indices of the two media",
      difficulty: "easy",
      global_id: 64,
      explanation: "The critical angle is determined by sin(θc) = n₂ / n₁."
    },
    {
      id: 15,
      question: "The outer protective layer of a fibre is generally called:",
      options: [
        "Jacket/coating",
        "Core",
        "Cladding index",
        "Lens"
      ],
      answer: "A",
      correct_option: "Jacket/coating",
      difficulty: "easy",
      global_id: 65,
      explanation: "The buffer coating and outer polymer jacket protect the fragile glass core/cladding against moisture and mechanical stress."
    },
    {
      id: 16,
      question: "In an optical fibre, light is guided mainly through the:",
      options: [
        "Core",
        "Jacket",
        "Air outside",
        "Connector pin"
      ],
      answer: "A",
      correct_option: "Core",
      difficulty: "easy",
      global_id: 66,
      explanation: "The high refractive index core traps and propagates the optical wave."
    },
    {
      id: 17,
      question: "Optical fibre communication offers:",
      options: [
        "High bandwidth",
        "Very low bandwidth only",
        "No data transmission",
        "Only audio transmission"
      ],
      answer: "A",
      correct_option: "High bandwidth",
      difficulty: "easy",
      global_id: 67,
      explanation: "Optical frequencies (~hundreds of Terahertz) support gigabits-to-terabits per second data transmission bandwidth."
    },
    {
      id: 18,
      question: "Optical fibres are immune to ordinary:",
      options: [
        "Electromagnetic interference",
        "Gravity",
        "Light",
        "All temperature effects"
      ],
      answer: "A",
      correct_option: "Electromagnetic interference",
      difficulty: "easy",
      global_id: 68,
      explanation: "Dielectric glass fibres do not conduct electrical current, making them completely immune to EMI and radio noise."
    },
    {
      id: 19,
      question: "A ray travelling exactly along the normal at a boundary has angle of incidence:",
      "options": [
        "0°",
        "45°",
        "90°",
        "180°"
      ],
      answer: "A",
      correct_option: "0°",
      difficulty: "easy",
      global_id: 69,
      explanation: "Angle of incidence is measured relative to the normal; normal incidence means θ = 0°."
    },
    {
      id: 20,
      question: "The unit commonly used for refractive index is:",
      "options": [
        "No unit",
        "Metre",
        "Newton",
        "Watt"
      ],
      answer: "A",
      correct_option: "No unit",
      difficulty: "easy",
      global_id: 70,
      explanation: "Refractive index n = c/v is a dimensionless ratio of two velocities."
    },
    {
      id: 21,
      question: "Snell's law relates:",
      "options": [
        "Angles and refractive indices",
        "Mass and force",
        "Power and time",
        "Charge and current only"
      ],
      "answer": "A",
      correct_option: "Angles and refractive indices",
      difficulty: "medium",
      global_id: 71,
      explanation: "Snell's Law: n₁ sin(θ₁) = n₂ sin(θ₂)."
    },
    {
      id: 22,
      question: "For an optical fibre with core index n1 and cladding index n2, guidance requires:",
      "options": [
        "n1 > n2",
        "n1 < n2",
        "n1 = 0",
        "n2 = 0 always"
      ],
      answer: "A",
      correct_option: "n1 > n2",
      difficulty: "medium",
      global_id: 72,
      explanation: "Core must be optically denser than cladding to support TIR."
    },
    {
      id: 23,
      question: "Critical angle C at a core-cladding boundary satisfies:",
      "options": [
        "sin C = n2/n1",
        "sin C = n1/n2",
        "C = n1+n2",
        "C = n1n2"
      ],
      "answer": "A",
      "correct_option": "sin C = n2/n1",
      difficulty: "medium",
      global_id: 73,
      explanation: "Setting refracted angle θ₂ = 90° in Snell's law gives n₁ sin(C) = n₂ sin(90°) => sin(C) = n₂/n₁."
    },
    {
      id: 24,
      question: "For air outside a fibre, numerical aperture is commonly given by:",
      "options": [
        "NA = √(n1² − n2²)",
        "NA = n1+n2",
        "NA = n1/n2",
        "NA = n1n2"
      ],
      "answer": "A",
      "correct_option": "NA = √(n1² − n2²)",
      difficulty: "medium",
      global_id: 74,
      explanation: "NA = n₀ sin(θmax) = √(n₁² - n₂²) when launching from air (n₀ = 1.0)."
    },
    {
      id: 25,
      question: "Acceptance angle increases when NA:",
      "options": [
        "Increases",
        "Decreases",
        "Becomes zero",
        "Is unrelated"
      ],
      "answer": "A",
      "correct_option": "Increases",
      difficulty: "medium",
      global_id: 75,
      explanation: "θmax = arcsin(NA); higher NA directly widens the acceptance cone angle."
    },
    {
      id: 26,
      question: "If n1 = n2, the ideal numerical aperture is:",
      "options": [
        "Zero",
        "One",
        "n1+n2",
        "Infinite"
      ],
      "answer": "A",
      "correct_option": "Zero",
      difficulty: "medium",
      "global_id": 76,
      explanation: "NA = √(n₁² - n₂²) = √(n₁² - n₁²) = 0; no refractive index contrast means zero light-guiding capability."
    },
    {
      id: 27,
      question: "Why does cladding have a lower refractive index than the core?",
      "options": [
        "To enable total internal reflection at the interface",
        "To absorb all light",
        "To stop all transmission",
        "To generate photons"
      ],
      "answer": "A",
      "correct_option": "To enable total internal reflection at the interface",
      difficulty: "medium",
      "global_id": 77,
      explanation: "Without a lower-index cladding, light would refract and leak out into surroundings."
    },
    {
      id: 28,
      question: "Which fibre is generally preferred for very long-distance, high-bandwidth links?",
      "options": [
        "Single-mode fibre",
        "Multimode step-index only",
        "Metal wire",
        "Plastic tube"
      ],
      "answer": "A",
      "correct_option": "Single-mode fibre",
      difficulty: "medium",
      "global_id": 78,
      explanation: "Single-mode fibres provide extremely low attenuation and zero intermodal pulse dispersion over hundreds of kilometers."
    },
    {
      id: 29,
      question: "Step-index fibre means the refractive index of the core:",
      "options": [
        "Is approximately constant and changes abruptly at the cladding",
        "Changes smoothly throughout the core",
        "Is always zero",
        "Equals air everywhere"
      ],
      "answer": "A",
      "correct_option": "Is approximately constant and changes abruptly at the cladding",
      difficulty: "medium",
      "global_id": 79,
      explanation: "Step-index profile features uniform core index n₁ with a sharp step change to n₂ at the cladding boundary."
    },
    {
      id: 30,
      question: "In a graded-index multimode fibre, core refractive index:",
      "options": [
        "Gradually decreases away from the centre",
        "Is constant everywhere",
        "Is zero at the centre",
        "Changes only at the jacket"
      ],
      "answer": "A",
      "correct_option": "Gradually decreases away from the centre",
      difficulty: "medium",
      "global_id": 80,
      explanation: "Parabolic grading curves outer rays back towards the axis, equalizing travel times across modes."
    },
    {
      id: 31,
      question: "Modal dispersion is especially associated with:",
      "options": [
        "Multimode propagation",
        "Single-mode propagation only",
        "No optical propagation",
        "Electrical wires only"
      ],
      "answer": "A",
      "correct_option": "Multimode propagation",
      difficulty: "medium",
      "global_id": 81,
      explanation: "Different modes take paths of different geometric lengths, spreading the optical pulse."
    },
    {
      id: 32,
      question: "Attenuation in fibre refers to:",
      "options": [
        "Loss of optical power during propagation",
        "Increase in optical power",
        "Change in fibre mass",
        "Increase in wavelength only"
      ],
      "answer": "A",
      "correct_option": "Loss of optical power during propagation",
      difficulty: "medium",
      "global_id": 82,
      explanation: "Attenuation (measured in dB/km) is signal power decay as photons travel through the fibre."
    },
    {
      id: 33,
      question: "One important cause of attenuation is:",
      "options": [
        "Absorption and scattering",
        "Gravity",
        "Magnetism only",
        "Sound"
      ],
      "answer": "A",
      "correct_option": "Absorption and scattering",
      difficulty: "medium",
      "global_id": 83,
      explanation: "Rayleigh scattering (from density fluctuations) and material absorption are primary intrinsic losses."
    },
    {
      id: 34,
      question: "A connector in an optical system is used mainly to:",
      "options": [
        "Couple light between fibre/device interfaces",
        "Increase gravity",
        "Generate electricity",
        "Change glass into metal"
      ],
      "answer": "A",
      "correct_option": "Couple light between fibre/device interfaces",
      difficulty: "medium",
      "global_id": 84,
      explanation: "Optical connectors provide low-loss, repeatable optical alignment between fibres and transmitter/receiver ports."
    },
    {
      id: 35,
      question: "If the refractive index of the core increases while cladding index stays fixed, NA generally:",
      "options": [
        "Increases",
        "Decreases to zero",
        "Stays exactly zero",
        "Becomes negative"
      ],
      "answer": "A",
      "correct_option": "Increases",
      difficulty: "medium",
      "global_id": 85,
      explanation: "NA = √(n₁² - n₂²); increasing n₁ increases the radical value, raising NA."
    },
    {
      id: 36,
      question: "For TIR, the refracted ray at the boundary:",
      "options": [
        "Does not enter the second medium as a propagating ray",
        "Has maximum intensity outside",
        "Always travels backward through air",
        "Becomes a sound wave"
      ],
      "answer": "A",
      "correct_option": "Does not enter the second medium as a propagating ray",
      difficulty: "medium",
      "global_id": 86,
      explanation: "No propagating wave carries energy into the rarer medium (only a non-propagating evanescent field exists)."
    },
    {
      id: 37,
      question: "The acceptance cone represents:",
      "options": [
        "The range of input directions accepted by the fibre",
        "The fibre's temperature range",
        "The output power only",
        "The cable diameter only"
      ],
      "answer": "A",
      "correct_option": "The range of input directions accepted by the fibre",
      difficulty: "medium",
      "global_id": 87,
      explanation: "It is the 3D cone formed by rotating the maximum acceptance angle θmax about the core axis."
    },
    {
      id: 38,
      question: "Why is optical fibre useful in medical endoscopy?",
      "options": [
        "It can transmit light/images through a flexible path",
        "It produces X-rays",
        "It measures mass directly",
        "It blocks all visible light"
      ],
      "answer": "A",
      "correct_option": "It can transmit light/images through a flexible path",
      difficulty: "medium",
      "global_id": 88,
      explanation: "Coherent fibre bundles allow illumination and visual inspection inside internal organs non-invasively."
    },
    {
      id: 39,
      question: "Compared with copper communication cables, fibre generally has:",
      "options": [
        "Lower transmission loss over suitable long links and higher bandwidth",
        "Much lower bandwidth",
        "Higher electromagnetic interference",
        "No communication capability"
      ],
      "answer": "A",
      "correct_option": "Lower transmission loss over suitable long links and higher bandwidth",
      difficulty: "medium",
      "global_id": 89,
      explanation: "Optical attenuation (~0.2 dB/km at 1550 nm) is orders of magnitude lower than electrical cable attenuation."
    },
    {
      id: 40,
      question: "A fibre's V-number (normalized frequency) depends on:",
      "options": [
        "Core/cladding indices, core radius and wavelength",
        "Mass only",
        "Cable colour only",
        "Room pressure only"
      ],
      "answer": "A",
      "correct_option": "Core/cladding indices, core radius and wavelength",
      difficulty: "medium",
      "global_id": 90,
      explanation: "V = (2π a / λ) √(n₁² - n₂²) = (2π a / λ) NA."
    },
    {
      id: 41,
      question: "If n1 = 1.50 and n2 = 1.48, the NA in air is approximately:",
      "options": [
        "0.244",
        "0.020",
        "1.49",
        "2.98"
      ],
      "answer": "A",
      "correct_option": "0.244",
      difficulty: "hard",
      "global_id": 91,
      explanation: "NA = √(1.50² - 1.48²) = √(2.25 - 2.1904) = √0.0596 ≈ 0.2441."
    },
    {
      id: 42,
      question: "For n1 = 1.5 and n2 = 1.0, the critical angle is approximately:",
      "options": [
        "41.8°",
        "30°",
        "60°",
        "90°"
      ],
      "answer": "A",
      "correct_option": "41.8°",
      difficulty: "hard",
      "global_id": 92,
      explanation: "sin(θc) = 1.0 / 1.5 = 0.6667 => θc = arcsin(0.6667) ≈ 41.81°."
    },
    {
      id: 43,
      question: "If NA = 0.5 in air, the acceptance half-angle is approximately:",
      "options": [
        "30°",
        "15°",
        "45°",
        "60°"
      ],
      "answer": "A",
      "correct_option": "30°",
      difficulty: "hard",
      "global_id": 93,
      explanation: "sin(θmax) = NA = 0.5 => θmax = arcsin(0.5) = 30°."
    },
    {
      id: 44,
      question: "If the fibre core radius is increased while other parameters remain fixed, the normalized frequency V:",
      "options": [
        "Increases",
        "Decreases",
        "Becomes zero",
        "Does not depend on radius"
      ],
      "answer": "A",
      "correct_option": "Increases",
      difficulty: "hard",
      "global_id": 94,
      explanation: "V = (2π a / λ) NA is directly proportional to core radius a."
    },
    {
      id: 45,
      question: "A fibre has n1 = 1.50 and n2 = 1.47. Its NA is closest to:",
      "options": [
        "0.30",
        "0.03",
        "1.485",
        "2.97"
      ],
      "answer": "A",
      "correct_option": "0.30",
      difficulty: "hard",
      "global_id": 95,
      explanation: "NA = √(1.50² - 1.47²) = √(2.25 - 2.1609) = √0.0891 ≈ 0.2985 ≈ 0.30."
    },
    {
      id: 46,
      question: "Why does single-mode fibre reduce modal dispersion?",
      "options": [
        "Only one mode is primarily guided",
        "It has no cladding",
        "It uses electrical current",
        "It has no refractive index difference"
      ],
      "answer": "A",
      "correct_option": "Only one mode is primarily guided",
      difficulty: "hard",
      "global_id": 96,
      explanation: "With only one spatial mode allowed (V < 2.405), there are no multiple ray paths to delay one another."
    },
    {
      id: 47,
      question: "If the wavelength increases while fibre radius and indices remain fixed, normalized frequency V:",
      "options": [
        "Decreases",
        "Increases",
        "Stays exactly same",
        "Becomes infinite"
      ],
      "answer": "A",
      "correct_option": "Decreases",
      difficulty: "hard",
      "global_id": 97,
      explanation: "V ∝ 1/λ; longer wavelengths produce lower V numbers."
    },
    {
      id: 48,
      question: "For a fibre with greater NA, the acceptance cone is generally:",
      "options": [
        "Wider",
        "Narrower",
        "Absent",
        "Always 0°"
      ],
      "answer": "A",
      "correct_option": "Wider",
      difficulty: "hard",
      "global_id": 98,
      explanation: "Higher NA means larger sin(θmax), opening a broader angular cone of accepted light."
    },
    {
      id: 49,
      question: "If core-cladding index difference is reduced significantly, TIR guidance generally becomes:",
      "options": [
        "Less strongly confined and NA decreases",
        "Stronger with larger NA",
        "Independent of indices",
        "Impossible only because wavelength changes"
      ],
      "answer": "A",
      "correct_option": "Less strongly confined and NA decreases",
      difficulty: "hard",
      "global_id": 99,
      explanation: "Lower index contrast Δ = (n₁ - n₂)/n₁ reduces the numerical aperture and makes the mode field more prone to bending loss."
    },
    {
      id: 50,
      question: "Which change most directly reduces coupling errors at a fibre input?",
      "options": [
        "Accurate alignment of the source with the acceptance cone",
        "Increasing cable weight",
        "Changing the jacket colour",
        "Heating the connector"
      ],
      "answer": "A",
      "correct_option": "Accurate alignment of the source with the acceptance cone",
      difficulty: "hard",
      "global_id": 100,
      explanation: "Matching the source emission angle to the fibre's acceptance angle minimizes geometric insertion loss."
    }
  ]
};

export const COLOUR_SENSOR_QUESTION_BANK = {
  title: "Study of Colour Sensor - Question Bank",
  experimentId: "colour-sensor",
  quizId: "colour-sensor-mastery-quiz",
  experimentName: "Study of Colour Sensor (TCS3200)",
  total_questions: 50,
  questions: [
    {
      id: 1,
      question: "What is the main purpose of a colour sensor?",
      options: [
        "Detect colours/light characteristics",
        "Measure temperature",
        "Measure pressure",
        "Measure mass"
      ],
      answer: "A",
      correct_option: "Detect colours/light characteristics",
      difficulty: "easy",
      global_id: 101,
      explanation: "Colour sensors quantify spectral reflectance/emission across RGB wavelengths to classify target chromaticity."
    },
    {
      id: 2,
      question: "RGB stands for:",
      options: [
        "Red, Green, Blue",
        "Red, Grey, Black",
        "Radiation, Green, Brightness",
        "Range, Gain, Band"
      ],
      answer: "A",
      correct_option: "Red, Green, Blue",
      difficulty: "easy",
      global_id: 102,
      explanation: "RGB represents the additive primary color channels in optoelectronics and trichromatic vision."
    },
    {
      id: 3,
      question: "Which component is commonly used to detect light?",
      options: [
        "Photodiode",
        "Fuse",
        "Switch",
        "Transformer"
      ],
      answer: "A",
      correct_option: "Photodiode",
      difficulty: "easy",
      global_id: 103,
      explanation: "Photodiodes generate current proportional to the flux of incident photons on their p-n junction."
    },
    {
      id: 4,
      question: "Which RGB colour has the longest wavelength?",
      options: [
        "Red",
        "Green",
        "Blue",
        "All are equal"
      ],
      answer: "A",
      correct_option: "Red",
      difficulty: "easy",
      global_id: 104,
      explanation: "Red light occupies the long-wavelength end of the visible spectrum (~620–750 nm)."
    },
    {
      id: 5,
      question: "Which RGB colour has the shortest wavelength?",
      options: [
        "Blue",
        "Red",
        "Green",
        "All are equal"
      ],
      answer: "A",
      correct_option: "Blue",
      difficulty: "easy",
      global_id: 105,
      explanation: "Blue/violet light has the shortest wavelength in visible spectrum (~400–495 nm)."
    },
    {
      id: 6,
      question: "If a surface reflects mostly red light, it generally appears:",
      options: [
        "Red",
        "Blue",
        "Green",
        "Black"
      ],
      answer: "A",
      correct_option: "Red",
      difficulty: "easy",
      global_id: 106,
      explanation: "An object's apparent color is determined by the spectral bands it reflects into the detector."
    },
    {
      id: 7,
      question: "Visible light is a part of:",
      options: [
        "Electromagnetic radiation",
        "Sound radiation",
        "Mechanical radiation",
        "Nuclear radiation only"
      ],
      answer: "A",
      correct_option: "Electromagnetic radiation",
      difficulty: "easy",
      global_id: 107,
      explanation: "Visible light consists of electromagnetic waves in the frequency range ~430–750 THz."
    },
    {
      id: 8,
      question: "The approximate visible-light wavelength range is:",
      options: [
        "400–700 nm",
        "1–10 nm",
        "10–100 m",
        "1–10 km"
      ],
      answer: "A",
      correct_option: "400–700 nm",
      difficulty: "easy",
      global_id: 108,
      explanation: "Human and sensor visible spectral sensitivity spans roughly 380/400 nm (violet) to 700/750 nm (deep red)."
    },
    {
      id: 9,
      question: "A photodiode converts incident light into an:",
      options: [
        "Electrical signal",
        "Sound wave",
        "Mechanical force",
        "Chemical fuel"
      ],
      answer: "A",
      correct_option: "Electrical signal",
      difficulty: "easy",
      global_id: 109,
      explanation: "The photoelectric effect creates electron-hole pairs, producing a measurable photocurrent or voltage."
    },
    {
      id: 10,
      question: "Equal high RGB intensities ideally produce:",
      options: [
        "White",
        "Black",
        "Red",
        "Magenta"
      ],
      answer: "A",
      correct_option: "White",
      difficulty: "easy",
      global_id: 110,
      explanation: "Additive mixing of full-intensity Red, Green, and Blue produces White light."
    },
    {
      id: 11,
      question: "Very low RGB intensities correspond approximately to:",
      options: [
        "Black",
        "White",
        "Yellow",
        "Cyan"
      ],
      answer: "A",
      correct_option: "Black",
      difficulty: "easy",
      global_id: 111,
      explanation: "The absence of reflected or emitted light (R=G=B≈0) corresponds to Black."
    },
    {
      id: 12,
      question: "Red plus green light produces:",
      options: [
        "Yellow",
        "Cyan",
        "Magenta",
        "Blue"
      ],
      answer: "A",
      correct_option: "Yellow",
      difficulty: "easy",
      global_id: 112,
      explanation: "In additive color synthesis, Red + Green = Yellow."
    },
    {
      id: 13,
      question: "Green plus blue light produces:",
      options: [
        "Cyan",
        "Yellow",
        "Red",
        "Orange"
      ],
      answer: "A",
      correct_option: "Cyan",
      difficulty: "easy",
      global_id: 113,
      explanation: "In additive color synthesis, Green + Blue = Cyan."
    },
    {
      id: 14,
      question: "Red plus blue light produces:",
      options: [
        "Magenta",
        "Green",
        "Cyan",
        "Yellow"
      ],
      answer: "A",
      correct_option: "Magenta",
      difficulty: "easy",
      global_id: 114,
      explanation: "In additive color synthesis, Red + Blue = Magenta."
    },
    {
      id: 15,
      question: "The unit nm commonly represents:",
      options: [
        "Wavelength",
        "Mass",
        "Pressure",
        "Current"
      ],
      answer: "A",
      correct_option: "Wavelength",
      difficulty: "easy",
      global_id: 115,
      explanation: "1 nanometer (nm) = 10⁻⁹ meters, standard for optical wavelengths."
    },
    {
      id: 16,
      question: "A sensor is a device that:",
      options: [
        "Detects a physical quantity and produces a usable signal",
        "Stores energy only",
        "Displays images only",
        "Acts only as a battery"
      ],
      answer: "A",
      correct_option: "Detects a physical quantity and produces a usable signal",
      difficulty: "easy",
      global_id: 116,
      explanation: "Transducers/sensors convert physical stimuli into readable electrical responses."
    },
    {
      id: 17,
      question: "A colour sensor mainly detects:",
      options: [
        "Light",
        "Sound",
        "Pressure",
        "Mass"
      ],
      answer: "A",
      correct_option: "Light",
      difficulty: "easy",
      global_id: 117,
      explanation: "Colour sensors measure electromagnetic radiation in the visible band."
    },
    {
      id: 18,
      question: "If a surface absorbs most visible light, it appears:",
      options: [
        "Dark",
        "White",
        "Transparent",
        "Bright yellow always"
      ],
      answer: "A",
      correct_option: "Dark",
      difficulty: "easy",
      global_id: 118,
      explanation: "High absorption with minimal reflection reflects almost no photons back to the sensor."
    },
    {
      id: 19,
      question: "Which region is normally detected by a visible colour sensor?",
      options: [
        "Visible spectrum",
        "X-ray",
        "Gamma-ray",
        "Radio"
      ],
      answer: "A",
      correct_option: "Visible spectrum",
      difficulty: "easy",
      global_id: 119,
      explanation: "Visible sensors have optical filters calibrated for human visual bandwidths (400–700 nm)."
    },
    {
      id: 20,
      question: "The three common colour channels in an RGB sensor are:",
      options: [
        "R, G and B",
        "X, Y and Z only",
        "A, B and C only",
        "P, Q and R only"
      ],
      answer: "A",
      correct_option: "R, G and B",
      difficulty: "easy",
      global_id: 120,
      explanation: "TCS3200 uses an 8x8 array of photodiodes partitioned with Red, Green, Blue, and Clear filters."
    },
    {
      id: 21,
      question: "Why are multiple RGB channels useful?",
      options: [
        "They allow different spectral components to be compared",
        "They measure pressure",
        "They remove all light",
        "They increase object mass"
      ],
      answer: "A",
      correct_option: "They allow different spectral components to be compared",
      difficulty: "medium",
      "global_id": 121,
      explanation: "Comparing relative filter responses lets the system differentiate hue and saturation independently of light intensity."
    },
    {
      id: 22,
      question: "If the red-channel reading is much higher than green and blue, the target has a strong:",
      "options": [
        "Red component",
        "Green component",
        "Blue component",
        "Cyan component"
      ],
      "answer": "A",
      "correct_option": "Red component",
      difficulty: "medium",
      global_id: 122,
      explanation: "High red filter transmittance indicates abundant photons in the ~650 nm wavelength region."
    },
    {
      id: 23,
      question: "What is the role of an ADC?",
      "options": [
        "Convert an analog signal into digital values",
        "Produce visible light",
        "Measure mass",
        "Store mechanical energy"
      ],
      "answer": "A",
      "correct_option": "Convert an analog signal into digital values",
      difficulty: "medium",
      global_id: 123,
      explanation: "Analog-to-Digital Converters (ADCs) quantize continuous photocurrent voltages into discrete digital numbers."
    },
    {
      id: 24,
      question: "Why is calibration important for a colour sensor?",
      "options": [
        "It improves accuracy and accounts for system variations",
        "It changes the object's mass",
        "It removes all light",
        "It makes wavelength constant"
      ],
      "answer": "A",
      "correct_option": "It improves accuracy and accounts for system variations",
      difficulty: "medium",
      global_id: 124,
      explanation: "Calibration normalizes for ambient lighting, LED color temperature, detector responsivity offsets, and distance."
    },
    {
      id: 25,
      question: "Why can the same object give different readings under different light sources?",
      "options": [
        "Illumination spectrum and intensity can change",
        "Its mass changes automatically",
        "Gravity changes its colour",
        "The sensor becomes a thermometer"
      ],
      "answer": "A",
      "correct_option": "Illumination spectrum and intensity can change",
      difficulty: "medium",
      global_id: 125,
      explanation: "Reflected spectrum = Incident spectrum × Reflectance curve. If the source spectrum changes (e.g. tungsten vs sunlight), reflected light changes."
    },
    {
      id: 26,
      question: "Why should sensor-to-target distance often be kept constant?",
      "options": [
        "To keep measurement conditions consistent",
        "To increase wavelength",
        "To change the target colour",
        "To increase gravity"
      ],
      "answer": "A",
      "correct_option": "To keep measurement conditions consistent",
      difficulty: "medium",
      global_id: 126,
      explanation: "Light intensity obeys the inverse-square law; varying distance shifts signal amplitudes."
    },
    {
      id: 27,
      question: "What is spectral response?",
      "options": [
        "Variation of sensor output with wavelength",
        "Variation of mass with time",
        "Variation of pressure with height",
        "Variation of resistance with length only"
      ],
      "answer": "A",
      "correct_option": "Variation of sensor output with wavelength",
      difficulty: "medium",
      global_id: 127,
      explanation: "Spectral responsivity R(λ) defines the output current per watt of incident optical power as a function of wavelength."
    },
    {
      id: 28,
      question: "Which is most directly related to colour rather than just brightness?",
      "options": [
        "Relative RGB values",
        "Battery weight",
        "Screw size",
        "Room temperature alone"
      ],
      "answer": "A",
      "correct_option": "Relative RGB values",
      difficulty: "medium",
      global_id: 128,
      explanation: "Ratios r = R/(R+G+B) isolate chromaticity (hue/saturation) from luminance."
    },
    {
      id: 29,
      question: "If all RGB readings rise by roughly the same proportion, what likely changed?",
      "options": [
        "Overall illumination intensity",
        "Hue only",
        "Object mass",
        "Wavelength of every photon necessarily"
      ],
      "answer": "A",
      "correct_option": "Overall illumination intensity",
      difficulty: "medium",
      global_id: 129,
      explanation: "Scaling all color channels uniformly indicates a change in light source brightness or distance, not color."
    },
    {
      id: 30,
      question: "What is the purpose of a white reference surface?",
      "options": [
        "Provide a known response for comparison/calibration",
        "Block all light",
        "Generate a laser",
        "Absorb all wavelengths"
      ],
      "answer": "A",
      "correct_option": "Provide a known response for comparison/calibration",
      difficulty: "medium",
      global_id: 130,
      explanation: "A high-reflectance white standard (like barium sulfate or PTFE) provides full-spectrum reference calibration."
    },
    {
      id: 31,
      question: "Why can ambient light affect a colour sensor?",
      "options": [
        "It adds unwanted light to the measured signal",
        "It changes gravity",
        "It changes object mass",
        "It stops the sensor from detecting red"
      ],
      "answer": "A",
      "correct_option": "It adds unwanted light to the measured signal",
      difficulty: "medium",
      global_id: 131,
      explanation: "Stray background photons combine with the target reflection, skewing RGB proportions."
    },
    {
      id: 32,
      question: "What does wavelength describe?",
      "options": [
        "Distance between corresponding points of a wave",
        "Photon mass",
        "Brightness only",
        "Electrical resistance"
      ],
      "answer": "A",
      "correct_option": "Distance between corresponding points of a wave",
      difficulty: "medium",
      global_id: 132,
      explanation: "Wavelength λ is the spatial period of the optical wave crest-to-crest."
    },
    {
      id: 33,
      question: "Photon energy is related to frequency by:",
      "options": [
        "E = hf",
        "E = h/f",
        "E = f/h",
        "E = h+f"
      ],
      "answer": "A",
      "correct_option": "E = hf",
      difficulty: "medium",
      global_id: 133,
      explanation: "Planck-Einstein relation: E = hf = hc/λ, where h is Planck's constant."
    },
    {
      id: 34,
      question: "For electromagnetic radiation in vacuum:",
      "options": [
        "c = fλ",
        "c = f/λ",
        "c = λ/f",
        "c = f+λ"
      ],
      "answer": "A",
      "correct_option": "c = fλ",
      difficulty: "medium",
      global_id: 134,
      explanation: "The wave speed equals frequency times wavelength: c = fλ ≈ 3 × 10⁸ m/s."
    },
    {
      id: 35,
      question: "If wavelength increases in vacuum, frequency:",
      "options": [
        "Decreases",
        "Increases",
        "Becomes zero",
        "Always stays the same"
      ],
      "answer": "A",
      "correct_option": "Decreases",
      difficulty: "medium",
      global_id: 135,
      explanation: "Because c = fλ is constant, frequency is inversely proportional to wavelength (f = c/λ)."
    },
    {
      id: 36,
      question: "Which condition improves repeatability of colour measurements?",
      "options": [
        "Controlled illumination",
        "Changing sensor distance each time",
        "Changing the target angle randomly",
        "Ignoring calibration"
      ],
      "answer": "A",
      "correct_option": "Controlled illumination",
      difficulty: "medium",
      global_id: 136,
      explanation: "Consistent lighting and fixed sensor geometry guarantee reproducible spectral measurements."
    },
    {
      id: 37,
      question: "RGB values can be normalized mainly to reduce the effect of:",
      "options": [
        "Overall brightness variation",
        "Object mass",
        "Gravity",
        "Room size"
      ],
      "answer": "A",
      "correct_option": "Overall brightness variation",
      difficulty: "medium",
      global_id: 137,
      explanation: "Normalization converts raw values into chromaticity coordinates r, g, b where r + g + b = 1."
    },
    {
      id: 38,
      question: "A matte surface is often easier to measure consistently because it:",
      "options": [
        "Reduces strong specular reflections",
        "Emits its own light",
        "Absorbs all colours",
        "Has infinite reflectivity"
      ],
      "answer": "A",
      "correct_option": "Reduces strong specular reflections",
      difficulty: "medium",
      global_id: 138,
      explanation: "Lambertian (matte) diffusion scatters light uniformly in all directions, avoiding specular glare spikes."
    },
    {
      id: 39,
      question: "A colour sensor's output is most directly related to:",
      "options": [
        "Light reaching its photodetectors",
        "Object weight",
        "Sound reaching the sensor",
        "Air pressure only"
      ],
      "answer": "A",
      "correct_option": "Light reaching its photodetectors",
      difficulty: "medium",
      global_id: 139,
      explanation: "The electrical output directly corresponds to the radiant flux captured by the filtered photodiode array."
    },
    {
      id: 40,
      question: "Under additive colour mixing, equal red and green with little blue appears approximately:",
      "options": [
        "Yellow",
        "Cyan",
        "Magenta",
        "Blue"
      ],
      "answer": "A",
      "correct_option": "Yellow",
      difficulty: "medium",
      global_id: 140,
      explanation: "Combining Red and Green spectral emissions stimulates red and green cone photoreceptors, perceived as Yellow."
    },
    {
      id: 41,
      question: "A sensor gives R=200,G=50,B=40 and another gives R=100,G=25,B=20 under identical conditions. Best conclusion:",
      "options": [
        "Their relative colour composition is similar but the second signal is weaker",
        "The second must be blue",
        "The first must be white",
        "They necessarily have different hues"
      ],
      "answer": "A",
      "correct_option": "Their relative colour composition is similar but the second signal is weaker",
      difficulty: "hard",
      "global_id": 141,
      explanation: "Both maintain a 4:1:0.8 channel ratio, meaning the hue is identical while luminance differs."
    },
    {
      id: 42,
      question: "Why are RGB values not exact wavelength measurements?",
      "options": [
        "Each channel usually responds over a range of wavelengths",
        "Each channel detects one exact wavelength",
        "RGB sensors detect mass",
        "Wavelength is unrelated to light"
      ],
      "answer": "A",
      "correct_option": "Each channel usually responds over a range of wavelengths",
      difficulty: "hard",
      "global_id": 142,
      explanation: "Broadband optical filters integrate photon flux over wide transmission passbands (~50–100 nm FWHM)."
    },
    {
      id: 43,
      question: "If the same spectrum is made twice as bright, what should ideally remain similar for colour estimation?",
      "options": [
        "Normalized RGB ratios",
        "Raw RGB values",
        "Sensor distance automatically",
        "Object mass"
      ],
      "answer": "A",
      "correct_option": "Normalized RGB ratios",
      difficulty: "hard",
      "global_id": 143,
      explanation: "Scaling intensity doubles numerator and denominator, leaving ratios R/(R+G+B) invariant."
    },
    {
      id: 44,
      question: "Why is ambient-light shielding useful?",
      "options": [
        "It reduces unwanted light added to the measured signal",
        "It changes red into blue",
        "It increases object reflectivity",
        "It removes the need for calibration in every system"
      ],
      "answer": "A",
      "correct_option": "It reduces unwanted light added to the measured signal",
      difficulty: "hard",
      "global_id": 144,
      explanation: "Optical hoods prevent room fluorescent/daylight flicker from contaminating the reflected LED signal."
    },
    {
      id: 45,
      question: "If RGB spectral responses overlap, then:",
      "options": [
        "One wavelength range can contribute to multiple channels",
        "Each channel detects exactly one wavelength",
        "No colour can be detected",
        "Only brightness can be measured"
      ],
      "answer": "A",
      "correct_option": "One wavelength range can contribute to multiple channels",
      difficulty: "hard",
      "global_id": 145,
      explanation: "Intermediate wavelengths (e.g. 580 nm yellow) pass partially through both Red and Green filter curves."
    },
    {
      id: 46,
      question: "Why is a white reference useful before measuring unknown colours?",
      "options": [
        "It provides a baseline for channel responses under the current illumination",
        "It blocks all visible light",
        "It generates photons",
        "It makes all objects white"
      ],
      "answer": "A",
      "correct_option": "It provides a baseline for channel responses under the current illumination",
      difficulty: "hard",
      "global_id": 146,
      explanation: "White balance calibration normalizes channel gains against the true spectral power distribution of the illuminant."
    },
    {
      id: 47,
      question: "If room lighting changes and readings become unstable, the most likely issue is:",
      "options": [
        "Uncontrolled illumination",
        "Incorrect object mass",
        "Wrong gravity",
        "Excessive cable length"
      ],
      "answer": "A",
      "correct_option": "Uncontrolled illumination",
      difficulty: "hard",
      "global_id": 147,
      explanation: "Unshielded fluctuations in ambient room lights contaminate photodiode integration."
    },
    {
      id: 48,
      question: "A dominant red-channel response primarily means:",
      "options": [
        "More red-region light is reaching the sensor relative to other channel responses",
        "The surface emits only red photons",
        "The surface absorbs no light",
        "The sensor has no green/blue sensitivity"
      ],
      "answer": "A",
      "correct_option": "More red-region light is reaching the sensor relative to other channel responses",
      difficulty: "hard",
      "global_id": 148,
      explanation: "Photocurrent from the red-filtered photodiodes exceeds that from green/blue filters."
    },
    {
      id: 49,
      question: "Best way to compare colours when overall brightness varies:",
      "options": [
        "Use calibrated or normalized channel values",
        "Compare only raw red values",
        "Ignore calibration",
        "Use object weight"
      ],
      "answer": "A",
      "correct_option": "Use calibrated or normalized channel values",
      difficulty: "hard",
      "global_id": 149,
      explanation: "Chromaticity normalization removes the scalar dependence on lux/illumination level."
    },
    {
      id: 50,
      question: "Which statement best summarizes a colour-sensor experiment?",
      "options": [
        "Relating optical response to different colours/light conditions and electrical output",
        "Measuring mass of coloured objects",
        "Studying sound reflection",
        "Measuring room temperature only"
      ],
      "answer": "A",
      "correct_option": "Relating optical response to different colours/light conditions and electrical output",
      difficulty: "hard",
      "global_id": 150,
      explanation: "The experiment studies the optoelectronic transduction of spectral reflectance into calibrated RGB frequency/voltage signals."
    }
  ]
};

export const HALL_EFFECT_QUESTION_BANK = {
  title: "Hall Effect Experiment - Question Bank",
  experimentId: "hall-effect",
  quizId: "hall-effect-mastery-quiz",
  experimentName: "Hall Effect in Semiconductor & Metal Probes",
  total_questions: 50,
  questions: [
    {
      id: 1,
      question: "Who discovered the Hall Effect and in which year?",
      options: [
        "Edwin Herbert Hall in 1879",
        "Heinrich Hertz in 1888",
        "Michael Faraday in 1831",
        "James Clerk Maxwell in 1865"
      ],
      answer: "A",
      correct_option: "Edwin Herbert Hall in 1879",
      difficulty: "easy",
      global_id: 151,
      explanation: "Edwin Herbert Hall discovered the Hall effect in 1879 while working on his doctoral thesis under Henry Rowland at Johns Hopkins University."
    },
    {
      id: 2,
      question: "What is the primary phenomenon observed in the Hall Effect?",
      options: [
        "Development of a transverse voltage across a current-carrying conductor in a perpendicular magnetic field",
        "Emission of electrons when light illuminates a metallic surface",
        "Change in electrical resistance when exposed to temperature changes",
        "Generation of electromotive force by mechanical pressure on a crystal"
      ],
      answer: "A",
      correct_option: "Development of a transverse voltage across a current-carrying conductor in a perpendicular magnetic field",
      difficulty: "easy",
      global_id: 152,
      explanation: "The Hall Effect is the creation of a transverse potential difference across an electrical conductor or semiconductor when placed in a magnetic field perpendicular to the current."
    },
    {
      id: 3,
      question: "Which force is primarily responsible for deflecting charge carriers in the Hall Effect?",
      options: [
        "Magnetic Lorentz force F = q(v × B)",
        "Gravitational force F = mg",
        "Nuclear strong force",
        "Coulomb electrostatic force only"
      ],
      answer: "A",
      correct_option: "Magnetic Lorentz force F = q(v × B)",
      difficulty: "easy",
      global_id: 153,
      explanation: "Moving mobile charge carriers with drift velocity v experience a magnetic Lorentz force F = q(v × B) that deflects them laterally."
    },
    {
      id: 4,
      question: "What is the mathematical expression for the Hall Voltage V_H?",
      options: [
        "V_H = (R_H · I · B) / t",
        "V_H = (R_H · I · t) / B",
        "V_H = (R_H · B · t) / I",
        "V_H = (I · B · t) / R_H"
      ],
      answer: "A",
      correct_option: "V_H = (R_H · I · B) / t",
      difficulty: "easy",
      global_id: 154,
      explanation: "The transverse Hall voltage V_H is directly proportional to Hall coefficient R_H, current I, and magnetic field B, and inversely proportional to specimen thickness t."
    },
    {
      id: 5,
      question: "How is the Hall Coefficient R_H defined in terms of charge carrier density n?",
      options: [
        "R_H = 1 / (n · q)",
        "R_H = n · q",
        "R_H = n / q",
        "R_H = q / n"
      ],
      answer: "A",
      correct_option: "R_H = 1 / (n · q)",
      difficulty: "easy",
      global_id: 155,
      explanation: "For a single dominant carrier type, the Hall coefficient is R_H = 1 / (n · q), where q is carrier charge (-e for electrons, +e for holes)."
    },
    {
      id: 6,
      question: "What is the sign of the Hall Coefficient in an n-type semiconductor?",
      options: [
        "Negative (R_H < 0)",
        "Positive (R_H > 0)",
        "Always exactly zero",
        "Fluctuates unpredictably"
      ],
      answer: "A",
      correct_option: "Negative (R_H < 0)",
      difficulty: "easy",
      global_id: 156,
      explanation: "In n-type semiconductors, majority carriers are electrons (q = -e), resulting in a negative Hall coefficient R_H = -1 / (n · e) < 0."
    },
    {
      id: 7,
      question: "What is the sign of the Hall Coefficient in a p-type semiconductor?",
      options: [
        "Positive (R_H > 0)",
        "Negative (R_H < 0)",
        "Zero",
        "Imaginary"
      ],
      answer: "A",
      correct_option: "Positive (R_H > 0)",
      difficulty: "easy",
      global_id: 157,
      explanation: "In p-type semiconductors, majority carriers are holes (q = +e), yielding a positive Hall coefficient R_H = +1 / (p · e) > 0."
    },
    {
      id: 8,
      question: "Why do semiconductors produce significantly larger Hall voltages than metals under identical conditions?",
      options: [
        "Semiconductors have a vastly smaller carrier concentration n, making R_H much larger",
        "Metals completely block external magnetic fields",
        "Semiconductors have infinite electrical resistance",
        "Electrons in metals cannot experience Lorentz force"
      ],
      answer: "A",
      correct_option: "Semiconductors have a vastly smaller carrier concentration n, making R_H much larger",
      difficulty: "medium",
      global_id: 158,
      explanation: "Since R_H = 1 / (n · q), and metals possess huge carrier concentrations (~10^28 m^-3) compared to semiconductors (~10^20 m^-3), the Hall coefficient is thousands of times higher in semiconductors."
    },
    {
      id: 9,
      question: "What is the SI unit of the Hall Coefficient R_H?",
      options: [
        "m³ / C (cubic meters per coulomb)",
        "V / m (volts per meter)",
        "Tesla (T)",
        "Ohm-meter (Ω·m)"
      ],
      answer: "A",
      correct_option: "m³ / C (cubic meters per coulomb)",
      difficulty: "medium",
      global_id: 159,
      explanation: "R_H = V_H · t / (I · B) has units of (V · m) / (A · T) = m³ / C."
    },
    {
      id: 10,
      question: "How does the Hall Voltage V_H vary with the thickness t of the specimen?",
      options: [
        "Inversely proportional (V_H ∝ 1/t)",
        "Directly proportional (V_H ∝ t)",
        "Proportional to t²",
        "Independent of thickness"
      ],
      answer: "A",
      correct_option: "Inversely proportional (V_H ∝ 1/t)",
      difficulty: "easy",
      global_id: 160,
      explanation: "Because drift velocity is inversely related to cross-sectional area (A = w · t), thinner specimens produce greater Hall potentials."
    },
    {
      id: 11,
      question: "Under dynamic equilibrium in the Hall Effect, which two forces balance each other?",
      options: [
        "Transverse electrostatic force (q · E_H) and magnetic Lorentz force (q · v_d · B)",
        "Gravitational force and buoyant force",
        "Frictional force and normal reaction force",
        "Centripetal force and centrifugal force"
      ],
      answer: "A",
      correct_option: "Transverse electrostatic force (q · E_H) and magnetic Lorentz force (q · v_d · B)",
      difficulty: "medium",
      global_id: 161,
      explanation: "At steady state, the accumulation of lateral charge creates a transverse Hall electric field E_H that exactly cancels the magnetic Lorentz deflection."
    },
    {
      id: 12,
      question: "How can the majority carrier density n be computed from experimental Hall measurements?",
      options: [
        "n = 1 / (|R_H| · e)",
        "n = |R_H| · e",
        "n = |R_H| / e",
        "n = e² / |R_H|"
      ],
      answer: "A",
      correct_option: "n = 1 / (|R_H| · e)",
      difficulty: "easy",
      global_id: 162,
      explanation: "Carrier concentration is calculated as n = 1 / (|R_H| · e), where e = 1.602 × 10^-19 C."
    },
    {
      id: 13,
      question: "What is the relationship between carrier mobility μ_H, Hall coefficient R_H, and electrical conductivity σ?",
      options: [
        "μ_H = |R_H| · σ",
        "μ_H = |R_H| / σ",
        "μ_H = σ / |R_H|",
        "μ_H = |R_H| · σ²"
      ],
      answer: "A",
      correct_option: "μ_H = |R_H| · σ",
      difficulty: "medium",
      global_id: 163,
      explanation: "Since conductivity is σ = n · e · μ, substituting n · e = 1 / |R_H| gives mobility μ_H = |R_H| · σ = |R_H| / ρ."
    },
    {
      id: 14,
      question: "What is the tangent of the Hall Angle (tan θ_H) equal to?",
      options: [
        "μ_H · B",
        "μ_H / B",
        "B / μ_H",
        "R_H · I"
      ],
      answer: "A",
      correct_option: "μ_H · B",
      difficulty: "medium",
      global_id: 164,
      explanation: "The Hall angle θ_H represents the tilt of the total electric field relative to current flow, given by tan(θ_H) = E_H / E_x = μ_H · B."
    },
    {
      id: 15,
      question: "What happens to the measured Hall Voltage if the direction of the magnetic field B is inverted?",
      options: [
        "It reverses polarity (sign inverts)",
        "It doubles in magnitude without changing sign",
        "It drops to zero and stays zero",
        "It remains completely unaffected"
      ],
      answer: "A",
      correct_option: "It reverses polarity (sign inverts)",
      difficulty: "easy",
      global_id: 165,
      explanation: "Since V_H = (R_H · I · B) / t, changing B to -B reverses the direction of the Lorentz force and inverts the sign of V_H."
    },
    {
      id: 16,
      question: "What happens to the measured Hall Voltage if both the current I and magnetic field B are reversed simultaneously?",
      options: [
        "It retains its original sign and polarity",
        "It reverses sign",
        "It becomes zero",
        "It fluctuates wildly"
      ],
      answer: "A",
      correct_option: "It retains its original sign and polarity",
      difficulty: "medium",
      global_id: 166,
      explanation: "Because V_H ∝ I · B, reversing both factors gives (-I) · (-B) = + (I · B), leaving the polarity unchanged."
    },
    {
      id: 17,
      question: "What is the primary cause of zero-field misalignment offset voltage (V_0) in a Hall probe?",
      options: [
        "Transverse voltage contacts are not positioned on the exact same equipotential line",
        "Earth's gravitational curvature",
        "Fluctuations in ambient atmospheric pressure",
        "Cosmic background radiation"
      ],
      answer: "A",
      correct_option: "Transverse voltage contacts are not positioned on the exact same equipotential line",
      difficulty: "medium",
      global_id: 167,
      explanation: "If the two transverse voltage electrodes are slightly offset longitudinally along the sample, an IR drop appears across them even when B = 0."
    },
    {
      id: 18,
      question: "How can misalignment and thermoelectric offset voltages be eliminated experimentally?",
      options: [
        "Four-quadrant averaging by reversing both current and magnetic field directions",
        "Covering the probe with aluminum foil",
        "Increasing room temperature to 100°C",
        "Using alternating current at radio frequency"
      ],
      answer: "A",
      correct_option: "Four-quadrant averaging by reversing both current and magnetic field directions",
      difficulty: "medium",
      global_id: 168,
      explanation: "Taking readings across (+I, +B), (+I, -B), (-I, +B), and (-I, -B) cancels out offset voltages and thermomagnetic asymmetries."
    },
    {
      id: 19,
      question: "What is the Ettingshausen Effect?",
      options: [
        "A transverse temperature difference produced by longitudinal current in a perpendicular magnetic field",
        "The emission of light by a heated conductor",
        "The change of capacitance with voltage",
        "The alignment of nuclear spins in a constant field"
      ],
      answer: "A",
      correct_option: "A transverse temperature difference produced by longitudinal current in a perpendicular magnetic field",
      difficulty: "hard",
      global_id: 169,
      explanation: "The Ettingshausen effect is the thermal analog of the Hall effect: faster electrons are deflected differently than slower electrons, establishing a lateral temperature gradient."
    },
    {
      id: 20,
      question: "What is the Nernst Effect?",
      options: [
        "A transverse electric field generated when a temperature gradient is applied across a magnetic field",
        "The change in resistance of a wire under mechanical stress",
        "The production of sound by oscillating electric currents",
        "The emission of alpha particles from heavy nuclei"
      ],
      answer: "A",
      correct_option: "A transverse electric field generated when a temperature gradient is applied across a magnetic field",
      difficulty: "hard",
      global_id: 170,
      explanation: "The Nernst effect occurs when a heat current (temperature gradient) and a perpendicular magnetic field induce a transverse voltage."
    },
    {
      id: 21,
      question: "In which year and by whom was the Integer Quantum Hall Effect discovered?",
      options: [
        "Klaus von Klitzing in 1980",
        "Albert Einstein in 1905",
        "Niels Bohr in 1913",
        "Richard Feynman in 1965"
      ],
      answer: "A",
      correct_option: "Klaus von Klitzing in 1980",
      difficulty: "medium",
      global_id: 171,
      explanation: "Klaus von Klitzing discovered the Integer Quantum Hall Effect in 1980 using 2D electron gas systems in silicon MOSFETs at cryogenic temperatures and high magnetic fields (Nobel Prize in 1985)."
    },
    {
      id: 22,
      question: "What is the fundamental quantized Hall resistance formula in the Quantum Hall Effect?",
      options: [
        "R_H = h / (ν · e²)",
        "R_H = ν · h · e²",
        "R_H = (ν · e) / h",
        "R_H = h² / (ν · e)"
      ],
      answer: "A",
      correct_option: "R_H = h / (ν · e²)",
      difficulty: "hard",
      global_id: 172,
      explanation: "In the Integer Quantum Hall Effect, Hall resistance exhibits exact plateaus at R_H = h / (ν · e²), where ν is an integer and h / e² is the von Klitzing constant."
    },
    {
      id: 23,
      question: "What is the approximate value of the von Klitzing constant R_K = h / e²?",
      options: [
        "25,812.807 Ω",
        "1,000.000 Ω",
        "377.000 Ω",
        "50.000 Ω"
      ],
      answer: "A",
      correct_option: "25,812.807 Ω",
      difficulty: "hard",
      global_id: 173,
      explanation: "The von Klitzing constant R_K = h / e² is approximately 25,812.807 ohms, utilized internationally as a universal quantum standard of electrical resistance."
    },
    {
      id: 24,
      question: "Which physical system is required to observe the Quantum Hall Effect?",
      options: [
        "A two-dimensional electron gas (2DEG) at cryogenic temperatures under strong magnetic fields",
        "A piece of copper wire at room temperature",
        "An incandescent light bulb filament",
        "A liquid mercury thermometer"
      ],
      answer: "A",
      correct_option: "A two-dimensional electron gas (2DEG) at cryogenic temperatures under strong magnetic fields",
      difficulty: "medium",
      global_id: 174,
      explanation: "The Quantum Hall effect requires electrons confined strictly to 2D motion (e.g., GaAs/AlGaAs heterostructures or graphene) under high magnetic fields and low temperatures."
    },
    {
      id: 25,
      question: "Which compound semiconductor is known for extremely high electron mobility and widely used in commercial Hall sensors?",
      options: [
        "Indium Arsenide (InAs) / Indium Antimonide (InSb)",
        "Silicon Dioxide (SiO₂)",
        "Lead (Pb)",
        "Sodium Chloride (NaCl)"
      ],
      answer: "A",
      correct_option: "Indium Arsenide (InAs) / Indium Antimonide (InSb)",
      difficulty: "medium",
      global_id: 175,
      explanation: "InAs and InSb have narrow bandgaps and exceptionally high electron mobilities (>20,000 cm²/(V·s)), making them ideal for high-sensitivity Hall probes."
    },
    {
      id: 26,
      question: "How are Hall effect sensors utilized in brushless DC (BLDC) electric motors?",
      options: [
        "To sense the rotor magnetic pole position and control phase electronic commutation",
        "To measure mechanical friction inside ball bearings",
        "To regulate cooling fan airflow by acoustic vibration",
        "To generate auxiliary electrical power for headlights"
      ],
      answer: "A",
      correct_option: "To sense the rotor magnetic pole position and control phase electronic commutation",
      difficulty: "easy",
      global_id: 176,
      explanation: "BLDC motors use three Hall sensors placed around the stator to detect rotor magnet pole positions and switch transistor phase inverter gates."
    },
    {
      id: 27,
      question: "How do automotive Anti-lock Braking Systems (ABS) utilize Hall effect sensors?",
      options: [
        "To detect the rotational speed of wheels by sensing passing reluctor ring teeth",
        "To measure brake fluid temperature directly",
        "To verify vehicle paint reflectivity",
        "To adjust cabin air conditioning airflow"
      ],
      answer: "A",
      correct_option: "To detect the rotational speed of wheels by sensing passing reluctor ring teeth",
      difficulty: "easy",
      global_id: 177,
      explanation: "Hall sensors monitor toothed reluctor wheels on each axle to measure instantaneous angular velocity and detect impending wheel lockup."
    },
    {
      id: 28,
      question: "What is an advantage of Hall effect current sensors over shunt resistors in power electronics?",
      options: [
        "Galvanic electrical isolation and zero insertion resistance loss",
        "Requires no DC operating power whatsoever",
        "Works only in vacuum environments",
        "Operates only at absolute zero"
      ],
      answer: "A",
      correct_option: "Galvanic electrical isolation and zero insertion resistance loss",
      difficulty: "medium",
      global_id: 178,
      explanation: "Hall current sensors measure the magnetic field surrounding a conductor without making electrical contact, providing full galvanic isolation between high-voltage circuits and logic."
    },
    {
      id: 29,
      question: "What instrument utilizes a calibrated Hall probe to measure magnetic flux density?",
      options: [
        "Digital Gaussmeter / Tesla meter",
        "Galvanic Spectrometer",
        "Optical Interferometer",
        "Seismograph"
      ],
      answer: "A",
      correct_option: "Digital Gaussmeter / Tesla meter",
      difficulty: "easy",
      global_id: 179,
      explanation: "Gaussmeters use a small calibrated semiconductor Hall sensor element whose output voltage linearly corresponds to magnetic flux density B."
    },
    {
      id: 30,
      question: "For intrinsic semiconductors where both electrons and holes contribute to transport, what is the expression for R_H?",
      options: [
        "R_H = (p·μ_h² - n·μ_e²) / [e · (p·μ_h + n·μ_e)²]",
        "R_H = (p·μ_h + n·μ_e) / [e · (p·μ_h - n·μ_e)]",
        "R_H = 1 / [e · (n + p)]",
        "R_H = (μ_e · μ_h) / [e · (n - p)]"
      ],
      answer: "A",
      correct_option: "R_H = (p·μ_h² - n·μ_e²) / [e · (p·μ_h + n·μ_e)²]",
      difficulty: "hard",
      global_id: 180,
      explanation: "When both carrier types participate, the Hall voltages of electrons and holes compete with quadratic weighting by their respective mobilities."
    },
    {
      id: 31,
      question: "Why does intrinsic Germanium (Ge) exhibit a negative Hall coefficient despite having equal electron and hole concentrations (n = p = n_i)?",
      options: [
        "Electron mobility is significantly greater than hole mobility (μ_e > μ_h)",
        "Electrons have higher mass than holes",
        "Holes do not experience magnetic fields",
        "Germanium crystal atoms carry net negative electric charge"
      ],
      answer: "A",
      correct_option: "Electron mobility is significantly greater than hole mobility (μ_e > μ_h)",
      difficulty: "medium",
      global_id: 181,
      explanation: "In Ge, μ_e ≈ 3900 cm²/(V·s) while μ_h ≈ 1900 cm²/(V·s). Because R_H ∝ (p·μ_h² - n·μ_e²), the electron term dominates, making R_H negative."
    },
    {
      id: 32,
      question: "If specimen current I = 20 mA, magnetic field B = 0.5 T, thickness t = 0.5 mm, and V_H = -15.2 mV, what is the Hall coefficient R_H?",
      options: [
        "-3.80 × 10⁻² m³ / C",
        "-1.52 × 10⁻⁴ m³ / C",
        "+7.60 × 10⁻² m³ / C",
        "-3.80 × 10² m³ / C"
      ],
      answer: "A",
      correct_option: "-3.80 × 10⁻² m³ / C",
      difficulty: "hard",
      global_id: 182,
      explanation: "R_H = (V_H · t) / (I · B) = (-0.0152 V · 0.0005 m) / (0.020 A · 0.5 T) = -7.6 × 10^-6 / 0.010 = -3.80 × 10^-2 m³/C."
    },
    {
      id: 33,
      question: "Given R_H = -3.80 × 10⁻² m³ / C, what is the carrier density n?",
      options: [
        "1.64 × 10²⁰ m⁻³",
        "3.80 × 10²⁰ m⁻³",
        "6.24 × 10¹⁸ m⁻³",
        "1.64 × 10²⁸ m⁻³"
      ],
      answer: "A",
      correct_option: "1.64 × 10²⁰ m⁻³",
      difficulty: "hard",
      global_id: 183,
      explanation: "n = 1 / (|R_H| · e) = 1 / (3.80 × 10^-2 · 1.602 × 10^-19) ≈ 1.64 × 10^20 m^-3."
    },
    {
      id: 34,
      question: "If electrical resistivity ρ = 0.098 Ω·m and R_H = -3.80 × 10⁻² m³/C, what is the carrier mobility μ_H?",
      options: [
        "0.388 m² / (V·s)",
        "0.0037 m² / (V·s)",
        "3.88 m² / (V·s)",
        "25.8 m² / (V·s)"
      ],
      answer: "A",
      correct_option: "0.388 m² / (V·s)",
      difficulty: "hard",
      global_id: 184,
      explanation: "μ_H = |R_H| / ρ = 0.0380 / 0.098 ≈ 0.388 m²/(V·s) = 3880 cm²/(V·s)."
    },
    {
      id: 35,
      question: "What is the typical order of magnitude of Hall voltage generated in a metallic copper plate of thickness 0.1 mm with I = 10 A and B = 1 T?",
      options: [
        "Microvolts (~0.5 μV)",
        "Millivolts (~50 mV)",
        "Volts (~5 V)",
        "Kilovolts (~1 kV)"
      ],
      answer: "A",
      correct_option: "Microvolts (~0.5 μV)",
      difficulty: "medium",
      global_id: 185,
      explanation: "In copper, R_H ≈ -5.5 × 10^-11 m³/C. For 10 A and 1 T with t = 10^-4 m: V_H = (5.5 × 10^-11 · 10 · 1) / 10^-4 ≈ 5.5 × 10^-6 V = 5.5 μV."
    },
    {
      id: 36,
      question: "Which of the following metals exhibits an anomalous positive Hall coefficient at room temperature?",
      options: [
        "Zinc (Zn) and Cadmium (Cd)",
        "Copper (Cu)",
        "Silver (Ag)",
        "Gold (Au)"
      ],
      answer: "A",
      correct_option: "Zinc (Zn) and Cadmium (Cd)",
      difficulty: "hard",
      global_id: 186,
      explanation: "Due to complex Fermi surface geometry and hole-like pockets in the second Brillouin zone, metals like Zinc and Cadmium exhibit a positive Hall coefficient."
    },
    {
      id: 37,
      question: "What happens to the carrier concentration n of a doped extrinsic semiconductor as temperature increases into the intrinsic regime?",
      options: [
        "It increases exponentially due to thermal generation of electron-hole pairs",
        "It drops to zero immediately",
        "It remains strictly constant at all temperatures",
        "It becomes negative"
      ],
      answer: "A",
      correct_option: "It increases exponentially due to thermal generation of electron-hole pairs",
      difficulty: "medium",
      global_id: 187,
      explanation: "At elevated temperatures, thermal excitation across the bandgap produces intrinsic electron-hole pairs exponentially, causing n to surge and R_H to decline."
    },
    {
      id: 38,
      question: "In the absence of a magnetic field (B = 0), what should the ideal Hall voltage be across perfect symmetric contacts?",
      options: [
        "Exactly 0.0 mV",
        "Equal to the power supply voltage",
        "Infinite",
        "Undefined"
      ],
      answer: "A",
      correct_option: "Exactly 0.0 mV",
      difficulty: "easy",
      global_id: 188,
      explanation: "Without a magnetic field, the Lorentz force is zero (F_L = 0), no lateral charge accumulation occurs, and transverse potential is zero."
    },
    {
      id: 39,
      question: "How does the drift velocity v_d of charge carriers relate to the sample current I?",
      options: [
        "v_d = I / (n · q · w · t)",
        "v_d = I · n · q · w · t",
        "v_d = (n · q) / (I · w · t)",
        "v_d = (w · t) / (I · n · q)"
      ],
      answer: "A",
      correct_option: "v_d = I / (n · q · w · t)",
      difficulty: "medium",
      global_id: 189,
      explanation: "Current density J = I / (w · t) = n · q · v_d, giving drift velocity v_d = I / (n · q · w · t)."
    },
    {
      id: 40,
      question: "If the magnetic field B is doubled while maintaining constant current I, what happens to the Hall voltage V_H?",
      options: [
        "It doubles (2 × V_H)",
        "It quadruples (4 × V_H)",
        "It halves (0.5 × V_H)",
        "It remains unchanged"
      ],
      answer: "A",
      correct_option: "It doubles (2 × V_H)",
      difficulty: "easy",
      global_id: 190,
      explanation: "Hall voltage is directly proportional to magnetic field B: V_H ∝ B. Doubling B doubles V_H."
    },
    {
      id: 41,
      question: "What is the physical interpretation of the Hall coefficient's sign?",
      options: [
        "It reveals the electrical charge sign of majority mobile carriers",
        "It reveals whether the specimen is radioactive",
        "It indicates the magnetic permeability of vacuum",
        "It indicates the speed of light in the material"
      ],
      answer: "A",
      correct_option: "It reveals the electrical charge sign of majority mobile carriers",
      difficulty: "easy",
      global_id: 191,
      explanation: "Because R_H = 1 / (n · q), the sign of R_H matches the sign of q: positive for holes, negative for electrons."
    },
    {
      id: 42,
      question: "What type of contacts must be made to semiconductor specimens for accurate Hall measurements?",
      options: [
        "Ohmic, non-rectifying contacts with minimal contact resistance",
        "Schottky barrier diode rectifying contacts",
        "Capacitive insulated air-gap contacts",
        "Loose mechanical touch pins with high oxide resistance"
      ],
      answer: "A",
      correct_option: "Ohmic, non-rectifying contacts with minimal contact resistance",
      difficulty: "medium",
      global_id: 192,
      explanation: "Non-ohmic rectifying contacts would create nonlinear voltage drops and asymmetric rectification, corrupting Hall voltage readouts."
    },
    {
      id: 43,
      question: "In the van der Pauw method of Hall measurement, what sample geometry is required?",
      options: [
        "Arbitrarily shaped flat thin sample of uniform thickness with four small peripheral perimeter contacts",
        "A long cylindrical rod with axial contacts",
        "A solid metal sphere with concentric core contacts",
        "A hollow wire loop"
      ],
      answer: "A",
      correct_option: "Arbitrarily shaped flat thin sample of uniform thickness with four small peripheral perimeter contacts",
      difficulty: "hard",
      global_id: 193,
      explanation: "The van der Pauw method permits exact measurement of resistivity and Hall coefficient on arbitrary flat 2D geometries of uniform thickness."
    },
    {
      id: 44,
      question: "What is the typical thickness t of commercial semiconductor Hall sensor elements?",
      options: [
        "Thin wafers or epitaxial films between 1 μm and 0.5 mm",
        "Thick blocks of 10 cm to 20 cm",
        "Massive ingots of 1 meter",
        "Atomic radius of 0.1 nanometers"
      ],
      answer: "A",
      correct_option: "Thin wafers or epitaxial films between 1 μm and 0.5 mm",
      difficulty: "medium",
      global_id: 194,
      explanation: "Thin films maximize the Hall voltage output because V_H is inversely proportional to thickness t (V_H ∝ 1/t)."
    },
    {
      id: 45,
      question: "When current flows in the +x direction and magnetic field points in the +z direction, in which direction do electrons drift?",
      options: [
        "-x direction (opposite to conventional current)",
        "+x direction",
        "+y direction",
        "+z direction"
      ],
      answer: "A",
      correct_option: "-x direction (opposite to conventional current)",
      difficulty: "medium",
      global_id: 195,
      explanation: "Negatively charged electrons drift in the direction opposite to conventional electric current density (+x), hence in the -x direction."
    },
    {
      id: 46,
      question: "For electrons moving in the -x direction in a magnetic field in the +z direction, which way is the magnetic Lorentz force directed?",
      options: [
        "-y direction: F = (-e) · [(-v_x i) × (B_z k)] = (-e) · (v_x B_z j) = -y",
        "+y direction",
        "+x direction",
        "+z direction"
      ],
      answer: "A",
      correct_option: "-y direction: F = (-e) · [(-v_x i) × (B_z k)] = (-e) · (v_x B_z j) = -y",
      difficulty: "hard",
      global_id: 196,
      explanation: "Using vector cross product: (-i) × k = +j. Multiplied by negative electron charge (-e), the force points in the -y direction."
    },
    {
      id: 47,
      question: "For holes moving in the +x direction in a magnetic field in the +z direction, which way is the magnetic Lorentz force directed?",
      options: [
        "-y direction: F = (+e) · [(+v_x i) × (B_z k)] = (+e) · (-v_x B_z j) = -y",
        "+y direction",
        "+x direction",
        "+z direction"
      ],
      answer: "A",
      correct_option: "-y direction: F = (+e) · [(+v_x i) × (B_z k)] = (+e) · (-v_x B_z j) = -y",
      difficulty: "hard",
      global_id: 197,
      explanation: "Using vector cross product: (+i) × k = -j. Multiplied by positive hole charge (+e), the force also points in the -y direction! Both carriers deflect to the same edge."
    },
    {
      id: 48,
      question: "Why do n-type and p-type semiconductors develop opposite Hall voltages if both electrons and holes deflect toward the same physical edge?",
      options: [
        "Because electrons carry negative charge while holes carry positive charge, giving opposite accumulated edge charge polarities",
        "Because holes move faster than the speed of light",
        "Because electrons lose their charge inside semiconductors",
        "Because magnetic field direction changes inside p-type materials"
      ],
      answer: "A",
      correct_option: "Because electrons carry negative charge while holes carry positive charge, giving opposite accumulated edge charge polarities",
      difficulty: "medium",
      global_id: 198,
      explanation: "Even though both deflect to the same lateral edge, the accumulated charge is negative for electrons and positive for holes, inverting the direction of the Hall electric field."
    },
    {
      id: 49,
      question: "Which of the following describes the Spin Hall Effect?",
      options: [
        "Accumulation of opposite electron spin orientations on lateral sample boundaries due to spin-orbit coupling",
        "Rotation of a specimen on a mechanical turntable",
        "Electromagnetic wave polarization in plasma",
        "Spinning of magnetic domains in ferromagnets"
      ],
      answer: "A",
      correct_option: "Accumulation of opposite electron spin orientations on lateral sample boundaries due to spin-orbit coupling",
      difficulty: "hard",
      global_id: 199,
      explanation: "The Spin Hall Effect (SHE) consists of spin-up and spin-down electrons deflecting to opposite edges in materials with strong spin-orbit coupling without external magnetic fields."
    },
    {
      id: 50,
      question: "Which statement best summarizes the practical significance of the Hall Effect experiment in solid-state physics?",
      options: [
        "It provides a direct experimental method to determine carrier type, carrier concentration, and mobility in semiconductors",
        "It proves that light has wave-particle duality",
        "It confirms the universal gravitational constant G",
        "It measures the speed of sound in crystalline solids"
      ],
      answer: "A",
      correct_option: "It provides a direct experimental method to determine carrier type, carrier concentration, and mobility in semiconductors",
      difficulty: "easy",
      global_id: 200,
      explanation: "The Hall Effect is the foundational experiment in solid-state electronics for determining whether a semiconductor is n-type or p-type and measuring its fundamental transport parameters."
    }
  ]
};

export const DIFFRACTION_QUESTION_BANK = {
  title: "Diffraction Grating Spectrometry - Question Bank",
  experimentId: "diffraction",
  quizId: "diffraction-mastery-quiz",
  experimentName: "Diffraction Grating Spectrometry",
  total_questions: 50,
  questions: [
    {
      id: 1,
      question: "What is the standard grating equation for normal incident light?",
      options: ["d · sin(θ) = m · λ", "d · cos(θ) = m · λ", "d · tan(θ) = m · λ", "sin(θ) = m · d · λ"],
      answer: "A",
      correct_option: "d · sin(θ) = m · λ",
      difficulty: "easy",
      global_id: 201,
      explanation: "For normal incidence, constructive interference from adjacent slits occurs when the path difference d sin(θ) equals an integer multiple of the wavelength mλ."
    },
    {
      id: 2,
      question: "In the grating equation d · sin(θ) = m · λ, what does 'd' represent?",
      options: ["The distance between centers of adjacent slits (grating pitch)", "The total width of the grating plate", "The distance from the grating to the screen", "The diameter of the laser beam spot"],
      answer: "A",
      correct_option: "The distance between centers of adjacent slits (grating pitch)",
      difficulty: "easy",
      global_id: 202,
      explanation: "The grating element d represents the slit separation (pitch), calculated as d = 1 / N where N is the line density."
    },
    {
      id: 3,
      question: "If a diffraction grating has 500 lines per mm, what is its slit spacing d?",
      options: ["2.0 × 10⁻⁶ m (2.0 μm)", "5.0 × 10⁻⁶ m (5.0 μm)", "2.0 × 10⁻³ m (2.0 mm)", "0.5 × 10⁻⁶ m (0.5 μm)"],
      answer: "A",
      correct_option: "2.0 × 10⁻⁶ m (2.0 μm)",
      difficulty: "medium",
      global_id: 203,
      explanation: "d = 1 / (500 lines/mm) = 0.002 mm = 2.0 × 10⁻⁶ m = 2.0 μm."
    },
    {
      id: 4,
      question: "What diffraction order corresponds to the undeflected central beam (θ = 0)?",
      options: ["Zeroth order (m = 0)", "First order (m = 1)", "Negative first order (m = -1)", "Infinite order (m = ∞)"],
      answer: "A",
      correct_option: "Zeroth order (m = 0)",
      difficulty: "easy",
      global_id: 204,
      explanation: "At θ = 0, path difference between all slits is zero regardless of wavelength, corresponding to the central m = 0 maximum."
    },
    {
      id: 5,
      question: "When white light is incident on a diffraction grating, what color is the central maximum (m = 0)?",
      options: ["White", "Red", "Violet", "Green"],
      answer: "A",
      correct_option: "White",
      difficulty: "easy",
      global_id: 205,
      explanation: "All visible wavelengths satisfy d sin(0) = 0 · λ at θ = 0, so all spectral colors recombine into an undiffracted white fringe."
    },
    {
      id: 6,
      question: "In the first-order spectrum (m = 1), which color of visible light diffracts at the largest angle θ?",
      options: ["Red (~650 nm)", "Blue (~450 nm)", "Green (~532 nm)", "Violet (~400 nm)"],
      answer: "A",
      correct_option: "Red (~650 nm)",
      difficulty: "medium",
      global_id: 206,
      explanation: "Since sin(θ) = mλ / d, angle θ increases monotonically with wavelength λ. Red light has the longest visible wavelength and diffracts furthest."
    },
    {
      id: 7,
      question: "How does spectral dispersion by a diffraction grating compare to dispersion by a glass prism?",
      options: ["Grating bends red more than violet; prism bends violet more than red", "Both bend red light more than violet light", "Both bend violet light more than red light", "Grating only transmits green light"],
      answer: "A",
      correct_option: "Grating bends red more than violet; prism bends violet more than red",
      difficulty: "medium",
      global_id: 207,
      explanation: "In a grating, sin(θ) ∝ λ (red deflects most). In a prism, refractive index n increases for shorter wavelengths, bending violet most."
    },
    {
      id: 8,
      question: "What is the theoretical maximum observable order m_max for light of wavelength λ with grating spacing d?",
      options: ["m_max = ⌊d / λ⌋", "m_max = ⌊λ / d⌋", "m_max = 2d · λ", "m_max = 2π / (d · λ)"],
      answer: "A",
      correct_option: "m_max = ⌊d / λ⌋",
      difficulty: "medium",
      global_id: 208,
      explanation: "Because sin(θ) cannot exceed 1, mλ / d ≤ 1 ⟹ m ≤ d / λ. The highest integer order is ⌊d / λ⌋."
    },
    {
      id: 9,
      question: "What happens to the angular separation between diffracted lines if a 300 lines/mm grating is replaced with a 600 lines/mm grating?",
      options: ["Angular separation doubles (spreads further apart)", "Angular separation is halved (narrows together)", "Angular separation remains completely unchanged", "The pattern turns completely dark"],
      answer: "A",
      correct_option: "Angular separation doubles (spreads further apart)",
      difficulty: "medium",
      global_id: 209,
      explanation: "Doubling ruling density halves slit spacing d. Because sin(θ) = mλ / d, smaller d results in significantly larger diffraction angles."
    },
    {
      id: 10,
      question: "Angular dispersion D of a diffraction grating is mathematically defined as:",
      options: ["D = dθ / dλ = m / (d · cos θ)", "D = dλ / dθ = (d · sin θ) / m", "D = m · d · cos(θ)", "D = λ / (m · d)"],
      answer: "A",
      correct_option: "D = dθ / dλ = m / (d · cos θ)",
      difficulty: "hard",
      global_id: 210,
      explanation: "Differentiating d sin(θ) = mλ with respect to λ yields d cos(θ) dθ = m dλ, giving D = dθ/dλ = m / (d cos θ)."
    },
    {
      id: 11,
      question: "If screen distance L is increased from 1.0 m to 2.0 m, how does the fringe displacement y change on the screen?",
      options: ["Displacement y doubles (y = L · tan θ)", "Displacement y is halved", "Displacement y decreases by 4x", "Displacement y remains invariant"],
      answer: "A",
      correct_option: "Displacement y doubles (y = L · tan θ)",
      difficulty: "easy",
      global_id: 211,
      explanation: "From geometry, tan(θ) = y / L, so y = L tan(θ). Linear fringe separation scales in direct proportion to screen distance L."
    },
    {
      id: 12,
      question: "What class of diffraction occurs when incident wavefronts are plane and observed at infinity (or focused by a lens)?",
      options: ["Fraunhofer diffraction", "Fresnel near-field diffraction", "Raman scattering", "Bragg backscattering"],
      answer: "A",
      correct_option: "Fraunhofer diffraction",
      difficulty: "medium",
      global_id: 212,
      explanation: "Fraunhofer diffraction occurs in the far-field regime where both the incoming and outgoing wavefronts are planar."
    },
    {
      id: 13,
      question: "The chromatic resolving power of a diffraction grating is given by:",
      options: ["R = λ / Δλ = m · N_total", "R = Δλ / λ = d / (m · N_total)", "R = m / (d · λ)", "R = N_total / (m · λ)"],
      answer: "A",
      correct_option: "R = λ / Δλ = m · N_total",
      difficulty: "hard",
      global_id: 213,
      explanation: "By Rayleigh's criterion, two spectral lines are resolved when their angular separation matches half-width: R = λ/Δλ = m · N_total."
    },
    {
      id: 14,
      question: "What governs the sharpness and intensity of principal maxima in an N-slit diffraction grating?",
      options: ["Peak intensity is proportional to N² and angular width is inversely proportional to N", "Peak intensity is proportional to N and width is independent of N", "Peak intensity decreases as N increases", "Sharpness is determined exclusively by screen distance"],
      answer: "A",
      correct_option: "Peak intensity is proportional to N² and angular width is inversely proportional to N",
      difficulty: "hard",
      global_id: 214,
      explanation: "Coherent constructive addition of N waves yields amplitude N · A₀ and intensity N² · I₀, while the width of the principal maximum narrows as 1/N."
    },
    {
      id: 15,
      question: "How many secondary minima exist between two adjacent principal maxima in an N-slit grating?",
      options: ["N - 1 minima", "N minima", "N + 1 minima", "2N minima"],
      answer: "A",
      correct_option: "N - 1 minima",
      difficulty: "hard",
      global_id: 215,
      explanation: "Between consecutive principal maxima, the phase difference traverses 2π, encountering N - 1 zero-amplitude nodes (minima) and N - 2 secondary maxima."
    },
    {
      id: 16,
      question: "A laser with wavelength 500 nm strikes a grating with slit spacing d = 2.0 μm. What is sin(θ) for the first-order beam?",
      options: ["0.25", "0.50", "0.10", "1.00"],
      answer: "A",
      correct_option: "0.25",
      difficulty: "easy",
      global_id: 216,
      explanation: "sin(θ) = (1 · 500 × 10⁻⁹ m) / (2.0 × 10⁻⁶ m) = 500 / 2000 = 0.25."
    },
    {
      id: 17,
      question: "What is the optical path difference between rays from adjacent slits for the second-order maximum (m = 2)?",
      options: ["2λ", "λ", "λ / 2", "4λ"],
      answer: "A",
      correct_option: "2λ",
      difficulty: "easy",
      global_id: 217,
      explanation: "For the m-th principal maximum, the path difference Δx = d sin(θ) must equal exactly mλ = 2λ."
    },
    {
      id: 18,
      question: "What causes a missing order (absent spectrum) in a diffraction grating pattern?",
      options: ["A principal interference maximum coincides with a single-slit diffraction minimum", "The incident beam is polarized at Brewster's angle", "The wavelength exceeds the physical size of the grating", "Total internal reflection inside the glass substrate"],
      answer: "A",
      correct_option: "A principal interference maximum coincides with a single-slit diffraction minimum",
      difficulty: "hard",
      global_id: 218,
      explanation: "When the condition for a grating maximum (d sin θ = mλ) coincides with a single-slit diffraction zero (a sin θ = pλ), the intensity envelope is zero, extinguishing the order."
    },
    {
      id: 19,
      question: "Why do higher order spectra (e.g. m = 2 and m = 3) sometimes overlap when using polychromatic light?",
      options: ["Because m₁ · λ₁ can equal m₂ · λ₂ at identical diffraction angles θ", "Because the grating heats up under laser irradiance", "Because transverse magnetic modes cancel each other", "Because light slows down inside the air gap"],
      answer: "A",
      correct_option: "Because m₁ · λ₁ can equal m₂ · λ₂ at identical diffraction angles θ",
      difficulty: "medium",
      global_id: 219,
      explanation: "Overlap occurs when 2 · λ_red (e.g., 2 × 700 = 1400 nm) exceeds 3 · λ_violet (3 × 400 = 1200 nm), placing different orders at overlapping angles."
    },
    {
      id: 20,
      question: "Why is a transmission diffraction grating widely preferred over a prism in quantitative spectrometry?",
      options: ["Gratings provide higher resolving power and linear angular dispersion", "Gratings require no light source to operate", "Gratings absorb all infrared radiation", "Prisms cannot refract visible light"],
      answer: "A",
      correct_option: "Gratings provide higher resolving power and linear angular dispersion",
      difficulty: "medium",
      global_id: 220,
      explanation: "Diffraction gratings yield much higher resolving power R and approximately linear dispersion dθ/dλ, making precise wavelength determination straightforward."
    }
,
    {
    "id": 21,
    "question": "What is the condition for missing spectra (absent orders) in a diffraction grating with slit width a and slit separation d?",
    "options": [
        "d / a = m / p (where m is grating order and p is single-slit minimum order)",
        "d · a = m · p",
        "d + a = m · λ",
        "d / a = (2m + 1) / p"
    ],
    "answer": "A",
    "correct_option": "d / a = m / p (where m is grating order and p is single-slit minimum order)",
    "difficulty": "hard",
    "global_id": 2021,
    "explanation": "When a principal interference maximum coincides with a single-slit diffraction minimum (d sin θ = mλ and a sin θ = pλ), the overall intensity vanishes, creating an absent order."
},
    {
    "id": 22,
    "question": "If a transmission grating has slit width a = 2.0 μm and slit spacing d = 4.0 μm, which interference orders will be absent?",
    "options": [
        "Even orders: m = 2, 4, 6, 8...",
        "Odd orders: m = 1, 3, 5, 7...",
        "Only m = 1",
        "No orders will be absent"
    ],
    "answer": "A",
    "correct_option": "Even orders: m = 2, 4, 6, 8...",
    "difficulty": "medium",
    "global_id": 2022,
    "explanation": "d / a = 4.0 / 2.0 = 2. Therefore m = 2p, meaning all even orders (2, 4, 6...) coincide with single-slit diffraction zeros and disappear."
},
    {
    "id": 23,
    "question": "What is the chromatic resolving power R of a diffraction grating defined as?",
    "options": [
        "R = λ / Δλ = m · N_total",
        "R = Δλ / λ = m / N_total",
        "R = d · sin θ / λ",
        "R = N_total / (m · λ)"
    ],
    "answer": "A",
    "correct_option": "R = λ / Δλ = m · N_total",
    "difficulty": "easy",
    "global_id": 2023,
    "explanation": "By Rayleigh criterion, two spectral lines of wavelength difference Δλ are just resolved when R = λ / Δλ = m · N_total, where N_total is the total illuminated rulings."
},
    {
    "id": 24,
    "question": "If a diffraction grating with 600 lines/mm is illuminated over a width of 20 mm, what is the total number of rulings N_total?",
    "options": [
        "12,000 lines",
        "30 lines",
        "60,000 lines",
        "1,200 lines"
    ],
    "answer": "A",
    "correct_option": "12,000 lines",
    "difficulty": "easy",
    "global_id": 2024,
    "explanation": "N_total = (600 lines/mm) × (20 mm) = 12,000 rulings."
},
    {
    "id": 25,
    "question": "For N_total = 12,000 rulings, what is the theoretical resolving power in the second order (m = 2)?",
    "options": [
        "24,000",
        "12,000",
        "6,000",
        "48,000"
    ],
    "answer": "A",
    "correct_option": "24,000",
    "difficulty": "easy",
    "global_id": 2025,
    "explanation": "R = m · N_total = 2 × 12,000 = 24,000."
},
    {
    "id": 26,
    "question": "With a resolving power of R = 24,000 at λ = 600 nm, what is the smallest resolvable wavelength difference Δλ?",
    "options": [
        "0.025 nm (0.25 Å)",
        "0.25 nm (2.5 Å)",
        "2.5 nm",
        "0.001 nm"
    ],
    "answer": "A",
    "correct_option": "0.025 nm (0.25 Å)",
    "difficulty": "medium",
    "global_id": 2026,
    "explanation": "Δλ = λ / R = 600 nm / 24,000 = 0.025 nm."
},
    {
    "id": 27,
    "question": "How does the angular dispersion D = dθ / dλ vary with the diffraction order m?",
    "options": [
        "D is directly proportional to m (higher orders have wider spectral dispersion)",
        "D is inversely proportional to m",
        "D is completely independent of m",
        "D approaches zero at higher orders"
    ],
    "answer": "A",
    "correct_option": "D is directly proportional to m (higher orders have wider spectral dispersion)",
    "difficulty": "medium",
    "global_id": 2027,
    "explanation": "Differentiating the grating equation gives D = dθ / dλ = m / (d cos θ). As m increases, angular dispersion increases proportionally."
},
    {
    "id": 28,
    "question": "If light strikes a diffraction grating at an angle of incidence i, what is the modified grating equation?",
    "options": [
        "d · (sin i + sin θ) = m · λ",
        "d · (cos i + cos θ) = m · λ",
        "d · sin(i · θ) = m · λ",
        "d · (sin i − sin θ) = 0"
    ],
    "answer": "A",
    "correct_option": "d · (sin i + sin θ) = m · λ",
    "difficulty": "medium",
    "global_id": 2028,
    "explanation": "For oblique incidence, the total path difference across adjacent slits includes both incident and diffracted segments: d(sin i + sin θ) = mλ."
},
    {
    "id": 29,
    "question": "Why do principal interference maxima become much sharper and brighter as the number of illuminated slits N increases?",
    "options": [
        "Because destructive interference occurs at virtually all non-principal angles and peak intensity scales as N²",
        "Because light travels faster through more slits",
        "Because the wavelength of laser light decreases",
        "Because the grating absorbs less thermal energy"
    ],
    "answer": "A",
    "correct_option": "Because destructive interference occurs at virtually all non-principal angles and peak intensity scales as N²",
    "difficulty": "hard",
    "global_id": 2029,
    "explanation": "For N coherent in-phase wavelets, constructive amplitude is N · A₀ so peak intensity scales as I ∝ N², while angular half-width narrows as Δθ ∝ 1/N."
},
    {
    "id": 30,
    "question": "In an N-slit diffraction grating, how many secondary minima exist between any two consecutive principal maxima?",
    "options": [
        "(N − 1) minima",
        "(N + 1) minima",
        "N minima",
        "2N minima"
    ],
    "answer": "A",
    "correct_option": "(N − 1) minima",
    "difficulty": "medium",
    "global_id": 2030,
    "explanation": "The interference term sin²(Nβ/2) / sin²(β/2) equals zero when Nβ/2 = pπ (with p not a multiple of N), yielding exactly (N - 1) minima."
},
    {
    "id": 31,
    "question": "In an N-slit diffraction grating, how many secondary maxima exist between adjacent principal maxima?",
    "options": [
        "(N − 2) secondary maxima",
        "(N − 1) secondary maxima",
        "N secondary maxima",
        "2 secondary maxima"
    ],
    "answer": "A",
    "correct_option": "(N − 2) secondary maxima",
    "difficulty": "medium",
    "global_id": 2031,
    "explanation": "Between the (N - 1) secondary minima lie exactly (N - 2) weak secondary maxima whose intensities are negligible for large N."
},
    {
    "id": 32,
    "question": "A diffraction grating has 1000 lines/mm. What is the maximum theoretical diffraction order for green laser light (λ = 500 nm)?",
    "options": [
        "m_max = 2",
        "m_max = 1",
        "m_max = 3",
        "m_max = 4"
    ],
    "answer": "A",
    "correct_option": "m_max = 2",
    "difficulty": "medium",
    "global_id": 2032,
    "explanation": "d = 1 / 1000 mm = 1000 nm. Since sin θ ≤ 1, m_max = ⌊d / λ⌋ = ⌊1000 / 500⌋ = 2."
},
    {
    "id": 33,
    "question": "What is the phase difference δ between wavelets diffracted at angle θ from adjacent slits separated by distance d?",
    "options": [
        "δ = (2π / λ) · d · sin(θ)",
        "δ = (π / λ) · d · cos(θ)",
        "δ = (2π / λ) · d · tan(θ)",
        "δ = 2π · m · λ"
    ],
    "answer": "A",
    "correct_option": "δ = (2π / λ) · d · sin(θ)",
    "difficulty": "medium",
    "global_id": 2033,
    "explanation": "Phase difference δ = k · Δx = (2π / λ) · (d sin θ)."
},
    {
    "id": 34,
    "question": "What are Rowland's ghosts in ruled mechanical diffraction gratings?",
    "options": [
        "Spurious spectral lines caused by periodic pitch errors in ruling engine drive screws",
        "Optical reflections from the glass rear boundary",
        "Fluorescence emission lines from diamond stylus wear",
        "Second-order diffraction from ambient room illumination"
    ],
    "answer": "A",
    "correct_option": "Spurious spectral lines caused by periodic pitch errors in ruling engine drive screws",
    "difficulty": "hard",
    "global_id": 2034,
    "explanation": "Periodic mechanical imperfections in the ruling screw produce systematic phase modulation, creating faint symmetrical ghost lines flanking principal lines."
},
    {
    "id": 35,
    "question": "What is a blazed grating?",
    "options": [
        "A grating with angled grooves designed to concentrate optical power into a specific diffraction order",
        "A grating heated to high temperatures during fabrication",
        "A grating coated with absorbing black paint",
        "A transmission grating with non-parallel slits"
    ],
    "answer": "A",
    "correct_option": "A grating with angled grooves designed to concentrate optical power into a specific diffraction order",
    "difficulty": "medium",
    "global_id": 2035,
    "explanation": "Blazing shifts the single-slit specular reflection envelope to match a chosen diffraction order, dramatically increasing diffraction efficiency at that blaze wavelength."
},
    {
    "id": 36,
    "question": "What is the Littrow configuration in a spectrometer?",
    "options": [
        "An optical geometry where the diffracted beam reflects back along the incident beam path (θ = i)",
        "A geometry where light passes through two consecutive gratings",
        "A setup using a cylindrical lens to collimate laser beams",
        "A detector configuration without any focusing optics"
    ],
    "answer": "A",
    "correct_option": "An optical geometry where the diffracted beam reflects back along the incident beam path (θ = i)",
    "difficulty": "hard",
    "global_id": 2036,
    "explanation": "In the Littrow mount, θ = i so the grating equation simplifies to 2d sin θ = mλ, maximizing blaze efficiency and optical compactness."
},
    {
    "id": 37,
    "question": "If a red laser (λ = 650 nm) is swapped for a violet laser (λ = 405 nm), what happens to the fringe pattern on the screen?",
    "options": [
        "The diffracted spots move closer to the central zeroth-order spot",
        "The diffracted spots move farther outward",
        "The fringe pattern disappears entirely",
        "Only the zeroth-order spot remains"
    ],
    "answer": "A",
    "correct_option": "The diffracted spots move closer to the central zeroth-order spot",
    "difficulty": "easy",
    "global_id": 2037,
    "explanation": "Since sin θ = mλ / d, a shorter wavelength produces smaller diffraction angles θ, contracting the fringe pattern toward center."
},
    {
    "id": 38,
    "question": "If the grating-to-screen distance L is doubled, what happens to the physical distance y between the m = 0 and m = 1 spots?",
    "options": [
        "The separation distance y approximately doubles",
        "The separation distance y is halved",
        "The separation distance y increases fourfold",
        "The separation distance y remains unchanged"
    ],
    "answer": "A",
    "correct_option": "The separation distance y approximately doubles",
    "difficulty": "easy",
    "global_id": 2038,
    "explanation": "For small angles, y ≈ L · tan(θ) ≈ L · θ. Doubling screen distance L directly doubles spot displacement y."
},
    {
    "id": 39,
    "question": "What happens to the diffraction angles if an entire grating experiment is submerged in water (n = 1.33)?",
    "options": [
        "Diffraction angles decrease because effective wavelength decreases (λ_med = λ / n)",
        "Diffraction angles increase by 1.33x",
        "The diffraction angles remain exactly the same",
        "Diffraction completely ceases in liquid media"
    ],
    "answer": "A",
    "correct_option": "Diffraction angles decrease because effective wavelength decreases (λ_med = λ / n)",
    "difficulty": "medium",
    "global_id": 2039,
    "explanation": "In a dielectric medium of refractive index n, the wavelength shortens to λ / n, causing smaller diffraction angles via d sin θ = m(λ/n)."
},
    {
    "id": 40,
    "question": "Why does an atomic gas discharge tube produce discrete sharp spectral lines through a diffraction grating?",
    "options": [
        "Because atoms emit photons at quantized discrete transition wavelengths ΔE = hc / λ",
        "Because the grating filters out continuous frequencies",
        "Because gas atoms absorb all odd orders",
        "Because of acoustic Doppler resonance inside the tube"
    ],
    "answer": "A",
    "correct_option": "Because atoms emit photons at quantized discrete transition wavelengths ΔE = hc / λ",
    "difficulty": "easy",
    "global_id": 2040,
    "explanation": "Electronic transitions between quantized energy levels produce monochromatic photons at discrete wavelengths, each diffracted into distinct lines."
},
    {
    "id": 41,
    "question": "What are the characteristic yellow doublet wavelengths of a low-pressure Sodium (Na) laboratory lamp?",
    "options": [
        "589.0 nm (D₂) and 589.6 nm (D₁)",
        "656.3 nm and 486.1 nm",
        "546.1 nm and 435.8 nm",
        "632.8 nm and 532.0 nm"
    ],
    "answer": "A",
    "correct_option": "589.0 nm (D₂) and 589.6 nm (D₁)",
    "difficulty": "medium",
    "global_id": 2041,
    "explanation": "The Sodium doublet originates from 3p → 3s fine-structure transitions with wavelengths 589.0 nm and 589.6 nm separated by Δλ = 0.6 nm."
},
    {
    "id": 42,
    "question": "What minimum resolving power R is required to clearly separate the Sodium doublet (589.0 nm and 589.6 nm)?",
    "options": [
        "R ≈ 982",
        "R ≈ 100",
        "R ≈ 10,000",
        "R ≈ 50"
    ],
    "answer": "A",
    "correct_option": "R ≈ 982",
    "difficulty": "medium",
    "global_id": 2042,
    "explanation": "R = λ_avg / Δλ = 589.3 nm / 0.6 nm ≈ 982. A grating needs at least ~982 total rulings in the first order to resolve them."
},
    {
    "id": 43,
    "question": "Can a diffraction grating with N_total = 500 total rulings resolve the Sodium doublet in the first order (m = 1)?",
    "options": [
        "No, because R = 1 × 500 = 500, which is less than the required 982",
        "Yes, because 500 is greater than 0.6",
        "Yes, any grating can resolve the doublet",
        "No, Sodium light cannot be diffracted by gratings"
    ],
    "answer": "A",
    "correct_option": "No, because R = 1 × 500 = 500, which is less than the required 982",
    "difficulty": "easy",
    "global_id": 2043,
    "explanation": "In order m = 1, R = 500 < 982, so Rayleigh criterion is not met and the two lines blur together."
},
    {
    "id": 44,
    "question": "What is the key structural difference between a transmission grating and a reflection grating?",
    "options": [
        "Transmission gratings transmit diffracted light through transparent slits; reflection gratings reflect light from mirrored facets",
        "Reflection gratings cannot produce spectra",
        "Transmission gratings have only two slits",
        "Reflection gratings require vacuum chambers"
    ],
    "answer": "A",
    "correct_option": "Transmission gratings transmit diffracted light through transparent slits; reflection gratings reflect light from mirrored facets",
    "difficulty": "easy",
    "global_id": 2044,
    "explanation": "Transmission gratings rely on periodic transmissive apertures; reflection gratings use periodic mirrored facets etched into a substrate."
},
    {
    "id": 45,
    "question": "If a transmission grating has 1200 lines/mm, what is its slit spacing d in nanometers?",
    "options": [
        "833.3 nm",
        "1200 nm",
        "120 nm",
        "83.3 nm"
    ],
    "answer": "A",
    "correct_option": "833.3 nm",
    "difficulty": "medium",
    "global_id": 2045,
    "explanation": "d = 1 / 1200 mm = (10⁶ nm) / 1200 ≈ 833.3 nm."
},
    {
    "id": 46,
    "question": "What is the diffraction angle θ for m = 1 with λ = 500 nm and d = 2000 nm?",
    "options": [
        "θ = arcsin(0.25) ≈ 14.48°",
        "θ = arcsin(0.50) = 30.00°",
        "θ = arcsin(0.10) ≈ 5.74°",
        "θ = 45.00°"
    ],
    "answer": "A",
    "correct_option": "θ = arcsin(0.25) ≈ 14.48°",
    "difficulty": "easy",
    "global_id": 2046,
    "explanation": "sin θ = (1 × 500) / 2000 = 0.25. θ = arcsin(0.25) ≈ 14.48°."
},
    {
    "id": 47,
    "question": "In Fraunhofer multi-slit diffraction, what optical function does a collimating lens serve before the grating?",
    "options": [
        "It converts diverging spherical rays into parallel planar wavefronts",
        "It focuses diffracted light onto the sensor",
        "It filters out UV wavelengths",
        "It increases the laser power"
    ],
    "answer": "A",
    "correct_option": "It converts diverging spherical rays into parallel planar wavefronts",
    "difficulty": "easy",
    "global_id": 2047,
    "explanation": "Fraunhofer diffraction strictly requires planar wavefront incidence, achieved by placing the point source at the focal point of a collimator lens."
},
    {
    "id": 48,
    "question": "What governs the relative intensity envelope of different diffraction orders in a plane grating?",
    "options": [
        "The single-slit diffraction factor [sin(α)/α]² where α = (π a sin θ) / λ",
        "The thickness of the glass substrate only",
        "The focal length of the telescope",
        "The temperature of the laser diode"
    ],
    "answer": "A",
    "correct_option": "The single-slit diffraction factor [sin(α)/α]² where α = (π a sin θ) / λ",
    "difficulty": "hard",
    "global_id": 2048,
    "explanation": "The total intensity is the product of multi-slit interference and single-slit diffraction: I(θ) = I₀ · [sin(α)/α]² · [sin(Nβ)/sin(β)]²."
},
    {
    "id": 49,
    "question": "Why are holographic gratings often superior to mechanically ruled gratings in high-precision spectroscopy?",
    "options": [
        "They are produced via laser interference fringes, eliminating mechanical ruling errors and ghost lines",
        "They do not require optical alignment",
        "They operate without physical slits",
        "They can amplify light like a laser amplifier"
    ],
    "answer": "A",
    "correct_option": "They are produced via laser interference fringes, eliminating mechanical ruling errors and ghost lines",
    "difficulty": "medium",
    "global_id": 2049,
    "explanation": "Holographic fabrication records sinusoidal optical interference fringes onto photoresist, virtually eliminating periodic mechanical errors and stray light ghosts."
},
    {
    "id": 50,
    "question": "What is the physical principle underlying the determination of laser wavelength using a transmission grating in this experiment?",
    "options": [
        "Measuring the fringe position y and bench distance L gives θ = arctan(y/L), enabling calculation via λ = (d · sin θ) / m",
        "Measuring the heat absorbed by the grating screen",
        "Measuring the time of flight of laser photons",
        "Detecting the Doppler redshift of laser light"
    ],
    "answer": "A",
    "correct_option": "Measuring the fringe position y and bench distance L gives θ = arctan(y/L), enabling calculation via λ = (d · sin θ) / m",
    "difficulty": "easy",
    "global_id": 2050,
    "explanation": "By geometry, tan θ = y / L. Substituting θ into the grating equation d sin θ = mλ yields the unknown laser wavelength with high precision."
  }
  ]
};

export const SANDBOX_QUESTION_BANK = {
  title: "Physics Sandbox Dynamics - Question Bank",
  experimentId: "sandbox",
  quizId: "sandbox-mastery-quiz",
  experimentName: "Physics Sandbox Newtonian Dynamics",
  total_questions: 50,
  questions: [
    {
      id: 1,
      question: "According to Newton's First Law, what happens to an object moving in zero gravity with no external forces?",
      options: ["It continues moving with constant velocity in a straight line", "It gradually slows down and stops", "It begins to rotate in a circular orbit", "It falls downward at 9.8 m/s²"],
      answer: "A",
      correct_option: "It continues moving with constant velocity in a straight line",
      difficulty: "easy",
      global_id: 221,
      explanation: "Newton's First Law (Law of Inertia) states that in the absence of net external forces, an object at rest stays at rest and an object in motion maintains constant velocity."
    },
    {
      id: 2,
      question: "Newton's Second Law mathematically relates net force, mass, and acceleration as:",
      options: ["F_net = m · a", "F_net = m / a", "F_net = a / m", "F_net = m · a²"],
      answer: "A",
      correct_option: "F_net = m · a",
      difficulty: "easy",
      global_id: 222,
      explanation: "Newton's Second Law states that acceleration is directly proportional to net force and inversely proportional to inertial mass: F = ma."
    },
    {
      id: 3,
      question: "What is the physical definition of mechanical impulse (J)?",
      options: ["The integral of force over time (J = F · Δt = Δp)", "The rate of change of work over distance", "The ratio of mass to kinetic energy", "The gravitational potential energy per unit height"],
      answer: "A",
      correct_option: "The integral of force over time (J = F · Δt = Δp)",
      difficulty: "medium",
      global_id: 223,
      explanation: "Impulse J is defined as the force integrated over the collision duration, which strictly equals the total change in linear momentum Δp."
    },
    {
      id: 4,
      question: "In an isolated physical system with no external forces, what physical quantity is conserved in all collisions?",
      options: ["Total linear momentum", "Kinetic energy only", "Gravitational potential energy only", "Temperature only"],
      answer: "A",
      correct_option: "Total linear momentum",
      difficulty: "easy",
      global_id: 224,
      explanation: "By Newton's Third Law, internal collision forces sum to zero, guaranteeing that total linear momentum Σp is conserved in all collisions."
    },
    {
      id: 5,
      question: "A collision in which total kinetic energy is conserved before and after impact is called:",
      options: ["A perfectly elastic collision", "An inelastic collision", "A completely plastic collision", "A dissipative collision"],
      answer: "A",
      correct_option: "A perfectly elastic collision",
      difficulty: "easy",
      global_id: 225,
      explanation: "In a perfectly elastic collision, no kinetic energy is converted into thermal energy, sound, or permanent deformation work (KE_initial = KE_final)."
    },
    {
      id: 6,
      question: "The coefficient of restitution (e) is defined as the ratio of:",
      options: ["Relative separation speed to relative approach speed", "Total final momentum to total initial momentum", "Frictional force to normal force", "Potential energy to kinetic energy"],
      answer: "A",
      correct_option: "Relative separation speed to relative approach speed",
      difficulty: "medium",
      global_id: 226,
      explanation: "Restitution is defined as e = |v₂f - v₁f| / |v₁i - v₂i|, quantifying the elasticity of an impact."
    },
    {
      id: 7,
      question: "For a completely inelastic collision where colliding bodies stick together, restitution e equals:",
      options: ["0.0", "1.0", "0.5", "-1.0"],
      answer: "A",
      correct_option: "0.0",
      difficulty: "easy",
      global_id: 227,
      explanation: "When objects stick together after collision, their separation speed is zero, meaning e = 0."
    },
    {
      id: 8,
      question: "For a perfectly elastic collision, what is the value of restitution e?",
      options: ["1.0", "0.0", "0.5", "Infinity"],
      answer: "A",
      correct_option: "1.0",
      difficulty: "easy",
      global_id: 228,
      explanation: "For perfectly elastic collisions, relative separation speed equals relative approach speed, giving e = 1.0."
    },
    {
      id: 9,
      question: "What is the gravitational potential energy of a body of mass m raised to height h in gravity g?",
      options: ["PE = m · g · h", "PE = 1/2 · m · g · h²", "PE = m · v² / 2", "PE = g · h / m"],
      answer: "A",
      correct_option: "PE = m · g · h",
      difficulty: "easy",
      global_id: 229,
      explanation: "Work done against uniform gravity equals force times displacement: W = F · h = mgh."
    },
    {
      id: 10,
      question: "Total mechanical energy of an undamped conservative rigid body system is:",
      options: ["E = KE + PE = 1/2 m v² + m g h", "E = KE - PE", "E = m · a · t", "E = F · v / t"],
      answer: "A",
      correct_option: "E = KE + PE = 1/2 m v² + m g h",
      difficulty: "easy",
      global_id: 230,
      explanation: "Total mechanical energy is the sum of translational kinetic energy (1/2 mv²) and gravitational potential energy (mgh)."
    },
    {
      id: 11,
      question: "If a net continuous force of 10 N acts on a 2.0 kg box for 3.0 seconds, what is its velocity increase?",
      options: ["15.0 m/s", "5.0 m/s", "30.0 m/s", "6.67 m/s"],
      answer: "A",
      correct_option: "15.0 m/s",
      difficulty: "medium",
      global_id: 231,
      explanation: "Acceleration a = F / m = 10 N / 2 kg = 5.0 m/s². Velocity change Δv = a · t = 5.0 × 3.0 = 15.0 m/s."
    },
    {
      id: 12,
      question: "What is the kinetic energy of a 4.0 kg ball moving at a speed of 5.0 m/s?",
      options: ["50.0 Joules", "20.0 Joules", "100.0 Joules", "10.0 Joules"],
      answer: "A",
      correct_option: "50.0 Joules",
      difficulty: "easy",
      global_id: 232,
      explanation: "KE = 1/2 · m · v² = 0.5 × 4.0 kg × (5.0 m/s)² = 2 × 25 = 50.0 J."
    },
    {
      id: 13,
      question: "Newton's Third Law states that every action force has an equal and opposite reaction force. Why do they not cancel each other out?",
      options: ["Because they act on two different bodies", "Because they occur at different times", "Because action is always greater than reaction", "Because friction eliminates the reaction force"],
      answer: "A",
      correct_option: "Because they act on two different bodies",
      difficulty: "medium",
      global_id: 233,
      explanation: "Action-reaction pairs act on opposite interacting bodies (F_AB = -F_BA), never on the same isolated body."
    },
    {
      id: 14,
      question: "The kinetic friction force opposing sliding between two flat surfaces is modeled as:",
      options: ["f_k = μ_k · N", "f_k = μ_k / N", "f_k = μ_k · m · v", "f_k = 1/2 · μ_k · N²"],
      answer: "A",
      correct_option: "f_k = μ_k · N",
      difficulty: "easy",
      global_id: 234,
      explanation: "Amontons-Coulomb friction law states that friction is proportional to the normal contact force: f_k = μ_k N."
    },
    {
      id: 15,
      question: "If a ball bounces off a rigid floor with restitution e = 0.8 after falling from height h, its rebound height h' is:",
      options: ["h' = e² · h = 0.64 h", "h' = e · h = 0.80 h", "h' = 2e · h = 1.6 h", "h' = e³ · h = 0.512 h"],
      answer: "A",
      correct_option: "h' = e² · h = 0.64 h",
      difficulty: "hard",
      global_id: 235,
      explanation: "Impact speed is v = √(2gh). Rebound speed is v' = e·v. Rebound height is h' = v'² / (2g) = e²·v²/(2g) = e²·h = 0.64 h."
    },
    {
      id: 16,
      question: "In zero-gravity mode (g = 0 m/s²), what trajectory does a ball launched at 10 m/s follow inside the sandbox?",
      options: ["A straight line at constant velocity until colliding with a wall", "A downward parabolic arc", "An upward hyperbolic arc", "An immediate stationary freeze"],
      answer: "A",
      correct_option: "A straight line at constant velocity until colliding with a wall",
      difficulty: "easy",
      global_id: 236,
      explanation: "With g = 0 and no atmospheric drag, net vertical and horizontal forces are zero, producing unaccelerated rectilinear motion."
    },
    {
      id: 17,
      question: "When two identical billiard balls (m₁ = m₂) collide head-on elastically with the second ball initially at rest, what occurs?",
      options: ["The first ball stops completely and the second ball moves away with the initial velocity", "Both balls stick together and move at half speed", "Both balls bounce backwards at equal speeds", "The first ball speeds up while the second remains still"],
      answer: "A",
      correct_option: "The first ball stops completely and the second ball moves away with the initial velocity",
      difficulty: "medium",
      global_id: 237,
      explanation: "Equal masses in a 1D elastic collision completely exchange velocities: v₁f = 0 and v₂f = v₁i."
    },
    {
      id: 18,
      question: "What physical quantity does the mathematical slope of a velocity versus time graph represent?",
      options: ["Acceleration", "Total displacement", "Momentum", "Net work done"],
      answer: "A",
      correct_option: "Acceleration",
      difficulty: "easy",
      global_id: 238,
      explanation: "By definition, the time derivative of velocity is instantaneous acceleration: a = dv / dt."
    },
    {
      id: 19,
      question: "If gravity is switched from Earth (9.81 m/s²) to Moon (1.62 m/s²), a dropped object:",
      options: ["Accelerates downward ~6x slower, taking ~2.46x longer to reach the ground", "Falls at identical velocity", "Floats upwards indefinitely", "Loses all inertial mass"],
      answer: "A",
      correct_option: "Accelerates downward ~6x slower, taking ~2.46x longer to reach the ground",
      difficulty: "medium",
      global_id: 239,
      explanation: "Because fall time t = √(2h/g), reducing gravity by 6x increases fall time by √6 ≈ 2.46 times."
    },
    {
      id: 20,
      question: "In an inelastic collision, the kinetic energy that is lost is primarily converted into:",
      options: ["Internal thermal energy (heat), acoustic vibrations (sound), and structural deformation", "Gravitational mass", "Electrical potential voltage", "Cosmic radiation"],
      answer: "A",
      correct_option: "Internal thermal energy (heat), acoustic vibrations (sound), and structural deformation",
      difficulty: "easy",
      global_id: 240,
      explanation: "By the First Law of Thermodynamics, non-conserved macroscopic mechanical energy dissipates into microscopic internal heat, sound waves, and plastic deformation."
    }
,
    {
    "id": 21,
    "question": "What does the Work-Energy Theorem state for a rigid body moving in 2D space?",
    "options": [
        "The net work done by all external forces equals the change in kinetic energy (W_net = ΔKE)",
        "Net work done always equals zero",
        "Work is the time derivative of momentum",
        "Potential energy equals kinetic energy at all points"
    ],
    "answer": "A",
    "correct_option": "The net work done by all external forces equals the change in kinetic energy (W_net = ΔKE)",
    "difficulty": "easy",
    "global_id": 2051,
    "explanation": "W_net = ∫ F_net · dr = Δ(½ m v²). Work done on a body translates directly into a change in translational kinetic energy."
},
    {
    "id": 22,
    "question": "What is the formula for gravitational potential energy (PE) near a planetary surface of acceleration g?",
    "options": [
        "PE = m · g · h",
        "PE = ½ m · g · h²",
        "PE = m · g / h",
        "PE = m · v · g"
    ],
    "answer": "A",
    "correct_option": "PE = m · g · h",
    "difficulty": "easy",
    "global_id": 2052,
    "explanation": "Gravitational potential energy of an object at height h relative to a datum datum is PE = mgh."
},
    {
    "id": 23,
    "question": "If a body speed increases from 2.0 m/s to 6.0 m/s (3x increase), by what factor does its kinetic energy increase?",
    "options": [
        "9 times (since KE ∝ v²)",
        "3 times",
        "6 times",
        "12 times"
    ],
    "answer": "A",
    "correct_option": "9 times (since KE ∝ v²)",
    "difficulty": "easy",
    "global_id": 2053,
    "explanation": "Kinetic energy scales quadratically with speed: KE = ½ m v². Tripling the velocity increases KE by 3² = 9 times."
},
    {
    "id": 24,
    "question": "A constant horizontal thrust force of F = 50 N is applied to a mass of m = 10 kg on a frictionless surface. What is its acceleration?",
    "options": [
        "5.0 m/s²",
        "500 m/s²",
        "0.2 m/s²",
        "50 m/s²"
    ],
    "answer": "A",
    "correct_option": "5.0 m/s²",
    "difficulty": "easy",
    "global_id": 2054,
    "explanation": "a = F / m = 50 N / 10 kg = 5.0 m/s²."
},
    {
    "id": 25,
    "question": "An instantaneous impulse kick of J = 24 N·s is delivered to a stationary crate of mass m = 3.0 kg. What is its speed immediately following impact?",
    "options": [
        "8.0 m/s",
        "72 m/s",
        "0.125 m/s",
        "24 m/s"
    ],
    "answer": "A",
    "correct_option": "8.0 m/s",
    "difficulty": "easy",
    "global_id": 2055,
    "explanation": "J = Δp = m · Δv. Δv = J / m = 24 N·s / 3.0 kg = 8.0 m/s."
},
    {
    "id": 26,
    "question": "In a 1D elastic collision between two identical masses (m₁ = m₂), where m₂ is initially at rest, what happens after collision?",
    "options": [
        "m₁ stops completely and m₂ moves forward with the initial velocity of m₁",
        "Both masses stick together and move at half speed",
        "m₁ rebounds with half speed while m₂ stays at rest",
        "Both masses come to an immediate halt"
    ],
    "answer": "A",
    "correct_option": "m₁ stops completely and m₂ moves forward with the initial velocity of m₁",
    "difficulty": "medium",
    "global_id": 2056,
    "explanation": "In equal-mass 1D elastic collisions, bodies exchange velocities completely: v₁f = 0 and v₂f = v₁i."
},
    {
    "id": 27,
    "question": "Two identical 2 kg clay balls moving toward each other at 4 m/s collide and stick together in a completely inelastic collision. What is their final speed?",
    "options": [
        "0.0 m/s (they stop dead at center)",
        "4.0 m/s",
        "2.0 m/s",
        "8.0 m/s"
    ],
    "answer": "A",
    "correct_option": "0.0 m/s (they stop dead at center)",
    "difficulty": "easy",
    "global_id": 2057,
    "explanation": "Total initial momentum p_initial = (2)(4) + (2)(-4) = 0. Since momentum is conserved, v_final = 0 / 4 = 0 m/s."
},
    {
    "id": 28,
    "question": "What is the maximum static friction force f_s,max between a body and surface with static coefficient μ_s and normal force N?",
    "options": [
        "f_s,max = μ_s · N",
        "f_s,max = μ_s / N",
        "f_s,max = N / μ_s",
        "f_s,max = μ_s · m · v"
    ],
    "answer": "A",
    "correct_option": "f_s,max = μ_s · N",
    "difficulty": "easy",
    "global_id": 2058,
    "explanation": "Amontons-Coulomb law states that static friction opposes motion up to a maximum threshold f_s,max = μ_s · N."
},
    {
    "id": 29,
    "question": "For typical physical contact interfaces in Newtonian mechanics, how does the kinetic friction coefficient μ_k compare to the static coefficient μ_s?",
    "options": [
        "μ_k is less than μ_s (μ_k < μ_s)",
        "μ_k is always greater than μ_s",
        "μ_k is always exactly equal to μ_s",
        "μ_k is always zero"
    ],
    "answer": "A",
    "correct_option": "μ_k is less than μ_s (μ_k < μ_s)",
    "difficulty": "easy",
    "global_id": 2059,
    "explanation": "Once relative sliding begins, microscopic electrostatic asperities have less time to form cold bonds, so kinetic friction is typically lower than static friction."
},
    {
    "id": 30,
    "question": "On a flat horizontal plane, what is the normal force N exerted by the surface on a static crate of mass m under gravitational acceleration g?",
    "options": [
        "N = m · g",
        "N = m / g",
        "N = 0",
        "N = m · g · cos(45°)"
    ],
    "answer": "A",
    "correct_option": "N = m · g",
    "difficulty": "easy",
    "global_id": 2060,
    "explanation": "Vertical equilibrium ΣFy = 0 requires normal support force N to exactly balance downward gravity: N = mg."
},
    {
    "id": 31,
    "question": "On an incline of angle θ to the horizontal, what component of gravitational force pulls an object down along the ramp surface?",
    "options": [
        "F_parallel = m · g · sin(θ)",
        "F_parallel = m · g · cos(θ)",
        "F_parallel = m · g · tan(θ)",
        "F_parallel = m · g"
    ],
    "answer": "A",
    "correct_option": "F_parallel = m · g · sin(θ)",
    "difficulty": "medium",
    "global_id": 2061,
    "explanation": "Resolving gravity vector mg into components: perpendicular component is mg cos θ, and downslope parallel component is mg sin θ."
},
    {
    "id": 32,
    "question": "What is the normal reaction force N exerted on a crate of mass m sitting on an inclined plane of angle θ?",
    "options": [
        "N = m · g · cos(θ)",
        "N = m · g · sin(θ)",
        "N = m · g · tan(θ)",
        "N = m · g"
    ],
    "answer": "A",
    "correct_option": "N = m · g · cos(θ)",
    "difficulty": "easy",
    "global_id": 2062,
    "explanation": "Equilibrium perpendicular to the ramp surface yields N - mg cos θ = 0 ⟹ N = mg cos θ."
},
    {
    "id": 33,
    "question": "In a Zero-G physics environment (g = 0 m/s²), what path does an object follow when given an initial velocity v₀?",
    "options": [
        "A uniform straight-line trajectory at constant speed until colliding with a wall",
        "A downward parabolic trajectory",
        "A logarithmic circular spiral",
        "It decelerates to an immediate stop"
    ],
    "answer": "A",
    "correct_option": "A uniform straight-line trajectory at constant speed until colliding with a wall",
    "difficulty": "easy",
    "global_id": 2063,
    "explanation": "With g = 0 and no drag (F_net = 0), Newton First Law dictates uniform rectilinear motion: r(t) = r₀ + v₀ t."
},
    {
    "id": 34,
    "question": "Where is the center of mass (X_cm) located for two bodies of equal mass m situated at x₁ = 2.0 m and x₂ = 8.0 m?",
    "options": [
        "X_cm = 5.0 m",
        "X_cm = 4.0 m",
        "X_cm = 6.0 m",
        "X_cm = 10.0 m"
    ],
    "answer": "A",
    "correct_option": "X_cm = 5.0 m",
    "difficulty": "easy",
    "global_id": 2064,
    "explanation": "X_cm = (m·2 + m·8) / (2m) = 10m / 2m = 5.0 m."
},
    {
    "id": 35,
    "question": "What physical quantity represents rotational inertia in angular dynamics?",
    "options": [
        "Moment of Inertia (I)",
        "Torque (τ)",
        "Angular velocity (ω)",
        "Rotational impulse"
    ],
    "answer": "A",
    "correct_option": "Moment of Inertia (I)",
    "difficulty": "easy",
    "global_id": 2065,
    "explanation": "Moment of inertia I = Σ m_i r_i² quantifies an object resistance to rotational acceleration, serving as the rotational analog of mass."
},
    {
    "id": 36,
    "question": "What is the formula for the rotational kinetic energy of a rigid body rotating with angular speed ω about a principal axis?",
    "options": [
        "KE_rot = ½ I · ω²",
        "KE_rot = I · ω",
        "KE_rot = ½ m · ω²",
        "KE_rot = I² · ω"
    ],
    "answer": "A",
    "correct_option": "KE_rot = ½ I · ω²",
    "difficulty": "easy",
    "global_id": 2066,
    "explanation": "Rotational kinetic energy is defined as KE_rot = ½ I ω², directly analogous to translational kinetic energy KE_trans = ½ m v²."
},
    {
    "id": 37,
    "question": "Which of Newton laws guarantees that momentum is strictly conserved in internal two-body collisions?",
    "options": [
        "Newton Third Law (Action and Reaction forces are equal and opposite: F₁₂ = -F₂₁)",
        "Newton First Law only",
        "Law of Universal Gravitation",
        "Coulomb Law"
    ],
    "answer": "A",
    "correct_option": "Newton Third Law (Action and Reaction forces are equal and opposite: F₁₂ = -F₂₁)",
    "difficulty": "medium",
    "global_id": 2067,
    "explanation": "Because F₁₂ = -F₂₁, integrating over collision time yields J₁ = -J₂ ⟹ Δp₁ + Δp₂ = 0, proving conservation of total momentum."
},
    {
    "id": 38,
    "question": "What is the apparent weight reading of a person of mass 70 kg inside an elevator in free fall (a = g downward)?",
    "options": [
        "0 N (Apparent weightlessness)",
        "686 N",
        "1372 N",
        "343 N"
    ],
    "answer": "A",
    "correct_option": "0 N (Apparent weightlessness)",
    "difficulty": "easy",
    "global_id": 2068,
    "explanation": "N - mg = m(-g) ⟹ N = 0 N. In free fall, the support scale exerts zero normal force, producing apparent weightlessness."
},
    {
    "id": 39,
    "question": "What is the surface gravity of the Moon relative to Earth surface gravity (g = 9.81 m/s²)?",
    "options": [
        "~1.62 m/s² (about 1/6 of Earth gravity)",
        "~3.72 m/s²",
        "~9.81 m/s²",
        "~24.79 m/s²"
    ],
    "answer": "A",
    "correct_option": "~1.62 m/s² (about 1/6 of Earth gravity)",
    "difficulty": "easy",
    "global_id": 2069,
    "explanation": "Lunar surface gravity is approximately 1.62 m/s², roughly 16.5% (~1/6) of Earth standard gravity."
},
    {
    "id": 40,
    "question": "What is the surface gravity of Mars relative to Earth surface gravity?",
    "options": [
        "~3.72 m/s² (about 38% of Earth gravity)",
        "~1.62 m/s²",
        "~9.81 m/s²",
        "~0.00 m/s²"
    ],
    "answer": "A",
    "correct_option": "~3.72 m/s² (about 38% of Earth gravity)",
    "difficulty": "easy",
    "global_id": 2070,
    "explanation": "Martian surface gravity is approximately 3.72 m/s², approximately 38% of terrestrial gravity."
},
    {
    "id": 41,
    "question": "What is the surface gravity of Jupiter compared to Earth?",
    "options": [
        "~24.79 m/s² (about 2.53 times Earth gravity)",
        "~9.81 m/s²",
        "~1.62 m/s²",
        "~50.0 m/s²"
    ],
    "answer": "A",
    "correct_option": "~24.79 m/s² (about 2.53 times Earth gravity)",
    "difficulty": "easy",
    "global_id": 2071,
    "explanation": "Jupiter intense planetary mass produces a surface gravity of ~24.79 m/s², over 2.5 times that of Earth."
},
    {
    "id": 42,
    "question": "What is mechanical power defined as in physics?",
    "options": [
        "The rate at which work is done or energy transferred: P = dW / dt = F · v",
        "The total work done multiplied by time",
        "The momentum per unit area",
        "The potential energy divided by mass"
    ],
    "answer": "A",
    "correct_option": "The rate at which work is done or energy transferred: P = dW / dt = F · v",
    "difficulty": "easy",
    "global_id": 2072,
    "explanation": "Power P is the instantaneous rate of energy transfer: P = dW / dt = F · (dr/dt) = F · v."
},
    {
    "id": 43,
    "question": "A rocket engine exerts a thrust of 400 N on a vehicle traveling at 25 m/s. What mechanical power is being delivered?",
    "options": [
        "10,000 Watts (10 kW)",
        "16 Watts",
        "1,000 Watts",
        "425 Watts"
    ],
    "answer": "A",
    "correct_option": "10,000 Watts (10 kW)",
    "difficulty": "easy",
    "global_id": 2073,
    "explanation": "P = F · v = (400 N) × (25 m/s) = 10,000 W = 10 kW."
},
    {
    "id": 44,
    "question": "A superball with coefficient of restitution e = 0.80 impacts a rigid concrete floor at 15.0 m/s. What is its rebound velocity?",
    "options": [
        "12.0 m/s upwards",
        "15.0 m/s upwards",
        "9.6 m/s upwards",
        "0.0 m/s"
    ],
    "answer": "A",
    "correct_option": "12.0 m/s upwards",
    "difficulty": "medium",
    "global_id": 2074,
    "explanation": "v_rebound = e · v_impact = 0.80 × 15.0 m/s = 12.0 m/s."
},
    {
    "id": 45,
    "question": "What fraction of kinetic energy is retained after a collision against an immovable wall with coefficient of restitution e?",
    "options": [
        "e² (i.e. KE_f / KE_i = e²)",
        "e",
        "1 - e",
        "½ e²"
    ],
    "answer": "A",
    "correct_option": "e² (i.e. KE_f / KE_i = e²)",
    "difficulty": "medium",
    "global_id": 2075,
    "explanation": "KE_f = ½ m (e v_i)² = e² · (½ m v_i²) = e² · KE_i. For e = 0.8, 64% of kinetic energy is preserved."
},
    {
    "id": 46,
    "question": "In two-dimensional oblique collisions, along which direction is linear momentum conserved?",
    "options": [
        "Along both independent Cartesian axes (x-axis and y-axis independently)",
        "Only along the line of centers (normal direction)",
        "Only along the tangential plane",
        "Momentum is never conserved in 2D collisions"
    ],
    "answer": "A",
    "correct_option": "Along both independent Cartesian axes (x-axis and y-axis independently)",
    "difficulty": "medium",
    "global_id": 2076,
    "explanation": "Because momentum is a vector quantity (p = m·v), conservation applies independently to each orthogonal component: Σpx_i = Σpx_f and Σpy_i = Σpy_f."
},
    {
    "id": 47,
    "question": "What happens to a sliding crate entering a region with kinetic friction coefficient μ_k under gravity g?",
    "options": [
        "It decelerates with constant acceleration a = -μ_k · g until stopping",
        "It accelerates forward",
        "It maintains constant velocity",
        "It floats upwards"
    ],
    "answer": "A",
    "correct_option": "It decelerates with constant acceleration a = -μ_k · g until stopping",
    "difficulty": "easy",
    "global_id": 2077,
    "explanation": "Friction force f_k = μ_k · N = μ_k · m · g. Acceleration a = -f_k / m = -μ_k · g."
},
    {
    "id": 48,
    "question": "If two masses m₁ = 2.0 kg and m₂ = 8.0 kg experience the identical net thrust force F, what is the ratio of their accelerations a₁ / a₂?",
    "options": [
        "4.0 (a₁ is 4x greater than a₂)",
        "0.25",
        "1.0",
        "16.0"
    ],
    "answer": "A",
    "correct_option": "4.0 (a₁ is 4x greater than a₂)",
    "difficulty": "easy",
    "global_id": 2078,
    "explanation": "a = F / m. Therefore a₁ / a₂ = (F / m₁) / (F / m₂) = m₂ / m₁ = 8.0 / 2.0 = 4.0."
},
    {
    "id": 49,
    "question": "What are the SI base units of linear momentum and mechanical impulse?",
    "options": [
        "kg · m / s (equivalent to N · s)",
        "kg · m² / s²",
        "kg / (m · s)",
        "N / s"
    ],
    "answer": "A",
    "correct_option": "kg · m / s (equivalent to N · s)",
    "difficulty": "easy",
    "global_id": 2079,
    "explanation": "Momentum p = mv has units kg·(m/s). Impulse J = F·Δt has units N·s = (kg·m/s²)·s = kg·m/s."
},
    {
    "id": 50,
    "question": "In rigid-body physics simulation (such as Matter.js), why are multiple constraint iterations performed per animation frame?",
    "options": [
        "To accurately resolve overlapping contact manifolds and satisfy momentum conservation without visual penetration",
        "To generate random colors for objects",
        "To save memory on the GPU",
        "To synchronize system clocks with UTC"
    ],
    "answer": "A",
    "correct_option": "To accurately resolve overlapping contact manifolds and satisfy momentum conservation without visual penetration",
    "difficulty": "hard",
    "global_id": 2080,
    "explanation": "Iterative impulse solvers (Sequential Impulses) iteratively project velocity and position constraints to solve resting contacts and collision responses accurately without sinking or exploding."
}
  ]
};

/**
 * Fisher-Yates pure randomization shuffle algorithm
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


export const POF_ATTENUATION_QUESTION_BANK = {
  title: "Plastic Optical Fiber Attenuation - Question Bank",
  experimentId: "pof-attenuation",
  quizId: "pof-attenuation-mastery-quiz",
  experimentName: "Plastic Optical Fiber Attenuation Experiment",
  total_questions: 50,
  questions: [
  {
    "id": 1,
    "question": "What does optical fiber attenuation measure?",
    "options": [
      "The reduction or loss of optical signal power as light travels through the fiber",
      "The increase in wavelength of the light beam",
      "The change in core diameter of the optical cable",
      "The velocity increase of photons inside the waveguide"
    ],
    "answer": "A",
    "correct_option": "The reduction or loss of optical signal power as light travels through the fiber",
    "difficulty": "easy",
    "global_id": 271,
    "explanation": "Attenuation is the physical attenuation (decay) of optical power along an optical fiber due to absorption, scattering, and radiative losses."
  },
  {
    "id": 2,
    "question": "Which mathematical formula defines the total optical power attenuation (A_dB) in decibels?",
    "options": [
      "A_dB = 10 · log10(P_in / P_out)",
      "A_dB = 20 · log10(P_out / P_in)",
      "A_dB = 10 · ln(P_out / P_in)",
      "A_dB = (P_in - P_out) / 10"
    ],
    "answer": "A",
    "correct_option": "A_dB = 10 · log10(P_in / P_out)",
    "difficulty": "easy",
    "global_id": 272,
    "explanation": "Decibel power attenuation is defined as A_dB = 10 · log10(P_in / P_out), expressing the ratio of input power to output power on a logarithmic scale."
  },
  {
    "id": 3,
    "question": "How is the attenuation coefficient (α) per unit length calculated from total attenuation A_dB and fiber length L?",
    "options": [
      "α = A_dB / L",
      "α = A_dB · L",
      "α = L / A_dB",
      "α = √(A_dB · L)"
    ],
    "answer": "A",
    "correct_option": "α = A_dB / L",
    "difficulty": "easy",
    "global_id": 273,
    "explanation": "The attenuation coefficient α represents the loss normalized per unit distance: α = A_dB / L (expressed in dB/km or dB/m)."
  },
  {
    "id": 4,
    "question": "When fiber length is measured in metres (L_m), how is the attenuation coefficient α in dB/km expressed?",
    "options": [
      "α = (1000 / L_m) · 10 · log10(P_in / P_out)",
      "α = (L_m / 1000) · 10 · log10(P_in / P_out)",
      "α = (1 / L_m) · 10 · log10(P_in / P_out)",
      "α = 1000 · (P_in / P_out)"
    ],
    "answer": "A",
    "correct_option": "α = (1000 / L_m) · 10 · log10(P_in / P_out)",
    "difficulty": "medium",
    "global_id": 274,
    "explanation": "Because L_km = L_m / 1000, α_dB/km = A_dB / L_km = (1000 / L_m) · 10 · log10(P_in / P_out)."
  },
  {
    "id": 5,
    "question": "What is the core material of standard Plastic Optical Fiber (POF)?",
    "options": [
      "Polymethyl methacrylate (PMMA)",
      "Pure fused silica glass (SiO2)",
      "Gallium arsenide (GaAs)",
      "Silicon carbide (SiC)"
    ],
    "answer": "A",
    "correct_option": "Polymethyl methacrylate (PMMA)",
    "difficulty": "easy",
    "global_id": 275,
    "explanation": "Standard step-index POF utilizes polymethyl methacrylate (PMMA, acrylic) as its flexible, high-transparency core."
  },
  {
    "id": 6,
    "question": "What is the primary transmission window commonly used for PMMA-based Plastic Optical Fiber?",
    "options": [
      "Visible red light (~650 nm)",
      "Ultraviolet light (~250 nm)",
      "Long-wave infrared (~10.6 μm)",
      "Near-infrared telecom band (1550 nm)"
    ],
    "answer": "A",
    "correct_option": "Visible red light (~650 nm)",
    "difficulty": "medium",
    "global_id": 276,
    "explanation": "PMMA polymer fibers exhibit an optical transmission window in the visible spectrum around 650 nm (red), where absorption minima occur."
  },
  {
    "id": 7,
    "question": "Under the Bouguer-Lambert-Beer law, how does optical power P_out decay with fiber length L for distributed loss α?",
    "options": [
      "P_out = P_in · 10^(-α · L / 10)",
      "P_out = P_in - α · L",
      "P_out = P_in / (1 + α · L)",
      "P_out = P_in · (α · L)^2"
    ],
    "answer": "A",
    "correct_option": "P_out = P_in · 10^(-α · L / 10)",
    "difficulty": "medium",
    "global_id": 277,
    "explanation": "Optical power undergoes exponential attenuation with propagation distance: P_out = P_in · 10^(-αL/10), matching the linear rate equation dP/dz = -α_p P."
  },
  {
    "id": 8,
    "question": "Why must input power (P_in) and output power (P_out) be measured in the same units before computing attenuation?",
    "options": [
      "Because decibel loss is derived from a dimensionless power ratio",
      "Because conversion to decibels is only possible for milliwatts",
      "Because optical detectors only support one electrical unit at a time",
      "Because powers must add up to 100%"
    ],
    "answer": "A",
    "correct_option": "Because decibel loss is derived from a dimensionless power ratio",
    "difficulty": "easy",
    "global_id": 278,
    "explanation": "The argument of the logarithm (P_in / P_out) must be a dimensionless ratio; mixing mW and μW would introduce a 1000-fold error (+30 dB)."
  },
  {
    "id": 9,
    "question": "What is Rayleigh scattering in plastic optical fibers caused by?",
    "options": [
      "Microscopic density and refractive index fluctuations in the polymer matrix",
      "Bending of the outer cable jacket",
      "Total reflection at the metallic bench rail",
      "Thermal expansion of the copper connectors"
    ],
    "answer": "A",
    "correct_option": "Microscopic density and refractive index fluctuations in the polymer matrix",
    "difficulty": "medium",
    "global_id": 279,
    "explanation": "Rayleigh scattering results from microscopic, sub-wavelength density fluctuations frozen into the amorphous polymer during manufacturing."
  },
  {
    "id": 10,
    "question": "How does Rayleigh scattering loss depend on the optical wavelength (λ)?",
    "options": [
      "It is proportional to 1 / λ⁴",
      "It is proportional to λ²",
      "It is linearly proportional to λ",
      "It is independent of wavelength"
    ],
    "answer": "A",
    "correct_option": "It is proportional to 1 / λ⁴",
    "difficulty": "medium",
    "global_id": 280,
    "explanation": "Rayleigh scattering cross-section varies inversely with the fourth power of wavelength (1/λ⁴), resulting in much stronger scattering at shorter wavelengths."
  },
  {
    "id": 11,
    "question": "What causes the strong infrared absorption bands in PMMA plastic optical fiber?",
    "options": [
      "Vibrational overtones and harmonics of carbon-hydrogen (C-H) molecular bonds",
      "Electronic band transitions in silicon crystals",
      "Conductance band electron scattering in copper",
      "Magnetic dipole moments in the cladding"
    ],
    "answer": "A",
    "correct_option": "Vibrational overtones and harmonics of carbon-hydrogen (C-H) molecular bonds",
    "difficulty": "hard",
    "global_id": 281,
    "explanation": "C-H stretching vibration fundamentals and high-order overtones in PMMA create strong intrinsic absorption bands in the infrared region (>700 nm)."
  },
  {
    "id": 12,
    "question": "What is macrobending loss in an optical fiber?",
    "options": [
      "Radiative loss caused by curving the fiber below its permissible bend radius",
      "Scattering from nanoscale core bubbles",
      "Loss due to cable length being too long",
      "Attenuation caused by thermal ambient changes"
    ],
    "answer": "A",
    "correct_option": "Radiative loss caused by curving the fiber below its permissible bend radius",
    "difficulty": "medium",
    "global_id": 282,
    "explanation": "Macrobending occurs when the fiber is curved with a macroscopic radius such that the angle of incidence at the outer core-cladding boundary falls below the critical angle, radiating light into the cladding."
  },
  {
    "id": 13,
    "question": "What is microbending loss in an optical fiber?",
    "options": [
      "Loss caused by microscopic localized lateral deformations and axial stress along the core-cladding boundary",
      "Reflection off the power meter LCD screen",
      "Dispersion caused by multiple optical modes",
      "Signal loss from slow photodetector response"
    ],
    "answer": "A",
    "correct_option": "Loss caused by microscopic localized lateral deformations and axial stress along the core-cladding boundary",
    "difficulty": "medium",
    "global_id": 283,
    "explanation": "Microbending arises from microscopic repetitive mechanical imperfections, surface roughness, or lateral pinching that couple guided modes into radiating cladding modes."
  },
  {
    "id": 14,
    "question": "What typical attenuation coefficient (α) is expected for standard PMMA step-index POF at 650 nm?",
    "options": [
      "Approximately 150 to 200 dB/km (0.15 to 0.20 dB/m)",
      "Approximately 0.2 dB/km (0.0002 dB/m)",
      "Approximately 15,000 dB/km (15 dB/m)",
      "0.00 dB/km (Lossless)"
    ],
    "answer": "A",
    "correct_option": "Approximately 150 to 200 dB/km (0.15 to 0.20 dB/m)",
    "difficulty": "medium",
    "global_id": 284,
    "explanation": "Standard PMMA step-index POF has an attenuation of ~150-200 dB/km at 650 nm, which is around 0.15-0.20 dB per metre."
  },
  {
    "id": 15,
    "question": "If input power P_in = 3.00 mW and output power P_out = 1.50 mW, what is the total attenuation in decibels?",
    "options": [
      "~3.01 dB",
      "~6.02 dB",
      "~1.50 dB",
      "~10.00 dB"
    ],
    "answer": "A",
    "correct_option": "~3.01 dB",
    "difficulty": "easy",
    "global_id": 285,
    "explanation": "A_dB = 10 · log10(3.00 / 1.50) = 10 · log10(2) ≈ 10 · 0.30103 = 3.01 dB (halving of power corresponds to 3 dB loss)."
  },
  {
    "id": 16,
    "question": "If input power P_in = 3.00 mW and output power P_out = 0.30 mW, what is the total attenuation in decibels?",
    "options": [
      "10.00 dB",
      "1.00 dB",
      "20.00 dB",
      "3.00 dB"
    ],
    "answer": "A",
    "correct_option": "10.00 dB",
    "difficulty": "easy",
    "global_id": 286,
    "explanation": "A_dB = 10 · log10(3.00 / 0.30) = 10 · log10(10) = 10 · 1 = 10.00 dB."
  },
  {
    "id": 17,
    "question": "If a 10.0 m optical fiber has a total attenuation of 1.80 dB, what is its attenuation coefficient in dB/km?",
    "options": [
      "180 dB/km",
      "18 dB/km",
      "1.8 dB/km",
      "1800 dB/km"
    ],
    "answer": "A",
    "correct_option": "180 dB/km",
    "difficulty": "easy",
    "global_id": 287,
    "explanation": "L_km = 10.0 / 1000 = 0.01 km. α = 1.80 dB / 0.01 km = 180 dB/km."
  },
  {
    "id": 18,
    "question": "What is the purpose of measuring reference power (P_in) before measuring the fiber output?",
    "options": [
      "To establish a baseline coupled source power against which transmission loss is evaluated",
      "To calibrate the physical guide rail ruler scale",
      "To check whether the room ambient lighting is off",
      "To determine the focal length of the detector lens"
    ],
    "answer": "A",
    "correct_option": "To establish a baseline coupled source power against which transmission loss is evaluated",
    "difficulty": "easy",
    "global_id": 288,
    "explanation": "Measuring P_in directly from the source or calibrated reference patch provides the known input power necessary to compute the decibel attenuation ratio."
  },
  {
    "id": 19,
    "question": "What happens to the Optical Power Meter reading when the optical source is switched OFF?",
    "options": [
      "It reads zero (or subtle instrument dark noise floor)",
      "It retains its previous measurement indefinitely",
      "It displays 100 mW automatically",
      "It shows Infinity (∞)"
    ],
    "answer": "A",
    "correct_option": "It reads zero (or subtle instrument dark noise floor)",
    "difficulty": "easy",
    "global_id": 289,
    "explanation": "With the light source de-energized, no optical photons strike the photodetector, yielding 0.00 mW (aside from negligible dark current)."
  },
  {
    "id": 20,
    "question": "What happens to the power meter reading when the optical fiber is disconnected on the bench?",
    "options": [
      "No light reaches the detector, producing zero measured output power",
      "The meter reading increases due to free space propagation",
      "The meter switches automatically into laser mode",
      "The meter calculates negative decibels"
    ],
    "answer": "A",
    "correct_option": "No light reaches the detector, producing zero measured output power",
    "difficulty": "easy",
    "global_id": 290,
    "explanation": "Disconnecting the fiber breaks the waveguide path, preventing source photons from arriving at the detector."
  },
  {
    "id": 21,
    "question": "Why should an optical transmitter be allowed to stabilize (warm up) prior to taking readings?",
    "options": [
      "To ensure stable optical power output and eliminate semiconductor thermal drift",
      "To allow the plastic optical fiber to melt slightly for better coupling",
      "To discharge static electricity on the optical bench rails",
      "To let the room reach ambient equilibrium"
    ],
    "answer": "A",
    "correct_option": "To ensure stable optical power output and eliminate semiconductor thermal drift",
    "difficulty": "medium",
    "global_id": 291,
    "explanation": "Semiconductor LED/laser junctions undergo thermal shift during initial turn-on; warm-up ensures steady forward current and constant optical emission."
  },
  {
    "id": 22,
    "question": "What type of curve is observed when plotting measured output power P_out against fiber length L on linear axes?",
    "options": [
      "An exponentially decaying downward curve",
      "A straight horizontal line",
      "A strictly linear ascending slope",
      "A sinusoidal oscillation"
    ],
    "answer": "A",
    "correct_option": "An exponentially decaying downward curve",
    "difficulty": "medium",
    "global_id": 292,
    "explanation": "Because P_out = P_in · 10^(-αL/10), plotting power vs length on linear axes produces an exponential decay curve."
  },
  {
    "id": 23,
    "question": "What type of relationship is observed when plotting total decibel attenuation (A_dB) against fiber length L?",
    "options": [
      "A linear relationship whose slope is the attenuation coefficient (α)",
      "An exponential curve bending upward rapidly",
      "A parabolic parabola with vertex at zero",
      "An inverse hyperbola asymptotically approaching zero"
    ],
    "answer": "A",
    "correct_option": "A linear relationship whose slope is the attenuation coefficient (α)",
    "difficulty": "medium",
    "global_id": 293,
    "explanation": "Since A_dB = α · L, total decibel loss is directly proportional to length, producing a straight line whose slope d(A)/dL = α."
  },
  {
    "id": 24,
    "question": "What is Fresnel reflection loss at the cleaved fiber end-facet?",
    "options": [
      "Reflective loss caused by refractive index discontinuity between air (n≈1.0) and the polymer core (n≈1.49)",
      "Scattering from impurities inside the optical detector silicon",
      "Absorption by water vapour in the laboratory room",
      "Loss caused by mechanical vibration of the optical bench"
    ],
    "answer": "A",
    "correct_option": "Reflective loss caused by refractive index discontinuity between air (n≈1.0) and the polymer core (n≈1.49)",
    "difficulty": "hard",
    "global_id": 294,
    "explanation": "At normal incidence, reflection R = [(n1 - n0) / (n1 + n0)]² ≈ [(1.49 - 1) / (1.49 + 1)]² ≈ 3.9% (~0.17 dB loss per facet) due to index mismatch."
  },
  {
    "id": 25,
    "question": "Why does lateral or angular misalignment of the input coupler degrade transmission?",
    "options": [
      "It reduces coupling efficiency, as fewer incident rays fall within the fiber acceptance cone",
      "It permanently alters the refractive index of the cladding",
      "It shifts the laser emission wavelength to infrared",
      "It increases electrical resistance of the power meter leads"
    ],
    "answer": "A",
    "correct_option": "It reduces coupling efficiency, as fewer incident rays fall within the fiber acceptance cone",
    "difficulty": "medium",
    "global_id": 295,
    "explanation": "Misalignment causes rays to strike outside the fiber core area or at angles exceeding the acceptance cone (θ > θ_a), failing total internal reflection."
  },
  {
    "id": 26,
    "question": "How does dirt, dust, or fingerprints on the optical fiber facet affect the measurement?",
    "options": [
      "They cause localized optical scattering and severe insertion loss",
      "They decrease optical attenuation across the link",
      "They transform multimode fiber into singlemode fiber",
      "They have zero effect because polymer is immune to contamination"
    ],
    "answer": "A",
    "correct_option": "They cause localized optical scattering and severe insertion loss",
    "difficulty": "easy",
    "global_id": 296,
    "explanation": "Contaminants on the core face scatter and absorb light, introducing artificial extrinsic loss and corrupting baseline measurements."
  },
  {
    "id": 27,
    "question": "What is the typical core diameter of standard step-index plastic optical fiber compared to silica singlemode fiber?",
    "options": [
      "POF core is very large (~980 μm to 1000 μm), whereas singlemode silica is ~9 μm",
      "POF core is tiny (~1 μm), whereas silica is ~1 mm",
      "Both cores are identically 50 μm",
      "POF has no core, only cladding"
    ],
    "answer": "A",
    "correct_option": "POF core is very large (~980 μm to 1000 μm), whereas singlemode silica is ~9 μm",
    "difficulty": "medium",
    "global_id": 297,
    "explanation": "Standard step-index POF has an enormous 1 mm outer diameter with a ~980 μm core, making alignment easy with visible light."
  },
  {
    "id": 28,
    "question": "What is a key advantage of POF's large core diameter in laboratory experiments?",
    "options": [
      "High coupling tolerance and easy mechanical alignment without sub-micron positioning equipment",
      "Near-zero attenuation below 0.01 dB/km",
      "Ability to transmit terahertz radio waves",
      "Immunity to all forms of macrobending"
    ],
    "answer": "A",
    "correct_option": "High coupling tolerance and easy mechanical alignment without sub-micron positioning equipment",
    "difficulty": "easy",
    "global_id": 298,
    "explanation": "With a ~1 mm core, light can be coupled efficiently with inexpensive connectors and relaxed alignment tolerances."
  },
  {
    "id": 29,
    "question": "If a student records P_in = 2.50 mW and P_out = 2.50 mW for an ideal 0 m link, what is total attenuation?",
    "options": [
      "0.00 dB",
      "1.00 dB",
      "10.00 dB",
      "Undefined"
    ],
    "answer": "A",
    "correct_option": "0.00 dB",
    "difficulty": "easy",
    "global_id": 299,
    "explanation": "A_dB = 10 · log10(2.50 / 2.50) = 10 · log10(1) = 0.00 dB (zero attenuation corresponds to unity power transmission)."
  },
  {
    "id": 30,
    "question": "If 10% of input power is lost during propagation (so P_out = 0.90 · P_in), what is the total attenuation?",
    "options": [
      "~0.46 dB",
      "~1.00 dB",
      "~10.00 dB",
      "~4.60 dB"
    ],
    "answer": "A",
    "correct_option": "~0.46 dB",
    "difficulty": "medium",
    "global_id": 300,
    "explanation": "A_dB = 10 · log10(1 / 0.90) = 10 · log10(1.111) ≈ 10 · 0.04576 = 0.46 dB."
  },
  {
    "id": 31,
    "question": "If 90% of input power is lost during propagation (so P_out = 0.10 · P_in), what is the total attenuation?",
    "options": [
      "10.0 dB",
      "9.0 dB",
      "90.0 dB",
      "1.0 dB"
    ],
    "answer": "A",
    "correct_option": "10.0 dB",
    "difficulty": "easy",
    "global_id": 301,
    "explanation": "A_dB = 10 · log10(1 / 0.10) = 10 · log10(10) = 10.0 dB."
  },
  {
    "id": 32,
    "question": "If 99% of input power is lost during propagation (P_out = 0.01 · P_in), what is the total attenuation?",
    "options": [
      "20.0 dB",
      "99.0 dB",
      "2.0 dB",
      "40.0 dB"
    ],
    "answer": "A",
    "correct_option": "20.0 dB",
    "difficulty": "easy",
    "global_id": 302,
    "explanation": "A_dB = 10 · log10(1 / 0.01) = 10 · log10(100) = 10 · 2 = 20.0 dB."
  },
  {
    "id": 33,
    "question": "What is the primary trade-off of Plastic Optical Fiber compared to Silica Glass Optical Fiber?",
    "options": [
      "POF has much higher attenuation (~180 dB/km vs ~0.2 dB/km) but offers superior flexibility, ruggedness, and low installation cost",
      "POF is much more brittle and shatters upon touch",
      "POF cannot guide visible light wavelengths",
      "POF requires cryogenic cooling to operate"
    ],
    "answer": "A",
    "correct_option": "POF has much higher attenuation (~180 dB/km vs ~0.2 dB/km) but offers superior flexibility, ruggedness, and low installation cost",
    "difficulty": "medium",
    "global_id": 303,
    "explanation": "While silica fiber has ultra-low loss (~0.2 dB/km at 1550 nm) for long-haul networks, POF's higher loss restricts it to short-distance links (<100 m) where mechanical toughness is key."
  },
  {
    "id": 34,
    "question": "How does the cutback method determine fiber attenuation in professional laboratory practice?",
    "options": [
      "By measuring output power, cutting the fiber back to a short reference length, and taking the ratio of measured powers without disturbing input coupling",
      "By slicing the fiber horizontally to observe core cross-section under an electron microscope",
      "By increasing laser voltage until the fiber burns back",
      "By measuring reflection while cutting off the power supply"
    ],
    "answer": "A",
    "correct_option": "By measuring output power, cutting the fiber back to a short reference length, and taking the ratio of measured powers without disturbing input coupling",
    "difficulty": "hard",
    "global_id": 304,
    "explanation": "The cutback method measures long-length power P2, then cuts back to short reference length L1 (measuring P1) without changing input launch conditions, yielding α = [10/(L2-L1)] log10(P1/P2)."
  },
  {
    "id": 35,
    "question": "Why is the cutback technique effective at eliminating connector and coupling loss errors?",
    "options": [
      "Because input coupling conditions remain strictly unchanged between long and short measurements",
      "Because it cools the fiber down to absolute zero",
      "Because cutting the fiber eliminates all internal Rayleigh scattering",
      "Because it converts multimode light into singlemode light"
    ],
    "answer": "A",
    "correct_option": "Because input coupling conditions remain strictly unchanged between long and short measurements",
    "difficulty": "hard",
    "global_id": 305,
    "explanation": "Since the input launch coupling chuck is untouched, input coupling efficiency η_in is identical in both measurements and cancels out in the power ratio."
  },
  {
    "id": 36,
    "question": "What physical unit is used to express optical power in the digital meter?",
    "options": [
      "Milliwatts (mW) or Microwatts (μW)",
      "Volts (V) or Amperes (A)",
      "Joules per second squared (J/s²)",
      "Pascals (Pa)"
    ],
    "answer": "A",
    "correct_option": "Milliwatts (mW) or Microwatts (μW)",
    "difficulty": "easy",
    "global_id": 306,
    "explanation": "Optical power is the time rate of radiant optical energy transfer, measured in milliwatts (mW) or microwatts (μW), or in logarithmic dBm."
  },
  {
    "id": 37,
    "question": "How is optical power in milliwatts (mW) related to microwatts (μW)?",
    "options": [
      "1 mW = 1000 μW",
      "1 mW = 0.001 μW",
      "1 mW = 100 μW",
      "1 mW = 1,000,000 μW"
    ],
    "answer": "A",
    "correct_option": "1 mW = 1000 μW",
    "difficulty": "easy",
    "global_id": 307,
    "explanation": "Milli means 10⁻³ and micro means 10⁻⁶; thus, 1 mW = 1000 μW."
  },
  {
    "id": 38,
    "question": "If a power meter reads 450 μW, what is the equivalent power in mW?",
    "options": [
      "0.450 mW",
      "4.500 mW",
      "45.00 mW",
      "0.045 mW"
    ],
    "answer": "A",
    "correct_option": "0.450 mW",
    "difficulty": "easy",
    "global_id": 308,
    "explanation": "450 μW / 1000 = 0.450 mW."
  },
  {
    "id": 39,
    "question": "How is optical power expressed in dBm related to power in milliwatts (P_mW)?",
    "options": [
      "P_dBm = 10 · log10(P_mW / 1 mW)",
      "P_dBm = 20 · log10(P_mW)",
      "P_dBm = P_mW · 10",
      "P_dBm = ln(P_mW)"
    ],
    "answer": "A",
    "correct_option": "P_dBm = 10 · log10(P_mW / 1 mW)",
    "difficulty": "medium",
    "global_id": 309,
    "explanation": "dBm is decibels referenced to 1 milliwatt: P_dBm = 10 · log10(P_mW / 1 mW). For example, 1 mW = 0 dBm."
  },
  {
    "id": 40,
    "question": "What is 0 dBm in milliwatts?",
    "options": [
      "1.0 mW",
      "0.0 mW",
      "10.0 mW",
      "0.1 mW"
    ],
    "answer": "A",
    "correct_option": "1.0 mW",
    "difficulty": "easy",
    "global_id": 310,
    "explanation": "By definition, 0 dBm corresponds to 1.0 mW (10 · log10(1.0) = 0 dBm)."
  },
  {
    "id": 41,
    "question": "If an input power is +3 dBm and output power is 0 dBm, what is the link attenuation in dB?",
    "options": [
      "3 dB",
      "0 dB",
      "-3 dB",
      "1 dB"
    ],
    "answer": "A",
    "correct_option": "3 dB",
    "difficulty": "easy",
    "global_id": 311,
    "explanation": "Attenuation in dB is the difference between input and output levels in dBm: A = P_in(dBm) - P_out(dBm) = 3 dBm - 0 dBm = 3 dB."
  },
  {
    "id": 42,
    "question": "Why does bending a plastic fiber into a tight loop (small radius of curvature) increase attenuation?",
    "options": [
      "Guided rays strike the core-cladding boundary at angles steeper than the critical angle and escape as radiation loss",
      "The copper core experiences work hardening and increased resistance",
      "The wavelength of light shifts into the ultraviolet regime",
      "The speed of light inside the core drops to zero"
    ],
    "answer": "A",
    "correct_option": "Guided rays strike the core-cladding boundary at angles steeper than the critical angle and escape as radiation loss",
    "difficulty": "medium",
    "global_id": 312,
    "explanation": "Tight curvature alters the local boundary orientation so rays exceed the critical angle (θ < θ_c), refracting into the cladding as radiative macrobending loss."
  },
  {
    "id": 43,
    "question": "What role does the cladding layer play in reducing attenuation in optical fibers?",
    "options": [
      "It provides a lower refractive index boundary (n2 < n1) enabling total internal reflection while protecting the core from surface contamination",
      "It amplifies light through stimulated emission",
      "It filters out red wavelengths to only pass infrared",
      "It acts as an electrical ground plane"
    ],
    "answer": "A",
    "correct_option": "It provides a lower refractive index boundary (n2 < n1) enabling total internal reflection while protecting the core from surface contamination",
    "difficulty": "medium",
    "global_id": 313,
    "explanation": "The lower-index cladding (n2 < n1) establishes the boundary for total internal reflection and isolates the evanescent optical field from dirt and moisture."
  },
  {
    "id": 44,
    "question": "In a laboratory experiment, if a student forgets to switch ON the optical transmitter, what will the power meter indicate?",
    "options": [
      "0.00 mW (No optical signal reaching the sensor)",
      "Maximum scale deflection (Overload)",
      "5.00 mW automatically",
      "Negative infinity (-∞)"
    ],
    "answer": "A",
    "correct_option": "0.00 mW (No optical signal reaching the sensor)",
    "difficulty": "easy",
    "global_id": 314,
    "explanation": "Without light emission from the transmitter, the photodetector generates zero photocurrent, reading 0.00 mW."
  },
  {
    "id": 45,
    "question": "If measured output powers are 2.88 mW (at 1 m) and 2.44 mW (at 5 m) for P_in = 3.00 mW, what trend is verified?",
    "options": [
      "Transmitted optical power decreases monotonically as fiber length increases",
      "Transmitted power is completely independent of length",
      "Optical power increases over distance",
      "The fiber generates optical power from ambient heat"
    ],
    "answer": "A",
    "correct_option": "Transmitted optical power decreases monotonically as fiber length increases",
    "difficulty": "easy",
    "global_id": 315,
    "explanation": "As propagation length increases, cumulative absorption and scattering losses increase, causing monotonic decrease in transmitted power."
  },
  {
    "id": 46,
    "question": "What is the numerical aperture (NA) of standard step-index POF typically around?",
    "options": [
      "High NA (~0.45 to 0.50), providing a wide acceptance angle (θ_a ≈ 27° to 30°)",
      "Extremely low NA (~0.05)",
      "Zero NA",
      "Infinite NA"
    ],
    "answer": "A",
    "correct_option": "High NA (~0.45 to 0.50), providing a wide acceptance angle (θ_a ≈ 27° to 30°)",
    "difficulty": "medium",
    "global_id": 316,
    "explanation": "Standard PMMA POF features a high index contrast (n1 ≈ 1.492, n2 ≈ 1.402), yielding a large NA ≈ 0.50 and wide acceptance cone."
  },
  {
    "id": 47,
    "question": "How does the large numerical aperture of POF affect coupling efficiency from an LED source?",
    "options": [
      "It significantly improves coupling efficiency because the wide acceptance cone captures a large fraction of diverging LED rays",
      "It prevents any LED rays from entering the core",
      "It converts the LED into a monochromatic laser",
      "It reduces output power by 90%"
    ],
    "answer": "A",
    "correct_option": "It significantly improves coupling efficiency because the wide acceptance cone captures a large fraction of diverging LED rays",
    "difficulty": "medium",
    "global_id": 317,
    "explanation": "A high NA (0.50) creates an acceptance cone of ~60° full angle, capturing substantial radiant flux from divergent surface-emitting LEDs."
  },
  {
    "id": 48,
    "question": "What is an important precaution when handling plastic optical fibers in an undergraduate physics lab?",
    "options": [
      "Avoid sharp kinks or bending below minimum bend radius, and keep connector end facets clean",
      "Never expose the outer jacket to visible room lighting",
      "Always submerge the cable in water before powering the laser",
      "Connect the fiber only when power supply is set to 220 V AC"
    ],
    "answer": "A",
    "correct_option": "Avoid sharp kinks or bending below minimum bend radius, and keep connector end facets clean",
    "difficulty": "easy",
    "global_id": 318,
    "explanation": "Sharp bends induce permanent mechanical crazing and radiation loss, while dirty facets degrade coupling efficiency."
  },
  {
    "id": 49,
    "question": "If linear regression of A_dB against L (in metres) yields a slope m = 0.180 dB/m, what is the attenuation coefficient in dB/km?",
    "options": [
      "180 dB/km",
      "18 dB/km",
      "1.8 dB/km",
      "0.18 dB/km"
    ],
    "answer": "A",
    "correct_option": "180 dB/km",
    "difficulty": "easy",
    "global_id": 319,
    "explanation": "Since 1 km = 1000 m, α_dB/km = slope_dB/m · 1000 = 0.180 · 1000 = 180 dB/km."
  },
  {
    "id": 50,
    "question": "In optical engineering, why is decibels (dB) preferred over percentage transmission for cascaded links?",
    "options": [
      "Because decibel losses of successive components add linearly instead of multiplying",
      "Because decibels eliminate all physical loss",
      "Because decibels work only with integer numbers",
      "Because percentage cannot exceed 50%"
    ],
    "answer": "A",
    "correct_option": "Because decibel losses of successive components add linearly instead of multiplying",
    "difficulty": "medium",
    "global_id": 320,
    "explanation": "In decibels, total loss A_total = A_fiber + A_coupler + A_splice (addition of dB terms instead of multiplying fractional transmission factors)."
  }
]
};

export function generateRandom10QuestionQuiz(expId = "projectile") {
  let bank = PROJECTILE_QUESTION_BANK;
  if (expId === "optical" || expId === "exp-optical" || expId === "exp2") {
    bank = OPTICAL_FIBRE_QUESTION_BANK;
  } else if (expId === "colour-sensor" || expId === "exp-colour-sensor" || expId === "exp3") {
    bank = COLOUR_SENSOR_QUESTION_BANK;
  } else if (expId === "hall-effect" || expId === "exp-hall-effect" || expId === "exp4" || expId === "hall") {
    bank = HALL_EFFECT_QUESTION_BANK;
  } else if (expId === "diffraction" || expId === "exp-diffraction" || expId === "exp5" || expId === "diffraction-grating") {
    bank = DIFFRACTION_QUESTION_BANK;
  } else if (expId === "sandbox" || expId === "exp-sandbox" || expId === "exp6" || expId === "physics-sandbox") {
    bank = SANDBOX_QUESTION_BANK;
  } else if (expId === "pof-attenuation" || expId === "optical-attenuation" || expId === "attenuation" || expId === "pof") {
    bank = POF_ATTENUATION_QUESTION_BANK;
  }

  // 1. Shuffle the full 50-question bank
  const shuffled50 = shuffleArray(bank.questions);

  // 2. Select 10 random questions
  const selected10 = shuffled50.slice(0, 10);

  // 3. For each selected question, shuffle its options and dynamically compute the correct answer
  const questions = selected10.map((q, idx) => {
    // Determine the exact correct option text
    const correctText = q.correct_option || q.options[0];

    // Shuffle the options array
    const shuffledOptions = shuffleArray(q.options);

    // Find the new index and letter for the correct answer
    const correctIdx = shuffledOptions.indexOf(correctText);
    const letters = ["A", "B", "C", "D"];
    const dynamicAnswerLetter = letters[correctIdx] || "A";

    return {
      id: q.id,
      originalGlobalId: q.global_id || q.id,
      indexInQuiz: idx + 1,
      question: q.question,
      options: shuffledOptions,
      answer: correctText, // The exact correct option text
      answerLetter: dynamicAnswerLetter,
      correct_option: correctText,
      explanation: q.explanation || `Correct answer is: ${correctText}`,
      difficulty: q.difficulty || "medium"
    };
  });

  return {
    quizId: bank.quizId,
    title: bank.title,
    experimentId: bank.experimentId,
    experimentName: bank.experimentName,
    totalQuestions: questions.length,
    questions
  };
}

// Backward-compatible default export
export const QUIZ_DATA = {
  experiment: "2D Projectile Kinematics & Lab Mastery",
  description: "Dynamic 10-Question Randomized Physics Knowledge Evaluation",
  get questions() {
    return generateRandom10QuestionQuiz("projectile").questions;
  }
};
