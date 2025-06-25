import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [nightMode, setNightMode] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('nightMode');
    if (saved !== null) setNightMode(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('nightMode', JSON.stringify(nightMode));
  }, [nightMode]);

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    }
  }, [token]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const temp = document.createElement('div');
    temp.innerHTML = content;
    const plainText = temp.textContent || temp.innerText || '';

    if (!title.trim()) return alert('Title is required');
    if (plainText.trim() === '') {
      const confirmed = window.confirm('Content is empty. Do you want to continue?');
      if (!confirmed) return;
    }

    try {
      await axios.post('/posts', { title, content });
      alert('Post created!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to create post');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');
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
        <h1 className="text-3xl font-extrabold tracking-wider">📝 New Post</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setNightMode(!nightMode)} className="text-lg hover:scale-110 transition">
            {nightMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => navigate('/')} className="hover:underline font-semibold transition">🏠 Home</button>
          <button onClick={() => navigate(`/profile/${userId}`)} className="hover:underline font-semibold transition">🙍‍♂️ Profile</button>
          <button onClick={handleLogout} className="text-red-500 hover:underline font-semibold transition">🚪 Logout</button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="relative z-20 max-w-4xl mx-auto p-6">
        <input
          type="text"
          placeholder="Enter post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-2 border-green-300 rounded-md p-3 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 transition bg-white shadow-sm"
          required
        />
        <ReactQuill
          value={content}
          onChange={setContent}
          className="mb-4 bg-white"
          theme="snow"
          modules={modules}
        />
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition">
          🚀 Publish
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

export default CreatePost;
