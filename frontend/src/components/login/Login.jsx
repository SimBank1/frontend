import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cookies, setCookie] = useCookies(['sessionCokie']);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation for demo
    if (username === 'admin' && password === 'admin') {
      setCookie('sessionCokie', 'admin', { path: '/' });
      navigate('/dashboard');
    } else {
      // handle error
      alert('Invalid username or password.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
