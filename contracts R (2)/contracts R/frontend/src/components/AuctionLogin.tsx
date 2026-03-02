import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const AuctionLogin = ({ onLogin }: { onLogin: () => void }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Three.js Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // --- Firework Particle System ---
    const count = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Spherical distribution for the "burst"
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.05 + Math.random() * 0.15;

      velocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
      velocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
      velocities[i * 3 + 2] = speed * Math.cos(phi);

      // Gradient from Blue (#7dd3fc) to Purple (#8b5cf6)
      colors[i * 3] = 0.49; // R
      colors[i * 3 + 1] = 0.82; // G
      colors[i * 3 + 2] = 0.98; // B
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
    camera.position.z = 5;

    // --- Animation Loop ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const pos = geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < count; i++) {
        pos[i * 3] += velocities[i * 3];
        pos[i * 3 + 1] += velocities[i * 3 + 1];
        pos[i * 3 + 2] += velocities[i * 3 + 2];

        // Reset if they travel too far (simulating new bursts)
        const dist = Math.sqrt(
          pos[i * 3] ** 2 + pos[i * 3 + 1] ** 2 + pos[i * 3 + 2] ** 2,
        );
        if (dist > 8) {
          pos[i * 3] = 0;
          pos[i * 3 + 1] = 0;
          pos[i * 3 + 2] = 0;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      points.rotation.y += 0.001;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      if (
        mountRef.current &&
        renderer.domElement.parentNode === mountRef.current
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      onLogin();
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.username) {
      alert(`Password reset link sent to ${formData.username}`);
      setIsResetMode(false);
    }
  };

  return (
    <div style={styles.pageWrapper as React.CSSProperties}>
      <div ref={mountRef} style={styles.canvas as React.CSSProperties} />

      <div style={styles.loginCard as React.CSSProperties}>
        <div style={styles.brand as React.CSSProperties}>
          <span style={{ fontSize: "28px" }}>🔨</span>
          <h2 style={styles.brandTitle as React.CSSProperties}>Auction DApp</h2>
        </div>

        {!isResetMode ? (
          <>
            <p style={styles.welcomeText as React.CSSProperties}>
              Sign in to manage your smart contracts
            </p>

            <form
              style={styles.form as React.CSSProperties}
              onSubmit={handleSubmit}
            >
              <div style={styles.inputGroup as React.CSSProperties}>
                <label style={styles.label as React.CSSProperties}>Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  style={styles.input as React.CSSProperties}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>

              <div style={styles.inputGroup as React.CSSProperties}>
                <label style={styles.label as React.CSSProperties}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  style={styles.input as React.CSSProperties}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <button type="submit" style={styles.submitBtn as React.CSSProperties}>
                Login to Dashboard
              </button>
            </form>

            <div style={styles.footer as React.CSSProperties}>
              Forgot password?{" "}
              <a
                href="#"
                style={styles.link as React.CSSProperties}
                onClick={(e) => {
                  e.preventDefault();
                  setIsResetMode(true);
                }}
              >
                Reset here
              </a>
            </div>
          </>
        ) : (
          <>
            <p style={styles.welcomeText as React.CSSProperties}>
              Enter your username to receive a reset link
            </p>

            <form
              style={styles.form as React.CSSProperties}
              onSubmit={handleResetSubmit}
            >
              <div style={styles.inputGroup as React.CSSProperties}>
                <label style={styles.label as React.CSSProperties}>Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  style={styles.input as React.CSSProperties}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>

              <button type="submit" style={styles.submitBtn as React.CSSProperties}>
                Send Reset Link
              </button>
            </form>

            <div style={styles.footer as React.CSSProperties}>
              <a
                href="#"
                style={styles.link as React.CSSProperties}
                onClick={(e) => {
                  e.preventDefault();
                  setIsResetMode(false);
                }}
              >
                Back to Login
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- Custom Styles ---
const styles = {
  pageWrapper: {
    height: "100vh",
    width: "100vw",
    backgroundColor: "#05070a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    fontFamily: "'Inter', sans-serif",
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  },
  loginCard: {
    zIndex: 10,
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "rgba(13, 17, 28, 0.9)",
    padding: "48px",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(15px)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  brandTitle: {
    color: "#7dd3fc",
    margin: 0,
    fontSize: "22px",
    letterSpacing: "-0.5px",
  },
  welcomeText: {
    color: "#94a3b8",
    textAlign: "center",
    fontSize: "14px",
    marginBottom: "32px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: "500",
    paddingLeft: "4px",
  },
  input: {
    backgroundColor: "#171b2b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "white",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  submitBtn: {
    marginTop: "10px",
    backgroundColor: "#8b5cf6",
    color: "white",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "13px",
    color: "#64748b",
  },
  link: {
    color: "#8b5cf6",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default AuctionLogin;
