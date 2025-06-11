"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

export default function Terminal() {
  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const [output, setOutput] = useState([
    "SimBank Terminal v1.0.0",
    'Type "help" for available commands.',
    "Secure connection established. Welcome, Agent 404.",
    "",
  ])
  const [accessLevel, setAccessLevel] = useState("standard")
  const [matrixMode, setMatrixMode] = useState(false)
  const [matrixChars, setMatrixChars] = useState([])

  const inputRef = useRef(null)
  const terminalBodyRef = useRef(null)
  const matrixSoundRef = useRef(null)
  const accessGrantedSoundRef = useRef(null)

  // Preload sounds
  useEffect(() => {
    matrixSoundRef.current = new Audio("/matrix-sound.mp3")
    matrixSoundRef.current.volume = 0.2

    accessGrantedSoundRef.current = new Audio("/access-granted.mp3")
    accessGrantedSoundRef.current.volume = 0.3

    return () => {
      if (matrixSoundRef.current) {
        matrixSoundRef.current.pause()
        matrixSoundRef.current = null
      }
      if (accessGrantedSoundRef.current) {
        accessGrantedSoundRef.current.pause()
        accessGrantedSoundRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
    }
  }, [output])

  const commands = {
    help: () => [
      "Available commands:",
      "  help     - Show this help message",
      "  clear    - Clear the terminal",
      "  ls       - List directory contents",
      "  pwd      - Show current directory",
      "  whoami   - Show current user",
      "  date     - Show current date and time",
      "  unlock   - Try to unlock something...",
      "  matrix   - Enter the matrix",
      "  bank     - Access bank mainframe (requires elevated privileges)",
      "  vegova   - Display Vegova information",
      "  exit     - Exit terminal",
      "",
    ],
    clear: () => {
      setOutput([])
      return []
    },
    ls: () => {
      if (accessLevel === "root") {
        return [
          "total 12",
          "drwxr-xr-x  2 agent404 simbank  4096 Dec  5 12:03 accounts/",
          "drwxr-xr-x  2 agent404 simbank  4096 Dec  5 12:03 clients/",
          "drwxr-xr-x  2 agent404 simbank  4096 Dec  5 12:03 transactions/",
          "-rw-r--r--  1 agent404 simbank   420 Dec  5 12:03 vegcoin.dat",
          "-rw-r--r--  1 agent404 simbank  1337 Dec  5 12:03 secret.txt",
          "-rwxr-xr-x  1 agent404 simbank  2048 Dec  5 12:03 bank_access.sh",
          "",
        ]
      } else {
        return [
          "total 8",
          "drwxr-xr-x  2 agent404 simbank  4096 Dec  5 12:03 accounts/",
          "drwxr-xr-x  2 agent404 simbank  4096 Dec  5 12:03 clients/",
          "drwxr-xr-x  2 agent404 simbank  4096 Dec  5 12:03 transactions/",
          "-rw-r--r--  1 agent404 simbank   420 Dec  5 12:03 vegcoin.dat",
          "",
        ]
      }
    },
    pwd: () => [currentPath, ""],
    whoami: () => [
      `agent404 (Access Level: ${accessLevel})`,
      accessLevel === "root" ? "You have full system access." : "Limited access granted.",
      "",
    ],
    date: () => [new Date().toString(), ""],
    unlock: (args) => {
      if (args && args[0] === "bank") {
        if (accessGrantedSoundRef.current) {
          accessGrantedSoundRef.current.play().catch(console.error)
        }

        setAccessLevel("root")
        return [
          "Scanning for vulnerabilities...",
          "Found 3 open ports: 22, 80, 443",
          "Attempting SSH brute force...",
          "Login successful: admin/admin",
          "",
          "Access granted. Welcome Agent 404.",
          "You now have root access to SimBank mainframe.",
          "",
        ]
      } else {
        return ["Usage: unlock [target]", "Example: unlock bank", ""]
      }
    },
    bank: () => {
      if (accessLevel === "root") {
        return [
          "Connecting to SimBank mainframe...",
          "Connection established.",
          "",
          "SimBank Core System v3.2.1",
          "Total accounts: 1,337",
          "Total balance: €42,000,000.00",
          "",
          "WARNING: Unauthorized access to this system is prohibited.",
          "All activities are logged and monitored.",
          "",
        ]
      } else {
        return ["Access denied. Insufficient privileges.", "Please use 'unlock bank' to gain access.", ""]
      }
    },
    vegova: () => [
      "Vegova Ljubljana Technical School",
      "Established: 1874",
      "Location: Ljubljana, Slovenia",
      "",
      "Known for excellence in:",
      "- Computer Science",
      "- Electrical Engineering",
      "- Telecommunications",
      "",
      "Notable alumni: The creators of SimBank",
      "",
    ],
    matrix: () => {
      triggerMatrixMode()
      return ["Entering the matrix...", ""]
    },
    exit: () => {
      navigate("/login")
      return ["Goodbye Agent 404...", ""]
    },
  }

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

  const handleCommand = (cmd) => {
    const trimmedCmd = cmd.trim()
    if (!trimmedCmd) {
      setOutput([...output, `agent404@simbank:${currentPath}$ `, ""])
      setInput("")
      return
    }

    const cmdParts = trimmedCmd.split(" ")
    const cmdName = cmdParts[0].toLowerCase()
    const cmdArgs = cmdParts.slice(1)

    const newOutput = [...output, `agent404@simbank:${currentPath}$ ${cmd}`]

    if (commands[cmdName]) {
      const result = commands[cmdName](cmdArgs)
      newOutput.push(...result)
    } else {
      newOutput.push(`bash: ${cmdName}: command not found`, "")
    }

    setOutput(newOutput)
    setInput("")
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCommand(input)
    }
  }

  return (
    <div className="terminal-container">
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

      <div className="terminal-header">
        <div className="terminal-buttons">
          <div className="terminal-button close" onClick={() => navigate("/login")}></div>
          <div className="terminal-button minimize"></div>
          <div className="terminal-button maximize"></div>
        </div>
        <div className="terminal-title">SimBank Terminal - Agent 404</div>
        <div className="terminal-status">{accessLevel === "root" ? "ROOT ACCESS" : "STANDARD ACCESS"}</div>
      </div>

      <div className="terminal-body" ref={terminalBodyRef}>
        <div className="terminal-output">
          {output.map((line, index) => (
            <div key={index} className="terminal-line">
              {line}
            </div>
          ))}
        </div>

        <div className="terminal-input-line">
          <span className="terminal-prompt">agent404@simbank:{currentPath}$ </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="terminal-input"
            autoFocus
          />
        </div>
      </div>

      <style jsx>{`
        .terminal-container {
          width: 100vw;
          height: 100vh;
          background: #000;
          color: #00ff00;
          font-family: 'Courier New', monospace;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .terminal-header {
          background: #333;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #555;
        }

        .terminal-buttons {
          display: flex;
          gap: 8px;
        }

        .terminal-button {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          cursor: pointer;
        }

        .terminal-button.close {
          background: #ff5f56;
        }

        .terminal-button.minimize {
          background: #ffbd2e;
        }

        .terminal-button.maximize {
          background: #27ca3f;
        }

        .terminal-title {
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          flex: 1;
        }
        
        .terminal-status {
          color: ${accessLevel === "root" ? "#ff5f56" : "#27ca3f"};
          font-size: 12px;
          font-weight: bold;
        }

        .terminal-body {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .terminal-output {
          flex: 1;
          margin-bottom: 16px;
        }

        .terminal-line {
          margin-bottom: 4px;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .terminal-input-line {
          display: flex;
          align-items: center;
        }

        .terminal-prompt {
          color: #00ff00;
          margin-right: 8px;
        }

        .terminal-input {
          background: transparent;
          border: none;
          color: #00ff00;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          outline: none;
          flex: 1;
        }

        .terminal-input::placeholder {
          color: #006600;
        }
        
        /* Matrix Mode Overlay */
        .matrix-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.9);
          z-index: 9999;
          pointer-events: none;
        }

        .matrix-char {
          position: absolute;
          color: #00ff00;
          font-family: "Courier New", monospace;
          font-size: 18px;
          animation: matrixFall linear infinite;
        }

        @keyframes matrixFall {
          0% {
            transform: translateY(-100vh);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
