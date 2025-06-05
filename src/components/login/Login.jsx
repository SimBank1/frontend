"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, X, CheckCircle, AlertCircle, Shield, Users, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useCookies } from "react-cookie"
import "./Login.css"

export default function Login({ onLogin, logoSrc = "/logo-rm.png?height=40&width=120" }) {
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

  const navigate = useNavigate()
  const [cookies, setCookie] = useCookies(["sessionCokie"])

  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    password: false,
  })

  const [shakeFields, setShakeFields] = useState({
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
  const [logoClickCount, setLogoClickCount] = useState(0)
  const [showVegovaAnimation, setShowVegovaAnimation] = useState(false)
  const [slovenianAnthem, setSlovenianAnthem] = useState(null)
  const [matrixMode, setMatrixMode] = useState(false)
  const [matrixChars, setMatrixChars] = useState([])

  // Console easter eggs
  useEffect(() => {
    console.log("🏦 SimBank Developer Console 🏦")
    console.log("Hey dev 👀, looking for bugs or just bored?")
    console.log("Vegova Rulez. 👨‍💻 💰")
    console.log("Try typing 'vegova' or 'slovenia' as username for surprises!")
    console.log("Or try the Konami code... just kidding, try 'matrix' anywhere!")
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

    // Play glitch sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.5)

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
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [popup.show, successPopup.show, successPopup.canDismiss])

  // Logo click easter egg
  const handleLogoClick = () => {
    setLogoClickCount((prev) => {
      const newCount = prev + 1
      if (newCount === 10) {
        // Enable VegCoin
        localStorage.setItem("vegcoin_enabled", "true")
        localStorage.setItem("vegcoin_balance", "420.69")
        showPopup("🪙 VegCoin unlocked! Balance: 420.69 VGC", "success")
        return 0
      }
      return newCount
    })
  }

  // Vegova animation easter egg
  useEffect(() => {
    if (username.toLowerCase() === "vegova") {
      setShowVegovaAnimation(true)
      setTimeout(() => setShowVegovaAnimation(false), 3000)
    }
  }, [username])

  // Slovenia anthem easter egg
  useEffect(() => {
    if (username.toLowerCase() === "slovenia") {
      if (!slovenianAnthem) {
        // Create a simple melody representing the Slovenian anthem
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const playNote = (frequency, duration, startTime) => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)

          oscillator.frequency.setValueAtTime(frequency, startTime)
          gainNode.gain.setValueAtTime(0.1, startTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

          oscillator.start(startTime)
          oscillator.stop(startTime + duration)
        }

        // Simple melody loop
        const playAnthem = () => {
          const notes = [523, 587, 659, 698, 784, 698, 659, 587, 523]
          const startTime = audioContext.currentTime

          notes.forEach((note, i) => {
            playNote(note, 0.5, startTime + i * 0.6)
          })
        }

        playAnthem()
        const interval = setInterval(playAnthem, 6000)
        setSlovenianAnthem(interval)
      }
    } else if (slovenianAnthem) {
      clearInterval(slovenianAnthem)
      setSlovenianAnthem(null)
    }
  }, [username, slovenianAnthem])

  const showPopup = (message, type) => {
    setPopup({ message, type, show: true, isClosing: false })

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      hidePopup()
    }, 4000)
  }

  const hidePopup = () => {
    setPopup((prev) => ({ ...prev, isClosing: true }))
    setTimeout(() => {
      setPopup((prev) => ({ ...prev, show: false, isClosing: false }))
    }, 200)
  }

  const triggerShake = (field) => {
    setShakeFields((prev) => ({ ...prev, [field]: true }))
    setTimeout(() => {
      setShakeFields((prev) => ({ ...prev, [field]: false }))
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
    await new Promise((resolve) => setTimeout(resolve, 1200))

    if (username === "admin" && password === "admin") {
      setCookie("sessionCokie", "admin", { path: "/" })

      setTimeout(() => {
        if (onLogin) onLogin({ username, password, userType: "admin" })
        navigate("/dashboard")
      }, 1000)
    } else if (username === "employee" && password === "employee") {
      setCookie("sessionCokie", "employee", { path: "/" })

      setTimeout(() => {
        if (onLogin) onLogin({ username, password, userType: "employee" })
        navigate("/dashboard")
      }, 1000)
    } else {
      setPassword("")

      if (username !== "admin" && username !== "employee") {
        setShakeField("username")
      } else {
        setShakeField("password")
      }

      setTimeout(() => {
        setShakeField("")
        setIsLoading(false)
      }, 600)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  const handleMouseDown = () => {
    setShowPassword(true)
  }

  const handleMouseUp = () => {
    setShowPassword(false)
  }

  const handleMouseLeave = () => {
    setShowPassword(false)
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

      {/* Vegova Animation Overlay */}
      {showVegovaAnimation && (
        <div className="vegova-animation-overlay">
          <div className="vegova-animation-content">
            <img src="/vegova-logo.png" alt="Vegova" className="vegova-animation-logo" />
            <div className="vegova-animation-text">VEGOVA POWER!</div>
            <div className="vegova-animation-sparkles">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="sparkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                >
                  ✨
                </div>
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
                  <img src="/vegova-logo.png" alt="Vegova Ljubljana" className="vegova-logo-img" />
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
          {/* Left Side - Info */}
          <div className="info-section">
            <div className="info-header">
              <div className="info-title-section">
                <div className="info-icon">
                  <Users size={32} color="white" />
                </div>
                <div className="info-title">
                  <h1>Staff Portal</h1>
                  <p>SimBank Internal Access</p>
                </div>
              </div>

              <p className="info-description">
                Secure access for administrators and employees. Manage operations, oversee accounts, and maintain the
                highest standards of banking excellence.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-header">
                  <Shield size={20} color="white" />
                  <h4 className="feature-title">Admin Dashboard</h4>
                </div>
                <p className="feature-description">Full system control and oversight capabilities</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <Users size={20} color="white" />
                  <h4 className="feature-title">Employee Workspace</h4>
                </div>
                <p className="feature-description">Customer service and account management tools</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <Lock size={20} color="white" />
                  <h4 className="feature-title">Secure Environment</h4>
                </div>
                <p className="feature-description">End-to-end encryption and audit logging</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <CheckCircle size={20} color="white" />
                  <h4 className="feature-title">Compliance Ready</h4>
                </div>
                <p className="feature-description">EU banking regulations and GDPR compliant</p>
              </div>
            </div>

            <div className="security-notice">
              <p className="security-text">
                <Lock size={14} />
                This is a restricted access portal. All activities are monitored and logged.
              </p>
            </div>
          </div>

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

                  <button onClick={handleLogin} disabled={isLoading} className="login-button">
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
                    <div className="vegova-logo-section">
                      <img src="/vegova-logo.png" alt="Vegova Ljubljana" className="vegova-logo-footer" />
                      <span className="vegova-text">Vegova Ljubljana</span>
                    </div>
                    <div className="creators-section">
                      <p className="creators-title">Created by:</p>
                      <p className="creators-names">Lin Čadež, Maj Mohar, Marko Vidic, Anej Grojzdek</p>
                    </div>
                  </div>
                  <div className="team-credits">
                    <p className="credits-text">
                      Made with 💚 by 4 students from Vegova Ljubljana. We promise we didn't steal real money to make
                      this.
                    </p>
                  </div>
                  <p className="footer-text">Authorized personnel only. All access is monitored and logged.</p>
                  <p className="footer-copyright">© {new Date().getFullYear()} SimBank EU. All rights reserved.</p>
                  <div className="secret-link">
                    <span className="dont-click-me" onClick={() => navigate("/banknote")}>
                      Don't click me
                    </span>
                  </div>
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
