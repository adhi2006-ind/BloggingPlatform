// src/pages/Register.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [errors, setErrors] = useState({ password: '' });
  const [nightMode, setNightMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('nightMode');
    if (saved !== null) setNightMode(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('nightMode', JSON.stringify(nightMode));
  }, [nightMode]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!form.username.trim()) return setUsernameStatus(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/check-username?username=${form.username}`);
        setUsernameStatus(res.data.available);
      } catch {
        setUsernameStatus(false);
      }
    };
    const delay = setTimeout(checkUsername, 500);
    return () => clearTimeout(delay);
  }, [form.username]);

  useEffect(() => {
    const checkEmail = async () => {
      if (!form.email.trim()) return setEmailStatus(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/check-email?email=${form.email}`);
        setEmailStatus(res.data.available);
      } catch {
        setEmailStatus(false);
      }
    };
    const delay = setTimeout(checkEmail, 500);
    return () => clearTimeout(delay);
  }, [form.email]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ password: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!usernameStatus || !emailStatus) return alert('Username or email is not available.');
    if (form.password.length < 8) return setErrors({ password: 'Password must be at least 8 characters.' });

    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      alert('Registration successful');
      navigate('/login');
    } catch {
      alert('Registration failed');
    }
  };

  const handleClickEffect = (e) => {
    if (nightMode) {
      const star = document.createElement('div');
      star.className = 'shooting-star';
      star.style.left = `${e.clientX}px`;
      star.style.top = `${e.clientY}px`;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 1000);
    } else {
      const ripple = document.createElement('div');
      ripple.className = 'day-ripple';
      ripple.style.left = `${e.clientX - 10}px`;
      ripple.style.top = `${e.clientY - 10}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    }
  };

  const backgroundClass = nightMode
    ? 'bg-black text-white'
    : 'bg-gradient-to-br from-green-50 to-green-100 text-green-900';

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden ${backgroundClass} transition-colors duration-500`}
      onClick={handleClickEffect}
    >
      {nightMode && <div className="universe-bg pointer-events-none"></div>}

      {!nightMode && Array.from({ length: 30 }).map((_, i) => (
        <span
          key={i}
          className="absolute text-2xl animate-fall pointer-events-none select-none"
          style={{
            top: `${Math.random() * -100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
            opacity: 0.3 + Math.random() * 0.3,
          }}
        >
          🍃
        </span>
      ))}

      {!nightMode && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-3xl animate-float-fast"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${5 + Math.random() * 3}s`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.2 + Math.random() * 0.2,
              }}
            >
              {['📝', '📘', '✏️', '📚', '🌿', '🎧', '🤖', '❄️'][Math.floor(Math.random() * 8)]}
            </span>
          ))}
        </div>
      )}

      {nightMode && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="twinkling-star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Top Nav */}
      <div className={`w-full flex justify-between items-center px-6 py-4 ${nightMode ? 'bg-gray-800 text-white' : 'bg-green-200 text-green-900'} shadow-md z-20 relative`}>
        <Link to="/" className="text-3xl font-extrabold tracking-wider hover:underline">🌿 MyBlog</Link>
        <div className="flex items-center gap-3">
          <button onClick={() => setNightMode(!nightMode)} className="text-lg hover:scale-110 transition">
            {nightMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => navigate('/login')} className="hover:underline font-semibold transition">🔑 Login</button>
        </div>
      </div>

      <h2 className="text-center text-3xl font-bold mt-8 mb-4 z-20 relative">📝 Register</h2>

      <form onSubmit={handleSubmit} className="relative z-20 p-4 max-w-md mx-auto mt-4 bg-white shadow-md rounded-md border border-green-300">
        {/* Username */}
        <div className="relative mb-2">
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            className="border-2 border-green-300 rounded-md p-2 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            required
          />
          {usernameStatus !== null && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              {usernameStatus ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />}
            </span>
          )}
          {usernameStatus === false && (
            <p className="text-xs text-red-500 mt-1">Username is taken</p>
          )}
        </div>

        {/* Email */}
        <div className="relative mb-2">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="border-2 border-green-300 rounded-md p-2 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            required
          />
          {emailStatus !== null && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              {emailStatus ? <FaCheckCircle className="text-green-500" /> : <FaTimesCircle className="text-red-500" />}
            </span>
          )}
          {emailStatus === false && (
            <p className="text-xs text-red-500 mt-1">Email is already registered</p>
          )}
        </div>

        {/* Password */}
        <div className="relative mb-2">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            placeholder="Password (min 8 characters)"
            className="border-2 border-green-300 rounded-md p-2 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
          <p className="text-xs text-red-600">{errors.password}</p>
        </div>

        <button className="bg-green-600 text-white px-4 py-2 w-full rounded-md hover:bg-green-700 transition">
          Register
        </button>
      </form>

      <style>{`
        .shooting-star {
          position: absolute;
          width: 6px;
          height: 6px;
          background: white;
          box-shadow: 0 0 18px 8px white;
          animation: shoot 1s ease-out forwards;
          z-index: 9999;
        }
        @keyframes shoot {
          to {
            transform: translate(300px, -300px);
            opacity: 0;
          }
        }
        .day-ripple {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.1);
          transform: scale(0);
          animation: ripple-anim 0.5s ease-out forwards;
          z-index: 10;
        }
        @keyframes ripple-anim {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .animate-float-fast {
          animation: floatFast 5s ease-in-out infinite;
        }
        @keyframes floatFast {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .twinkling-star {
          width: 1.5px;
          height: 1.5px;
          background-color: white;
          position: absolute;
          border-radius: 50%;
          opacity: 0.9;
        }
        .universe-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          background-image: url('/space.jpg');
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          animation: pan 180s linear infinite;
          z-index: -10;
        }
        @keyframes pan {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
      `}</style>
    </div>
  );
};

export default Register;
