/**
 * PhysiX • Scientific Laboratory Manual & Theoretical Data Repository
 * 
 * Provides rigorous academic specifications, formulas, procedures, and observation
 * guides for PhysiX virtual physics experiments.
 */

export const EXPERIMENT_DETAILS = {
  projectile: {
    id: "projectile",
    title: "2D Projectile Motion Virtual Laboratory",
    category: "Classical Mechanics & Ballistic Kinematics",
    shortDescription: "Analyze 2D parabolic trajectories, maximum apex heights, airtime duration, and horizontal landing ranges under variable gravitational acceleration.",
    difficulty: "Undergraduate / AP Physics",
    duration: "45 Minutes",
    engine: "Matter.js 2D Newtonian Kinematics",
accentColor: "#38bdf8",
    referenceBooks: [
      {
        title: "Projectile Motion",
        source: "OpenStax",
        url: "https://openstax.org/books/university-physics-volume-1/pages/4-3-projectile-motion",
        description: "Learn about projectile trajectories, horizontal and vertical motion, time of flight, maximum height, and horizontal range."
      },
      {
        title: "Motion in Two and Three Dimensions",
        source: "OpenStax",
        url: "https://openstax.org/books/university-physics-volume-1/pages/4-introduction",
        description: "Review the vector and kinematic principles used to describe two-dimensional motion."
      },
      {
        title: "Motion in Two and Three Dimensions: Chapter Summary",
        source: "OpenStax",
        url: "https://openstax.org/books/university-physics-volume-1/pages/4-summary",
        description: "Review important concepts and equations for motion in two and three dimensions."
      }
    ],
    aim: `<p class="manual-aim-text">To investigate the two-dimensional kinematic motion of a projectile fired at an initial elevation angle θ and launch speed v₀ in a gravitational field, to verify that horizontal and vertical motions are independent, and to determine how launch parameters affect the maximum apex height (H<sub>max</sub>), total flight duration (T), and horizontal ground range (R).</p>`,
    theory: `
      <div class="theory-block">
        <h3>1. Principle of Physical Independence</h3>
        <p>A projectile is any object projected into space with an initial velocity and subsequently subject solely to the force of gravity and (optionally) air resistance. According to Galilean invariance and Newtonian mechanics, two-dimensional projectile motion can be resolved into two mutually independent, orthogonal component motions:</p>
        <ul class="manual-list">
          <li><strong>Horizontal Motion (x-axis):</strong> In the absence of aerodynamic drag, no horizontal force acts on the projectile (F<sub>x</sub> = 0). Thus, horizontal acceleration a<sub>x</sub> = 0, and the horizontal velocity remains strictly uniform throughout flight:
            <div class="math-callout">v_x(t) = v_0 \cos(\theta) = \text{constant}</div>
          </li>
          <li><strong>Vertical Motion (y-axis):</strong> The projectile experiences a continuous, downward gravitational acceleration (a<sub>y</sub> = −g). The vertical velocity decreases uniformly until reaching zero at the peak apex, reversing direction as it descends:
            <div class="math-callout">v_y(t) = v_0 \sin(\theta) - gt</div>
          </li>
        </ul>
      </div>

      <div class="theory-block">
        <h3>2. Derivation of Parabolic Trajectory Equation</h3>
        <p>Let the projectile be launched from an initial coordinate (d₀, h₀) with speed v₀ at angle θ to the horizontal plane. The parametric displacement equations as a function of elapsed time t are:</p>
        <div class="math-callout">x(t) = d_0 + (v_0 \cos\theta)t \implies t = \frac{x - d_0}{v_0 \cos\theta}</div>
        <div class="math-callout">y(t) = h_0 + (v_0 \sin\theta)t - \frac{1}{2}gt^2</div>
        <p>Substituting t into the vertical displacement equation yields the Cartesian trajectory equation:</p>
        <div class="math-callout formula-highlight">y(x) = h_0 + (x - d_0)\tan(\theta) - \frac{g(x - d_0)^2}{2v_0^2 \cos^2(\theta)}</div>
        <p>Because this equation is quadratic in x with a negative second-degree coefficient (−g / [2v₀² cos²θ]), the geometric path traced by the projectile is an exact downward-opening <strong>parabola</strong>.</p>
      </div>

      <div class="theory-block">
        <h3>3. Condition for Maximum Range</h3>
        <p>For a level terrain launch (h₀ = 0), setting y = 0 yields the horizontal range R = (v₀² · sin 2θ) / g. Differentiating R with respect to θ and setting dR/dθ = 0 gives:</p>
        <div class="math-callout">\frac{d}{d\theta} [\sin(2\theta)] = 2 \cos(2\theta) = 0 \implies 2\theta = 90^\circ \implies \theta = 45^\circ</div>
        <p>When launching from an elevated cliff or platform (h₀ &gt; 0), the optimal angle for maximum range decreases below 45° according to θ<sub>opt</sub> = arcsin( 1 / √(2 + 2gh₀ / v₀²) ).</p>
      </div>
    `,
    howToPerform: `
      <div class="steps-container">
        <div class="step-card">
          <div class="step-badge">1</div>
          <div class="step-info">
            <h4>Launch the Virtual Laboratory</h4>
            <p>Click the <strong>Start Simulator</strong> button above to open the 2D Projectile Motion interactive simulation canvas and Control Deck.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">2</div>
          <div class="step-info">
            <h4>Configure Launch Velocity (v₀) & Angle (θ)</h4>
            <p>Use the <strong>Initial Velocity (v₀)</strong> slider to set speed between 10.0 m/s and 50.0 m/s. Adjust the <strong>Launch Angle (θ)</strong> slider from 0° to 90°. Notice the real-time cannon elevation tilt and trajectory preview guide.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">3</div>
          <div class="step-info">
            <h4>Select Gravitational Environment</h4>
            <p>Choose your planetary gravitation preset (Earth g = 9.8 m/s², Moon 1.6 m/s², or Mars 3.7 m/s²) or drag the gravity slider to test custom planetary fields.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">4</div>
          <div class="step-info">
            <h4>Execute the Ballistic Launch</h4>
            <p>Press the red <strong>FIRE CANNON</strong> button. Watch the projectile launch in real-time with animated velocity vector components (v<sub>x</sub>, v<sub>y</sub>), gravitational deceleration, and parabolic breadcrumb trail.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">5</div>
          <div class="step-info">
            <h4>Analyze Telemetry Readouts</h4>
            <p>Examine the digital telemetry displays for <strong>Flight Time (t<sub>flight</sub>)</strong>, <strong>Max Apex Height (H<sub>max</sub>)</strong>, <strong>Total Range (R)</strong>, and <strong>Impact Velocity (v<sub>f</sub>)</strong>.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">6</div>
          <div class="step-info">
            <h4>Log Data into Scientific Observation Table</h4>
            <p>Click <strong>Record Observation</strong> to commit the trial data. The table automatically calculates theoretical values and the percentage error (% Error) between computational physics and mathematical formulation.</p>
          </div>
        </div>
      </div>
    `,
    procedure: `
      <ol class="manual-ordered-list">
        <li><strong>Apparatus Setup:</strong> Set up the ballistic launcher on a level datum. Ensure the launcher elevation scale reads accurately and initial height is set to h₀ = 0.0 m.</li>
        <li><strong>Varying Launch Angle at Constant Speed:</strong> Fix the initial velocity at v₀ = 30.0 m/s and gravitational acceleration at g = 9.8 m/s² (Earth).</li>
        <li>Set the launch angle θ = 15.0°. Fire the projectile and measure the horizontal landing distance R.</li>
        <li>Increment the launch angle in 15° steps: θ = 30.0°, 45.0°, 60.0°, 75.0°. Measure and record R, H<sub>max</sub>, and T for each trial.</li>
        <li>Observe and compare the ranges for complementary angle pairs ({15°, 75°} and {30°, 60°}).</li>
        <li><strong>Varying Initial Velocity at Constant Angle:</strong> Fix the launch angle at θ = 45.0°. Set initial velocity to v₀ = 10.0 m/s. Measure the horizontal range R.</li>
        <li>Repeat the launch for velocities v₀ = 20.0, 30.0, 40.0, 50.0 m/s. Plot R versus v₀² to verify linear dependency.</li>
        <li><strong>Varying Platform Elevation:</strong> Raise initial platform height to h₀ = 15.0 m. Fire at θ = 45.0° and measure the new range and touchdown impact speed v<sub>f</sub>.</li>
      </ol>
    `,
    formulas: `
      <div class="formula-card-grid">
        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Total Time of Flight (T)</span>
            <span class="f-unit">Seconds [s]</span>
          </div>
          <div class="f-eq">T = \frac{v_0 \sin(\theta) + \sqrt{v_0^2 \sin^2\theta + 2gh_0}}{g}</div>
          <p class="f-desc">When launch height h₀ = 0, simplifies to T = (2 · v₀ · sin θ) / g. Represents the duration from cannon departure to ground contact.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Maximum Apex Height (H<sub>max</sub>)</span>
            <span class="f-unit">Meters [m]</span>
          </div>
          <div class="f-eq">H_{\text{max}} = h_0 + \frac{v_0^2 \sin^2\theta}{2g}</div>
          <p class="f-desc">The maximum vertical altitude achieved when vertical velocity v<sub>y</sub> = 0. Independent of horizontal velocity component.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Horizontal Range (R)</span>
            <span class="f-unit">Meters [m]</span>
          </div>
          <div class="f-eq">R = d_0 + (v_0 \cos\theta) \cdot T</div>
          <p class="f-desc">For level ground (h₀ = 0), R = (v₀² · sin 2θ) / g. Yields the total horizontal displacement traversed.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Impact Touchdown Velocity (v<sub>f</sub>)</span>
            <span class="f-unit">Meters / Second [m/s]</span>
          </div>
          <div class="f-eq">v_f = \sqrt{v_0^2 + 2gh_0}</div>
          <p class="f-desc">Derived from conservation of mechanical energy (E<sub>i</sub> = E<sub>f</sub>). Demonstrates that impact speed is independent of launch angle when air resistance is neglected.</p>
        </div>
      </div>
    `,
    observations: `
      <div class="obs-table-wrap">
        <table class="manual-obs-table">
          <thead>
            <tr>
              <th>Trial</th>
              <th>Launch Angle (θ)</th>
              <th>Initial Speed (v₀)</th>
              <th>Flight Time (T)</th>
              <th>Max Apex (H<sub>max</sub>)</th>
              <th>Range (R)</th>
              <th>Physical Behavior Observed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>15.0°</td>
              <td>30.0 m/s</td>
              <td>1.58 s</td>
              <td>3.08 m</td>
              <td>45.92 m</td>
              <td>Low trajectory, short flight time, moderate range</td>
            </tr>
            <tr>
              <td>2</td>
              <td>30.0°</td>
              <td>30.0 m/s</td>
              <td>3.06 s</td>
              <td>11.48 m</td>
              <td>79.53 m</td>
              <td>Parabolic arc, substantial range expansion</td>
            </tr>
            <tr>
              <td>3</td>
              <td>45.0°</td>
              <td>30.0 m/s</td>
              <td>4.33 s</td>
              <td>22.96 m</td>
              <td>91.84 m</td>
              <td>Maximum horizontal range achieved on level ground</td>
            </tr>
            <tr>
              <td>4</td>
              <td>60.0°</td>
              <td>30.0 m/s</td>
              <td>5.30 s</td>
              <td>34.44 m</td>
              <td>79.53 m</td>
              <td>Equal range to 30° trial, significantly higher apex</td>
            </tr>
            <tr>
              <td>5</td>
              <td>75.0°</td>
              <td>30.0 m/s</td>
              <td>5.91 s</td>
              <td>42.84 m</td>
              <td>45.92 m</td>
              <td>Equal range to 15° trial, long airtime</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="obs-notes">
        <h4>Key Experimental Takeaways:</h4>
        <ul class="manual-list">
          <li><strong>Complementary Angle Invariance:</strong> Angles summing to 90° (such as 30° and 60°) achieve identical theoretical horizontal ranges (R) because sin(2θ) = sin(2(90° − θ)).</li>
          <li><strong>Velocity Scaling:</strong> Range scales quadratically with initial launch velocity (R ∝ v₀²). Doubling speed quadruples the maximum range.</li>
          <li><strong>Gravitational Inversion:</strong> In weaker gravity (e.g. Moon g = 1.6 m/s²), airtime and range expand by a factor of approximately 6.12 compared to Earth.</li>
        </ul>
      </div>
    `,
    result: `
      <div class="result-box">
        <h4>Experimental Conclusions:</h4>
        <ol class="manual-ordered-list">
          <li>The trajectory of a projectile launched under uniform gravitational acceleration is strictly parabolic in the absence of aerodynamic friction.</li>
          <li>For a level launch plane (h₀ = 0), the maximum horizontal range R<sub>max</sub> occurs precisely at a launch angle of θ = 45.0°.</li>
          <li>Complementary launch angles produce equal horizontal ranges, with the steeper angle producing higher apex altitude and extended airtime.</li>
          <li>The simulated kinematics results from the PhysiX computational engine agree with analytical theoretical equations with less than 0.2% numerical variance.</li>
        </ol>
      </div>
    `
  },

  optical: {
    id: "optical",
    title: "Determination of Numerical Aperture of an Optical Fibre",
    category: "Fiber Optics & Optoelectronic Waveguides",
    shortDescription: "Measure the output divergence cone, numerical aperture (NA), and acceptance angle of an optical fiber cable on a precision optical bench.",
    difficulty: "Undergraduate STEM Practical",
    duration: "45 Minutes",
    engine: "Waveguide Ray Tracing & Conical Divergence Solver",
accentColor: "#00f0ff",
    referenceBooks: [
      {
        title: "Measurement of Numerical Aperture",
        source: "IIT Roorkee Virtual Labs",
        url: "https://oc-iitr.vlabs.ac.in/exp/measurement-numerical-aperture/theory.html",
        description: "Study numerical aperture, acceptance angle, and the theoretical basis of its measurement."
      },
      {
        title: "Numerical Aperture Measurement",
        source: "IIT Kanpur Virtual Labs",
        url: "https://bop-iitk.vlabs.ac.in/exp/numerical-aperture-measurement/theory.html",
        description: "Learn about optical-fiber numerical aperture and the principles behind its experimental measurement."
      },
      {
        title: "Total Internal Reflection",
        source: "OpenStax",
        url: "https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection",
        description: "Understand the optical principle that enables light propagation through an optical fiber."
      }
    ],
    aim: `<p class="manual-aim-text">To determine the Numerical Aperture (NA) and maximum Acceptance Angle (θ<sub>a</sub>) of a step-index multimode optical fibre cable by measuring the divergence diameter of the output laser beam spot at varying distances on a calibrated optical bench.</p>`,
    theory: `
      <div class="theory-block">
        <h3>1. Waveguide Architecture & Total Internal Reflection (TIR)</h3>
        <p>An optical fibre is a cylindrical dielectric waveguide consisting of an inner <strong>core</strong> with refractive index n₁ surrounded by an outer <strong>cladding</strong> with refractive index n₂, such that n₁ &gt; n₂. Optical transmission through the fibre is governed by the phenomenon of <strong>Total Internal Reflection (TIR)</strong> occurring at the core-cladding boundary.</p>
        <p>When light enters the core from the external medium (air, n₀ ≈ 1.0), it refracts at the entrance facet and strikes the core-cladding interface at an angle φ. If φ equals or exceeds the critical angle φ<sub>c</sub> given by:</p>
        <div class="math-callout">sin(φ<sub>c</sub>) = n₂ / n₁</div>
        <p>the ray undergoes repeated total internal reflections, remaining trapped inside the core and propagating down the length of the cable.</p>
      </div>

      <div class="theory-block">
        <h3>2. Acceptance Angle & Numerical Aperture Derivation</h3>
        <p>Applying Snell's Law at the input air-core interface for a ray entering at the maximum acceptance angle θ<sub>a</sub>:</p>
        <div class="math-callout">n_0 \sin(\theta_a) = n_1 \sin(r) = n_1 \sin(90^\circ - \phi_c) = n_1 \cos(\phi_c) = n_1 \sqrt{1 - \sin^2\phi_c}</div>
        <p>Substituting sin(φ<sub>c</sub>) = n₂ / n₁:</p>
        <div class="math-callout formula-highlight">n_0 \sin(\theta_a) = n_1 \sqrt{1 - \frac{n_2^2}{n_1^2}} = \sqrt{n_1^2 - n_2^2}</div>
        <p>For an external medium of air (n₀ = 1.0), the light-gathering capacity of the fibre is defined as the <strong>Numerical Aperture (NA)</strong>:</p>
        <div class="math-callout formula-highlight">NA = \sin(\theta_a) = \sqrt{n_1^2 - n_2^2}</div>
      </div>

      <div class="theory-block">
        <h3>3. Spot Divergence Measurement Principle</h3>
        <p>Because the optical path is reversible, light emerging from the fiber output tip diverges into a solid cone whose semi-angle is equal to the acceptance angle θ<sub>a</sub>. When projected onto a perpendicular target screen at distance L, the spot diameter W relates trigonometrically to L and θ<sub>a</sub>:</p>
        <div class="math-callout">\tan(\theta_a) = \frac{W/2}{L} = \frac{W}{2L}</div>
        <p>Expressing sin(θ<sub>a</sub>) in terms of tan(θ<sub>a</sub>):</p>
        <div class="math-callout formula-highlight">NA = \sin(\theta_a) = \frac{W/2L}{\sqrt{1 + (W/2L)^2}} = \frac{W}{\sqrt{4L^2 + W^2}}</div>
      </div>
    `,
    howToPerform: `
      <div class="steps-container">
        <div class="step-card">
          <div class="step-badge">1</div>
          <div class="step-info">
            <h4>Start the Optical Bench Laboratory</h4>
            <p>Click <strong>Start Simulator</strong> to load the high-precision virtual optical bench, optical fiber trainer kit, and measurement jig.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">2</div>
          <div class="step-info">
            <h4>Power On the Laser Diode Source</h4>
            <p>Turn on the <strong>DC Laboratory Power Switch</strong>, then activate the <strong>650nm Red Laser Diode</strong>. Verify that the transmitter LED indicator turns red.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">3</div>
          <div class="step-info">
            <h4>Inspect Fiber Patchcord Connections</h4>
            <p>Confirm the fiber cable SMA connector is plugged into the transmitter output port and the receiving tip is mounted securely in the micrometer translation jig.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">4</div>
          <div class="step-info">
            <h4>Adjust Screen Distance (L)</h4>
            <p>Use the <strong>Lead-Screw Translation Slider</strong> to adjust the distance between the fiber tip and the concentric circle target screen from 5.0 mm to 35.0 mm.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">5</div>
          <div class="step-info">
            <h4>Match Concentric Target Circles</h4>
            <p>Observe the projected red laser spot diameter on the target screen. Select concentric ring buttons (Ring 1 = 10 mm to Ring 6 = 35 mm) to match the expanding beam perimeter.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">6</div>
          <div class="step-info">
            <h4>Record Observations & Compute NA</h4>
            <p>When the spot aligns with the target ring, observe the "PERFECT RING MATCH" readout and click <strong>Record Observation</strong> to record the reading in the telemetry data table.</p>
          </div>
        </div>
      </div>
    `,
    procedure: `
      <ol class="manual-ordered-list">
        <li><strong>Apparatus Assembly:</strong> Mount the optical fibre cable on the optical bench. Connect one end to the 650 nm semiconductor laser output and fix the receiving end into the calibrated measurement jig facing the concentric target screen.</li>
        <li><strong>Bench Alignment:</strong> Ensure the axis of the optical fibre output is strictly normal to the plane of the white target screen.</li>
        <li><strong>Initial Positioning:</strong> Set the distance between the fibre tip and target screen to L = 10.0 mm using the precision lead-screw micrometer scale.</li>
        <li><strong>Spot Diameter Measurement:</strong> Turn on the laser source. Measure the diameter W of the red circular illumination spot where intensity drops to the concentric reference boundary.</li>
        <li><strong>Stepwise Distance Increments:</strong> Increase distance L in steps of 5.0 mm (L = 15.0, 20.0, 25.0, 30.0 mm). For each distance, measure the corresponding spot diameter W.</li>
        <li><strong>Computation:</strong> For each measurement pair (L, W), calculate the Numerical Aperture using NA = W / √(4L² + W²) and the acceptance angle using θ<sub>a</sub> = arcsin(NA).</li>
        <li><strong>Graphical Method:</strong> Plot a graph of Spot Diameter (W) on the y-axis against Distance (L) on the x-axis. Find the linear slope m = ΔW / ΔL, and compute NA = m / √(4 + m²).</li>
      </ol>
    `,
    formulas: `
      <div class="formula-card-grid">
        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Experimental NA Formula</span>
            <span class="f-unit">Dimensionless</span>
          </div>
          <div class="f-eq">NA = \frac{W}{\sqrt{4L^2 + W^2}}</div>
          <p class="f-desc">Where W is the light spot diameter (mm) and L is the distance from the fibre tip to the target screen (mm).</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Acceptance Angle (θ<sub>a</sub>)</span>
            <span class="f-unit">Degrees [°]</span>
          </div>
          <div class="f-eq">\theta_a = \arcsin(NA) = \arctan\left(\frac{W}{2L}\right)</div>
          <p class="f-desc">The half-angle of the cone within which light rays are accepted and guided through total internal reflection.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Theoretical Refractive NA</span>
            <span class="f-unit">Dimensionless</span>
          </div>
          <div class="f-eq">NA = \sqrt{n_1^2 - n_2^2} = n_1 \sqrt{2\Delta}</div>
          <p class="f-desc">Where n₁ is core index, n₂ is cladding index, and Δ = (n₁ − n₂) / n₁ is the fractional index difference.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Solid Acceptance Angle (Ω)</span>
            <span class="f-unit">Steradians [sr]</span>
          </div>
          <div class="f-eq">\Omega = \pi \sin^2(\theta_a) = \pi (NA)^2</div>
          <p class="f-desc">Quantifies the total solid angle of the light-gathering acceptance cone in three-dimensional space.</p>
        </div>
      </div>
    `,
    observations: `
      <div class="obs-table-wrap">
        <table class="manual-obs-table">
          <thead>
            <tr>
              <th>Trial</th>
              <th>Distance L (mm)</th>
              <th>Target Ring</th>
              <th>Spot Diameter W (mm)</th>
              <th>Calculated NA</th>
              <th>Acceptance Angle θ<sub>a</sub></th>
              <th>Fidelity Match</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>10.5 mm</td>
              <td>Ring 1</td>
              <td>10.0 mm</td>
              <td>0.430</td>
              <td>25.5°</td>
              <td>Concentric spot alignment</td>
            </tr>
            <tr>
              <td>2</td>
              <td>15.2 mm</td>
              <td>Ring 2</td>
              <td>15.0 mm</td>
              <td>0.443</td>
              <td>26.3°</td>
              <td>Spot perimeter matches ring 2</td>
            </tr>
            <tr>
              <td>3</td>
              <td>20.4 mm</td>
              <td>Ring 3</td>
              <td>20.0 mm</td>
              <td>0.440</td>
              <td>26.1°</td>
              <td>Linear divergence verification</td>
            </tr>
            <tr>
              <td>4</td>
              <td>25.1 mm</td>
              <td>Ring 4</td>
              <td>25.0 mm</td>
              <td>0.446</td>
              <td>26.5°</td>
              <td>Consistent numerical aperture</td>
            </tr>
            <tr>
              <td>5</td>
              <td>30.0 mm</td>
              <td>Ring 5</td>
              <td>30.0 mm</td>
              <td>0.447</td>
              <td>26.6°</td>
              <td>Near-field divergence equilibrium</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="obs-notes">
        <h4>Key Experimental Takeaways:</h4>
        <ul class="manual-list">
          <li><strong>Linear Spot Expansion:</strong> As screen distance L increases, the spot diameter W increases proportionally with constant cone slope W / (2L) = tan(θ<sub>a</sub>).</li>
          <li><strong>Invariant Numerical Aperture:</strong> The calculated value of NA remains invariant across distance changes, demonstrating that Numerical Aperture is an intrinsic physical constant of the optical waveguide.</li>
        </ul>
      </div>
    `,
    result: `
      <div class="result-box">
        <h4>Experimental Conclusions:</h4>
        <ol class="manual-ordered-list">
          <li>The Numerical Aperture (NA) of the multimode step-index optical fibre was experimentally determined to be NA = 0.44 ± 0.02.</li>
          <li>The maximum Acceptance Angle of the fibre was determined to be θ<sub>a</sub> = 26.2° ± 0.5°.</li>
          <li>The linear relationship between screen distance and beam spot diameter confirms the conical divergence model of light propagation emerging from dielectric optical fibres.</li>
        </ol>
      </div>
    `
  },

  "colour-sensor": {
    id: "colour-sensor",
    title: "Study of Colour Sensor & Spectral Photodiode Response",
    category: "Sensors, Optoelectronic Devices & Instrumentation",
    shortDescription: "Characterize spectral photodiode channel selection (S2/S3), frequency scaling (S0/S1), and RGB color identification with the TCS3200 sensor.",
    difficulty: "Undergraduate Instrumentation Practical",
    duration: "45 Minutes",
    engine: "TCS3200 Optoelectronic Converter & Spectral Decomposition Solver",
    accentColor: "#10b981",

    referenceBooks: [
      {
        title: "Color Sensors",
        source: "Adafruit Learning System",
        url: "https://learn.adafruit.com/adafruit-color-sensors",
        description: "Explore colour-sensor operation, RGB measurements, and practical implementation."
      },
      {
        title: "TCS34725 Color Sensor",
        source: "ams OSRAM",
        url: "https://ams-osram.com/products/sensor-solutions/ambient-light-color-spectral-proximity-sensors/ams-tcs34725-color-sensor",
        description: "Review technical information about RGB colour sensing and the capabilities of the TCS34725 sensor."
      },
      {
        title: "RGB Color Sensor (Retired Product Reference)",
        source: "SparkFun",
        url: "https://www.sparkfun.com/sparkfun-rgb-light-sensor-isl29125.html",
        description: "Explore supplementary hardware information about a colour-sensor implementation. (Note: Retired product page; maintained for educational reference)."
      }
    ],
    aim: `<p class="manual-aim-text">To investigate the operational principles, spectral sensitivity, programmable frequency scaling, and RGB color identification accuracy of the TCS3200 programmable light-to-frequency optoelectronic sensor using sample swatches at varying calibrated distances.</p>`,
    theory: `
      <div class="theory-block">
        <h3>1. TCS3200 Sensor Architecture</h3>
        <p>The TCS3200 is a monolithic CMOS optoelectronic converter that integrates a configurable array of silicon photodiodes and an internal current-to-frequency converter. The sensor active area comprises an 8 × 8 matrix of 64 photodiodes:</p>
        <ul class="manual-list">
          <li><strong>16 Red Filter Photodiodes:</strong> Peak spectral transmission at λ ≈ 650 nm.</li>
          <li><strong>16 Green Filter Photodiodes:</strong> Peak spectral transmission at λ ≈ 540 nm.</li>
          <li><strong>16 Blue Filter Photodiodes:</strong> Peak spectral transmission at λ ≈ 470 nm.</li>
          <li><strong>16 Clear Photodiodes:</strong> Unfiltered broadband response across 300 nm − 1050 nm.</li>
        </ul>
        <p>Interleaving the filtered photodiodes across the matrix eliminates the effect of non-uniform irradiance distribution across the sensor package.</p>
      </div>

      <div class="theory-block">
        <h3>2. Light-to-Frequency Conversion Principle</h3>
        <p>When photons with energy hν strike the photodiode depletion region, electron-hole pairs are generated via the internal photoelectric effect. The resulting photocurrent I<sub>ph</sub> is directly proportional to incident optical irradiance P<sub>opt</sub> and wavelength λ:</p>
        <div class="math-callout">I_{\text{ph}} = R(\lambda) \cdot P_{\text{opt}} = \left(\frac{\eta q \lambda}{h c}\right) P_{\text{opt}}</div>
        <p>The internal current-to-frequency oscillator converts this photocurrent into a 50% duty-cycle square wave whose frequency f<sub>out</sub> is linearly proportional to the detected optical irradiance:</p>
        <div class="math-callout formula-highlight">f_{\text{out}} = k \cdot I_{\text{ph}} \propto P_{\text{opt}}</div>
      </div>

      <div class="theory-block">
        <h3>3. Programmable Control Logic (S0-S3)</h3>
        <p>The device is controlled through four digital logic pins:</p>
        <ul class="manual-list">
          <li><strong>Frequency Scaling Pins (S0, S1):</strong> Scale output frequency to match microcontroller counter bandwidth (Power Down, 2%, 20%, 100%).</li>
          <li><strong>Photodiode Filter Selection Pins (S2, S3):</strong> Dynamically select which channel of the photodiode matrix connects to the converter:
            <br><code>(0,0) = Red</code> | <code>(0,1) = Blue</code> | <code>(1,0) = Clear</code> | <code>(1,1) = Green</code>.
          </li>
        </ul>
      </div>

      <div class="theory-block">
        <h3>4. Color Coordinate Normalization & Inverse-Square Law</h3>
        <p>By measuring the frequency across the three primary channels (f<sub>R</sub>, f<sub>G</sub>, f<sub>B</sub>), normalized chromaticity coordinates are computed:</p>
        <div class="math-callout formula-highlight">r = \frac{f_R}{f_R + f_G + f_B}, \quad g = \frac{f_G}{f_R + f_G + f_B}, \quad b = \frac{f_B}{f_R + f_G + f_B}</div>
        <p>Furthermore, reflected radiant intensity E decreases quadratically with distance d according to the Inverse-Square Law:</p>
        <div class="math-callout">E(d) \propto \frac{1}{d^2} \implies f_{\text{out}}(d) \propto \frac{1}{d^2}</div>
      </div>
    `,
    howToPerform: `
      <div class="steps-container">
        <div class="step-card">
          <div class="step-badge">1</div>
          <div class="step-info">
            <h4>Start the Color Sensor Laboratory</h4>
            <p>Click <strong>Start Simulator</strong> to load the virtual TCS3200 sensor platform, digital power supply, and sample carousel.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">2</div>
          <div class="step-info">
            <h4>Power On the Sensor & LED Array</h4>
            <p>Toggle the <strong>DC Laboratory Power Switch</strong> to ON (5.0V rail). Turn on the <strong>White LED Illumination Ring</strong> to uniformly illuminate test samples.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">3</div>
          <div class="step-info">
            <h4>Set Frequency Scaling (S0/S1)</h4>
            <p>Set the frequency scaling selector to 20% (standard for laboratory microcontrollers) or 100% for high-resolution analysis.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">4</div>
          <div class="step-info">
            <h4>Select Sample Color Swatch</h4>
            <p>Choose a color swatch from the sample carousel (Red, Green, Blue, Yellow, Cyan, Magenta, White, or Black) and place it on the target holder.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">5</div>
          <div class="step-info">
            <h4>Cycle Through Filter Channels (S2/S3)</h4>
            <p>Click through the <strong>Red</strong>, <strong>Green</strong>, <strong>Blue</strong>, and <strong>Clear</strong> filter channel buttons. Observe how the output square wave frequency responds to the swatch's spectral reflectance.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">6</div>
          <div class="step-info">
            <h4>Adjust Distance Slider & Record Telemetry</h4>
            <p>Use the <strong>Distance (d)</strong> slider between 5 mm and 50 mm to observe the inverse-square frequency decay. Click <strong>Record Observation</strong> to log the 4-channel spectral profile and reconstructed Hex color.</p>
          </div>
        </div>
      </div>
    `,
    procedure: `
      <ol class="manual-ordered-list">
        <li><strong>Sensor Power & White Balance Calibration:</strong> Connect the sensor module to a stabilized 5.0V DC power supply. Position a pure white calibration card at a distance of d = 20.0 mm.</li>
        <li>Select the Clear channel (S2=1, S3=0) and adjust frequency scaling to 20% to avoid counter overflow.</li>
        <li>Record the maximum calibration baseline frequencies for Red, Green, Blue, and Clear channels.</li>
        <li><strong>Sample Testing:</strong> Replace the white calibration card with a primary Red sample swatch.</li>
        <li>Measure and record the output frequency for Red (f<sub>R</sub>), Green (f<sub>G</sub>), Blue (f<sub>B</sub>), and Clear (f<sub>clear</sub>) channels.</li>
        <li>Repeat the multi-channel frequency measurements for Green, Blue, Yellow, and Cyan sample swatches.</li>
        <li><strong>Distance Response Test:</strong> Fix the Red swatch and keep the Red channel active (S2=0, S3=0).</li>
        <li>Vary distance d from 10.0 mm to 50.0 mm in 10.0 mm steps. Record output frequency f<sub>out</sub> at each distance and plot f<sub>out</sub> versus 1/d².</li>
      </ol>
    `,
    formulas: `
      <div class="formula-card-grid">
        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Optoelectronic Current (I<sub>ph</sub>)</span>
            <span class="f-unit">Microamperes [μA]</span>
          </div>
          <div class="f-eq">I_{\text{ph}} = \left(\frac{\eta q \lambda}{h c}\right) P_{\text{opt}}</div>
          <p class="f-desc">Where η is quantum efficiency, q is electronic charge, h is Planck's constant, and P<sub>opt</sub> is incident optical power.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Frequency Output (f<sub>out</sub>)</span>
            <span class="f-unit">Kilohertz [kHz]</span>
          </div>
          <div class="f-eq">f_{\text{out}} = k_s \left(\frac{I_{\text{ph}}}{C_{\text{int}}}\right)</div>
          <p class="f-desc">Direct linear current-to-frequency relationship modulated by frequency scaling factor k<sub>s</sub> (2%, 20%, 100%).</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Normalized Chromaticity Coordinate (r, g, b)</span>
            <span class="f-unit">Dimensionless [0 - 1]</span>
          </div>
          <div class="f-eq">r = \frac{f_R}{f_R + f_G + f_B}, \quad g = \frac{f_G}{f_R + f_G + f_B}</div>
          <p class="f-desc">Normalizes color component ratios, eliminating dependence on ambient illumination variations.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Inverse-Square Law (E)</span>
            <span class="f-unit">Watts / Meter² [W/m²]</span>
          </div>
          <div class="f-eq">E(d) = \frac{I_0}{d^2} \implies f_{\text{out}}(d) \propto \frac{1}{d^2}</div>
          <p class="f-desc">Quantifies the decay of detected optical irradiance as distance from the reflective target increases.</p>
        </div>
      </div>
    `,
    observations: `
      <div class="obs-table-wrap">
        <table class="manual-obs-table">
          <thead>
            <tr>
              <th>Target Swatch</th>
              <th>Red Ch (f<sub>R</sub>)</th>
              <th>Green Ch (f<sub>G</sub>)</th>
              <th>Blue Ch (f<sub>B</sub>)</th>
              <th>Clear Ch (f<sub>clr</sub>)</th>
              <th>Dominant Channel</th>
              <th>Match Fidelity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Red (#E11D48)</td>
              <td>14.2 kHz</td>
              <td>3.8 kHz</td>
              <td>4.1 kHz</td>
              <td>22.1 kHz</td>
              <td>Red Channel Dominant</td>
              <td>98.2%</td>
            </tr>
            <tr>
              <td>Green (#10B981)</td>
              <td>3.5 kHz</td>
              <td>15.6 kHz</td>
              <td>5.2 kHz</td>
              <td>24.3 kHz</td>
              <td>Green Channel Dominant</td>
              <td>96.8%</td>
            </tr>
            <tr>
              <td>Blue (#2563EB)</td>
              <td>3.1 kHz</td>
              <td>4.9 kHz</td>
              <td>16.8 kHz</td>
              <td>24.8 kHz</td>
              <td>Blue Channel Dominant</td>
              <td>97.4%</td>
            </tr>
            <tr>
              <td>White (#F8FAFC)</td>
              <td>16.5 kHz</td>
              <td>17.1 kHz</td>
              <td>18.0 kHz</td>
              <td>51.6 kHz</td>
              <td>Balanced High Output</td>
              <td>99.1%</td>
            </tr>
            <tr>
              <td>Black (#0F172A)</td>
              <td>1.2 kHz</td>
              <td>1.1 kHz</td>
              <td>1.4 kHz</td>
              <td>3.7 kHz</td>
              <td>Minimal Dark Frequency</td>
              <td>95.0%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="obs-notes">
        <h4>Key Experimental Takeaways:</h4>
        <ul class="manual-list">
          <li><strong>Spectral Selectivity:</strong> Under pure colored swatches, the matching filtered photodiode channel exhibits a 3x to 4x higher frequency output than non-matching channels.</li>
          <li><strong>Distance Decay (1/d²):</strong> As sample distance increases from 10 mm to 30 mm, frequency decreases by approximately 88.9%, conforming to the inverse-square propagation law.</li>
        </ul>
      </div>
    `,
    result: `
      <div class="result-box">
        <h4>Experimental Conclusions:</h4>
        <ol class="manual-ordered-list">
          <li>The TCS3200 sensor successfully transduces spectral optical irradiance into proportional square-wave frequencies with linear optoelectronic response.</li>
          <li>Digital filter selection via S2 and S3 logic pins cleanly isolates Red, Green, Blue, and broadband Clear irradiance.</li>
          <li>Normalized RGB chromaticity ratios identify sample surface colors with &gt;96% recognition fidelity across variable distance offsets.</li>
        </ol>
      </div>
    `
  },

  sandbox: {
    id: "sandbox",
    title: "Physics Sandbox & 2D Kinematics Playground",
    category: "Newtonian Mechanics & Computational Physics",
    shortDescription: "Interactive 2D physics sandbox: spawn rigid bodies, test momentum conservation, elastic/inelastic collisions, and modulate celestial gravity.",
    difficulty: "All Levels STEM Practical",
    duration: "45 Minutes",
    engine: "Matter.js Velocity Verlet Rigid-Body Engine",
    accentColor: "#a855f7",
    referenceBooks: [
      {
        title: "Newton's Second Law",
        source: "OpenStax",
        url: "https://openstax.org/books/university-physics-volume-1/pages/5-3-newtons-second-law",
        description: "Learn how force, mass, and acceleration are related through Newton's second law."
      },
      {
        title: "University Physics, Volume 1: Work and Energy Chapter",
        source: "OpenStax",
        url: "https://openstax.org/books/university-physics-volume-1/pages/7-introduction",
        description: "Review work, kinetic energy, and related mechanics concepts."
      },
      {
        title: "University Physics, Volume 1",
        source: "OpenStax",
        url: "https://openstax.org/books/university-physics-volume-1/pages/preface",
        description: "Use the textbook as a broader reference for mechanics, forces, motion, and energy."
      }
    ],

    aim: `<p class="manual-aim-text">To investigate Newtonian rigid-body mechanics, conservation of linear momentum, coefficient of restitution (e), and the exchange between kinetic and gravitational potential energy in an interactive computational 2D physics environment.</p>`,
    theory: `
      <div class="theory-block">
        <h3>1. Newton's Laws & Rigid-Body Dynamics</h3>
        <p>In computational physics, a rigid body is an idealized solid object in which deformation is neglected. Motion is governed by Newton's Second Law for translational and rotational dynamics:</p>
        <div class="math-callout">F = dp/dt = m · a, &nbsp; τ = I · α</div>
        <p>where F is the resultant external force, m is inertial mass, a is linear acceleration, τ is torque, I is mass moment of inertia, and α is angular acceleration.</p>
      </div>

      <div class="theory-block">
        <h3>2. Conservation of Linear Momentum</h3>
        <p>For a closed system of interacting rigid bodies subject to zero net external horizontal force, total linear momentum is strictly conserved across all collision regimes:</p>
        <div class="math-callout formula-highlight">∑ p<sub>before</sub> = ∑ p<sub>after</sub> &nbsp;⟹&nbsp; m₁ · u₁ + m₂ · u₂ = m₁ · v₁ + m₂ · v₂</div>
      </div>

      <div class="theory-block">
        <h3>3. Coefficient of Restitution (e) & Collision Kinematics</h3>
        <p>The elasticity of a collision along the line of impact is characterized by the <strong>Coefficient of Restitution (e)</strong>, defined as the ratio of relative separation speed to relative approach speed:</p>
        <div class="math-callout formula-highlight">e = \frac{v_{1n} - v_{2n}}{u_{2n} - u_{1n}}</div>
        <ul class="manual-list">
          <li><strong>e = 1.0 (Perfectly Elastic):</strong> Total mechanical kinetic energy is conserved (∑ KE<sub>i</sub> = ∑ KE<sub>f</sub>).</li>
          <li><strong>0 &lt; e &lt; 1.0 (Inelastic):</strong> Kinetic energy is partially dissipated into thermal and vibrational modes.</li>
          <li><strong>e = 0.0 (Completely Inelastic):</strong> Bodies coalesce and move with a single common velocity.</li>
        </ul>
      </div>

      <div class="theory-block">
        <h3>4. Mechanical Energy Conservation</h3>
        <p>In a conservative gravitational field with zero non-conservative dissipative forces:</p>
        <div class="math-callout formula-highlight">E_{\text{total}} = KE + PE = \frac{1}{2} m v^2 + m g y = \text{constant}</div>
      </div>
    `,
    howToPerform: `
      <div class="steps-container">
        <div class="step-card">
          <div class="step-badge">1</div>
          <div class="step-info">
            <h4>Start the Physics Sandbox</h4>
            <p>Click <strong>Start Simulator</strong> to load the interactive 2D canvas, rigid-body spawner, and telemetry analyzer.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">2</div>
          <div class="step-info">
            <h4>Spawn Dynamic Objects</h4>
            <p>Click <strong>Spawn Ball</strong> or <strong>Spawn Crate</strong> to add rigid bodies into the simulation space. Adjust their mass, size, and friction parameters.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">3</div>
          <div class="step-info">
            <h4>Interact via Mouse Fling & Impulse</h4>
            <p>Click and drag any object on the canvas with your mouse to apply live directional velocity impulse vectors and fling bodies against walls or obstacles.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">4</div>
          <div class="step-info">
            <h4>Modulate Planetary Gravitation</h4>
            <p>Switch between celestial gravity presets: <strong>Earth (9.8 m/s²)</strong>, <strong>Moon (1.6 m/s²)</strong>, <strong>Mars (3.7 m/s²)</strong>, <strong>Zero-G (0 m/s²)</strong>, or <strong>Inverted Gravity</strong>.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">5</div>
          <div class="step-info">
            <h4>Analyze Live Kinematics Telemetry</h4>
            <p>Observe the telemetry counters for live body count, instantaneous velocity components (v<sub>x</sub>, v<sub>y</sub>), kinetic energy (KE), and gravitational potential energy (PE).</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">6</div>
          <div class="step-info">
            <h4>Pause & Step Simulation Frames</h4>
            <p>Use the <strong>Pause</strong> and <strong>Step Frame</strong> buttons to freeze high-velocity collision events and inspect exact collision impulses.</p>
          </div>
        </div>
      </div>
    `,
    procedure: `
      <ol class="manual-ordered-list">
        <li><strong>Free-Fall Energy Conservation:</strong> Clear the canvas. Set gravity to Earth (g = 9.8 m/s²) and restitution to e = 0.8.</li>
        <li>Spawn a ball at height y₁ = 300 px. Record the initial potential energy PE<sub>i</sub> and kinetic energy KE<sub>i</sub> = 0.</li>
        <li>Release the ball and observe energy transformation from potential to kinetic as altitude decreases.</li>
        <li><strong>Head-On Elastic Collision Test:</strong> Set restitution to e = 1.0 and contact friction to μ = 0.</li>
        <li>Spawn two balls of equal mass (m₁ = m₂ = 1.0 kg). Keep Ball 2 stationary and fling Ball 1 directly into Ball 2.</li>
        <li>Record pre-collision and post-collision velocities to verify complete velocity transfer.</li>
        <li><strong>Zero-Gravity Inertia Test:</strong> Select Zero-G (g = 0 m/s²). Fling an object horizontally.</li>
        <li>Confirm that the object moves in a straight path with constant velocity, validating Newton's First Law.</li>
      </ol>
    `,
    formulas: `
      <div class="formula-card-grid">
        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Linear Momentum (p)</span>
            <span class="f-unit">Kilogram Meter / Second [kg·m/s]</span>
          </div>
          <div class="f-eq">p = m \cdot v</div>
          <p class="f-desc">Vector quantity representing the quantity of motion in an object.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Restitution (e)</span>
            <span class="f-unit">Dimensionless [0 - 1]</span>
          </div>
          <div class="f-eq">e = \frac{v_1 - v_2}{u_2 - u_1} = \sqrt{\frac{h_{\text{rebound}}}{h_{\text{drop}}}}</div>
          <p class="f-desc">Quantifies energy elasticity in normal impacts between colliding bodies.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Kinetic Energy (KE)</span>
            <span class="f-unit">Joules [J]</span>
          </div>
          <div class="f-eq">KE = \frac{1}{2} m v^2 + \frac{1}{2} I \omega^2</div>
          <p class="f-desc">Includes translational kinetic energy and rotational kinetic energy.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Collision Impulse (J)</span>
            <span class="f-unit">Newton Seconds [N·s]</span>
          </div>
          <div class="f-eq">J = \int F dt = \Delta p = m(v - u)</div>
          <p class="f-desc">The instantaneous force-time integral acting during contact impact.</p>
        </div>
      </div>
    `,
    observations: `
      <div class="obs-table-wrap">
        <table class="manual-obs-table">
          <thead>
            <tr>
              <th>Simulation Case</th>
              <th>Gravity Setting</th>
              <th>Restitution (e)</th>
              <th>Kinematic Behavior Observed</th>
              <th>Conservation Verified</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Free Bounce (Earth)</td>
              <td>9.8 m/s²</td>
              <td>1.0</td>
              <td>Continuous rebound to exact release height</td>
              <td>Energy fully conserved</td>
            </tr>
            <tr>
              <td>Damped Bounce</td>
              <td>9.8 m/s²</td>
              <td>0.5</td>
              <td>Successive apex heights decay by (0.5)² = 0.25</td>
              <td>Momentum conserved at impact</td>
            </tr>
            <tr>
              <td>Zero-G Drift</td>
              <td>0.0 m/s²</td>
              <td>1.0</td>
              <td>Constant linear translation in straight line</td>
              <td>Newton's 1st Law verified</td>
            </tr>
            <tr>
              <td>Equal Mass Collision</td>
              <td>0.0 m/s²</td>
              <td>1.0</td>
              <td>Moving ball stops dead; target departs at equal speed</td>
              <td>100% velocity transfer</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="obs-notes">
        <h4>Key Experimental Takeaways:</h4>
        <ul class="manual-list">
          <li><strong>Energy-Momentum Duality:</strong> While linear momentum is conserved in all collision scenarios, kinetic energy is only conserved when e = 1.0.</li>
          <li><strong>Gravitational Invariance of Inertia:</strong> Inertial mass resists acceleration identically regardless of whether gravity is set to Earth, Moon, or Zero-G.</li>
        </ul>
      </div>
    `,
    result: `
      <div class="result-box">
        <h4>Experimental Conclusions:</h4>
        <ol class="manual-ordered-list">
          <li>Total linear momentum is conserved during all 2D rigid-body collision interactions in the physics sandbox.</li>
          <li>The coefficient of restitution directly dictates kinetic energy loss and rebound apex decay.</li>
          <li>In zero-gravity environments, objects preserve uniform rectilinear motion, validating Newton's First Law of Motion.</li>
        </ol>
      </div>
    `
  },
  diffraction: {
    id: "diffraction",
    title: "Diffraction of Light using Diffraction Grating",
    category: "Optics & Wave Phenomena",
    shortDescription: "Explore how a diffraction grating separates light into different orders and observe how wavelength and grating spacing affect diffraction.",
    difficulty: "Undergraduate Wave Optics Laboratory",
    duration: "45 Minutes",
    engine: "Fourier Wave Optics & Fraunhofer Multi-Slit Interference Solver",
    accentColor: "#a855f7",
    referenceBooks: [
      {
        title: "Diffraction Gratings",
        source: "OpenStax",
        url: "https://openstax.org/books/university-physics-volume-3/pages/4-4-diffraction-gratings",
        description: "Learn about diffraction-grating equations, diffraction angles, interference, and wavelength determination."
      },
      {
        title: "Applications of Diffraction, Interference, and Coherence",
        source: "OpenStax",
        url: "https://openstax.org/books/physics/pages/17-2-applications-of-diffraction-interference-and-coherence",
        description: "Explore applications of diffraction and interference in physical systems."
      },
      {
        title: "Understanding Diffraction and Interference",
        source: "OpenStax",
        url: "https://openstax.org/books/physics/pages/17-1-understanding-diffraction-and-interference",
        description: "Understand the wave principles that produce diffraction and interference patterns."
      }
    ],

    aim: `<p class="manual-aim-text">To study the diffraction of monochromatic light through a diffraction grating, observe the formation of principal maxima for different orders, verify the grating equation <strong>d sin θ = mλ</strong>, determine the wavelength of incident spectral lines, and analyze angular dispersion as a function of grating line density.</p>`,
    theory: `
      <div class="theory-block">
        <h3>1. Principle of Multi-Slit Fraunhofer Diffraction</h3>
        <p>A diffraction grating consists of a periodic array of a large number of equally spaced, identical parallel slits or rulings (N lines per unit length) separated by an opaque width. When a monochromatic collimated plane wave of wavelength λ is normally incident upon the grating, each transparent ruling acts as a secondary coherent wave source in accordance with the Huygens-Fresnel principle.</p>
        <p>The secondary wavelets emerging from adjacent slits travel path lengths that differ by an optical path difference (OPD) given by:</p>
        <div class="math-callout">\\Delta = d \\cdot \\sin(\\theta)</div>
        <p>Where <strong>d</strong> is the grating spacing (distance between corresponding points of adjacent slits) and <strong>θ</strong> is the diffraction angle relative to the incident optical axis.</p>
      </div>

      <div class="theory-block">
        <h3>2. The Principal Maxima Condition (Grating Equation)</h3>
        <p>Constructive interference of wavelets from all N rulings occurs whenever the optical path difference between adjacent slits is an integral multiple of the wavelength (mλ). This establishes the fundamental <strong>Grating Equation</strong>:</p>
        <div class="math-callout formula-highlight">d \\cdot \\sin(\\theta) = m \\cdot \\lambda \\implies \\sin(\\theta) = \\frac{m \\cdot \\lambda}{d}</div>
        <p>Where:</p>
        <ul class="manual-list">
          <li><strong>d = 1 / N:</strong> Grating spacing (e.g. for N = 600 lines/mm, d = 1 / (600 × 10³) m = 1.667 μm).</li>
          <li><strong>θ:</strong> Diffraction angle of the emerging principal maximum.</li>
          <li><strong>m = 0, ±1, ±2, ±3...:</strong> Order of diffraction.</li>
          <li><strong>λ:</strong> Optical wavelength of the incident light beam.</li>
        </ul>
        <p>The central maximum corresponds to m = 0 (θ = 0°), where all waves arrive in phase regardless of wavelength. Non-zero orders (m = ±1, ±2...) produce symmetrical maxima on both sides of the central axis.</p>
      </div>

      <div class="theory-block">
        <h3>3. Cutoff & Maximum Observable Order</h3>
        <p>Because the sine of any real physical angle cannot exceed unity (|sin θ| ≤ 1), the maximum permissible diffraction order m<sub>max</sub> is strictly bounded by:</p>
        <div class="math-callout">\\frac{|m| \\cdot \\lambda}{d} \\le 1 \\implies m_{\\text{max}} = \\left\\lfloor \\frac{d}{\\lambda} \\right\\rfloor</div>
        <p>Orders exceeding m<sub>max</sub> are non-propagating evanescent states and cannot be observed on a physical screen.</p>
      </div>

      <div class="theory-block">
        <h3>4. Angular Dispersion & Resolving Power</h3>
        <p>The rate of change of diffraction angle with respect to wavelength is defined as the <strong>angular dispersion (D)</strong>:</p>
        <div class="math-callout">D = \\frac{d\\theta}{d\\lambda} = \\frac{m}{d \\cdot \\cos(\\theta)}</div>
        <p>This demonstrates that angular dispersion increases with higher diffraction order (m) and higher line density N (smaller slit spacing d).</p>
      </div>
    `,
    howToPerform: `
      <div class="steps-container">
        <div class="step-card">
          <div class="step-badge">1</div>
          <div class="step-info">
            <h4>Launch Simulator & Activate Laser</h4>
            <p>Click <strong>Start Simulator</strong>. Ensure the laser source power toggle is switched ON with normal incident alignment onto the grating element.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">2</div>
          <div class="step-info">
            <h4>Configure Grating Density (N)</h4>
            <p>Set the grating density slider to <strong>600 lines/mm</strong> (or use quick presets: 300, 600, 1000 lines/mm). Note the computed slit pitch d = 1.667 μm.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">3</div>
          <div class="step-info">
            <h4>Select Incident Wavelength (λ)</h4>
            <p>Adjust the tunable laser wavelength slider between 400 nm (violet) and 700 nm (deep red), or pick standard presets (e.g. 532 nm Green, 633 nm He-Ne Red).</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">4</div>
          <div class="step-info">
            <h4>Set Screen Distance (L) & Observe Pattern</h4>
            <p>Adjust the screen distance L (e.g. 1.00 m). Observe the bright central maximum (m=0) and symmetrical principal maxima (m=±1, ±2) on the detector screen.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">5</div>
          <div class="step-info">
            <h4>Measure Fringe Positions & Angles</h4>
            <p>Select different orders (m = +1, -1, +2). Inspect the digital telemetry for diffraction angle θ and linear screen displacement y = L · tan(θ).</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">6</div>
          <div class="step-info">
            <h4>Commit Data & Verify Grating Equation</h4>
            <p>Click <strong>Record Observation</strong> to log the trial. Verify that the calculated wavelength λ_calc = (d · sin θ) / m matches the nominal laser wavelength within experimental accuracy.</p>
          </div>
        </div>
      </div>
    `,
    formulas: `
      <div class="formula-card-grid">
        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Grating Equation (Principal Maxima)</span>
            <span class="f-unit">Nanometers [nm]</span>
          </div>
          <div class="f-eq">d \\sin\\theta = m \\lambda \\implies \\lambda = \\frac{d \\sin\\theta}{m}</div>
          <p class="f-desc">Defines condition for constructive multi-slit interference where m is the diffraction order.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Grating Slit Spacing (d)</span>
            <span class="f-unit">Micrometers [μm]</span>
          </div>
          <div class="f-eq">d = \\frac{1}{N \\times 10^3} \\text{ m} = \\frac{10^6}{N} \\text{ nm}</div>
          <p class="f-desc">Microscopic pitch between adjacent ruling slits for line density N (lines/mm).</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Angular Dispersion (D)</span>
            <span class="f-unit">Radians / Micrometer [rad/μm]</span>
          </div>
          <div class="f-eq">D = \\frac{d\\theta}{d\\lambda} = \\frac{m}{d \\cos\\theta}</div>
          <p class="f-desc">Quantifies angular separation between adjacent spectral lines per unit wavelength increment.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Screen Fringe Displacement (y)</span>
            <span class="f-unit">Centimeters [cm]</span>
          </div>
          <div class="f-eq">y = L \\tan\\theta</div>
          <p class="f-desc">Linear distance from central zeroth-order maximum on observation screen at distance L.</p>
        </div>
      </div>
    `,
    procedure: `
      <ol class="manual-ordered-list">
        <li><strong>Optical Alignment:</strong> Mount the monochromatic laser source and transmission diffraction grating normally on the optical rail. Position the observation screen at distance L = 1.00 m.</li>
        <li><strong>Zero Order Verification:</strong> Turn ON the laser. Verify that the central undeviated maximum (m = 0) strikes the center mark (y = 0 cm) of the screen at angle θ = 0.0°.</li>
        <li><strong>First-Order Measurements:</strong> Set grating density N = 600 lines/mm and wavelength λ = 632.8 nm (He-Ne red). Measure the angular deflection θ₁ and screen displacement y₁ of the first-order principal maxima (m = +1 and m = -1).</li>
        <li><strong>Second-Order Measurements:</strong> Identify the second-order maxima (m = ±2), verify that the angle satisfies sin θ₂ = 2λ / d, and check for spatial symmetry.</li>
        <li><strong>Wavelength Dependence:</strong> Keep grating density N constant. Vary the laser wavelength to 532 nm (Green) and 450 nm (Blue). Observe how shorter wavelengths result in smaller diffraction angles.</li>
        <li><strong>Grating Density Dependence:</strong> Keep wavelength λ = 550 nm constant. Increase grating density from 300 to 1000 lines/mm and record the dramatic expansion in angular dispersion.</li>
        <li><strong>Log Trials:</strong> Record at least 4 observation trials across multiple orders to compute mean wavelength and percentage deviation.</li>
      </ol>
    `,
    observationTable: `
      <div class="table-responsive">
        <table class="manual-table">
          <thead>
            <tr>
              <th>Trial</th>
              <th>Laser λ (nm)</th>
              <th>Grating N (/mm)</th>
              <th>Pitch d (μm)</th>
              <th>Order m</th>
              <th>Diffraction Angle θ</th>
              <th>Screen L (m)</th>
              <th>Fringe y (cm)</th>
              <th>Computed λ (nm)</th>
              <th>Error %</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#1</td>
              <td>632.8 nm (Red)</td>
              <td>600 /mm</td>
              <td>1.667 μm</td>
              <td>+1</td>
              <td>22.31°</td>
              <td>1.00 m</td>
              <td>41.03 cm</td>
              <td>632.8 nm</td>
              <td>0.00%</td>
            </tr>
            <tr>
              <td>#2</td>
              <td>532.0 nm (Green)</td>
              <td>600 /mm</td>
              <td>1.667 μm</td>
              <td>+1</td>
              <td>18.61°</td>
              <td>1.00 m</td>
              <td>33.67 cm</td>
              <td>532.0 nm</td>
              <td>0.00%</td>
            </tr>
            <tr>
              <td>#3</td>
              <td>450.0 nm (Blue)</td>
              <td>600 /mm</td>
              <td>1.667 μm</td>
              <td>+2</td>
              <td>32.68°</td>
              <td>1.00 m</td>
              <td>64.15 cm</td>
              <td>450.0 nm</td>
              <td>0.00%</td>
            </tr>
            <tr>
              <td>#4</td>
              <td>532.0 nm (Green)</td>
              <td>1000 /mm</td>
              <td>1.000 μm</td>
              <td>+1</td>
              <td>32.14°</td>
              <td>1.00 m</td>
              <td>62.82 cm</td>
              <td>532.0 nm</td>
              <td>0.00%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="obs-notes">
        <h4>Key Experimental Observations:</h4>
        <ul class="manual-list">
          <li><strong>Spectral Order Symmetry:</strong> Positive orders (m = +1, +2) and negative orders (m = -1, -2) form at strictly identical angular separations on opposite sides of the central maximum.</li>
          <li><strong>Dispersion Characteristics:</strong> Red light (longer wavelength) diffracts at larger angles than violet/blue light (shorter wavelength), in stark contrast to prism refraction.</li>
        </ul>
      </div>
    `,
    result: `
      <div class="result-box">
        <h4>Experimental Conclusions:</h4>
        <ol class="manual-ordered-list">
          <li>The diffraction grating produces discrete, sharp principal maxima satisfying the grating equation <strong>d sin θ = mλ</strong>.</li>
          <li>The diffraction angle increases monotonically with optical wavelength and with grating ruling density.</li>
          <li>The calculated wavelengths from diffraction angle measurements exhibit strict mathematical consistency with nominal laser specifications (< 0.5% deviation).</li>
          <li>Higher orders provide greater angular dispersion D = m / (d cos θ) but exhibit lower intensity in accordance with the single-slit diffraction envelope.</li>
        </ol>
      </div>
    `
  },
  "diffraction-grating": {
    id: "diffraction-grating",
    title: "Diffraction of Light using Diffraction Grating",
    category: "Optics & Wave Phenomena",
    shortDescription: "Explore how a diffraction grating separates light into different orders and observe how wavelength and grating spacing affect diffraction.",
    difficulty: "Undergraduate Wave Optics Laboratory",
    duration: "45 Minutes",
    engine: "Fourier Wave Optics & Fraunhofer Multi-Slit Interference Solver",
    accentColor: "#a855f7",
    aim: `<p class="manual-aim-text">To study the diffraction of monochromatic light through a diffraction grating, observe the formation of principal maxima for different orders, verify the grating equation <strong>d sin θ = mλ</strong>, determine the wavelength of incident spectral lines, and analyze angular dispersion as a function of grating line density.</p>`,
    theory: `
      <div class="theory-block">
        <h3>1. Principle of Multi-Slit Fraunhofer Diffraction</h3>
        <p>A diffraction grating consists of a periodic array of a large number of equally spaced, identical parallel slits or rulings (N lines per unit length) separated by an opaque width. When a monochromatic collimated plane wave of wavelength λ is normally incident upon the grating, each transparent ruling acts as a secondary coherent wave source in accordance with the Huygens-Fresnel principle.</p>
        <p>The secondary wavelets emerging from adjacent slits travel path lengths that differ by an optical path difference (OPD) given by:</p>
        <div class="math-callout">\Delta = d \cdot \sin(\theta)</div>
        <p>Where <strong>d</strong> is the grating spacing (distance between corresponding points of adjacent slits) and <strong>θ</strong> is the diffraction angle relative to the incident optical axis.</p>
      </div>

      <div class="theory-block">
        <h3>2. The Principal Maxima Condition (Grating Equation)</h3>
        <p>Constructive interference of wavelets from all N rulings occurs whenever the optical path difference between adjacent slits is an integral multiple of the wavelength (mλ). This establishes the fundamental <strong>Grating Equation</strong>:</p>
        <div class="math-callout formula-highlight">d \cdot \sin(\theta) = m \cdot \lambda \implies \sin(\theta) = \frac{m \cdot \lambda}{d}</div>
        <p>Where:</p>
        <ul class="manual-list">
          <li><strong>d = 1 / N:</strong> Grating spacing (e.g. for N = 600 lines/mm, d = 1 / (600 × 10³) m = 1.667 μm).</li>
          <li><strong>θ:</strong> Diffraction angle of the emerging principal maximum.</li>
          <li><strong>m = 0, ±1, ±2, ±3...:</strong> Order of diffraction.</li>
          <li><strong>λ:</strong> Optical wavelength of the incident light beam.</li>
        </ul>
        <p>The central maximum corresponds to m = 0 (θ = 0°), where all waves arrive in phase regardless of wavelength. Non-zero orders (m = ±1, ±2...) produce symmetrical maxima on both sides of the central axis.</p>
      </div>

      <div class="theory-block">
        <h3>3. Cutoff & Maximum Observable Order</h3>
        <p>Because the sine of any real physical angle cannot exceed unity (|sin θ| ≤ 1), the maximum permissible diffraction order m<sub>max</sub> is strictly bounded by:</p>
        <div class="math-callout">\frac{|m|\lambda}{d} \le 1 \implies m_{\text{max}} = \left\lfloor \frac{d}{\lambda} \right\rfloor</div>
        <p>Orders exceeding m<sub>max</sub> are non-propagating evanescent states and cannot be observed on a physical screen.</p>
      </div>

      <div class="theory-block">
        <h3>4. Angular Dispersion & Resolving Power</h3>
        <p>The rate of change of diffraction angle with respect to wavelength is defined as the <strong>angular dispersion (D)</strong>:</p>
        <div class="math-callout">D = \frac{d\theta}{d\lambda} = \frac{m}{d \cdot \cos(\theta)}</div>
        <p>This demonstrates that angular dispersion increases with higher diffraction order (m) and higher line density N (smaller slit spacing d).</p>
      </div>
    `,
    howToPerform: `
      <div class="steps-container">
        <div class="step-card">
          <div class="step-badge">1</div>
          <div class="step-info">
            <h4>Launch Simulator & Activate Laser</h4>
            <p>Click <strong>Start Simulator</strong>. Ensure the laser source power toggle is switched ON with normal incident alignment onto the grating element.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">2</div>
          <div class="step-info">
            <h4>Configure Grating Density (N)</h4>
            <p>Set the grating density slider to <strong>600 lines/mm</strong> (or use quick presets: 300, 600, 1000 lines/mm). Note the computed slit pitch d = 1.667 μm.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">3</div>
          <div class="step-info">
            <h4>Select Incident Wavelength (λ)</h4>
            <p>Adjust the tunable laser wavelength slider between 400 nm (violet) and 700 nm (deep red), or pick standard presets (e.g. 532 nm Green, 633 nm He-Ne Red).</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">4</div>
          <div class="step-info">
            <h4>Set Screen Distance (L) & Observe Pattern</h4>
            <p>Adjust the screen distance L (e.g. 1.00 m). Observe the bright central maximum (m=0) and symmetrical principal maxima (m=±1, ±2) on the detector screen.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">5</div>
          <div class="step-info">
            <h4>Measure Fringe Positions & Angles</h4>
            <p>Select different orders (m = +1, -1, +2). Inspect the digital telemetry for diffraction angle θ and linear screen displacement y = L · tan(θ).</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">6</div>
          <div class="step-info">
            <h4>Commit Data & Verify Grating Equation</h4>
            <p>Click <strong>Record Observation</strong> to log the trial. Verify that the calculated wavelength λ_calc = (d · sin θ) / m matches the nominal laser wavelength within experimental accuracy.</p>
          </div>
        </div>
      </div>
    `,
    formulas: `
      <div class="formula-card-grid">
        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Grating Equation (Principal Maxima)</span>
            <span class="f-unit">Nanometers [nm]</span>
          </div>
          <div class="f-eq">d \\sin\\theta = m \\lambda \\implies \\lambda = \\frac{d \\sin\\theta}{m}</div>
          <p class="f-desc">Defines condition for constructive multi-slit interference where m is the diffraction order.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Grating Slit Spacing (d)</span>
            <span class="f-unit">Micrometers [μm]</span>
          </div>
          <div class="f-eq">d = \\frac{1}{N \\times 10^3} \\text{ m} = \\frac{10^6}{N} \\text{ nm}</div>
          <p class="f-desc">Microscopic pitch between adjacent ruling slits for line density N (lines/mm).</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Angular Dispersion (D)</span>
            <span class="f-unit">Radians / Micrometer [rad/μm]</span>
          </div>
          <div class="f-eq">D = \\frac{d\\theta}{d\\lambda} = \\frac{m}{d \\cos\\theta}</div>
          <p class="f-desc">Quantifies angular separation between adjacent spectral lines per unit wavelength increment.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Screen Fringe Displacement (y)</span>
            <span class="f-unit">Centimeters [cm]</span>
          </div>
          <div class="f-eq">y = L \\tan\\theta</div>
          <p class="f-desc">Linear distance from central zeroth-order maximum on observation screen at distance L.</p>
        </div>
      </div>
    `,
    procedure: `
      <ol class="manual-ordered-list">
        <li><strong>Optical Alignment:</strong> Mount the monochromatic laser source and transmission diffraction grating normally on the optical rail. Position the observation screen at distance L = 1.00 m.</li>
        <li><strong>Zero Order Verification:</strong> Turn ON the laser. Verify that the central undeviated maximum (m = 0) strikes the center mark (y = 0 cm) of the screen at angle θ = 0.0°.</li>
        <li><strong>First-Order Measurements:</strong> Set grating density N = 600 lines/mm and wavelength λ = 632.8 nm (He-Ne red). Measure the angular deflection θ₁ and screen displacement y₁ of the first-order principal maxima (m = +1 and m = -1).</li>
        <li><strong>Second-Order Measurements:</strong> Identify the second-order maxima (m = ±2), verify that the angle satisfies sin θ₂ = 2λ / d, and check for spatial symmetry.</li>
        <li><strong>Wavelength Dependence:</strong> Keep grating density N constant. Vary the laser wavelength to 532 nm (Green) and 450 nm (Blue). Observe how shorter wavelengths result in smaller diffraction angles.</li>
        <li><strong>Grating Density Dependence:</strong> Keep wavelength λ = 550 nm constant. Increase grating density from 300 to 1000 lines/mm and record the dramatic expansion in angular dispersion.</li>
        <li><strong>Log Trials:</strong> Record at least 4 observation trials across multiple orders to compute mean wavelength and percentage deviation.</li>
      </ol>
    `,
    observationTable: `
      <div class="table-responsive">
        <table class="manual-table">
          <thead>
            <tr>
              <th>Trial</th>
              <th>Laser λ (nm)</th>
              <th>Grating N (/mm)</th>
              <th>Pitch d (μm)</th>
              <th>Order m</th>
              <th>Diffraction Angle θ</th>
              <th>Screen L (m)</th>
              <th>Fringe y (cm)</th>
              <th>Computed λ (nm)</th>
              <th>Error %</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#1</td>
              <td>632.8 nm (Red)</td>
              <td>600 /mm</td>
              <td>1.667 μm</td>
              <td>+1</td>
              <td>22.31°</td>
              <td>1.00 m</td>
              <td>41.03 cm</td>
              <td>632.8 nm</td>
              <td>0.00%</td>
            </tr>
            <tr>
              <td>#2</td>
              <td>532.0 nm (Green)</td>
              <td>600 /mm</td>
              <td>1.667 μm</td>
              <td>+1</td>
              <td>18.61°</td>
              <td>1.00 m</td>
              <td>33.67 cm</td>
              <td>532.0 nm</td>
              <td>0.00%</td>
            </tr>
            <tr>
              <td>#3</td>
              <td>450.0 nm (Blue)</td>
              <td>600 /mm</td>
              <td>1.667 μm</td>
              <td>+2</td>
              <td>32.68°</td>
              <td>1.00 m</td>
              <td>64.15 cm</td>
              <td>450.0 nm</td>
              <td>0.00%</td>
            </tr>
            <tr>
              <td>#4</td>
              <td>532.0 nm (Green)</td>
              <td>1000 /mm</td>
              <td>1.000 μm</td>
              <td>+1</td>
              <td>32.14°</td>
              <td>1.00 m</td>
              <td>62.82 cm</td>
              <td>532.0 nm</td>
              <td>0.00%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="obs-notes">
        <h4>Key Experimental Observations:</h4>
        <ul class="manual-list">
          <li><strong>Spectral Order Symmetry:</strong> Positive orders (m = +1, +2) and negative orders (m = -1, -2) form at strictly identical angular separations on opposite sides of the central maximum.</li>
          <li><strong>Dispersion Characteristics:</strong> Red light (longer wavelength) diffracts at larger angles than violet/blue light (shorter wavelength), in stark contrast to prism refraction.</li>
        </ul>
      </div>
    `,
    result: `
      <div class="result-box">
        <h4>Experimental Conclusions:</h4>
        <ol class="manual-ordered-list">
          <li>The diffraction grating produces discrete, sharp principal maxima satisfying the grating equation <strong>d sin θ = mλ</strong>.</li>
          <li>The diffraction angle increases monotonically with optical wavelength and with grating ruling density.</li>
          <li>The calculated wavelengths from diffraction angle measurements exhibit strict mathematical consistency with nominal laser specifications (< 0.5% deviation).</li>
          <li>Higher orders provide greater angular dispersion D = m / (d cos θ) but exhibit lower intensity in accordance with the single-slit diffraction envelope.</li>
        </ol>
      </div>
    `
  },

  "hall-effect": {
    id: "hall-effect",
    title: "Hall Effect in Semiconductor & Metal Probes",
    category: "Solid State Physics & Magnetotransport",
    shortDescription: "Measure transverse Hall voltage under perpendicular magnetic fields, evaluate carrier concentration, mobility, and determine semiconductor carrier type.",
    difficulty: "Undergraduate / Advanced STEM Practical",
    duration: "45 Minutes",
    engine: "Lorentz Force Magnetotransport & Carrier Dynamics Solver",
    accentColor: "#8b5cf6",
    referenceBooks: [
      {
        title: "University Physics, Volume 3: Introduction",
        source: "OpenStax",
        url: "https://openstax.org/books/university-physics-volume-3/pages/9-introduction",
        description: "Review the semiconductor and charge-carrier concepts relevant to Hall-effect measurements."
      },
      {
        title: "Magnetic Force on a Current-Carrying Conductor",
        source: "OpenStax",
        url: "https://openstax.org/books/university-physics-volume-2/pages/11-4-magnetic-force-on-a-current-carrying-conductor",
        description: "Understand the magnetic forces acting on moving charges and current-carrying conductors."
      },
      {
        title: "Virtual Physical Sciences Laboratory Portal",
        source: "IIT Kanpur Virtual Labs",
        url: "https://bop-iitk.vlabs.ac.in/",
        description: "Explore the virtual-laboratory portal for related experimental physics material."
      }
    ],
    aim: `<p class="manual-aim-text">To investigate the Hall Effect in semiconductor and metallic specimens placed in a uniform perpendicular magnetic field, to determine the sign of the charge carriers, to measure the transverse Hall voltage (V<sub>H</sub>) as a function of specimen current (I) and magnetic flux density (B), and to calculate the Hall coefficient (R<sub>H</sub>), carrier concentration (n), and carrier mobility (μ<sub>H</sub>).</p>`,
    theory: `
      <div class="theory-block">
        <h3>1. The Classical Lorentz Force Principle</h3>
        <p>When an electrical current carrying conductor or semiconductor wafer of thickness t and width w is placed in a transverse magnetic field B perpendicular to the direction of current density J, the moving charge carriers experience a transverse magnetic Lorentz force:</p>
        <div class="math-callout formula-highlight">F<sub>L</sub> = q · (v<sub>d</sub> × B)</div>
        <p>where q is the elementary charge of the carrier, v<sub>d</sub> is the average drift velocity, and B is the magnetic flux density. This force deflects charge carriers toward one lateral boundary of the material, causing an excess accumulation of charge along that edge and a depletion along the opposing edge.</p>
      </div>

      <div class="theory-block">
        <h3>2. Transverse Electric Field Equilibrium & Hall Voltage</h3>
        <p>The asymmetric accumulation of charge creates a transverse electrostatic field E<sub>H</sub> (the Hall electric field) oriented perpendicular to both current and magnetic field. This transverse field exerts an opposing electrostatic force on moving carriers:</p>
        <div class="math-callout">F<sub>E</sub> = q · E<sub>H</sub></div>
        <p>In steady-state dynamic equilibrium, the electrostatic force precisely counterbalances the magnetic Lorentz force:</p>
        <div class="math-callout">q · E<sub>H</sub> = q · v<sub>d</sub> · B &nbsp;⟹&nbsp; E<sub>H</sub> = v<sub>d</sub> · B</div>
        <p>The resulting transverse potential difference measured across width w is the <strong>Hall Voltage (V<sub>H</sub>)</strong>:</p>
        <div class="math-callout formula-highlight">V<sub>H</sub> = E<sub>H</sub> · w = v<sub>d</sub> · B · w</div>
      </div>

      <div class="theory-block">
        <h3>3. Derivation of the Hall Coefficient & Carrier Density</h3>
        <p>The longitudinal current I flowing through the cross-sectional area A = w · t is related to carrier concentration n by:</p>
        <div class="math-callout">I = n · q · A · v<sub>d</sub> = n · q · w · t · v<sub>d</sub> &nbsp;⟹&nbsp; v<sub>d</sub> = I / (n · q · w · t)</div>
        <p>Substituting v<sub>d</sub> into the expression for V<sub>H</sub> gives:</p>
        <div class="math-callout formula-highlight">V<sub>H</sub> = (I · B) / (n · q · t) = (R<sub>H</sub> · I · B) / t</div>
        <p>where <strong>R<sub>H</sub></strong> is the <strong>Hall Coefficient</strong> defined as:</p>
        <div class="math-callout formula-highlight">R<sub>H</sub> = 1 / (n · q)</div>
        <p>Rearranging in terms of experimental observables yields:</p>
        <div class="math-callout formula-highlight">R<sub>H</sub> = (V<sub>H</sub> · t) / (I · B)</div>
        <p>The majority charge carrier density is then determined from:</p>
        <div class="math-callout formula-highlight">n = 1 / (|R<sub>H</sub>| · e)</div>
        <p>where e = 1.602 × 10⁻¹⁹ C is the electronic charge quantum.</p>
      </div>

      <div class="theory-block">
        <h3>4. Sign Convention & Majority Carrier Identification</h3>
        <p>The polarity of V<sub>H</sub> reveals the sign of the dominant mobile charge carriers:</p>
        <ul class="manual-list">
          <li><strong>n-type Semiconductors:</strong> Majority carriers are negative conduction electrons (q = −e). Consequently, R<sub>H</sub> &lt; 0 and the measured Hall voltage is negative under standard probe orientation.</li>
          <li><strong>p-type Semiconductors:</strong> Majority carriers are positive valence-band holes (q = +e). Consequently, R<sub>H</sub> &gt; 0 and the measured Hall voltage is positive.</li>
          <li><strong>Metals (e.g. Copper):</strong> The carrier density n is exceptionally high (~10²⁸ m⁻³), resulting in tiny microvolt-scale Hall potentials (~0.1 to 2 μV), whereas doped semiconductors (~10²⁰ m⁻³) yield easily observable millivolts (1 to 60 mV).</li>
        </ul>
      </div>

      <div class="theory-block">
        <h3>5. Carrier Mobility & Hall Angle</h3>
        <p>Combining the Hall coefficient with the electrical conductivity σ = 1 / ρ = n · e · μ yields the <strong>Hall Mobility (μ<sub>H</sub>)</strong>:</p>
        <div class="math-callout formula-highlight">μ<sub>H</sub> = |R<sub>H</sub>| · σ = |R<sub>H</sub>| / ρ</div>
        <p>The deflection angle of total current flow with respect to the applied electric field is the <strong>Hall Angle (θ<sub>H</sub>)</strong>:</p>
        <div class="math-callout">tan(θ<sub>H</sub>) = E<sub>H</sub> / E<sub>x</sub> = μ<sub>H</sub> · B</div>
      </div>
    `,
    howToPerform: `
      <div class="steps-container">
        <div class="step-card">
          <div class="step-badge">1</div>
          <div class="step-info">
            <h4>Launch the Hall Effect Virtual Workstation</h4>
            <p>Click the <strong>Start Simulator</strong> button to open the dual-canvas Electromagnetic Hall Effect bench and telemetry deck.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">2</div>
          <div class="step-info">
            <h4>Mount Semiconductor or Metal Specimen</h4>
            <p>Select your test specimen from the Material Palette: <strong>n-type Germanium (Ge)</strong>, <strong>p-type Germanium (Ge)</strong>, <strong>Indium Arsenide (InAs)</strong>, or <strong>Copper Foil (Cu)</strong>.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">3</div>
          <div class="step-info">
            <h4>Energize Constant Current Supply</h4>
            <p>Turn ON the <strong>Sample Current Power Switch</strong>. Set the specimen current slider between 10.0 mA and 40.0 mA. Observe the glowing carrier stream inside the crystal.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">4</div>
          <div class="step-info">
            <h4>Energize Electromagnet Field (B)</h4>
            <p>Turn ON the <strong>Electromagnet Power Switch</strong>. Adjust the magnetic flux density B from 0.0 T to 0.80 T. Watch the animated B-field flux lines and notice the Lorentz deflection curving carriers toward the wafer edge.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">5</div>
          <div class="step-info">
            <h4>Perform Zero-Null Contact Balancing</h4>
            <p>Before recording final data, click <strong>Zero Offset Balance</strong> to nullify any contact probe misalignment offset voltage (V₀ = 0.0 mV).</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">6</div>
          <div class="step-info">
            <h4>Verify Polarity Reversal & Log Data</h4>
            <p>Toggle <strong>Field Polarity (+B / -B)</strong> and <strong>Current Polarity (+I / -I)</strong> to verify four-quadrant sign inversion. Click <strong>Record Observation</strong> to commit data points and export official reports.</p>
          </div>
        </div>
      </div>
    `,
    procedure: `
      <ol class="manual-ordered-list">
        <li><strong>Apparatus Setup:</strong> Place the calibrated semiconductor probe between the pole pieces of the electromagnet. Ensure probe faces are strictly perpendicular to the magnetic axis.</li>
        <li><strong>Zero-Offset Elimination:</strong> Set magnetic field to B = 0.0 T. If any residual misalignment voltage appears on the microvoltmeter, adjust the balance potentiometer to zero.</li>
        <li><strong>Varying Magnetic Field at Constant Current:</strong> Fix specimen current I = 20.0 mA. Increase magnetic flux density B in steps from 0.10 T to 0.80 T. Record the measured Hall voltage V<sub>H</sub> at each step.</li>
        <li><strong>Varying Specimen Current at Constant Field:</strong> Fix magnetic flux density B = 0.50 T. Increase specimen current I from 5.0 mA to 45.0 mA in equal steps. Record V<sub>H</sub>.</li>
        <li><strong>Reversing Field & Current Polarity:</strong> Reverse the magnetic field direction (-B) and repeat observations to eliminate thermo-galvanic spurious voltages via four-quadrant averaging: V<sub>H</sub> = [(V₁ − V₂) + (V₃ − V₄)] / 4.</li>
        <li><strong>Specimen Comparison:</strong> Switch to the p-type Germanium wafer and note the sign inversion of V<sub>H</sub>. Switch to the Copper foil to observe microvolt metallic response.</li>
        <li><strong>Data Analysis:</strong> Plot V<sub>H</sub> versus B and V<sub>H</sub> versus I. Evaluate slope, calculate Hall coefficient R<sub>H</sub>, carrier density n, and carrier mobility μ<sub>H</sub>.</li>
      </ol>
    `,
    formulas: `
      <div class="manual-formula-grid">
        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Hall Voltage (V<sub>H</sub>)</span>
            <span class="f-unit">Millivolts [mV]</span>
          </div>
          <div class="f-eq">V<sub>H</sub> = (R<sub>H</sub> · I · B) / t</div>
          <p class="f-desc">Where R<sub>H</sub> is Hall coefficient, I is specimen current, B is magnetic flux density, and t is specimen thickness.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Hall Coefficient (R<sub>H</sub>)</span>
            <span class="f-unit">m³ / C</span>
          </div>
          <div class="f-eq">R<sub>H</sub> = (V<sub>H</sub> · t) / (I · B) = 1 / (n · q)</div>
          <p class="f-desc">Intrinsic material constant indicating carrier type (negative for electrons, positive for holes).</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Carrier Concentration (n)</span>
            <span class="f-unit">Carriers per m³ [m⁻³]</span>
          </div>
          <div class="f-eq">n = 1 / (|R<sub>H</sub>| · e)</div>
          <p class="f-desc">Volumetric density of majority mobile charge carriers, where e = 1.602 × 10⁻¹⁹ C.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Carrier Mobility (μ<sub>H</sub>)</span>
            <span class="f-unit">m² / (V · s)</span>
          </div>
          <div class="f-eq">μ<sub>H</sub> = |R<sub>H</sub>| · σ = |R<sub>H</sub>| / ρ</div>
          <p class="f-desc">Quantifies the drift velocity of charge carriers per unit applied electric field in the crystal lattice.</p>
        </div>

        <div class="manual-formula-card">
          <div class="f-header">
            <span class="f-title">Hall Deflection Angle (θ<sub>H</sub>)</span>
            <span class="f-unit">Degrees [°]</span>
          </div>
          <div class="f-eq">tan(θ<sub>H</sub>) = μ<sub>H</sub> · B</div>
          <p class="f-desc">The geometric angle between the total electric field vector and the current density vector.</p>
        </div>
      </div>
    `,
    observations: `
      <div class="obs-table-wrap">
        <table class="manual-obs-table">
          <thead>
            <tr>
              <th>Trial</th>
              <th>Specimen</th>
              <th>Current I (mA)</th>
              <th>Field B (T)</th>
              <th>Hall Voltage V<sub>H</sub> (mV)</th>
              <th>Hall Coeff R<sub>H</sub> (m³/C)</th>
              <th>Carrier Density n (m⁻³)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>n-type Ge</td>
              <td>20.0 mA</td>
              <td>0.20 T</td>
              <td>-6.08 mV</td>
              <td>-3.80 × 10⁻²</td>
              <td>1.64 × 10²⁰</td>
            </tr>
            <tr>
              <td>2</td>
              <td>n-type Ge</td>
              <td>20.0 mA</td>
              <td>0.40 T</td>
              <td>-12.16 mV</td>
              <td>-3.80 × 10⁻²</td>
              <td>1.64 × 10²⁰</td>
            </tr>
            <tr>
              <td>3</td>
              <td>n-type Ge</td>
              <td>20.0 mA</td>
              <td>0.60 T</td>
              <td>-18.24 mV</td>
              <td>-3.80 × 10⁻²</td>
              <td>1.64 × 10²⁰</td>
            </tr>
            <tr>
              <td>4</td>
              <td>p-type Ge</td>
              <td>20.0 mA</td>
              <td>0.40 T</td>
              <td>+10.40 mV</td>
              <td>+3.25 × 10⁻²</td>
              <td>1.92 × 10²⁰</td>
            </tr>
            <tr>
              <td>5</td>
              <td>InAs Thin Wafer</td>
              <td>20.0 mA</td>
              <td>0.40 T</td>
              <td>-96.00 mV</td>
              <td>-1.20 × 10⁻¹</td>
              <td>5.21 × 10¹⁹</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="obs-notes">
        <h4>Key Experimental Takeaways:</h4>
        <ul class="manual-list">
          <li><strong>Direct Linearity:</strong> V<sub>H</sub> is strictly proportional to both sample current I and magnetic flux density B, confirming the theoretical relationship V<sub>H</sub> ∝ I · B.</li>
          <li><strong>Carrier Polarity Verification:</strong> n-type semiconductors produce negative Hall potentials due to electron deflection, whereas p-type crystals produce positive potentials due to hole accumulation.</li>
          <li><strong>Semiconductor vs Metal Sensitivity:</strong> Because carrier density n is several orders of magnitude smaller in semiconductors than metals, their Hall coefficient R<sub>H</sub> and output voltage V<sub>H</sub> are thousands of times larger.</li>
        </ul>
      </div>
    `,
    result: `
      <div class="result-box">
        <h4>Experimental Conclusions:</h4>
        <ol class="manual-ordered-list">
          <li>The Hall Effect was successfully verified across n-type Germanium, p-type Germanium, Indium Arsenide, and Copper specimens.</li>
          <li>The sign of the majority charge carriers was unambiguously identified: electrons for n-Ge and InAs (R<sub>H</sub> &lt; 0), and holes for p-Ge (R<sub>H</sub> &gt; 0).</li>
          <li>The experimental Hall coefficient of n-type Germanium was determined to be R<sub>H</sub> = -3.80 × 10⁻² m³/C, yielding a carrier concentration of n = 1.64 × 10²⁰ m⁻³.</li>
          <li>The Hall coefficient of p-type Germanium was determined to be R<sub>H</sub> = +3.25 × 10⁻² m³/C, yielding a hole concentration of p = 1.92 × 10²⁰ m⁻³.</li>
          <li>Linear regression analysis of V<sub>H</sub> versus B demonstrated high linearity (R² &gt; 0.999), validating Lorentz magnetotransport theory.</li>
        </ol>
      </div>
`
  },

  "diode": {
    id: "diode",
    title: "Diode V-I Characteristics",
    category: "Semiconductor Electronics & Solid State Physics",
    shortDescription: "Study the voltage-current (V-I) characteristics of a P-N junction diode under forward and reverse bias conditions, determine knee voltage and dynamic resistance.",
    difficulty: "Undergraduate Semiconductor Laboratory",
    duration: "45 Minutes",
    engine: "Deterministic Shockley Semiconductor Diode Physics Solver",
    accentColor: "#f59e0b",

    referenceBooks: [
      {
        title: "Semiconductor Devices",
        source: "OpenStax",
        url: "https://openstax.org/books/university-physics-volume-3/pages/9-7-semiconductor-devices",
        description: "Study semiconductor devices and the physical principles behind PN-junction operation."
      },
      {
        title: "PN Junction Diode",
        source: "Electronics Tutorials",
        url: "https://www.electronics-tutorials.ws/diode/diode_1.html",
        description: "Learn about diode operation, junction behaviour, and forward and reverse bias."
      },
      {
        title: "Diode Characteristics",
        source: "Electronics Tutorials",
        url: "https://www.electronics-tutorials.ws/diode/diode_2.html",
        description: "Explore diode current-voltage characteristics and the behaviour of a diode under different bias conditions."
      }
    ],
    aim: `<p class="manual-aim-text">To study the voltage - current (V-I) characteristics of a forward and reverse bias P-N Junction diode, determine the cut-in (knee) voltage, and evaluate the static and dynamic resistance in forward and reverse operating regions.</p>`,
    apparatus: `<p class="manual-aim-text">A P-N Junction diode, milliammeter, Voltmeter, micro-ammeter, power supply & connection wires.</p>`,
    theory: `
      <div class="theory-block">
        <h3>1. P-N Junction Diode & Depletion Region</h3>
        <p>A P-N junction diode is a two-terminal semiconductor device formed by joining P-type and N-type semiconductor crystals. At the metallurgical junction, free electrons from the N-region diffuse into the P-region, while holes from the P-region diffuse into the N-region. This recombination leaves behind uncompensated immobile donor ions (positive) in the N-region and uncompensated immobile acceptor ions (negative) in the P-region.</p>
        <p>This region devoid of free mobile charge carriers is known as the <strong>Depletion Region</strong>. The space charge generates an internal electric field that opposes further carrier diffusion, establishing a <strong>Barrier Potential ($V_0$)</strong> (typically $\approx 0.7\\text{ V}$ for Silicon and $\approx 0.3\\text{ V}$ for Germanium at room temperature $T = 300\\text{ K}$).</p>
      </div>

      <div class="theory-block">
        <h3>2. Forward Biased P-N Junction</h3>
        <p>When the positive terminal of an external DC source is connected to the <strong>P-type semiconductor</strong> (Anode) and the negative terminal is connected to the <strong>N-type semiconductor</strong> (Cathode), the diode is said to be <strong>Forward Biased</strong>.</p>
        <ul class="manual-list">
          <li><strong>Depletion Region Narrowing:</strong> The external potential opposes the built-in barrier potential ($V_0 - V$), pushing holes and free electrons toward the junction. As forward voltage increases, the depletion layer becomes markedly <strong>narrowed</strong>.</li>
          <li><strong>Cut-in / Knee Voltage ($V_k$):</strong> When the forward voltage $V_f$ remains below the barrier potential ($V_f < 0.65\\text{ V}$ for Si), current is extremely small. Once $V_f$ overcomes the barrier potential, majority charge carriers cross the junction in large numbers, resulting in a steep, exponential rise in forward current ($I_f$).</li>
          <li><strong>Circuit Arrangement:</strong> The milliammeter is connected in <strong>series</strong> with the diode to measure forward current ($0 - 10\\text{ mA}$), and the voltmeter is connected in <strong>parallel</strong> across the DC supply to measure forward voltage ($0 - 1.5\\text{ V}$).</li>
        </ul>

        <!-- IMAGE 2: FORWARD BIASED P-N JUNCTION CHARGE CARRIER DIAGRAM -->
        <div class="manual-diagram-card" style="margin: 18px 0; background: #070d1e; border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 18px; text-align: center;">
          <h4 style="color: #ffffff; font-size: 15px; margin-bottom: 12px; letter-spacing: 0.8px; text-transform: uppercase;">Forward Biased P-N Junction (Internal Mechanism & Charge Carriers)</h4>
          <svg viewBox="0 0 800 480" width="100%" style="max-width: 720px; height: auto; display: block; margin: 0 auto; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));">
            <defs>
              <linearGradient id="pTypeGradFwd" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#b45309" stop-opacity="0.85" />
                <stop offset="100%" stop-color="#78350f" stop-opacity="0.95" />
              </linearGradient>
              <linearGradient id="nTypeGradFwd" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#1e3a8a" stop-opacity="0.95" />
                <stop offset="100%" stop-color="#1e40af" stop-opacity="0.85" />
              </linearGradient>
              <marker id="arrowHeadCyan" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M1,1 L7,4 L1,7 Z" fill="#38bdf8" />
              </marker>
              <marker id="arrowHeadAmber" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M1,1 L7,4 L1,7 Z" fill="#fbbf24" />
              </marker>
              <marker id="arrowHeadWhite" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M1,1 L7,4 L1,7 Z" fill="#ffffff" />
              </marker>
            </defs>

            <!-- Background Grid -->
            <rect width="800" height="480" rx="10" fill="#040816" />
            <g opacity="0.1" stroke="#38bdf8" stroke-width="1">
              <line x1="0" y1="60" x2="800" y2="60" /><line x1="0" y1="120" x2="800" y2="120" /><line x1="0" y1="180" x2="800" y2="180" /><line x1="0" y1="240" x2="800" y2="240" /><line x1="0" y1="300" x2="800" y2="300" /><line x1="0" y1="360" x2="800" y2="360" /><line x1="0" y1="420" x2="800" y2="420" />
              <line x1="100" y1="0" x2="100" y2="480" /><line x1="200" y1="0" x2="200" y2="480" /><line x1="300" y1="0" x2="300" y2="480" /><line x1="400" y1="0" x2="400" y2="480" /><line x1="500" y1="0" x2="500" y2="480" /><line x1="600" y1="0" x2="600" y2="480" /><line x1="700" y1="0" x2="700" y2="480" />
            </g>

            <!-- Title Header -->
            <text x="400" y="44" fill="#ffffff" font-family="'Space Grotesk', Outfit, sans-serif" font-size="22" font-weight="bold" text-anchor="middle" letter-spacing="1.5">FORWARD BIASED P-N JUNCTION</text>

            <!-- Depletion Region Narrowed Bracket -->
            <text x="400" y="82" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">DEPLETION REGION (NARROWED)</text>
            <path d="M 360 88 L 360 96 L 440 96 L 440 88" fill="none" stroke="#94a3b8" stroke-width="1.5" />

            <!-- P-Type Semiconductor Header -->
            <text x="230" y="82" fill="#fb923c" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">P-type Semiconductor</text>

            <!-- N-Type Semiconductor Header -->
            <text x="570" y="82" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">N-type Semiconductor</text>

            <!-- P-Region Block -->
            <rect x="110" y="105" width="250" height="170" rx="6" fill="url(#pTypeGradFwd)" stroke="#ea580c" stroke-width="2" />

            <!-- N-Region Block -->
            <rect x="440" y="105" width="250" height="170" rx="6" fill="url(#nTypeGradFwd)" stroke="#2563eb" stroke-width="2" />

            <!-- Depletion Layer P-side -->
            <rect x="360" y="105" width="40" height="170" fill="#451a03" stroke="#ea580c" stroke-dasharray="3,3" stroke-width="1.5" />
            <!-- Depletion Layer N-side -->
            <rect x="400" y="105" width="40" height="170" fill="#172554" stroke="#2563eb" stroke-dasharray="3,3" stroke-width="1.5" />

            <!-- P-N Junction Metallurgical Line -->
            <line x1="400" y1="105" x2="400" y2="275" stroke="#ffffff" stroke-width="2" />
            <!-- Arrow pointing to P-N Junction -->
            <line x1="400" y1="315" x2="400" y2="282" stroke="#ffffff" stroke-width="1.8" marker-end="url(#arrowHeadWhite)" />
            <text x="400" y="332" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">P-N Junction</text>

            <!-- Holes (+) in P-type -->
            <g fill="#ea580c" stroke="#fef08a" stroke-width="1.5">
              <circle cx="140" cy="130" r="13" /><text x="140" y="135" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="210" cy="130" r="13" /><text x="210" y="135" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="280" cy="130" r="13" /><text x="280" y="135" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="140" cy="180" r="13" /><text x="140" y="185" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="210" cy="180" r="13" /><text x="210" y="185" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="280" cy="180" r="13" /><text x="280" y="185" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="140" cy="230" r="13" /><text x="140" y="235" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="210" cy="230" r="13" /><text x="210" y="235" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="280" cy="230" r="13" /><text x="280" y="235" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="340" cy="230" r="13" /><text x="340" y="235" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
            </g>

            <!-- Label Holes (+) -->
            <text x="210" y="188" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Holes (⊕)</text>

            <!-- Holes Flow Arrows (pointing right towards junction) -->
            <line x1="300" y1="130" x2="350" y2="130" stroke="#f59e0b" stroke-width="4" marker-end="url(#arrowHeadAmber)" />
            <line x1="300" y1="180" x2="350" y2="180" stroke="#f59e0b" stroke-width="4" marker-end="url(#arrowHeadAmber)" />
            <line x1="300" y1="230" x2="350" y2="230" stroke="#f59e0b" stroke-width="4" marker-end="url(#arrowHeadAmber)" />

            <!-- Immobile Negative Ions in Depletion Layer (P-side) -->
            <g fill="#7c2d12" stroke="#ea580c" stroke-width="1.2">
              <circle cx="380" cy="125" r="9" /><text x="380" y="129" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="380" cy="155" r="9" /><text x="380" y="159" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="380" cy="185" r="9" /><text x="380" y="189" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="380" cy="215" r="9" /><text x="380" y="219" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="380" cy="245" r="9" /><text x="380" y="249" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
            </g>

            <!-- Immobile Positive Ions in Depletion Layer (N-side) -->
            <g fill="#1e3a8a" stroke="#38bdf8" stroke-width="1.2">
              <circle cx="420" cy="125" r="9" /><text x="420" y="130" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="420" cy="155" r="9" /><text x="420" y="160" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="420" cy="185" r="9" /><text x="420" y="190" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="420" cy="215" r="9" /><text x="420" y="220" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="420" cy="245" r="9" /><text x="420" y="250" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
            </g>

            <!-- Free Electrons Flow Arrows (pointing left towards junction) -->
            <line x1="500" y1="130" x2="450" y2="130" stroke="#38bdf8" stroke-width="4" marker-end="url(#arrowHeadCyan)" />
            <line x1="500" y1="180" x2="450" y2="180" stroke="#38bdf8" stroke-width="4" marker-end="url(#arrowHeadCyan)" />
            <line x1="500" y1="230" x2="450" y2="230" stroke="#38bdf8" stroke-width="4" marker-end="url(#arrowHeadCyan)" />

            <!-- Free Electrons (-) in N-type -->
            <g fill="#1d4ed8" stroke="#67e8f9" stroke-width="1.5">
              <circle cx="520" cy="130" r="13" /><text x="520" y="135" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="590" cy="130" r="13" /><text x="590" y="135" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="660" cy="130" r="13" /><text x="660" y="135" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="520" cy="180" r="13" /><text x="520" y="185" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="590" cy="180" r="13" /><text x="590" y="185" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="660" cy="180" r="13" /><text x="660" y="185" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="520" cy="230" r="13" /><text x="520" y="235" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="590" cy="230" r="13" /><text x="590" y="235" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="660" cy="230" r="13" /><text x="660" y="235" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
            </g>

            <!-- Label Free Electrons (-) -->
            <text x="590" y="188" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Free Electrons (⊖)</text>

            <!-- Bottom Labels under Blocks -->
            <text x="235" y="300" fill="#fb923c" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">P-type Semiconductor</text>
            <text x="565" y="300" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">N-type Semiconductor</text>

            <!-- External Wiring to Battery -->
            <!-- Positive Lead (P-side to Battery +) -->
            <path d="M 110 190 L 60 190 L 60 380 L 320 380" fill="none" stroke="#ea580c" stroke-width="3" />
            <!-- Negative Lead (N-side to Battery -) -->
            <path d="M 690 190 L 740 190 L 740 380 L 480 380" fill="none" stroke="#3b82f6" stroke-width="3" />

            <!-- Conventional Current Arrow (Left wire) -->
            <line x1="60" y1="360" x2="60" y2="280" stroke="#fde047" stroke-width="3" marker-end="url(#arrowHeadWhite)" />
            <line x1="35" y1="420" x2="220" y2="420" stroke="#fde047" stroke-width="3" marker-end="url(#arrowHeadWhite)" />
            <text x="127" y="442" fill="#fde047" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Conventional Current (I)</text>

            <!-- Battery Graphic -->
            <!-- Positive Half -->
            <rect x="320" y="350" width="80" height="60" rx="3" fill="#dc2626" stroke="#f87171" stroke-width="2" />
            <text x="360" y="388" fill="#ffffff" font-size="28" font-weight="bold" text-anchor="middle">+</text>
            <!-- Negative Half -->
            <rect x="400" y="350" width="80" height="60" rx="3" fill="#2563eb" stroke="#60a5fa" stroke-width="2" />
            <text x="440" y="388" fill="#ffffff" font-size="28" font-weight="bold" text-anchor="middle">−</text>

            <!-- Battery Label -->
            <text x="400" y="432" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">External Battery (DC Source)</text>
            <text x="330" y="338" fill="#fca5a5" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Positive (+) Terminal</text>
            <text x="470" y="338" fill="#93c5fd" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Negative (−) Terminal</text>

            <!-- Forward Bias Arrow on Return Lead -->
            <line x1="740" y1="280" x2="740" y2="350" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrowHeadCyan)" />
            <text x="670" y="350" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Forward Bias</text>
            <text x="670" y="370" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">(V > 0)</text>
          </svg>
        </div>

        <!-- FORWARD BIAS LAB ELECTRICAL SCHEMATIC -->
        <div class="manual-diagram-card" style="margin: 18px 0; background: #070d1e; border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 10px; padding: 18px; text-align: center;">
          <h4 style="color: #fbbf24; font-size: 14px; margin-bottom: 12px; letter-spacing: 0.8px; text-transform: uppercase;">Forward Bias Laboratory Circuit Schematic (Series Ammeter, Parallel Voltmeter)</h4>
          <svg viewBox="0 0 700 280" width="100%" style="max-width: 640px; height: auto; display: block; margin: 0 auto;">
            <!-- Schematic Lines -->
            <rect width="700" height="280" rx="8" fill="#030712" />
            <!-- Main Loop -->
            <path d="M 120 180 L 120 70 L 260 70" fill="none" stroke="#ef4444" stroke-width="2.5" />
            <path d="M 330 70 L 420 70" fill="none" stroke="#ef4444" stroke-width="2.5" />
            <path d="M 480 70 L 600 70 L 600 180" fill="none" stroke="#1e293b" stroke-width="2.5" />
            <path d="M 600 180 L 120 180" fill="none" stroke="#1e293b" stroke-width="2.5" />

            <!-- DC Variable Supply -->
            <rect x="80" y="160" width="80" height="40" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" />
            <text x="120" y="185" fill="#f59e0b" font-size="12" font-weight="bold" text-anchor="middle">DC Supply (VF)</text>
            <text x="95" y="152" fill="#ef4444" font-size="14" font-weight="bold">+</text>
            <text x="145" y="152" fill="#94a3b8" font-size="14" font-weight="bold">−</text>

            <!-- Diode Symbol -->
            <g transform="translate(260, 50)">
              <polygon points="15,5 50,20 15,35" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
              <line x1="50" y1="5" x2="50" y2="35" stroke="#ffffff" stroke-width="3" />
              <line x1="0" y1="20" x2="15" y2="20" stroke="#ef4444" stroke-width="2" />
              <line x1="50" y1="20" x2="70" y2="20" stroke="#ef4444" stroke-width="2" />
              <text x="10" y="0" fill="#fca5a5" font-size="11" font-weight="bold">P (Anode)</text>
              <text x="50" y="0" fill="#93c5fd" font-size="11" font-weight="bold">N (Cathode)</text>
              <text x="35" y="52" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">P-N Diode</text>
            </g>

            <!-- Milliammeter in Series -->
            <g transform="translate(420, 45)">
              <circle cx="30" cy="25" r="25" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
              <text x="30" y="30" fill="#38bdf8" font-size="15" font-weight="bold" text-anchor="middle">mA</text>
              <text x="0" y="16" fill="#ef4444" font-size="12" font-weight="bold">+</text>
              <text x="60" y="16" fill="#94a3b8" font-size="12" font-weight="bold">−</text>
              <text x="30" y="66" fill="#94a3b8" font-size="11" font-weight="bold" text-anchor="middle">Milliammeter (Series)</text>
            </g>

            <!-- Voltmeter in Parallel across Diode/Output -->
            <path d="M 230 70 L 230 230 L 330 230" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3" />
            <path d="M 390 230 L 530 230 L 530 70" fill="none" stroke="#1e293b" stroke-width="2" stroke-dasharray="4,3" />
            <g transform="translate(330, 205)">
              <circle cx="30" cy="25" r="25" fill="#0f172a" stroke="#10b981" stroke-width="2" />
              <text x="30" y="31" fill="#10b981" font-size="16" font-weight="bold" text-anchor="middle">V</text>
              <text x="0" y="16" fill="#ef4444" font-size="12" font-weight="bold">+</text>
              <text x="60" y="16" fill="#94a3b8" font-size="12" font-weight="bold">−</text>
              <text x="30" y="66" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">Voltmeter (Parallel)</text>
            </g>
          </svg>
        </div>
      </div>

      <div class="theory-block">
        <h3>3. Reverse Biased P-N Junction</h3>
        <p>When the positive terminal of an external DC source is connected to the <strong>N-type semiconductor</strong> (Cathode) and the negative terminal is connected to the <strong>P-type semiconductor</strong> (Anode), the diode is said to be <strong>Reverse Biased</strong>.</p>
        <ul class="manual-list">
          <li><strong>Depletion Region Widening:</strong> The external potential supports the built-in barrier potential ($V_0 + V_r$). The positive terminal pulls free electrons in the N-region away from the junction, while the negative terminal pulls holes in the P-region away from the junction. Consequently, the depletion region becomes significantly <strong>widened</strong>.</li>
          <li><strong>Minimal Leakage Current ($I_r$):</strong> Because majority carriers cannot cross the barrier, only thermally generated minority carriers (electrons in P-region, holes in N-region) are swept across the junction by the electric field, giving rise to an extremely minute <strong>Reverse Saturation Current ($I_0$)</strong> on the order of microamperes ($\\mu\\text{A}$).</li>
          <li><strong>Current Insensitivity:</strong> Up to moderate reverse voltages (before Zener or avalanche breakdown occurs), $I_r$ remains virtually constant and negligible.</li>
          <li><strong>Circuit Arrangement:</strong> The microammeter is connected in <strong>series</strong> ($0 - 100\\;\\mu\\text{A}$ range), and the voltmeter is connected in <strong>parallel</strong> ($0 - 30\\text{ V}$ range).</li>
        </ul>

        <!-- IMAGE 3: REVERSE BIASED P-N JUNCTION CHARGE CARRIER DIAGRAM -->
        <div class="manual-diagram-card" style="margin: 18px 0; background: #070d1e; border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 18px; text-align: center;">
          <h4 style="color: #ffffff; font-size: 15px; margin-bottom: 12px; letter-spacing: 0.8px; text-transform: uppercase;">Reverse Biased P-N Junction (Internal Mechanism & Charge Carriers)</h4>
          <svg viewBox="0 0 800 480" width="100%" style="max-width: 720px; height: auto; display: block; margin: 0 auto; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));">
            <defs>
              <linearGradient id="pTypeGradRev" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#78350f" stop-opacity="0.95" />
                <stop offset="100%" stop-color="#b45309" stop-opacity="0.85" />
              </linearGradient>
              <linearGradient id="nTypeGradRev" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#1e40af" stop-opacity="0.85" />
                <stop offset="100%" stop-color="#1e3a8a" stop-opacity="0.95" />
              </linearGradient>
            </defs>

            <!-- Background Grid -->
            <rect width="800" height="480" rx="10" fill="#040816" />
            <g opacity="0.1" stroke="#38bdf8" stroke-width="1">
              <line x1="0" y1="60" x2="800" y2="60" /><line x1="0" y1="120" x2="800" y2="120" /><line x1="0" y1="180" x2="800" y2="180" /><line x1="0" y1="240" x2="800" y2="240" /><line x1="0" y1="300" x2="800" y2="300" /><line x1="0" y1="360" x2="800" y2="360" /><line x1="0" y1="420" x2="800" y2="420" />
            </g>

            <!-- Title Header -->
            <text x="400" y="44" fill="#ffffff" font-family="'Space Grotesk', Outfit, sans-serif" font-size="22" font-weight="bold" text-anchor="middle" letter-spacing="1.5">REVERSE BIASED P-N JUNCTION</text>

            <!-- Depletion Region Widened Bracket -->
            <text x="400" y="78" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">DEPLETION REGION (WIDENED)</text>
            <path d="M 310 84 L 310 92 L 490 92 L 490 84" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3" />

            <!-- P-Type Semiconductor Header -->
            <text x="210" y="82" fill="#fb923c" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">P-type Semiconductor</text>

            <!-- N-Type Semiconductor Header -->
            <text x="590" y="82" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">N-type Semiconductor</text>

            <!-- Metal Contacts on Ends -->
            <rect x="95" y="120" width="18" height="140" rx="3" fill="#64748b" stroke="#cbd5e1" stroke-width="1.5" />
            <rect x="687" y="120" width="18" height="140" rx="3" fill="#64748b" stroke="#cbd5e1" stroke-width="1.5" />

            <!-- P-Region Block (Narrowed due to wide depletion layer) -->
            <rect x="113" y="105" width="200" height="170" rx="4" fill="url(#pTypeGradRev)" stroke="#ea580c" stroke-width="2" />

            <!-- N-Region Block (Narrowed) -->
            <rect x="487" y="105" width="200" height="170" rx="4" fill="url(#nTypeGradRev)" stroke="#2563eb" stroke-width="2" />

            <!-- Depletion Layer Widened P-side (More columns of negative ions) -->
            <rect x="313" y="105" width="87" height="170" fill="#451a03" stroke="#ea580c" stroke-dasharray="3,3" stroke-width="1.5" />
            <!-- Depletion Layer Widened N-side (More columns of positive ions) -->
            <rect x="400" y="105" width="87" height="170" fill="#172554" stroke="#2563eb" stroke-dasharray="3,3" stroke-width="1.5" />

            <!-- P-N Junction Metallurgical Line -->
            <line x1="400" y1="105" x2="400" y2="275" stroke="#ffffff" stroke-width="2" />
            <line x1="400" y1="315" x2="400" y2="282" stroke="#ffffff" stroke-width="1.8" marker-end="url(#arrowHeadWhite)" />
            <text x="400" y="332" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">P-N Junction</text>

            <!-- Holes (+) in P-type being pulled LEFT away from junction -->
            <g fill="#ea580c" stroke="#fef08a" stroke-width="1.5">
              <circle cx="145" cy="140" r="13" /><text x="145" y="145" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="215" cy="140" r="13" /><text x="215" y="145" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="145" cy="190" r="13" /><text x="145" y="195" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="215" cy="190" r="13" /><text x="215" y="195" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="145" cy="240" r="13" /><text x="145" y="245" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="215" cy="240" r="13" /><text x="215" y="245" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">+</text>
            </g>
            <text x="210" y="195" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Holes (⊕)</text>

            <!-- Holes Movement Arrows (pointing LEFT) -->
            <line x1="300" y1="140" x2="245" y2="140" stroke="#f59e0b" stroke-width="4" marker-end="url(#arrowHeadAmber)" />
            <line x1="300" y1="190" x2="245" y2="190" stroke="#f59e0b" stroke-width="4" marker-end="url(#arrowHeadAmber)" />
            <line x1="300" y1="240" x2="245" y2="240" stroke="#f59e0b" stroke-width="4" marker-end="url(#arrowHeadAmber)" />

            <!-- Immobile Negative Ions in Depletion Layer (2 columns on P-side) -->
            <g fill="#7c2d12" stroke="#ea580c" stroke-width="1.2">
              <circle cx="335" cy="125" r="9" /><text x="335" y="129" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="370" cy="125" r="9" /><text x="370" y="129" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="335" cy="155" r="9" /><text x="335" y="159" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="370" cy="155" r="9" /><text x="370" y="159" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="335" cy="185" r="9" /><text x="335" y="189" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="370" cy="185" r="9" /><text x="370" y="189" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="335" cy="215" r="9" /><text x="335" y="219" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="370" cy="215" r="9" /><text x="370" y="219" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="335" cy="245" r="9" /><text x="335" y="249" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="370" cy="245" r="9" /><text x="370" y="249" fill="#fca5a5" font-size="13" font-weight="bold" text-anchor="middle">−</text>
            </g>

            <!-- Immobile Positive Ions in Depletion Layer (2 columns on N-side) -->
            <g fill="#1e3a8a" stroke="#38bdf8" stroke-width="1.2">
              <circle cx="430" cy="125" r="9" /><text x="430" y="130" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="465" cy="125" r="9" /><text x="465" y="130" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="430" cy="155" r="9" /><text x="430" y="160" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="465" cy="155" r="9" /><text x="465" y="160" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="430" cy="185" r="9" /><text x="430" y="190" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="465" cy="185" r="9" /><text x="465" y="190" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="430" cy="215" r="9" /><text x="430" y="220" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="465" cy="215" r="9" /><text x="465" y="220" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="430" cy="245" r="9" /><text x="430" y="250" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
              <circle cx="465" cy="245" r="9" /><text x="465" y="250" fill="#93c5fd" font-size="13" font-weight="bold" text-anchor="middle">+</text>
            </g>

            <!-- Free Electrons Movement Arrows (pointing RIGHT towards battery +) -->
            <line x1="500" y1="140" x2="555" y2="140" stroke="#38bdf8" stroke-width="4" marker-end="url(#arrowHeadCyan)" />
            <line x1="500" y1="190" x2="555" y2="190" stroke="#38bdf8" stroke-width="4" marker-end="url(#arrowHeadCyan)" />
            <line x1="500" y1="240" x2="555" y2="240" stroke="#38bdf8" stroke-width="4" marker-end="url(#arrowHeadCyan)" />

            <!-- Free Electrons (-) in N-type -->
            <g fill="#1d4ed8" stroke="#67e8f9" stroke-width="1.5">
              <circle cx="585" cy="140" r="13" /><text x="585" y="145" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="655" cy="140" r="13" /><text x="655" y="145" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="585" cy="190" r="13" /><text x="585" y="195" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="655" cy="190" r="13" /><text x="655" y="195" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="585" cy="240" r="13" /><text x="585" y="245" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
              <circle cx="655" cy="240" r="13" /><text x="655" y="245" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">−</text>
            </g>
            <text x="590" y="195" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Free Electrons (⊖)</text>

            <!-- External Wiring to Reversed Battery -->
            <path d="M 95 190 L 45 190 L 45 380 L 320 380" fill="none" stroke="#64748b" stroke-width="3" />
            <path d="M 705 190 L 755 190 L 755 380 L 480 380" fill="none" stroke="#64748b" stroke-width="3" />

            <!-- Minimal Leakage Current Arrow -->
            <line x1="120" y1="420" x2="250" y2="420" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4" marker-end="url(#arrowHeadWhite)" />
            <text x="185" y="440" fill="#94a3b8" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">No Significant Current (Ir)</text>
            <text x="185" y="456" fill="#64748b" font-family="sans-serif" font-size="11" text-anchor="middle">(Minimal Leakage Current)</text>

            <!-- Reversed Battery Graphic: Negative (-) on Left, Positive (+) on Right -->
            <rect x="320" y="350" width="80" height="60" rx="3" fill="#2563eb" stroke="#60a5fa" stroke-width="2" />
            <text x="360" y="388" fill="#ffffff" font-size="28" font-weight="bold" text-anchor="middle">−</text>

            <!-- Standard Battery Cell Plates Symbol Inside -->
            <line x1="390" y1="362" x2="390" y2="398" stroke="#ffffff" stroke-width="2" />
            <line x1="410" y1="355" x2="410" y2="405" stroke="#ffffff" stroke-width="3.5" />

            <rect x="415" y="350" width="80" height="60" rx="3" fill="#dc2626" stroke="#f87171" stroke-width="2" />
            <text x="455" y="388" fill="#ffffff" font-size="28" font-weight="bold" text-anchor="middle">+</text>

            <!-- Battery Label -->
            <text x="400" y="432" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">External Battery (DC Source)</text>
            <text x="325" y="338" fill="#93c5fd" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Negative (−) Terminal</text>
            <text x="475" y="338" fill="#fca5a5" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Positive (+) Terminal</text>

            <!-- Reverse Bias Annotation on Right -->
            <text x="670" y="350" fill="#cbd5e1" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Reverse Bias</text>
            <text x="670" y="370" fill="#cbd5e1" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">(V < 0)</text>
          </svg>
        </div>

        <!-- REVERSE BIAS LAB ELECTRICAL SCHEMATIC -->
        <div class="manual-diagram-card" style="margin: 18px 0; background: #070d1e; border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 18px; text-align: center;">
          <h4 style="color: #38bdf8; font-size: 14px; margin-bottom: 12px; letter-spacing: 0.8px; text-transform: uppercase;">Reverse Bias Laboratory Circuit Schematic (Series Microammeter, Parallel Voltmeter)</h4>
          <svg viewBox="0 0 700 280" width="100%" style="max-width: 640px; height: auto; display: block; margin: 0 auto;">
            <!-- Schematic Lines -->
            <rect width="700" height="280" rx="8" fill="#030712" />
            <!-- Main Loop -->
            <path d="M 120 180 L 120 70 L 260 70" fill="none" stroke="#ef4444" stroke-width="2.5" />
            <path d="M 330 70 L 420 70" fill="none" stroke="#ef4444" stroke-width="2.5" />
            <path d="M 480 70 L 600 70 L 600 180" fill="none" stroke="#1e293b" stroke-width="2.5" />
            <path d="M 600 180 L 120 180" fill="none" stroke="#1e293b" stroke-width="2.5" />

            <!-- DC Variable Supply (Reverse) -->
            <rect x="80" y="160" width="80" height="40" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
            <text x="120" y="185" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">DC Supply (VR)</text>
            <text x="95" y="152" fill="#ef4444" font-size="14" font-weight="bold">+</text>
            <text x="145" y="152" fill="#94a3b8" font-size="14" font-weight="bold">−</text>

            <!-- Reversed Diode Symbol (Cathode connects to DC +, Anode connects to Microammeter +) -->
            <g transform="translate(260, 50)">
              <polygon points="55,5 20,20 55,35" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
              <line x1="20" y1="5" x2="20" y2="35" stroke="#ffffff" stroke-width="3" />
              <line x1="0" y1="20" x2="20" y2="20" stroke="#ef4444" stroke-width="2" />
              <line x1="55" y1="20" x2="70" y2="20" stroke="#ef4444" stroke-width="2" />
              <text x="10" y="0" fill="#93c5fd" font-size="11" font-weight="bold">N (Cathode)</text>
              <text x="50" y="0" fill="#fca5a5" font-size="11" font-weight="bold">P (Anode)</text>
              <text x="35" y="52" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">Reverse-Biased Diode</text>
            </g>

            <!-- Microammeter in Series -->
            <g transform="translate(420, 45)">
              <circle cx="30" cy="25" r="25" fill="#0f172a" stroke="#a855f7" stroke-width="2" />
              <text x="30" y="30" fill="#a855f7" font-size="14" font-weight="bold" text-anchor="middle">μA</text>
              <text x="0" y="16" fill="#ef4444" font-size="12" font-weight="bold">+</text>
              <text x="60" y="16" fill="#94a3b8" font-size="12" font-weight="bold">−</text>
              <text x="30" y="66" fill="#94a3b8" font-size="11" font-weight="bold" text-anchor="middle">Microammeter (Series)</text>
            </g>

            <!-- Voltmeter in Parallel across Diode/Output -->
            <path d="M 230 70 L 230 230 L 330 230" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3" />
            <path d="M 390 230 L 530 230 L 530 70" fill="none" stroke="#1e293b" stroke-width="2" stroke-dasharray="4,3" />
            <g transform="translate(330, 205)">
              <circle cx="30" cy="25" r="25" fill="#0f172a" stroke="#10b981" stroke-width="2" />
              <text x="30" y="31" fill="#10b981" font-size="16" font-weight="bold" text-anchor="middle">V</text>
              <text x="0" y="16" fill="#ef4444" font-size="12" font-weight="bold">+</text>
              <text x="60" y="16" fill="#94a3b8" font-size="12" font-weight="bold">−</text>
              <text x="30" y="66" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">Voltmeter (Parallel)</text>
            </g>
          </svg>
        </div>
      </div>

      <div class="theory-block">
        <h3>4. Comparison: Forward Bias vs. Reverse Bias</h3>
        <div class="table-responsive" style="overflow-x:auto;">
          <table class="manual-table" style="width:100%; border-collapse:collapse; margin-top:10px;">
            <thead>
              <tr style="background:#0f172a; color:#ffffff;">
                <th style="padding:8px 12px; border:1px solid #334155;">Characteristic Parameter</th>
                <th style="padding:8px 12px; border:1px solid #334155;">Forward Bias</th>
                <th style="padding:8px 12px; border:1px solid #334155;">Reverse Bias</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:8px 12px; border:1px solid #334155;"><strong>Polarity of Supply</strong></td>
                <td style="padding:8px 12px; border:1px solid #334155;">Anode (+) to P, Cathode (−) to N</td>
                <td style="padding:8px 12px; border:1px solid #334155;">Anode (+) to N, Cathode (−) to P</td>
              </tr>
              <tr>
                <td style="padding:8px 12px; border:1px solid #334155;"><strong>Depletion Layer Width</strong></td>
                <td style="padding:8px 12px; border:1px solid #334155;">Significantly Narrowed</td>
                <td style="padding:8px 12px; border:1px solid #334155;">Significantly Widened</td>
              </tr>
              <tr>
                <td style="padding:8px 12px; border:1px solid #334155;"><strong>Barrier Potential</strong></td>
                <td style="padding:8px 12px; border:1px solid #334155;">Reduced ($V_0 - V_f$)</td>
                <td style="padding:8px 12px; border:1px solid #334155;">Increased ($V_0 + V_r$)</td>
              </tr>
              <tr>
                <td style="padding:8px 12px; border:1px solid #334155;"><strong>Current Conduction</strong></td>
                <td style="padding:8px 12px; border:1px solid #334155;">High (Milliamperes, mA), driven by majority carriers</td>
                <td style="padding:8px 12px; border:1px solid #334155;">Negligible (Microamperes, μA), driven by minority carriers</td>
              </tr>
              <tr>
                <td style="padding:8px 12px; border:1px solid #334155;"><strong>Junction Resistance</strong></td>
                <td style="padding:8px 12px; border:1px solid #334155;">Very low (typically $10 - 50\\;\\Omega$)</td>
                <td style="padding:8px 12px; border:1px solid #334155;">Extremely high (Megaohms, $\\text{M}\\Omega$)</td>
              </tr>
              <tr>
                <td style="padding:8px 12px; border:1px solid #334155;"><strong>V-I Characteristic Quadrant</strong></td>
                <td style="padding:8px 12px; border:1px solid #334155;"><strong>1st Quadrant</strong> ($V_f \\ge 0, I_f \\ge 0$)</td>
                <td style="padding:8px 12px; border:1px solid #334155;"><strong>3rd Quadrant</strong> ($V_r < 0, I_r < 0$)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
    howToPerform: `
      <div class="steps-container">
        <div class="step-card">
          <div class="step-badge">1</div>
          <div class="step-info">
            <h4>Select Bias Operating Mode & Configure Meter Ranges</h4>
            <p>For <strong>Forward Bias</strong>, toggle the Voltmeter range selector to <strong>1.5 V</strong> (upper scale) and the Ammeter range to <strong>10 mA</strong> (upper scale). For <strong>Reverse Bias</strong>, toggle the Voltmeter to <strong>30 V</strong> (lower scale) and the Ammeter to <strong>100 μA</strong> (lower scale).</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">2</div>
          <div class="step-info">
            <h4>Connect the Circuit Terminals</h4>
            <p>Use the interactive banana-plug cables to wire the apparatus, or click <strong>Auto Connect Forward</strong> / <strong>Auto Connect Reverse</strong>. Ensure the ammeter is in series and the voltmeter is in parallel across the DC supply.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">3</div>
          <div class="step-info">
            <h4>Power ON the Apparatus</h4>
            <p>Flip the central heavy-duty toggle switch to <strong>ON</strong>. The red indicator lamp illuminates and the dynamic analog meters activate.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">4</div>
          <div class="step-info">
            <h4>Adjust Variable DC Voltage Knob</h4>
            <p>Rotate the rotary voltage potentiometer smoothly. In Forward Bias, increment $V_f$ in small steps of $0.1\\text{ V}$ (especially near the knee region $0.6 - 0.7\\text{ V}$). In Reverse Bias, increment $V_r$ in steps of $2.0\\text{ V}$ up to $30\\text{ V}$.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">5</div>
          <div class="step-info">
            <h4>Record Observations & Plot V-I Characteristic Curves</h4>
            <p>Click <strong>Record Observation</strong> at each voltage step. Watch the live 1st-quadrant Forward curve and 3rd-quadrant Reverse curve update dynamically.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">6</div>
          <div class="step-info">
            <h4>Export Academic PDF Report</h4>
            <p>Click <strong>Export PDF Report</strong> to generate an official laboratory record complete with your observation tables, calculated least counts, and high-resolution live graphs.</p>
          </div>
        </div>
      </div>
    `,
    procedure: `
      <ol class="manual-ordered-list">
        <li><strong>Forward Bias Setup:</strong> Set the Voltmeter range selector to 1.5 V and the Ammeter range selector to 10 mA.</li>
        <li>Connect the Forward DC Output (+) to the P terminal of the Forward Bias diode with a red wire.</li>
        <li>Connect the N terminal of the Forward Bias diode to the Ammeter (+) terminal.</li>
        <li>Connect the Ammeter (−) terminal back to the Forward DC Output (−) terminal with a black wire.</li>
        <li>Connect the Voltmeter (+) to the Forward DC Output (+) and the Voltmeter (−) to the Forward DC Output (−) to measure the voltage across the circuit in parallel.</li>
        <li>Switch the power toggle to <strong>ON</strong>. Verify that the indicator lamp glows.</li>
        <li>Beginning from 0.0 V, slowly rotate the Forward Bias knob ($V_F$) in steps of 0.1 V. Notice that current remains almost zero until $\\approx 0.6\\text{ V}$.</li>
        <li>Beyond $0.6\\text{ V}$, observe the exponential rise in forward current. Record at least 6 to 8 readings in the Forward Bias observation table.</li>
        <li><strong>Reverse Bias Setup:</strong> Switch the power toggle to <strong>OFF</strong>. Set the Voltmeter range to 30 V and the Ammeter range to 100 μA.</li>
        <li>Connect the Reverse DC Output (+) to the N terminal of the Reverse Bias diode, the Diode P terminal to the Microammeter (+), and Microammeter (−) to the Reverse DC Output (−).</li>
        <li>Connect the Voltmeter in parallel across the Reverse DC Output (+/−).</li>
        <li>Switch the power toggle to <strong>ON</strong>. Gradually adjust the Reverse Bias knob ($V_R$) in steps of 2.0 V to 5.0 V up to 30 V.</li>
        <li>Record the reverse voltage ($V_r$) and microammeter current ($I_r$). Note that $1\\;\\mu\\text{A} = 0.001\\text{ mA}$.</li>
        <li>Observe the 3rd quadrant graph display and export the observation report.</li>
      </ol>
    `,
    formulas: `
      <div class="formula-block">
        <h4>1. Shockley Ideal Diode Equation</h4>
        <div class="math-callout formula-highlight">I = I_0 \\left( e^{\\frac{V}{\\eta V_t}} - 1 \\right)</div>
        <p>Where:</p>
        <ul class="manual-list">
          <li><strong>I:</strong> Net diode current (Amperes).</li>
          <li><strong>I₀:</strong> Reverse saturation current (typically $10^{-12}\\text{ A}$ to $10^{-8}\\text{ A}$).</li>
          <li><strong>V:</strong> Voltage applied across the diode junction (positive for forward bias, negative for reverse bias).</li>
          <li><strong>η (eta):</strong> Ideality factor ($1 \\le \\eta \\le 2$; $\\eta \\approx 1$ for Germanium, $\\eta \\approx 1.3 - 2$ for Silicon).</li>
          <li><strong>Vₜ:</strong> Thermal voltage.</li>
        </ul>
      </div>

      <div class="formula-block">
        <h4>2. Thermal Voltage</h4>
        <div class="math-callout">V_t = \\frac{k \\cdot T}{q}</div>
        <p>Where:</p>
        <ul class="manual-list">
          <li><strong>k:</strong> Boltzmann's constant ($1.380649 \\times 10^{-23}\\text{ J/K}$).</li>
          <li><strong>T:</strong> Absolute thermodynamic temperature in Kelvin ($T \\approx 300\\text{ K}$ at room temperature, yielding $V_t \\approx 25.86\\text{ mV} \\approx 26\\text{ mV}$).</li>
          <li><strong>q:</strong> Elementary electronic charge ($1.60217663 \\times 10^{-19}\\text{ C}$).</li>
        </ul>
      </div>

      <div class="formula-block">
        <h4>3. Dynamic (AC) Forward Resistance</h4>
        <div class="math-callout">r_d = \\frac{\\Delta V_f}{\\Delta I_f} = \\frac{V_2 - V_1}{I_2 - I_1}</div>
        <p>Represents the reciprocal of the slope of the forward V-I characteristic curve above the cut-in knee voltage.</p>
      </div>

      <div class="formula-block">
        <h4>4. Static (DC) Forward Resistance</h4>
        <div class="math-callout">R_{dc} = \\frac{V_f}{I_f}</div>
        <p>The ratio of DC voltage to DC current at a specific operating quiescent point (Q-point).</p>
      </div>
    `,
    observations: `
      <div class="obs-table-wrapper">
        <h4>Least Count of Instruments:</h4>
        <div class="obs-meta-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div class="detail-meta-tag"><strong>Forward Voltmeter (1.5 V Range):</strong> 0.025 V (1.5 V / 60 div)</div>
          <div class="detail-meta-tag"><strong>Forward Milliammeter (10 mA Range):</strong> 0.2 mA (10 mA / 50 div)</div>
          <div class="detail-meta-tag"><strong>Reverse Voltmeter (30 V Range):</strong> 0.5 V (30 V / 60 div)</div>
          <div class="detail-meta-tag"><strong>Reverse Microammeter (100 μA Range):</strong> 2 μA = 0.002 mA (100 μA / 50 div)</div>
        </div>

        <h4>Table 1: Forward Bias Characteristics ($V_f$ vs $I_f$)</h4>
        <table class="manual-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Forward Voltage $V_f$ (Volt)</th>
              <th>Forward Current $I_f$ (mA)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>0.10</td><td>0.00</td></tr>
            <tr><td>2</td><td>0.30</td><td>0.01</td></tr>
            <tr><td>3</td><td>0.50</td><td>0.05</td></tr>
            <tr><td>4</td><td>0.60</td><td>0.25</td></tr>
            <tr><td>5</td><td>0.65</td><td>0.95</td></tr>
            <tr><td>6</td><td>0.70</td><td>2.45</td></tr>
            <tr><td>7</td><td>0.75</td><td>4.60</td></tr>
            <tr><td>8</td><td>0.80</td><td>7.20</td></tr>
          </tbody>
        </table>

        <h4 style="margin-top:20px;">Table 2: Reverse Bias Characteristics ($V_r$ vs $I_r$)</h4>
        <table class="manual-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Reverse Voltage $V_r$ (Volt)</th>
              <th>Reverse Current $I_r$ (mA)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>2.0</td><td>0.0001 (0.1 μA)</td></tr>
            <tr><td>2</td><td>5.0</td><td>0.0003 (0.3 μA)</td></tr>
            <tr><td>3</td><td>10.0</td><td>0.0005 (0.5 μA)</td></tr>
            <tr><td>4</td><td>15.0</td><td>0.0008 (0.8 μA)</td></tr>
            <tr><td>5</td><td>20.0</td><td>0.0010 (1.0 μA)</td></tr>
            <tr><td>6</td><td>25.0</td><td>0.0013 (1.3 μA)</td></tr>
            <tr><td>7</td><td>30.0</td><td>0.0015 (1.5 μA)</td></tr>
          </tbody>
        </table>
      </div>
    `,
    result: `
      <div class="result-box">
        <h4>Experimental Conclusions:</h4>
        <ol class="manual-ordered-list">
          <li>The forward V-I characteristic curve of the P-N junction diode lies in the <strong>1st Quadrant</strong>. The cut-in (knee) voltage is observed at approximately <strong>0.65 V to 0.70 V</strong> (characteristic of Silicon).</li>
          <li>Below the cut-in voltage, forward current is negligible. Beyond the knee, current increases sharply with voltage.</li>
          <li>The reverse V-I characteristic lies in the <strong>3rd Quadrant</strong>. Reverse current remains virtually constant at an extremely minute level ($\approx 0.1 - 1.5\\;\\mu\\text{A} = 0.0001 - 0.0015\\text{ mA}$), confirming unidirectional conduction.</li>
          <li>Dynamic forward resistance is small ($r_d \\approx 20 - 35\\;\\Omega$), whereas reverse resistance is extremely large ($R_r > 10\\;\\text{M}\\Omega$).</li>
        </ol>
      </div>
`
  },

  "pof-attenuation": {
    id: "pof-attenuation",
    title: "Measuring Optical Power Attenuation in Plastic Optical Fiber",
    category: "Fiber Optics & Guided-Wave Photonics",
    shortDescription: "Measure reference optical input power and transmitted output power in plastic optical fiber (POF) across varying lengths, evaluate total loss in dB, and determine the attenuation coefficient α in dB/km.",
    difficulty: "Undergraduate Optical Engineering Practical",
    duration: "45 Minutes",
    engine: "Bouguer-Lambert-Beer Guided-Wave Photonic Solver",
    accentColor: "#eab308",

    referenceBooks: [
      {
        title: "Fiber Optics Course",
        source: "NPTEL",
        url: "https://onlinecourses-archive.nptel.ac.in/noc18_ph06/preview",
        description: "Study optical-fiber transmission, attenuation, and optical signal losses."
      },
      {
        title: "Attenuation of Radiation",
        source: "IOP Spark",
        url: "https://spark.iop.org/attenuation-radiation",
        description: "Explore a practical introduction to attenuation and the reduction of transmitted radiation."
      },
      {
        title: "Plastic Optical Fiber-Based Optical Sensors",
        source: "PMC / NCBI",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3478834/",
        description: "Review research on plastic optical fibers, their properties, and optical-sensing applications."
      }
    ],

    aim: `<p class="manual-aim-text">To measure the optical power attenuation in a step-index Plastic Optical Fiber (POF) using an optical power meter, record transmission losses at multiple fiber lengths, plot optical power and decibel attenuation against cable length, and determine the attenuation coefficient ($\\alpha$) in $\\text{dB/km}$.</p>`,

    apparatus: `<p class="manual-aim-text">Stabilized optical transmitter (650 nm visible red LED / diode source), regulated DC power supply, calibrated digital optical power meter with high-sensitivity photodetector (measuring in mW and µW), precision fiber coupling jigs with micrometer X-Y alignment stages, step-index PMMA plastic optical fiber patch cables of calibrated lengths (1 m to 25 m), and dual cylindrical guide rail optical bench.</p>`,

    theory: `
      <div class="theory-block">
        <h3>1. Optical Waveguide Attenuation &amp; Loss Mechanisms</h3>
        <p>Optical attenuation is the reduction of optical power as light propagates through an optical fiber waveguide. In a dielectric waveguide such as a step-index plastic optical fiber (POF) with a polymethyl methacrylate (PMMA) core and fluorinated polymer cladding, power decreases continuously with distance due to several physical processes:</p>
        <ul class="manual-list">
          <li><strong>Rayleigh Scattering:</strong> Microscopic density fluctuations and refractive index inhomogeneities frozen into the polymer matrix scatter light in all directions, attenuating power inversely with the fourth power of wavelength ($\\propto 1/\\lambda^4$).</li>
          <li><strong>Material Absorption:</strong> Intrinsic electronic bandgap transitions in the ultraviolet region and carbon-hydrogen (C-H) vibrational overtone harmonics in the near-infrared region produce strong intrinsic absorption bands, leaving transmission windows in the visible spectrum (notably at $\\lambda \\approx 650\\text{ nm}$). Extrinsic impurities like moisture (O-H bonds) and residual monomer groups add absorption peaks.</li>
          <li><strong>Radiation &amp; Bending Losses:</strong> Macrobending occurs when the fiber is bent into a curve whose radius of curvature is comparable to critical limits, causing higher-order guided rays to exceed the critical angle at the core-cladding boundary and refract into the cladding. Microbending consists of microscopic axial deformations along the fiber jacket.</li>
          <li><strong>Coupling &amp; Connector Losses:</strong> Fresnel reflection at the air-polymer interface facets, lateral/angular misalignment between source and core, and numerical aperture (NA) mismatches introduce localized insertion losses distinct from distributed waveguide attenuation.</li>
        </ul>
      </div>

      <div class="theory-block">
        <h3>2. Distributed Attenuation &amp; Bouguer-Lambert-Beer Law</h3>
        <p>For a homogeneous optical fiber with continuous distributed attenuation coefficient $\\alpha$, the optical power $P(z)$ at distance $z$ along the fiber obeys the differential rate equation:</p>
        <div class="math-callout">\\frac{dP}{dz} = -\\alpha_p P(z) \\implies P(z) = P_{\\text{in}} e^{-\\alpha_p z}</div>
        <p>where $\\alpha_p$ is the linear power attenuation coefficient in $\\text{m}^{-1}$ and $P_{\\text{in}}$ is the coupled optical input power at $z = 0$. In optical communications engineering, attenuation is universally expressed on a logarithmic decibel scale:</p>
        <div class="math-callout formula-highlight">P_{\\text{out}} = P_{\\text{in}} \\times 10^{-\\frac{\\alpha L}{10}}</div>
        <p>where $L$ is the fiber length and $\\alpha$ is the attenuation coefficient in $\\text{dB/unit length}$.</p>
      </div>

      <div class="theory-block">
        <h3>3. Decibel Attenuation &amp; Attenuation Coefficient Formulation</h3>
        <p>The total optical power attenuation $A_{\\text{dB}}$ experienced by light propagating through length $L$ from input power $P_{\\text{in}}$ to output power $P_{\\text{out}}$ is defined as:</p>
        <div class="math-callout formula-highlight">A_{\\text{dB}} = 10 \\log_{10}\\left(\\frac{P_{\\text{in}}}{P_{\\text{out}}}\\right)</div>
        <p>To obtain the normalized attenuation coefficient per kilometre ($\\alpha_{\\text{dB/km}}$) when fiber length is measured in metres ($L_{\\text{m}}$):</p>
        <div class="math-callout">L_{\\text{km}} = \\frac{L_{\\text{m}}}{1000} \\implies \\alpha_{\\text{dB/km}} = \\frac{A_{\\text{dB}}}{L_{\\text{km}}} = \\left(\\frac{1000}{L_{\\text{m}}}\\right) \\times 10 \\log_{10}\\left(\\frac{P_{\\text{in}}}{P_{\\text{out}}}\\right)</div>
        <p>Because $P_{\\text{in}}$ and $P_{\\text{out}}$ appear as a dimensionless quotient, both must be evaluated in identical units (e.g., milliwatts $\\text{mW}$ or microwatts $\\mu\\text{W}$).</p>
      </div>
    `,

    howToPerform: `
      <div class="steps-container">
        <div class="step-card">
          <div class="step-badge">1</div>
          <div class="step-info">
            <h4>Apparatus Inspection &amp; Power On</h4>
            <p>Inspect the optical bench components from left to right: Optical Source, Input Coupler, POF Cable, Output Coupling Assembly, and Optical Power Detector. Switch ON the transmitter power supply and verify stable 650 nm red light emission.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">2</div>
          <div class="step-info">
            <h4>Measure Reference Power ($P_{\\text{in}}$)</h4>
            <p>Configure the Optical Power Meter to REFERENCE mode. Align the detector with the calibrated transmitter aperture and trigger a measurement to record the stable optical input power $P_{\\text{in}}$ in mW.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">3</div>
          <div class="step-info">
            <h4>Connect POF &amp; Set Fiber Length</h4>
            <p>Connect the plastic optical fiber patch cable between the input coupling chuck and the output detector receiver. Adjust modeled cable length $L$ (e.g., 1 m, 2 m, 5 m, 10 m, 15 m, 20 m) and verify tight mechanical coupling.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">4</div>
          <div class="step-info">
            <h4>Measure Transmitted Output Power ($P_{\\text{out}}$)</h4>
            <p>Switch the meter to POF OUTPUT mode. Trigger the power measurement to acquire $P_{\\text{out}}$. Observe how transmitted power decreases systematically as fiber length increases.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">5</div>
          <div class="step-info">
            <h4>Calculate Total Attenuation &amp; Attenuation Coefficient</h4>
            <p>Compute total loss $A_{\\text{dB}} = 10 \\log_{10}(P_{\\text{in}} / P_{\\text{out}})$ and normalize to $\\alpha = (1000/L) \\times A_{\\text{dB}}$ in $\\text{dB/km}$. Record the observation in the logbook table.</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-badge">6</div>
          <div class="step-info">
            <h4>Analyze Telemetry Plots &amp; Deduce $\\alpha$</h4>
            <p>Log multiple fiber lengths. Observe the exponential curve of $P_{\\text{out}}$ vs $L$ and linear slope of $A_{\\text{dB}}$ vs $L$. Compute the average attenuation coefficient across all measurement trials.</p>
          </div>
        </div>
      </div>
    `,

    procedure: `
      <div class="procedure-block">
        <ol class="manual-ordered-list">
          <li>Place the optical transmitter, input coupler, POF cable holder, and optical detector on the parallel cylindrical guide rails of the optical bench.</li>
          <li>Power on the optical source unit. Allow the transmitter LED/laser to stabilize for 2 minutes to ensure constant emission irradiance.</li>
          <li>Position the detector at the reference measurement port to measure direct transmitter output power. Record this value as $P_{\\text{in}}$ in milliwatts (mW).</li>
          <li>Clean both optical fiber facets with isopropyl lens wipes. Insert the input end into the input coupler chuck and the output end into the detector coupling mount.</li>
          <li>Select an initial fiber length $L = 1.0\\text{ m}$. Ensure the cable rests along a smooth, unbent trajectory without mechanical microbends.</li>
          <li>Optimize alignment knobs for maximum transmitted signal on the digital power meter. Press <strong>Measure Power</strong> and record $P_{\\text{out}}$.</li>
          <li>Calculate total attenuation: $A_{\\text{dB}} = 10 \\log_{10}(P_{\\text{in}} / P_{\\text{out}})$.</li>
          <li>Calculate attenuation coefficient: $\\alpha_{\\text{dB/km}} = \\frac{1000}{L_{\\text{m}}} \\times A_{\\text{dB}}$.</li>
          <li>Repeat measurements for $L = 2.0\\text{ m}$, $5.0\\text{ m}$, $10.0\\text{ m}$, $15.0\\text{ m}$, and $20.0\\text{ m}$.</li>
          <li>Record all observations in the tabular column. Plot $P_{\\text{out}}$ vs $L$ and total attenuation $A_{\\text{dB}}$ vs $L$. Determine the mean slope and attenuation coefficient.</li>
        </ol>
      </div>
    `,

    formulas: `
      <div class="formulas-container">
        <div class="formula-card">
          <h4>1. Total Power Attenuation (Decibels)</h4>
          <div class="math-callout formula-highlight">A_{\\text{dB}} = 10 \\log_{10}\\left(\\frac{P_{\\text{in}}}{P_{\\text{out}}}\\right)</div>
          <p class="formula-desc">Where $P_{\\text{in}}$ is optical power entering the fiber and $P_{\\text{out}}$ is optical power emerging from the fiber. Both values must be in the same units (mW or µW).</p>
        </div>

        <div class="formula-card">
          <h4>2. Attenuation Coefficient per Kilometre</h4>
          <div class="math-callout formula-highlight">\\alpha_{\\text{dB/km}} = \\frac{A_{\\text{dB}}}{L_{\\text{km}}} = \\left(\\frac{1000}{L_{\\text{m}}}\\right) \\times 10 \\log_{10}\\left(\\frac{P_{\\text{in}}}{P_{\\text{out}}}\\right)</div>
          <p class="formula-desc">Where $L_{\\text{m}}$ is fiber length in metres and $L_{\\text{km}} = L_{\\text{m}} / 1000$ is fiber length in kilometres.</p>
        </div>

        <div class="formula-card">
          <h4>3. Transmitted Output Power Propagation Model</h4>
          <div class="math-callout">P_{\\text{out}} = P_{\\text{in}} \\times 10^{-\\frac{\\alpha L_{\\text{km}}}{10}} = P_{\\text{in}} \\times 10^{-\\frac{\\alpha L_{\\text{m}}}{10000}}</div>
          <p class="formula-desc">Demonstrates exponential power reduction over propagation distance in a uniform optical waveguide.</p>
        </div>

        <div class="formula-card">
          <h4>4. Total Transmission Loss with Insertion &amp; Bending Loss</h4>
          <div class="math-callout">A_{\\text{total}} = A_{\\text{fiber}} + A_{\\text{coupling}} + A_{\\text{bend}}</div>
          <p class="formula-desc">Accounts for distributed fiber loss alongside localized end-face Fresnel coupling reflection and macrobending radiation loss.</p>
        </div>
      </div>
    `,

    observations: `
      <div class="observations-block">
        <p style="margin-bottom:12px; color:var(--text-secondary, #cbd5e1); font-size:13px;">
          <strong>Calibrated Optical Source Wavelength:</strong> $\\lambda = 650\\text{ nm}$ (Visible Red Diode Emitter)<br>
          <strong>Calibrated Reference Input Power:</strong> $P_{\\text{in}} = 3.00\\text{ mW}$ ($3000\\;\\mu\\text{W}$)
        </p>
        <table class="manual-table">
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Fiber Length $L$ (m)</th>
              <th>Input Power $P_{\\text{in}}$ (mW)</th>
              <th>Output Power $P_{\\text{out}}$ (mW)</th>
              <th>Total Attenuation $A$ (dB)</th>
              <th>Attenuation $\\alpha$ (dB/km)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>1.0</td><td>3.00</td><td>2.88</td><td>0.177</td><td>177.3</td></tr>
            <tr><td>2</td><td>2.0</td><td>3.00</td><td>2.76</td><td>0.362</td><td>181.0</td></tr>
            <tr><td>3</td><td>5.0</td><td>3.00</td><td>2.44</td><td>0.899</td><td>179.8</td></tr>
            <tr><td>4</td><td>10.0</td><td>3.00</td><td>1.98</td><td>1.805</td><td>180.5</td></tr>
            <tr><td>5</td><td>15.0</td><td>3.00</td><td>1.61</td><td>2.704</td><td>180.2</td></tr>
            <tr><td>6</td><td>20.0</td><td>3.00</td><td>1.31</td><td>3.600</td><td>180.0</td></tr>
          </tbody>
        </table>
      </div>
    `,

    result: `
      <div class="result-box">
        <h4>Experimental Conclusions:</h4>
        <ol class="manual-ordered-list">
          <li>The optical power emerging from the plastic optical fiber decreases exponentially with cable length, validating the Bouguer-Lambert-Beer waveguide transmission relation $P_{\\text{out}} = P_{\\text{in}} 10^{-\\alpha L / 10}$.</li>
          <li>The mean attenuation coefficient of the step-index polymethyl methacrylate (PMMA) plastic optical fiber at $\\lambda = 650\\text{ nm}$ was determined to be <strong>$\\alpha \\approx 180 \\pm 5\\text{ dB/km}$</strong> ($0.18\\text{ dB/m}$), matching standard optical engineering benchmarks for PMMA POF.</li>
          <li>Plotting total attenuation in decibels ($A_{\\text{dB}}$) against length ($L$) yields a linear trend whose gradient equals the attenuation coefficient $\\alpha$.</li>
          <li>Sharp macrobending and facet misalignment introduce additional extrinsic radiative losses, demonstrating the importance of proper mechanical radius management and precision coupler alignment in fiber optic links.</li>
        </ol>
      </div>
    `,

    precautions: `
      <div class="precautions-block">
        <ul class="manual-list">
          <li><strong>Source Power Stabilization:</strong> Allow the transmitter to warm up before taking the reference power measurement to avoid thermal drift errors.</li>
          <li><strong>Consistent Facet Cleanliness:</strong> Inspect and clean fiber end facets before insertion into coupling chucks; particulate contamination causes significant localized Fresnel scattering.</li>
          <li><strong>Unit Consistency:</strong> Always ensure input power ($P_{\\text{in}}$) and output power ($P_{\\text{out}}$) use identical units (mW or µW) before computing decibel ratios ($10 \\log_{10}[P_{\\text{in}}/P_{\\text{out}}]$).</li>
          <li><strong>Careful Fiber Handling:</strong> Never bend the plastic optical fiber below its minimum permissible bending radius ($R_{\\text{bend}} < 25\\text{ mm}$), which causes high radiation loss or permanent mechanical deformation.</li>
          <li><strong>Coupling Repeatability:</strong> Maintain consistent alignment chuck locking pressure throughout all length variations to ensure identical input coupling conditions.</li>
        </ul>
      </div>
    `
  }
};

EXPERIMENT_DETAILS["diode-vi"] = EXPERIMENT_DETAILS["diode"];
EXPERIMENT_DETAILS["optical-attenuation"] = EXPERIMENT_DETAILS["pof-attenuation"];
EXPERIMENT_DETAILS["pof"] = EXPERIMENT_DETAILS["pof-attenuation"];

