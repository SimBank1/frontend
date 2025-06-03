import { useState } from "react"
import { Eye, EyeOff, X, CheckCircle, AlertCircle, Shield, Users, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Login({ onLogin, logoSrc = "/logo-rm.png?height=40&width=120" }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [popup, setPopup] = useState({
    message: "",
    type: "success",
    show: false,
  })

  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    password: false,
  })

  const [shakeFields, setShakeFields] = useState({
    username: false,
    password: false,
  })

  const showPopup = (message, type) => {
    setPopup({ message, type, show: true })

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setPopup((prev) => ({ ...prev, show: false }))
    }, 4000)
  }

  const hidePopup = () => {
    setPopup((prev) => ({ ...prev, show: false }))
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
    if (!validateForm()) {
      // Don't show popup, just shake and highlight fields
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200))

    if (username === "admin" && password === "admin") {
      showPopup("✅ Welcome Admin! Redirecting to dashboard...", "success")
      if (onLogin) {
        onLogin({ username, password, userType: "admin" })
      }
      setTimeout(() => {
        console.log("Navigate to admin dashboard")
      }, 2000)
    } else if (username === "employee" && password === "employee") {
      showPopup("✅ Welcome Employee! Redirecting to your workspace...", "success")
      if (onLogin) {
        onLogin({ username, password, userType: "employee" })
      }
      setTimeout(() => {
        console.log("Navigate to employee dashboard")
      }, 2000)
    } else {
      setPassword("")
      showPopup("❌ Invalid credentials. Please check your username and password.", "error")
    }

    setIsLoading(false)
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 to-blue-900/40" />

      {/* Content */}
      <div className={`relative min-h-screen transition-all duration-500 ${popup.show ? "blur-[2px]" : ""}`}>
        {/* Navigation */}
        <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img src={logoSrc || "/placeholder.svg"} alt="SimBank Logo" className="h-10" />
                <div className="hidden md:flex items-center space-x-2 text-white/90">
                </div>
              </div>
              <div className="flex items-center space-x-4 text-white/80 text-sm">
                <div className="flex items-center space-x-1">
                  <Lock size={14} />
                  <span>Secure Access</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center justify-center px-6 py-12 gap-16 min-h-[calc(100vh-80px)]">
          {/* Left Side - Admin/Employee Info */}
          <div className="w-full max-w-xl space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <Users className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">Staff Portal</h1>
                  <p className="text-blue-200 text-lg font-medium">SimBank Internal Access</p>
                </div>
              </div>

              <p className="text-xl text-white/90 leading-relaxed drop-shadow-md">
                Secure access for administrators and employees. Manage operations, oversee accounts, and maintain the
                highest standards of banking excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: Shield,
                  title: "Admin Dashboard",
                  desc: "Full system control and oversight capabilities",
                  color: "from-red-500/20 to-orange-500/20 border-red-300/30",
                },
                {
                  icon: Users,
                  title: "Employee Workspace",
                  desc: "Customer service and account management tools",
                  color: "from-blue-500/20 to-cyan-500/20 border-blue-300/30",
                },
                {
                  icon: Lock,
                  title: "Secure Environment",
                  desc: "End-to-end encryption and audit logging",
                  color: "from-green-500/20 to-emerald-500/20 border-green-300/30",
                },
                {
                  icon: CheckCircle,
                  title: "Compliance Ready",
                  desc: "EU banking regulations and GDPR compliant",
                  color: "from-purple-500/20 to-pink-500/20 border-purple-300/30",
                },
              ].map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${feature.color} backdrop-blur-sm rounded-xl p-5 border shadow-lg`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <IconComponent className="text-white" size={20} />
                      <h4 className="font-bold text-white text-lg">{feature.title}</h4>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">{feature.desc}</p>
                  </div>
                )
              })}
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-white/80 text-center">
                <Lock className="inline mr-2" size={14} />
                This is a restricted access portal. All activities are monitored and logged.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/30 relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
                      <Shield className="text-white" size={24} />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Staff Login</h2>
                  <p className="text-gray-600 font-medium">Enter your credentials to continue</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        if (fieldErrors.username) {
                          setFieldErrors((prev) => ({ ...prev, username: false }))
                        }
                      }}
                      onKeyDown={handleKeyPress}
                      className={`h-12 transition-all duration-300 font-medium ${
                        fieldErrors.username
                          ? "border-red-500 bg-red-50 focus:ring-red-500 shadow-red-200/50"
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      } ${shakeFields.username ? "animate-pulse" : ""}`}
                      style={{
                        animation: shakeFields.username ? "shake 0.6s ease-in-out" : undefined,
                      }}
                    />
                    {fieldErrors.username && (
                      <p className="text-xs text-red-600 font-medium flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        Username is required
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (fieldErrors.password) {
                            setFieldErrors((prev) => ({ ...prev, password: false }))
                          }
                        }}
                        onKeyDown={handleKeyPress}
                        className={`h-12 pr-12 transition-all duration-300 font-medium ${
                          fieldErrors.password
                            ? "border-red-500 bg-red-50 focus:ring-red-500 shadow-red-200/50"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        } ${shakeFields.password ? "animate-pulse" : ""}`}
                        style={{
                          animation: shakeFields.password ? "shake 0.6s ease-in-out" : undefined,
                        }}
                      />
                      <button
                        type="button"
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all duration-200 p-1 rounded-full hover:bg-gray-100"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-xs text-red-600 font-medium flex items-center">
                        <AlertCircle size={12} className="mr-1" />
                        Password is required
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Shield size={18} />
                        <span>Access Portal</span>
                      </div>
                    )}
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-2">
                  <p className="text-xs text-gray-500 font-medium">
                    Authorized personnel only. All access is monitored and logged.
                  </p>
                  <p className="text-xs text-gray-400">© {new Date().getFullYear()} SimBank EU. All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Glowy Popup Modal */}
      {popup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={hidePopup} />

          {/* Glow effect container */}
          <div className="relative">
            {/* Outer glow */}
            <div
              className={`absolute inset-0 rounded-3xl blur-xl ${
                popup.type === "success"
                  ? "bg-gradient-to-r from-green-400/40 to-emerald-400/40"
                  : "bg-gradient-to-r from-red-400/40 to-pink-400/40"
              }`}
            />

            {/* Inner glow */}
            <div
              className={`absolute inset-2 rounded-2xl blur-lg ${
                popup.type === "success"
                  ? "bg-gradient-to-r from-green-300/30 to-emerald-300/30"
                  : "bg-gradient-to-r from-red-300/30 to-pink-300/30"
              }`}
            />

            {/* Main popup */}
            <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6 max-w-sm w-full mx-4 transform transition-all duration-500 scale-100">
              <button
                onClick={hidePopup}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100/50"
              >
                <X size={18} />
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <div
                  className={`p-2 rounded-full ${
                    popup.type === "success"
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-red-500 to-pink-500"
                  }`}
                >
                  {popup.type === "success" ? (
                    <CheckCircle className="text-white" size={20} />
                  ) : (
                    <AlertCircle className="text-white" size={20} />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  {popup.type === "success" ? "Success" : "Authentication Error"}
                </h3>
              </div>

              <p className="text-gray-700 mb-6 font-medium leading-relaxed">{popup.message}</p>

              <Button
                onClick={hidePopup}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 border-0 font-semibold"
                variant="outline"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}
