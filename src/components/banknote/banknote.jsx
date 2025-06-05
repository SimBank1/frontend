"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Banknote() {
  const navigate = useNavigate()
  const [isRickRolling, setIsRickRolling] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  // Handle rickroll
  const startRickroll = () => {
    setIsRickRolling(true)

    // Create and play audio
    const audio = new Audio("/rickroll.mp3")
    audio.volume = 1
    audio.play().catch(console.error)

    // Open rickroll in new window after a short delay
    setTimeout(() => {
      window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank")

      // Return to login after rickroll
      setTimeout(() => {
        setIsRickRolling(false)
        navigate("/login")
      }, 1000)
    }, 1500)
  }

  // Flip the banknote
  const flipBanknote = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="banknote-container">
      <div className={`banknote ${isFlipped ? "flipped" : ""}`} onClick={flipBanknote}>
        <div className="banknote-front">
          <div className="banknote-header">
            <div className="banknote-logo">
              <img src="/vegova-logo.png" alt="Vegova" className="vegova-banknote-logo" />
            </div>
            <div className="banknote-title">
              <h1>REPUBLIC OF VEGOVA</h1>
              <p>OFFICIAL CURRENCY</p>
            </div>
          </div>

          <div className="banknote-body">
            <div className="banknote-left">
              <div className="denomination">420</div>
              <div className="currency-name">VEGCOINS</div>
            </div>

            <div className="banknote-center">
              <div className="portrait-section">
                <div className="portrait-frame">
                  <div className="portrait-placeholder">
                    <div className="face-placeholder">👨‍💻</div>
                    <p>Lin Čadež</p>
                  </div>
                </div>
                <div className="portrait-frame">
                  <div className="portrait-placeholder">
                    <div className="face-placeholder">👨‍💻</div>
                    <p>Maj Mohar</p>
                  </div>
                </div>
                <div className="portrait-frame">
                  <div className="portrait-placeholder">
                    <div className="face-placeholder">👨‍💻</div>
                    <p>Marko Vidic</p>
                  </div>
                </div>
                <div className="portrait-frame">
                  <div className="portrait-placeholder">
                    <div className="face-placeholder">👨‍💻</div>
                    <p>Anej Grojzdek</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="banknote-right">
              <div className="serial-number">VGV-2024-420</div>
              <div className="security-features">
                <div className="hologram">🌈</div>
                <div className="watermark">VEGOVA</div>
              </div>
            </div>
          </div>

          <div className="banknote-footer">
            <div className="footer-text">
              <p>This note is legal tender for all debts, public and private, in the Republic of Vegova</p>
              <p>Issued by the Central Bank of Vegova Ljubljana • Series 2024</p>
            </div>
            <div
              className="back-button"
              onClick={(e) => {
                e.stopPropagation()
                startRickroll()
              }}
            >
              Don't click me
            </div>
          </div>
        </div>

        <div className="banknote-back">
          <div className="banknote-back-header">
            <h2>VEGOVA CENTRAL BANK</h2>
          </div>

          <div className="banknote-back-center">
            <div className="school-building">
              <img src="/vegova-building.png" alt="Vegova School Building" className="building-image" />
            </div>

            <div className="denomination-back">420</div>
          </div>

          <div className="banknote-back-footer">
            <div className="security-code">SB-2024-VEGOVA-SIMBANK</div>
            <div className="signature">Signed: Team SimBank</div>
          </div>
        </div>
      </div>

      <div className="banknote-info">
        <h2>🏦 Official Vegova Banknote 🏦</h2>
        <p>Congratulations! You've discovered the secret Vegova banknote!</p>
        <p>This commemorative 420 VegCoin note features the founding fathers of SimBank.</p>
        <p>
          <strong>Fun Fact:</strong> This banknote is worth exactly 420.69 VegCoins in the SimBank ecosystem!
        </p>
        <p className="flip-instruction">Click the banknote to see the reverse side</p>
        <button className="return-button" onClick={() => navigate("/login")}>
          Return to Login
        </button>
      </div>

      {isRickRolling && (
        <div className="rickroll-overlay">
          <div className="rickroll-text">Never Gonna Give You Up...</div>
        </div>
      )}

      <style jsx>{`
        .banknote-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e3a8a, #3730a3, #7c3aed);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          gap: 40px;
        }

        .banknote {
          width: 600px;
          height: 300px;
          position: relative;
          transition: transform 0.8s;
          transform-style: preserve-3d;
          cursor: pointer;
        }
        
        .banknote.flipped {
          transform: rotateY(180deg);
        }
        
        .banknote-front,
        .banknote-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }
        
        .banknote-front {
          background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
          border: 3px solid #92400e;
          padding: 20px;
        }
        
        .banknote-back {
          background: linear-gradient(135deg, #d97706, #f59e0b, #fbbf24);
          border: 3px solid #92400e;
          padding: 20px;
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
        }

        .banknote-front::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(146, 64, 14, 0.1) 10px,
            rgba(146, 64, 14, 0.1) 20px
          );
          pointer-events: none;
        }
        
        .banknote-back::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 10px,
            rgba(146, 64, 14, 0.1) 10px,
            rgba(146, 64, 14, 0.1) 20px
          );
          pointer-events: none;
        }

        .banknote-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .vegova-banknote-logo {
          height: 40px;
          width: auto;
        }

        .banknote-title h1 {
          font-size: 18px;
          font-weight: 900;
          color: #92400e;
          margin: 0;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        .banknote-title p {
          font-size: 12px;
          color: #b45309;
          margin: 0;
          font-weight: 600;
        }

        .banknote-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 140px;
        }

        .banknote-left {
          text-align: center;
        }

        .denomination {
          font-size: 48px;
          font-weight: 900;
          color: #92400e;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          margin-bottom: 8px;
        }

        .currency-name {
          font-size: 14px;
          font-weight: 700;
          color: #b45309;
          letter-spacing: 2px;
        }

        .banknote-center {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .portrait-section {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .portrait-frame {
          width: 80px;
          height: 60px;
          border: 2px solid #92400e;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .portrait-placeholder {
          text-align: center;
        }

        .face-placeholder {
          font-size: 20px;
          margin-bottom: 2px;
        }

        .portrait-placeholder p {
          font-size: 8px;
          color: #92400e;
          font-weight: 600;
          margin: 0;
          line-height: 1;
        }

        .banknote-right {
          text-align: center;
        }

        .serial-number {
          font-size: 12px;
          font-weight: 700;
          color: #92400e;
          margin-bottom: 16px;
          transform: rotate(90deg);
        }

        .security-features {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hologram {
          font-size: 24px;
          animation: rainbow 2s ease-in-out infinite;
        }

        .watermark {
          font-size: 10px;
          color: rgba(146, 64, 14, 0.5);
          font-weight: 700;
          letter-spacing: 1px;
        }

        .banknote-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 20px;
        }

        .footer-text p {
          font-size: 8px;
          color: #92400e;
          margin: 2px 0;
          font-weight: 500;
        }

        .back-button {
          font-size: 6px;
          color: rgba(146, 64, 14, 0.3);
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .back-button:hover {
          opacity: 0.7;
        }
        
        /* Back of the banknote */
        .banknote-back-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .banknote-back-header h2 {
          font-size: 20px;
          font-weight: 900;
          color: #92400e;
          margin: 0;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }
        
        .banknote-back-center {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          height: 180px;
        }
        
        .school-building {
          width: 80%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .building-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          opacity: 0.8;
        }
        
        .denomination-back {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 60px;
          font-weight: 900;
          color: rgba(146, 64, 14, 0.5);
        }
        
        .banknote-back-footer {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
        }
        
        .security-code {
          font-size: 10px;
          color: #92400e;
        }
        
        .signature {
          font-size: 10px;
          font-style: italic;
          color: #92400e;
        }

        .banknote-info {
          max-width: 600px;
          text-align: center;
          color: white;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 24px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .banknote-info h2 {
          margin-bottom: 16px;
          font-size: 24px;
          font-weight: 700;
        }

        .banknote-info p {
          margin-bottom: 12px;
          line-height: 1.6;
        }
        
        .flip-instruction {
          margin-top: 20px;
          font-style: italic;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .return-button {
          margin-top: 20px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .return-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .rickroll-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.5s ease-out;
        }
        
        .rickroll-text {
          font-size: 36px;
          color: white;
          font-weight: bold;
          animation: pulse 1s infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes rainbow {
          0%, 100% { filter: hue-rotate(0deg); }
          25% { filter: hue-rotate(90deg); }
          50% { filter: hue-rotate(180deg); }
          75% { filter: hue-rotate(270deg); }
        }

        @media (max-width: 768px) {
          .banknote {
            width: 90vw;
            height: auto;
            aspect-ratio: 2/1;
          }

          .denomination {
            font-size: 36px;
          }

          .portrait-section {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .portrait-frame {
            width: 60px;
            height: 45px;
          }

          .face-placeholder {
            font-size: 16px;
          }

          .portrait-placeholder p {
            font-size: 7px;
          }
        }
      `}</style>
    </div>
  )
}
