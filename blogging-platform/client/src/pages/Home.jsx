import { useEffect, useState } from 'react';
import axios from '../axios';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(null);
  const [nightMode, setNightMode] = useState(false);

  const limit = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setToken(token);
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`/posts?search=${search}&page=${page}&limit=${limit}`);
      setPosts(res.data.posts);
      setTotal(res.data.total);
    } catch {
      alert('Failed to fetch posts');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [search, page]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserId(null);
    navigate('/');
  };

  const totalPages = Math.ceil(total / limit);

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

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleString(undefined, options);
  };

  const backgroundClass = nightMode
    ? 'bg-black text-white'
    : 'bg-gradient-to-br from-green-50 to-green-100 text-green-900';

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden ${backgroundClass} transition-colors duration-500`}
      onClick={handleClickEffect}
    >
      {/* Universe BG for Night Mode */}
      {nightMode && (
        <div className="universe-bg pointer-events-none"></div>
      )}

      {/* Leaves in Day Mode */}
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

      {/* Floating Icons (Day Only) */}
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

      {/* Night Mode Stars */}
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

      {/* Top Bar (Full Width) */}
      <div className={`w-full flex justify-between items-center px-6 py-4 ${nightMode ? 'bg-gray-800 text-white' : 'bg-green-200 text-green-900'} shadow-md z-20 relative`}>
        <h1 className="text-3xl font-extrabold tracking-wider">🌿 MyBlog</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNightMode(!nightMode)}
            className="text-lg hover:scale-110 transition"
            title="Toggle Night Mode"
          >
            {nightMode ? '☀️' : '🌙'}
          </button>
          {token ? (
            <>
              <button onClick={() => navigate('/createpost')} className="hover:underline font-semibold transition">✏️ New Post</button>
              <button onClick={() => navigate(`/profile/${userId}`)} className="hover:underline font-semibold transition">🙍‍♂️ Profile</button>
              <button onClick={() => navigate('/dashboard')} className="hover:underline font-semibold transition">📊 Dashboard</button>
              <button onClick={handleLogout} className="text-red-500 hover:underline font-semibold transition">🚪 Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="hover:underline font-semibold transition">🔑 Login</button>
              <button onClick={() => navigate('/register')} className="hover:underline font-semibold transition">📝 Register</button>
            </>
          )}
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-20 w-full">
        {/* Search Bar */}
        <div className="relative my-6 px-4 max-w-5xl mx-auto">
          <input
            type="text"
            placeholder="🔍 Search blog posts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border-2 border-green-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400 transition bg-white shadow-sm"
          />
        </div>

        {/* Blog Posts */}
        <div className="space-y-4 px-4 max-w-5xl mx-auto">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link
                to={`/posts/${post._id}`}
                key={post._id}
                className="block bg-white border border-green-200 shadow-sm hover:shadow-md rounded-lg p-4 hover:scale-[1.01] transition-all duration-200 relative" // Added 'relative' for positioning
              >
                <h2 className="text-xl font-semibold text-green-800 mb-1">{post.title}</h2>
                <p className="text-sm text-gray-600">
                  by{' '}
                  <Link to={`/profile/${post.author?._id}`} className="text-green-700 hover:underline font-medium">
                    {post.author?.username}
                  </Link>
                </p>
                <div className="absolute top-2 right-4 text-sm text-gray-500 flex items-center gap-2">
                  <span>❤️ {post.likes ? post.likes.length : 0}</span> {/* Display likes count */}
                  <span>•</span>
                  <span>{formatDateTime(post.createdAt)}</span> {/* Display formatted date/time */}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center font-medium mt-20">
              <p className="text-3xl mb-2">No blog posts yet 🕊️</p>
              <p className="text-sm text-green-600">Start by creating your first post!</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded-lg font-semibold transition ${
                  page === i + 1 ? 'bg-green-500 text-white shadow-md' : 'bg-green-100 hover:bg-green-200 text-green-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

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

export default Home;