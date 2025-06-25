import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import Home from './pages/Home';
import PostDetails from './pages/PostDetails';
import EditPost from './pages/EditPost';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import AccountDeletion from './pages/AccountDeletion';
import ResetPassword from './pages/ResetPassword';



// Inside your <Routes> block:


 // Adjust path as needed
// ... inside your Routes/Router setup



// Optional: Navbar (if it's a standalone page route, which is unusual)
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/createpost" element={<CreatePost />} />
        <Route path="/edit/:id" element={<EditPost />} />
        <Route path="/posts/:id" element={<PostDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Not common to route directly to Navbar, keep only if needed */}
        <Route path="/navbar" element={<Navbar />} />
        <Route path="/delete-account" element={<AccountDeletion />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
