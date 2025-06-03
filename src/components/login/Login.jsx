import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import bankLogo from '/mnt/data/ChatGPT Image Jun 3, 2025, 09_22_27 AM.png'; // Adjust path if needed

const Login = () => {
  const [cookies, setCookie] = useCookies(['sessionCokie']);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError('Invalid username or password.');
      return;
    }

    if (username === 'admin' && password === 'admin') {
      setCookie('sessionCokie', 'admin', { path: '/' });
      navigate('/dashboard');
    } else {
      setError('Invalid username or password.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <img src={bankLogo} alt="SimBank Logo" className="h-10 w-auto" />
        <ul className="flex space-x-6 text-gray-700 text-sm font-medium">
          <li className="hover:text-blue-600 cursor-pointer">Home</li>
          <li className="hover:text-blue-600 cursor-pointer">About</li>
          <li className="hover:text-blue-600 cursor-pointer">Help</li>
          <li className="hover:text-blue-600 cursor-pointer">Contact</li>
        </ul>
      </nav>

      <div className="flex flex-1 flex-col lg:flex-row items-center justify-center px-6 py-12 gap-12">
        {/* Info Panel */}
        <div className="w-full max-w-lg text-gray-700 space-y-6">
          <h2 className="text-4xl font-bold text-blue-800">Your Trusted Digital Bank</h2>
          <p className="text-lg">
            Manage all your finances in one place. SecureBank offers 24/7 online banking, instant transfers,
            and top-tier encryption. No monthly fees, no hidden charges.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>🔒 Advanced security with 2FA</li>
            <li>📱 Mobile app support</li>
            <li>💸 Free domestic transfers</li>
            <li>🏦 Virtual and physical debit cards</li>
          </ul>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Sign in to your account</h3>
          <div className="space-y-5">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Login
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} SimBank Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
