import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../axios';
import { FaTrash } from 'react-icons/fa';

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [userId, setUserId] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [nightMode, setNightMode] = useState(localStorage.getItem('theme') === 'night');
  const [showReplies, setShowReplies] = useState({}); // New state to manage reply visibility
  const [showComments, setShowComments] = useState(true); // New state to manage comment visibility
  const [showFullScreen, setShowFullScreen] = useState(false); // New state for full screen mode
  const [showCloseButton, setShowCloseButton] = useState(true); // State for close button visibility in full screen

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/comments/${id}`);
      setComments(res.data);
      const likesMap = {};
      res.data.forEach(c => (likesMap[c._id] = c.likes?.includes(userId)));
      setLikedComments(likesMap);
    } catch {
      alert('Failed to load comments');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    }

    axios.get(`/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(() => alert('Post not found'));

    fetchComments();

    const handleClick = (e) => {
      if (nightMode) {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        star.style.left = `${e.clientX}px`;
        star.style.top = `${e.clientY}px`;
        document.body.appendChild(star);
        // Original night mode animation timeout was 1000ms
        setTimeout(() => star.remove(), 1000);
      } else {
        const ripple = document.createElement('div');
        ripple.className = 'day-ripple';
        ripple.style.left = `${e.clientX - 10}px`;
        ripple.style.top = `${e.clientY - 10}px`;
        document.body.appendChild(ripple);
        // Keeping day mode animation timeout fast at 200ms
        setTimeout(() => ripple.remove(), 200);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [id, nightMode]);

  useEffect(() => {
    if (post) {
      setLikeCount(post.likes?.length || 0);
      setLiked(post.likes?.includes(userId));
    }
  }, [post, userId]);

  const toggleTheme = () => {
    const newTheme = nightMode ? 'day' : 'night';
    localStorage.setItem('theme', newTheme);
    setNightMode(!nightMode);
  };

  const handleLike = async () => {
    const prevLiked = liked;
    const prevCount = likeCount;

    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      await axios.put(`/posts/${id}/like`);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      alert("Like failed");
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this post?')) {
      try {
        await axios.delete(`/posts/${id}`);
        alert('Deleted');
        navigate('/');
      } catch {
        alert('Delete failed');
      }
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axios.post(`/comments/${id}`, { text: newComment });
      setNewComment('');
      fetchComments();
    } catch {
      alert('Failed to post comment');
    }
  };

  const handleReply = async (commentId) => {
    const reply = replyText[commentId];
    if (!reply?.trim()) return;
    try {
      await axios.post(`/comments/reply/${commentId}`, { text: reply });
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      fetchComments();
    } catch {
      alert('Failed to reply');
    }
  };

  const toggleCommentLike = async (commentId) => {
    try {
      await axios.put(`/comments/like/${commentId}`);
      setLikedComments(prev => ({ ...prev, [commentId]: !prev[commentId] }));
      fetchComments();
    } catch {
      alert('Failed to like comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Delete this comment?")) {
      try {
        await axios.delete(`/comments/${commentId}`);
        fetchComments();
      } catch {
        alert("Failed to delete comment");
      }
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (window.confirm("Delete this reply?")) {
      try {
        await axios.delete(`/comments/${commentId}/reply/${replyId}`);
        fetchComments();
      } catch {
        alert("Failed to delete reply");
      }
    }
  };

  const toggleRepliesVisibility = (commentId) => {
    setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const toggleCommentsVisibility = () => {
    setShowComments(!showComments);
  };

  const toggleFullScreen = () => {
    setShowFullScreen(!showFullScreen);
  };

  // Function to format the date and time
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!post) return <p className="p-6 text-center">Loading post...</p>;
  const isAuthor = post.author?._id === userId;

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${nightMode ? 'bg-black text-white' : 'bg-green-50 text-green-900'} transition-colors duration-500`}>
      {/* Night Mode Background Animation */}
      {nightMode && <div className="universe-bg pointer-events-none"></div>}

      {/* Day Mode Background Animation */}
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
        >🍃</span>
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

      {/* Night Mode Twinkling Stars Animation */}
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
        <h1 className="text-3xl font-extrabold tracking-wider">🌿 MyBlog</h1>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="text-lg hover:scale-110 transition">
            {nightMode ? '☀️' : '🌙'}
          </button>
          <Link to="/" className="hover:underline font-semibold transition">🏠 Home</Link>
          <Link to={`/profile/${userId}`} className="hover:underline font-semibold transition">🙍‍♂️ Profile</Link>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Blog Content Box */}
        <div className={`relative ${nightMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg p-6 mb-8`}>
          {/* Date and Time of Upload */}
          {post.createdAt && (
            <p className="absolute top-4 right-16 text-xs text-gray-500 dark:text-gray-400">
              {formatDateTime(post.createdAt)}
            </p>
          )}

          <h1 className="text-3xl font-extrabold mb-1">{post.title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            by <Link to={`/profile/${post.author?._id}`} className="text-blue-600 dark:text-blue-400 hover:underline">{post.author?.username}</Link>
          </p>

          {isAuthor && (
            <div className="flex gap-2 mb-4">
              <Link to={`/edit/${post._id}`} className="bg-green-500 text-white px-3 py-1 rounded shadow">Edit</Link>
              <button onClick={handleDelete} className="bg-red-600 text-white px-3 py-1 rounded shadow">Delete</button>
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none mb-4" dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* Instant like toggle */}
          <button onClick={handleLike} className="text-xl mt-4">
            {liked ? '❤️' : '🤍'} {likeCount}
          </button>

          {/* Full Screen Toggle Button */}
          <button
            onClick={toggleFullScreen}
            className="absolute top-4 right-4 text-xl focus:outline-none"
            title="Full Screen"
          >
            {nightMode ? '⛶' : '⛶'}
          </button>
        </div>

        <hr className="my-6" />

        {/* Comment Toggle Button */}
        <button
          onClick={toggleCommentsVisibility}
          className="text-xl font-semibold mb-3 focus:outline-none"
        >
          Comments ({comments.length}) {showComments ? '▼' : '►'}
        </button>

        {showComments && (
          <>
            <form onSubmit={handleComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:text-white"
                rows="3"
              ></textarea>
              <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded mt-2">Post Comment</button>
            </form>

            {comments.map((c) => (
              <div key={c._id} className="mb-6 border-b pb-3 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{c.user?.username}</p>
                  {c.user?._id === userId && (
                    <button onClick={() => handleDeleteComment(c._id)} className="text-red-500">
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>
                <p className={`${nightMode ? 'text-white' : 'text-black'} mt-1`}>{c.text}</p>
                <button
                  onClick={() => toggleCommentLike(c._id)}
                  className="text-sm text-blue-500 hover:underline mt-1"
                >
                  {likedComments[c._id] ? '❤️' : '🤍'} {c.likes?.length || 0}
                </button>

                {/* Reply section */}
                <div className="mt-3">
                  <button
                    onClick={() => toggleRepliesVisibility(c._id)}
                    className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-700'} hover:underline`}
                  >
                    {showReplies[c._id] ? 'Hide Replies' : 'View Replies'} ({c.replies?.length || 0})
                  </button>

                  {showReplies[c._id] && (
                    <div className="ml-4 mt-2">
                      {c.replies?.map((r) => (
                        <div key={r._id} className="border-l pl-3 text-sm my-1 flex justify-between items-center">
                          <span><strong>{r.user?.username}</strong>: {r.text}</span>
                          {r.user?._id === userId && (
                            <button onClick={() => handleDeleteReply(c._id, r._id)} className="text-red-500 ml-2">
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      ))}
                      <textarea
                        value={replyText[c._id] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [c._id]: e.target.value }))}
                        placeholder="Reply..."
                        rows="2"
                        className={`w-full p-2 border rounded mt-3 text-sm ${nightMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
                      ></textarea>
                      <button
                        onClick={() => handleReply(c._id)}
                        className={`px-3 py-1 text-sm mt-2 rounded ${nightMode ? 'bg-gray-700 text-white' : 'bg-gray-600 text-white'}`}
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Full Screen Overlay */}
      {showFullScreen && (
        <div
          className={`fixed inset-0 z-50 flex flex-col ${nightMode ? 'bg-black text-white' : 'bg-white text-black'} p-8 overflow-y-auto`}
          onMouseEnter={() => setShowCloseButton(true)}
          onMouseLeave={() => setShowCloseButton(false)}
        >
          <button
            onClick={toggleFullScreen}
            className={`absolute top-4 right-4 text-4xl focus:outline-none transition-opacity duration-300 ${showCloseButton ? 'opacity-100' : 'opacity-0'}`}
          >
            &times; {/* Close button (X icon) */}
          </button>
          <h1 className="text-4xl font-extrabold mb-4">{post.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            by <Link to={`/profile/${post.author?._id}`} className="text-blue-600 dark:text-blue-400 hover:underline">{post.author?.username}</Link>
          </p>
          <div className="prose dark:prose-invert max-w-none text-lg flex-grow" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      )}

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
          animation: ripple-anim 0.2s ease-out forwards; /* Keeping this fast for day mode */
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

export default PostDetails;