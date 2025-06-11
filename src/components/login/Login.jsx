"use client"

import { useState, useEffect, useRef } from "react"
import { Eye, EyeOff, X, CheckCircle, AlertCircle, Shield, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import "./login.css"
import { getServerLink } from "@/server_link"
export default function Login({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [popup, setPopup] = useState({
    message: "",
    type: "success",
    show: false,
    isClosing: false,
  })
  const [authError, setAuthError] = useState(false)
  const [serverErr, setServerErr] = useState(false)

  const navigate = useNavigate()

  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    password: false,
  })

  const [shakeField, setShakeField] = useState("")
  const [successPopup, setSuccessPopup] = useState({
    show: false,
    message: "",
    canDismiss: false,
    isClosing: false,
  })

  // Easter egg states
  const logoClickCountRef = useRef(0)
  const vegovaLogoClickCountRef = useRef(0)
  const [showVegovaAnimation, setShowVegovaAnimation] = useState(false)
  const [matrixMode, setMatrixMode] = useState(false)
  const [matrixChars, setMatrixChars] = useState([])
  const [showRainbowText, setShowRainbowText] = useState(false)
  const [consoleInitialized, setConsoleInitialized] = useState(false)

  // Refs for audio elements
  const anthemRef = useRef(null)
  const matrixSoundRef = useRef(null)
  const vegovaSoundRef = useRef(null)

  // Console easter eggs - only once
  useEffect(() => {
    if (!consoleInitialized) {
      // Clear console first
      console.clear()

      // Add our messages with styling
      console.log("%c🏦 SimBank Developer Console 🏦", "color: #8b5cf6; font-size: 20px; font-weight: bold;")
      console.log("%cHey dev 👀, looking for bugs or just bored?", "color: #3b82f6; font-size: 14px;")
      console.log("%cVegova Rulez. 👨‍💻 💰", "color: #10b981; font-size: 16px; font-weight: bold;")
      console.log("%cTry typing 'vegova' or 'slovenia' as username for surprises!", "color: #f59e0b;")
      console.log("%cOr try the Konami code... just kidding, try 'matrix' anywhere!", "color: #ef4444;")
      console.log("%cPssst... there's a hidden route at /terminal", "color: #6366f1; font-style: italic;")

      setConsoleInitialized(true)
    }
  }, [consoleInitialized])

  // Preload audio files
  useEffect(() => {
    // Create audio elements but don't play them yet
    anthemRef.current = new Audio("/slovenian-anthem.mp3")
    anthemRef.current.loop = true
    anthemRef.current.volume = 0.3

    matrixSoundRef.current = new Audio("/matrix-sound.mp3")
    matrixSoundRef.current.volume = 0.2

    vegovaSoundRef.current = new Audio("/vegova-sound.mp3")
    vegovaSoundRef.current.volume = 0.3

    return () => {
      // Cleanup audio elements
      if (anthemRef.current) {
        anthemRef.current.pause()
        anthemRef.current = null
      }
      if (matrixSoundRef.current) {
        matrixSoundRef.current.pause()
        matrixSoundRef.current = null
      }
      if (vegovaSoundRef.current) {
        vegovaSoundRef.current.pause()
        vegovaSoundRef.current = null
      }
    }
  }, [])

  // Matrix effect
  useEffect(() => {
    const handleKeyPress = (e) => {
      const sequence = ["m", "a", "t", "r", "i", "x"]
      const currentSequence = window.matrixSequence || []

      if (e.key.toLowerCase() === sequence[currentSequence.length]) {
        currentSequence.push(e.key.toLowerCase())
        window.matrixSequence = currentSequence

        if (currentSequence.length === sequence.length) {
          triggerMatrixMode()
          window.matrixSequence = []
        }
      } else {
        window.matrixSequence = []
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [])

  const triggerMatrixMode = () => {
    setMatrixMode(true)

    // Create falling characters
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
    const columns = Math.floor(window.innerWidth / 20)
    const drops = Array(columns).fill(1)

    setMatrixChars(
      drops.map((_, i) => ({
        id: i,
        x: i * 20,
        y: Math.random() * window.innerHeight,
        char: chars[Math.floor(Math.random() * chars.length)],
        speed: Math.random() * 3 + 1,
      })),
    )

    // Play matrix sound
    if (matrixSoundRef.current) {
      matrixSoundRef.current.currentTime = 0
      matrixSoundRef.current.play().catch(console.error)
    }

    setTimeout(() => {
      setMatrixMode(false)
      setMatrixChars([])
    }, 5000)
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (popup.show) {
          hidePopup()
        }
        if (successPopup.show && successPopup.canDismiss) {
          handleSuccessPopupDismiss()
        }
        if (matrixMode) {
          setMatrixMode(false)
          setMatrixChars([])
        }
        if (showVegovaAnimation) {
          setShowVegovaAnimation(false)
        }
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [popup.show, successPopup.show, successPopup.canDismiss, matrixMode, showVegovaAnimation])

  // Logo click easter egg
  const handleLogoClick = () => {
    logoClickCountRef.current += 1
    if (logoClickCountRef.current === 5) {
      // Reduced from 10 to 5 for easier activation
      // Enable VegCoin
      localStorage.setItem("vegcoin_enabled", "true")
      localStorage.setItem("vegcoin_balance", "420.69")
      showPopup("🪙 VegCoin unlocked! Balance: 420.69 VGC", "success")
      logoClickCountRef.current = 0
    }
  }
  // Vegova logo click easter egg for rainbow text
  const handleVegovaLogoClick = () => {
    vegovaLogoClickCountRef.current += 1
    if (vegovaLogoClickCountRef.current === 2) {
      setShowRainbowText(true)
      vegovaLogoClickCountRef.current = 0
    }
  }
  // Technical Vegova animation easter egg
  useEffect(() => {
    if (username.toLowerCase() === "vegova") {
      setShowVegovaAnimation(true)

      // Play vegova sound
      if (vegovaSoundRef.current) {
        vegovaSoundRef.current.currentTime = 0
        vegovaSoundRef.current.play().catch(console.error)
      }

      // Auto-dismiss after animation completes
      setTimeout(() => setShowVegovaAnimation(false), 4000)
    }
  }, [username])

  // Slovenia anthem easter egg with MP3
  useEffect(() => {
    if (username.toLowerCase() === "slovenia") {
      if (anthemRef.current) {
        anthemRef.current.play().catch(console.error)
      }
      setUsername("")
    } else if (anthemRef.current && !anthemRef.current.paused) {
      anthemRef.current.pause()
      anthemRef.current.currentTime = 0
    }
  }, [username])

  const hidePopup = () => {
    setPopup((prev) => ({ ...prev, isClosing: true }))
    setTimeout(() => {
      setPopup((prev) => ({ ...prev, show: false, isClosing: false }))
    }, 200)
  }

  const triggerShake = (field) => {
    setShakeField(field)
    setTimeout(() => {
      setShakeField("")
    }, 600)
  }

  const validateForm = () => {
    const isUsernameEmpty = username.trim() === ""
    const isPasswordEmpty = password.trim() === ""

    setFieldErrors({
      username: isUsernameEmpty,
      password: isPasswordEmpty,
    })

    if (isUsernameEmpty) {
      triggerShake("username")
    }
    if (isPasswordEmpty) {
      triggerShake("password")
    }

    return !isUsernameEmpty && !isPasswordEmpty
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setAuthError(false)

    try {
      const response = await fetch(getServerLink() + "/login", {
        method: "POST", // This is a top-level option
        headers: {
          "Content-Type": "application/json",
          // ONLY HTTP headers go here. Remove 'referrer', 'referrerPolicy', 'body', 'method', 'mode' from here.
        },
        // These are top-level options for fetch:
        referrer: "http://localhost:5173/",
        referrerPolicy: "strict-origin-when-cross-origin",
        mode: "cors",
        credentials: "include", // Correct, keeps session/cookies
        body: JSON.stringify({ username, password }), // Correct, the actual request body
      })

      console.log("Response status:", response.status, response.statusText)

      // While you can't see the 'Set-Cookie' header value directly here,
      // you can log other response headers for debugging if needed.
      // Note: 'Set-Cookie' is typically not exposed here due to security.
      console.log("All response headers:")
      for (const pair of response.headers.entries()) {
        // This will log headers like 'Content-Type', 'Cache-Control', etc.
        // 'Set-Cookie' will likely NOT be present in this list due to browser security restrictions.
        console.log(pair[0] + ": " + pair[1])
      }

      const data = await response.json()

      if (!response.ok) {
        setServerErr(true)
        console.log("Server error:", data)
        throw new Error(data.message || "Login failed")
      }

      if (data.error) {
        setAuthError(true)
      }
      if (data.mode) {
        setIsLoading(false)
        window.location.href = "/dashboard"
      }
    } catch (error) {
      setServerErr(true)
      console.log("Error during login:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  const handleSuccessPopupDismiss = () => {
    if (successPopup.canDismiss) {
      setSuccessPopup((prev) => ({ ...prev, isClosing: true }))
      setTimeout(() => {
        setSuccessPopup({ show: false, message: "", canDismiss: false, isClosing: false })
        if (onLogin) {
          if (username === "admin") {
            onLogin({ username, password, userType: "admin" })
          } else {
            onLogin({ username, password, userType: "employee" })
          }
        }
        navigate("/dashboard")
      }, 200)
    }
  }

  return (
    <div className="login-container">
      {/* Matrix Mode Overlay */}
      {matrixMode && (
        <div className="matrix-overlay">
          {matrixChars.map((char) => (
            <div
              key={char.id}
              className="matrix-char"
              style={{
                left: char.x,
                top: char.y,
                animationDuration: `${char.speed}s`,
              }}
            >
              {char.char}
            </div>
          ))}
        </div>
      )}

      {/* Technical Vegova Animation Overlay */}
      {showVegovaAnimation && (
        <div className="vegova-tech-overlay">
          <div className="tech-grid">
            {[...Array(100)].map((_, i) => (
              <div key={i} className="tech-cell" style={{ animationDelay: `${i * 0.05}s` }}></div>
            ))}
          </div>
          <div className="vegova-tech-content">
            <div className="tech-header">
              <div className="tech-logo">
                <img src="/vegova-logo.png" alt="Vegova" className="vegova-tech-logo" />
              </div>
              <div className="tech-text">
                <div className="tech-title">VEGOVA SYSTEMS</div>
                <div className="tech-subtitle">INITIALIZING...</div>
              </div>
            </div>

            <div className="tech-console">
              <div className="console-line">{"> "} Connecting to Vegova mainframe...</div>
              <div className="console-line" style={{ animationDelay: "0.5s" }}>
                {"> "} Authentication successful
              </div>
              <div className="console-line" style={{ animationDelay: "1s" }}>
                {"> "} Loading student database...
              </div>
              <div className="console-line" style={{ animationDelay: "1.5s" }}>
                {"> "} SimBank protocols activated
              </div>
              <div className="console-line" style={{ animationDelay: "2s" }}>
                {"> "} Welcome to the future of banking
              </div>
              <div className="console-line success" style={{ animationDelay: "2.5s" }}>
                {"> "} SYSTEM READY
              </div>
            </div>

            <div className="tech-particles">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Background */}
      <div className="login-background" />
      <div className="login-overlay" />

      {/* Animated background elements */}
      <div className="animated-bg">
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>
        <div className="bg-element bg-element-3"></div>
        <div className="bg-element bg-element-4"></div>
        <div className="bg-element bg-element-5"></div>
        <div className="bg-particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="bg-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={`login-content ${popup.show ? "blurred" : ""}`}>
        {/* Navigation */}
        <nav className="login-nav">
          <div className="nav-container">
            <div className="nav-content">
              <div className="nav-logo">
                <div className="nav-logo-icon" onClick={handleLogoClick}>
                  <Shield size={24} color="white" />
                </div>
                <div className="nav-title">
                  <h1>SimBank</h1>
                </div>
                <div className="vegova-logo-nav">
                  <img
                    src="/vegova-logo.png"
                    alt="Vegova Ljubljana"
                    className="vegova-logo-img"
                    onClick={handleVegovaLogoClick}
                  />
                </div>
              </div>
              <div className="nav-info">
                <div className="nav-secure">
                  <Lock size={14} />
                  <span>Secure Access</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="main-content">
          {/* Right Side - Login Form */}
          <div className="login-form-section">
            <div className="login-form">
              {/* Decorative glow */}
              <div className="form-glow-1"></div>
              <div className="form-glow-2"></div>

              <div className="form-content">
                <div className="form-header">
                  <div className="form-icon">
                    <div className="form-icon-bg">
                      <Shield size={24} color="white" />
                    </div>
                  </div>
                  <h2 className="form-title">Staff Login</h2>
                  <p className="form-subtitle">Enter your credentials to continue</p>
                </div>

                <div className="form-fields">
                  <div className="field-group">
                    <label className="field-label">Username</label>
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        if (fieldErrors.username) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            username: false,
                          }))
                        }
                        if (authError) {
                          setAuthError(false)
                        }
                      }}
                      onKeyDown={handleKeyPress}
                      className={`field-input ${
                        fieldErrors.username ? "error" : ""
                      } ${shakeField === "username" ? "shake" : ""}`}
                    />
                    {fieldErrors.username && (
                      <p className="field-error">
                        <AlertCircle size={12} />
                        Username is required
                      </p>
                    )}
                  </div>

                  <div className="field-group">
                    <label className="field-label">Password</label>
                    <div className="password-field">
                      <input
                        type="text"
                        name="fake_simulated_password"
                        autoComplete="off"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (fieldErrors.password) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              password: false,
                            }))
                          }
                          if (authError) {
                            setAuthError(false)
                          }
                        }}
                        onKeyDown={handleKeyPress}
                        className={`field-input ${fieldErrors.password ? "error" : ""} ${
                          shakeField === "password" ? "shake" : ""
                        } simulated-password ${showPassword ? "show-password" : ""}`}
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onMouseDown={() => setShowPassword(true)}
                        onMouseUp={() => setShowPassword(false)}
                        onMouseLeave={() => setShowPassword(false)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="field-error">
                        <AlertCircle size={12} />
                        Password is required
                      </p>
                    )}
                  </div>
                  {authError && (
                    <div
                      className="auth-error-label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 16px",
                        marginBottom: "16px",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "12px",
                        color: "#dc2626",
                        fontSize: "14px",
                        fontWeight: "500",
                        backdropFilter: "blur(8px)",
                        animation: "fadeIn 0.3s ease-out",
                      }}
                    >
                      <AlertCircle size={16} color="#dc2626" />
                      <span>Wrong password or username</span>
                    </div>
                  )}
                  {serverErr && (
                    <div
                      className="auth-error-label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 16px",
                        marginBottom: "16px",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "12px",
                        color: "#dc2626",
                        fontSize: "14px",
                        fontWeight: "500",
                        backdropFilter: "blur(8px)",
                        animation: "fadeIn 0.3s ease-out",
                      }}
                    >
                      <AlertCircle size={16} color="#dc2626" />
                      <span>Server not reachable!</span>
                    </div>
                  )}

                  <button type="button" onClick={handleLogin} disabled={isLoading} className="login-button">
                    {isLoading ? (
                      <>
                        <div className="loading-spinner" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <Shield size={18} />
                        <span>Access Portal</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="form-footer">
                  <div className="vegova-section">
                    <div className="vegova-logo-section" onClick={handleVegovaLogoClick}>
                      <img src="/vegova-logo.png" alt="Vegova Ljubljana" className="vegova-logo-footer" />
                      <span className="vegova-text">Vegova Ljubljana</span>
                    </div>
                    <div className="creators-section">
                      <p className="creators-title">Created by:</p>
                      <p className="creators-names">Lin Čadež, Maj Mohar, Marko Vidic, Anej Grojzdek</p>
                    </div>
                  </div>
                  {showRainbowText && (
                    <div className="team-credits">
                      <p className="credits-text">
                        Made with 💚 by 4 students from Vegova Ljubljana. We promise we didn't steal real money to make
                        this.
                      </p>
                    </div>
                  )}
                  <p className="footer-text">Authorized personnel only. All access is monitored and logged.</p>
                  <p className="footer-copyright">© {new Date().getFullYear()} SimBank EU. All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {popup.show && (
        <div className="popup-overlay" onClick={hidePopup}>
          <div className="popup-glow-container">
            {/* Outer glow */}
            <div className={`popup-outer-glow ${popup.type}`} />

            {/* Inner glow */}
            <div className={`popup-inner-glow ${popup.type}`} />

            {/* Main popup */}
            <div className={`popup-content ${popup.isClosing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
              <button onClick={hidePopup} className="popup-close">
                <X size={18} />
              </button>

              <div className="popup-header">
                <div className={`popup-icon ${popup.type}`}>
                  {popup.type === "success" ? (
                    <CheckCircle size={20} color="white" />
                  ) : (
                    <AlertCircle size={20} color="white" />
                  )}
                </div>
                <h3 className="popup-title">{popup.type === "success" ? "Success" : "Authentication Error"}</h3>
              </div>

              <p className="popup-message">{popup.message}</p>

              <button onClick={hidePopup} className="popup-button">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup Modal */}
      {successPopup.show && (
        <div className="popup-overlay" onClick={handleSuccessPopupDismiss}>
          <div className="popup-glow-container">
            <div className="popup-outer-glow success" />
            <div className="popup-inner-glow success" />
            <div
              className={`popup-content ${successPopup.isClosing ? "closing" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              {successPopup.canDismiss && (
                <button onClick={handleSuccessPopupDismiss} className="popup-close">
                  <X size={18} />
                </button>
              )}
              <div className="popup-header">
                <div className="popup-icon success">
                  <CheckCircle size={20} color="white" />
                </div>
                <h3 className="popup-title">Success</h3>
              </div>
              <p className="popup-message">{successPopup.message}</p>
              {successPopup.canDismiss && (
                <button onClick={handleSuccessPopupDismiss} className="popup-button">
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
