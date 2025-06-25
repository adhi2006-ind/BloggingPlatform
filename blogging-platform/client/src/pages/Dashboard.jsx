import { useEffect, useState } from 'react';
import axios from '../axios';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [nightMode, setNightMode] = useState(false);
  const [loading, setLoading] = useState(true); // Added loading state
  const navigate = useNavigate();

  // Effect to load night mode preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('nightMode');
    if (savedMode !== null) setNightMode(JSON.parse(savedMode));
  }, []);

  // Effect to save night mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('nightMode', JSON.stringify(nightMode));
  }, [nightMode]);

  // Effect to fetch user's posts
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    if (!storedToken) {
      setLoading(false); // No token, so no loading needed for posts
      return;
    }

    try {
      const payload = JSON.parse(atob(storedToken.split('.')[1]));
      setUserId(payload.id);

      setLoading(true); // Start loading
      axios.get('/posts')
        .then(res => {
          const userPosts = res.data.posts.filter(post => post.author._id === payload.id);
          setPosts(userPosts);
        })
        .catch(() => alert('Failed to fetch posts'))
        .finally(() => setLoading(false)); // End loading regardless of success or failure
    } catch (error) {
      console.error("Error decoding token or parsing payload:", error);
      localStorage.removeItem('token'); // Invalidate bad token
      setLoading(false);
      navigate('/'); // Redirect to home if token is invalid
    }
  }, [navigate]); // Added navigate to dependency array for useEffect

  // Handles user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserId(null);
    navigate('/');
  };

  // Handles click effects based on night mode
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

  // Handles deleting a post
  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      axios.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => {
          setPosts(posts.filter(post => post._id !== postId));
          alert('Post deleted successfully!');
        })
        .catch((error) => {
          console.error('Error deleting post:', error);
          alert('Failed to delete post. Please try again.');
        });
    }
  };

  // Determines background class based on night mode
  const backgroundClass = nightMode
    ? 'bg-black text-white'
    : 'bg-gradient-to-br from-green-50 to-green-100 text-green-900';

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden ${backgroundClass} transition-colors duration-500`}
      onClick={handleClickEffect}
    >
      {/* Night mode cosmic background */}
      {nightMode && <div className="universe-bg pointer-events-none"></div>}

      {/* Day mode falling leaves effect */}
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

      {/* Day mode floating emojis */}
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

      {/* Night mode twinkling stars */}
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

      {/* Top Navigation */}
      <div className={`w-full flex justify-between items-center px-6 py-4 ${nightMode ? 'bg-gray-800 text-white' : 'bg-green-200 text-green-900'} shadow-md z-20 relative`}>
        <h1 className="text-3xl font-extrabold tracking-wider">📊 Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNightMode(!nightMode)}
            className="text-lg hover:scale-110 transition"
            title="Toggle Night Mode"
          >
            {nightMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => navigate('/')} className="hover:underline font-semibold transition px-3 py-1 rounded-md">🏠 Home</button>
          <button onClick={() => navigate(`/profile/${userId}`)} className="hover:underline font-semibold transition px-3 py-1 rounded-md">🙍‍♂️ Profile</button>
          <button
            onClick={() => navigate('/createpost')}
            className={`font-semibold transition px-3 py-1 rounded-md ${nightMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} shadow-md`}
          >
            ✏️ New Post
          </button>
          <button onClick={handleLogout} className="text-red-500 hover:underline font-semibold transition px-3 py-1 rounded-md">🚪 Logout</button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 w-full px-4 max-w-5xl mx-auto py-8 mt-5"> {/* Added mt-5 for top margin */}
        <h2 className="text-2xl font-bold mb-6">My Blog Posts</h2>
        {loading ? (
          // Skeleton loader for posts
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Grid for skeleton loaders */}
            {[...Array(3)].map((_, i) => ( // Show 3 skeleton items
              <div key={i} className={`animate-pulse rounded-lg shadow-lg p-6 ${nightMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`h-6 ${nightMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-3/4 mb-4`}></div>
                <div className={`h-4 ${nightMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-full mb-2`}></div>
                <div className={`h-4 ${nightMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-5/6`}></div>
                <div className="mt-4 flex justify-between">
                  <div className={`h-4 w-1/4 ${nightMode ? 'bg-gray-700' : 'bg-gray-300'} rounded`}></div>
                  <div className={`h-4 w-1/6 ${nightMode ? 'bg-gray-700' : 'bg-gray-300'} rounded`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          // Engaging empty state
          <div className="text-center py-12">
            <p className={`text-xl ${nightMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>You haven't written any posts yet.</p>
            <button
              onClick={() => navigate('/createpost')}
              className={`font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 ${nightMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              Start Your First Post! ✨
            </button>
          </div>
        ) : (
          // Display user's posts as cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Grid layout for cards */}
            {posts.map(post => (
              <div
                key={post._id}
                className={`rounded-lg shadow-lg p-6 flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-xl ${nightMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-green-900 border border-gray-200'}`}
              >
                <div>
                  <Link to={`/posts/${post._id}`} className="text-xl font-bold mb-2 block hover:underline">
                    {post.title}
                  </Link>
                  {/* Assuming post.content exists and you want to show a snippet */}
                  <p className={`text-sm mb-4 ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {post.content ? post.content.substring(0, 100) + '...' : 'No content preview available.'}
                  </p>
                </div>
                <div className="flex justify-between items-end mt-auto"> {/* Aligns time and buttons */}
                  <div className="flex gap-3">
                    <Link to={`/edit/${post._id}`} className={`${nightMode ? 'text-yellow-400' : 'text-yellow-600'} hover:underline font-medium`}>Edit</Link>
                    <Link to={`/posts/${post._id}`} className={`${nightMode ? 'text-blue-400' : 'text-blue-600'} hover:underline font-medium`}>View</Link>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className={`${nightMode ? 'text-red-400' : 'text-red-600'} hover:underline text-sm font-medium transition-colors mb-1`}
                      title="Delete Post"
                    >
                      🗑️ Delete
                    </button>
                    {post.createdAt && (
                      <span className={`text-xs ${nightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Uploaded: {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
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
          border-radius: 50%;
          pointer-events: none; /* Ensure it doesn't block clicks */
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
          pointer-events: none; /* Ensure it doesn't block clicks */
        }
        @keyframes ripple-anim {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0.3; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
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
          animation: twinkle 1.5s infinite ease-in-out alternate;
          box-shadow: 0 0 4px white;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(0.8); }
        }
        .universe-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          background-image: url('/space.jpg'); /* Make sure you have a space.jpg image in your public folder */
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

export default Dashboard;