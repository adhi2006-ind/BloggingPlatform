import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axios';

const AccountDeletion = () => {
  const [nightMode, setNightMode] = useState(localStorage.getItem('theme') === 'night');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = nightMode ? 'day' : 'night';
    localStorage.setItem('theme', newTheme);
    setNightMode(!nightMode);
  };

  // Click ripple/star effect
  useEffect(() => {
    const handleClick = (e) => {
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
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [nightMode]);

  const handleDelete = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const verifyRes = await axios.post('/user/verify-password', { password });
      if (!verifyRes.data.success) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      await axios.delete('/user/delete');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      setError('Error deleting account. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${nightMode ? 'bg-black text-white' : 'bg-green-50 text-green-900'} transition-colors duration-500`}>
      {/* Background Effects */}
      {nightMode && <div className="universe-bg pointer-events-none"></div>}
      {!nightMode && (
        <>
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} className="absolute text-2xl animate-fall pointer-events-none select-none"
              style={{
                top: `${Math.random() * -100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
                opacity: 0.3 + Math.random() * 0.3,
              }}>🍃</span>
          ))}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className="absolute text-3xl animate-float-fast"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${5 + Math.random() * 3}s`,
                  animationDelay: `${Math.random() * 3}s`,
                  opacity: 0.2 + Math.random() * 0.2,
                }}>
                {['📝', '📘', '✏️', '📚', '🌿', '🎧', '🤖', '❄️'][Math.floor(Math.random() * 8)]}
              </span>
            ))}
          </div>
        </>
      )}
      {nightMode && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="twinkling-star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}></div>
          ))}
        </div>
      )}

      {/* Navbar */}
      <div className={`w-full flex justify-between items-center px-6 py-4 ${nightMode ? 'bg-gray-800 text-white' : 'bg-green-200 text-green-900'} shadow-md z-20 relative`}>
        <h1 className="text-3xl font-extrabold tracking-wider">🌿 MyBlog</h1>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="text-lg hover:scale-110 transition">
            {nightMode ? '☀️' : '🌙'}
          </button>
          <Link to="/" className="hover:underline font-semibold transition">🏠 Home</Link>
          <Link to="/profile/me" className="hover:underline font-semibold transition">🙍‍♂️ Profile</Link>
        </div>
      </div>

      {/* Main Form */}
      <div className="relative z-10 max-w-lg mx-auto p-8 mt-16 rounded-lg shadow-xl border
        bg-white text-green-900 dark:bg-gray-800 dark:text-white dark:border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center">Delete Account 🗑️</h2>
        <p className="mb-4 text-center text-red-600 font-semibold">
          This action is irreversible. Please confirm your password.
        </p>

        <form onSubmit={handleDelete} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-md border focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter your password"
              />
              <span
                className="absolute right-3 top-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105"
          >
            {loading ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </form>
      </div>

      {/* Style */}
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
          to { transform: translate(300px, -300px); opacity: 0; }
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
          to { transform: scale(4); opacity: 0; }
        }
        .animate-float-fast {
          animation: floatFast 5s ease-in-out infinite;
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
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
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background-image: url('https://placehold.co/1920x1080/000000/FFFFFF?text=Space+Background');
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

export default AccountDeletion;
