import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axios';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Define Firebase and App ID variables
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [isMe, setIsMe] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '' });
  const [nightMode, setNightMode] = useState(localStorage.getItem('theme') === 'night');
  const [userId, setUserId] = useState('');

  // New state for Firebase and PFP upload
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [storage, setStorage] = useState(null);
  const [pfpUrl, setPfpUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const pfpInputRef = useRef(null); // Ref for the hidden file input

  // --- Firebase Initialization and Auth ---
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);
      const storageInstance = getStorage(app);

      setAuth(authInstance);
      setDb(dbInstance);
      setStorage(storageInstance);

      // Sign in with custom token if available, otherwise anonymously
      onAuthStateChanged(authInstance, async (user) => {
        if (!user) {
          if (initialAuthToken) {
            await signInWithCustomToken(authInstance, initialAuthToken);
          } else {
            await signInAnonymously(authInstance);
          }
        }
        // Once authenticated, proceed with data fetching
      });
    } catch (error) {
      console.error("Error initializing Firebase:", error);
    }
  }, []);

  // --- Data Fetching and User Profile Setup ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const currentUserId = payload?.id;

    if (currentUserId === id) {
      setIsMe(true);
    }
    setUserId(currentUserId);

    // Fetch user profile and blogs from backend
    axios.get(`/user/${id}`).then(res => {
      setProfile(res.data.user);
      setBlogs(res.data.posts);
      setForm({
        username: res.data.user.username,
        bio: res.data.user.bio || '',
      });
      // Set initial PFP URL if available from backend
      setPfpUrl(res.data.user.pfpUrl || '');
    }).catch(error => {
      console.error("Error fetching profile from backend:", error);
    });

    // Handle mouse click animations
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
  }, [id, nightMode]);

  // --- Real-time PFP updates from Firestore (if current user is viewing their own profile) ---
  useEffect(() => {
    if (db && auth && auth.currentUser && isMe) {
      // Listen for changes to the user's profile document in Firestore
      // Path: artifacts/{appId}/users/{userId}/profiles/{documentId}
      const userDocRef = doc(db, `artifacts/${appId}/users/${auth.currentUser.uid}/profiles`, auth.currentUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.pfpUrl) {
            setPfpUrl(data.pfpUrl);
            setProfile(prev => ({ ...prev, pfpUrl: data.pfpUrl })); // Update axios-fetched profile too
          }
        }
      }, (error) => {
        console.error("Error listening to profile changes:", error);
      });
      return () => unsubscribe(); // Clean up the listener on unmount
    }
  }, [db, auth, isMe]); // Re-run if db or auth state changes, or if it becomes 'me'

  // --- Theme Toggle ---
  const toggleTheme = () => {
    const newTheme = nightMode ? 'day' : 'night';
    localStorage.setItem('theme', newTheme);
    setNightMode(!nightMode);
  };

  // --- Handle Profile Update (username/bio) ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/user/me', form);
      setProfile(res.data);
      setEditMode(false);

      // If this is the current user's profile, also update Firestore
      if (isMe && db && auth.currentUser) {
        const userDocRef = doc(db, `artifacts/${appId}/users/${auth.currentUser.uid}/profiles`, auth.currentUser.uid);
        await updateDoc(userDocRef, {
          username: form.username,
          bio: form.bio,
        });
      }
    } catch (error) {
      console.error('Update failed:', error);
      // Implement a custom message box instead of alert
    }
  };

  // --- Handle Profile Picture Upload ---
  const handlePfpUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!db || !auth || !auth.currentUser || !storage) {
      console.error("Firebase services not fully initialized or user not authenticated.");
      // Implement a custom message box
      return;
    }

    setUploading(true);
    try {
      // Storage path: profilePictures/{userId}/{filename}
      const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore document with new PFP URL
      // Path: artifacts/{appId}/users/{userId}/profiles/{documentId}
      const userDocRef = doc(db, `artifacts/${appId}/users/${auth.currentUser.uid}/profiles`, auth.currentUser.uid);
      await updateDoc(userDocRef, { pfpUrl: downloadURL });

      setPfpUrl(downloadURL); // Update local state for immediate display
      setProfile(prev => ({ ...prev, pfpUrl: downloadURL })); // Also update the profile object fetched by axios
      console.log("Profile picture uploaded and profile updated!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      // Implement a custom message box
    } finally {
      setUploading(false);
      if (pfpInputRef.current) {
        pfpInputRef.current.value = ''; // Clear the file input
      }
    }
  };

  if (!profile) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${nightMode ? 'bg-black text-white' : 'bg-green-50 text-green-900'} transition-colors duration-500`}>
      {/* Background Layers */}
      {nightMode && <div className="universe-bg pointer-events-none"></div>}
      {!nightMode && Array.from({ length: 30 }).map((_, i) => (
        <span key={i} className="absolute text-2xl animate-fall pointer-events-none select-none"
          style={{
            top: `${Math.random() * -100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
            opacity: 0.3 + Math.random() * 0.3,
          }}>🍃</span>
      ))}
      {!nightMode && (
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

      {/* Top Navbar */}
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

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold mb-8 text-center">Your Personal Space ✨</h1>

        <div className={`mb-8 p-6 rounded-lg shadow-xl relative transition-all duration-300
          ${nightMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-green-900 border border-green-200'}`}>
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {pfpUrl ? (
                <img
                  src={pfpUrl}
                  alt="Profile Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/96x96/667EEA/FFFFFF?text=PFP'; }} // Fallback image
                />
              ) : (
                isMe ? (
                  <div className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg flex items-center justify-center text-center font-bold text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    Upload Image
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg flex items-center justify-center text-center font-bold text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <span role="img" aria-label="Default avatar">👤</span>
                  </div>
                )
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <span className="text-white text-xl animate-spin">🔄</span>
                </div>
              )}
              <span className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 text-xs">
                {isMe ? '⭐' : '🌐'}
              </span>
              {isMe && ( // Only show upload button if it's the current user's profile
                <>
                  <input
                    type="file"
                    id="pfp-upload"
                    className="hidden"
                    onChange={handlePfpUpload}
                    accept="image/*"
                    ref={pfpInputRef}
                  />
                  <label htmlFor="pfp-upload" className="absolute bottom-0 left-0 bg-purple-600 text-white rounded-full p-2 text-xs cursor-pointer hover:bg-purple-700 transition transform hover:scale-110 shadow-md">
                    📸
                  </label>
                </>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleUpdate} className="w-full max-w-md mx-auto">
                <div className="mb-4">
                  <label htmlFor="username" className={`block text-sm font-medium mb-1 ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
                  <input
                    type="text"
                    id="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className={`border p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${nightMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-green-900 border-gray-300'}`}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="bio" className={`block text-sm font-medium mb-1 ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
                  <textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className={`border p-3 w-full rounded-md resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${nightMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-green-900 border-gray-300'}`}
                    rows="4"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
                <div className="flex justify-center gap-4">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition transform hover:scale-105">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setEditMode(false)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition transform hover:scale-105">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center w-full max-w-md mx-auto">
                <h2 className="text-3xl font-extrabold mb-2 break-words">
                  {profile.username}
                </h2>
                <p className={`text-lg italic mb-4 whitespace-pre-wrap ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{profile.bio || "No bio yet. Time to add one!"}"
                </p>
                {isMe && (
                  <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                    <button onClick={() => setEditMode(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-5 rounded-full shadow-md transition transform hover:scale-105">
                      ✏️ Edit Profile
                    </button>
                    <Link
                      to="/delete-account"
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-5 rounded-full shadow-md transition transform hover:scale-105 text-center"
                    >
                      🗑️ Delete My Account
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <hr className={`my-8 ${nightMode ? 'border-gray-700' : 'border-gray-400'}`} />

        <h3 className="text-2xl font-bold mb-6 text-center">📚 Blogs by {profile.username}</h3>

        {blogs.length === 0 ? (
          <p className="text-center text-lg italic opacity-80">No posts yet. Start sharing your thoughts!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((post) => (
              <div key={post._id} className={`p-5 rounded-lg shadow-md transition transform hover:scale-105
                ${nightMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-300'}`}>
                <Link to={`/posts/${post._id}`} className={`text-xl font-semibold hover:underline ${nightMode ? 'text-blue-400' : 'text-blue-700'}`}>
                  {post.title}
                </Link>
                <p className={`text-sm mt-2 ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Published: {new Date(post.createdAt).toLocaleDateString()}
                </p>
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
          background-image: url('https://placehold.co/1920x1080/000000/FFFFFF?text=Space+Background'); /* Using a placeholder image */
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Profile;
