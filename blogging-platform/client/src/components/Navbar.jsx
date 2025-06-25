import { Link } from 'react-router-dom';


const Navbar = () => {
 const token = localStorage.getItem('token');
const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
const userId = payload?.id;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">📝 MyBlog</Link>

      <div className="flex gap-4 items-center">
        {token ? (
          <>
            <Link to="/createpost" className="hover:underline">New Post</Link>
            <Link to={`/profile/${userId}`} className="hover:underline">My Profile</Link>
            <button onClick={handleLogout} className="text-red-400 hover:underline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
