import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeValid, setCodeValid] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  // New state to control password fields visibility
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('nightMode');
    if (saved !== null) setNightMode(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('nightMode', JSON.stringify(nightMode));
  }, [nightMode]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (code.trim().length === 6 && email.trim()) verifyCode(true);
      else setCodeValid(null);
    }, 400);
    return () => clearTimeout(delay);
  }, [code, email]);

  const verifyCode = async (silent = false) => {
    if (!code.trim() || !email.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-code', { email, code });
      const isValid = res.data.valid;
      setCodeValid(isValid);
      if (!silent) {
        if (isValid) {
          alert('✅ Verification successful! You can now set your new password.');
          // Set to true to show password fields on successful verification
          setShowPasswordFields(true);
        } else {
          alert('❌ Verification failed. Please check the code.');
          setShowPasswordFields(false); // Hide if verification fails
        }
      } else if (isValid) {
        // If silent verification is successful, also show password fields
        setShowPasswordFields(true);
      } else {
        setShowPasswordFields(false);
      }
    } catch {
      setCodeValid(false);
      setShowPasswordFields(false); // Hide if there's an error
      if (!silent) alert('❌ Error verifying the code.');
    }
  };

  const sendCode = async () => {
    if (!email.trim()) return alert('Please enter your email first.');
    try {
      await axios.post('http://localhost:5000/api/auth/send-reset-code', { email });
      alert('📧 Verification code sent to your email.');
      // Reset code validation and password fields visibility when a new code is sent
      setCode('');
      setCodeValid(null);
      setShowPasswordFields(false);
    } catch {
      alert('❌ Failed to send code. Make sure the email is correct.');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    // Ensure password fields are shown and code is valid before attempting reset
    if (!showPasswordFields || !codeValid) {
        return alert('Please verify the code first before resetting your password.');
    }
    if (newPassword.length < 8) return alert('Password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return alert('Passwords do not match.');

    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        code,
        newPassword,
      });
      alert('✅ Password reset successful!');
      navigate('/login');
    } catch {
      alert('❌ Password reset failed.');
    }
  };

  const handleClickEffect = (e) => {
    const ripple = document.createElement('div');
    ripple.className = nightMode ? 'shooting-star' : 'day-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
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

      <div className={`w-full flex justify-between items-center px-6 py-4 ${nightMode ? 'bg-gray-800 text-white' : 'bg-green-200 text-green-900'} shadow-md z-20 relative`}>
        <Link to="/" className="text-3xl font-extrabold tracking-wider hover:underline">🌿 MyBlog</Link>
        <button onClick={() => setNightMode(!nightMode)} className="text-lg hover:scale-110 transition">
          {nightMode ? '☀️' : '🌙'}
        </button>
      </div>

      <h2 className="text-center text-3xl font-bold mt-8 mb-4 z-20 relative">🔐 Reset Password</h2>

      <form onSubmit={handleReset} className="relative z-20 p-4 max-w-md mx-auto bg-white shadow-md rounded-md border border-green-300">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border-2 border-green-300 rounded-md p-2 w-full mb-2 text-black"
          required
        />
        <button
          type="button"
          onClick={sendCode}
          className="bg-green-500 text-white px-4 py-1 rounded-md mb-3 hover:bg-green-600 w-full"
        >
          📧 Send Code
        </button>

        <div className="relative mb-1">
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="border-2 border-green-300 rounded-md p-2 w-full pr-10 text-black"
            required
          />
          {code && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              {codeValid === true && <FaCheckCircle className="text-green-500" />}
              {codeValid === false && <FaTimesCircle className="text-red-500" />}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => verifyCode(false)}
          className="mb-3 w-full px-4 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
          disabled={!email.trim() || !code.trim() || codeValid === true}
        >
          ✅ Verify Code
        </button>

        {/* Conditionally render password fields */}
        {showPasswordFields && (
          <>
            <div className="relative mb-2">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="border-2 border-green-300 rounded-md p-2 w-full pr-10 text-black"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="border-2 border-green-300 rounded-md p-2 w-full text-black"
                required
              />
            </div>

            <button className="bg-green-600 text-white px-4 py-2 w-full rounded-md hover:bg-green-700 transition">
              🔒 Reset Password
            </button>
          </>
        )}
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
          top: 0; left: 0; right: 0; bottom: 0;
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

export default ResetPassword;