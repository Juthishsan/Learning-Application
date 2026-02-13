import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // Import Footer
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Courses from './pages/Courses';
import CourseOverview from './pages/CourseOverview';
import CourseContent from './pages/CourseContent';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminSettings from './pages/Admin/AdminSettings';
import AdminInstructors from './pages/Admin/AdminInstructors';
import AdminProfile from './pages/Admin/AdminProfile';
import InstructorDashboard from './pages/Instructor/InstructorDashboard';
import InstructorCourses from './pages/Instructor/InstructorCourses';
import InstructorStudents from './pages/Instructor/InstructorStudents';
import AdminEarnings from './pages/Admin/AdminEarnings';
import InstructorProfile from './pages/Instructor/InstructorProfile';
import InstructorSettings from './pages/Instructor/InstructorSettings';

const NavbarWrapper = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/instructor');
  if (isAdminRoute) return null;
  return <Navbar />;
};

const FooterWrapper = () => { // Create Footer Wrapper
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/instructor');
  const isCourseContent = location.pathname.startsWith('/course-content');
  if (isAdminRoute || isCourseContent) return null;
  return <Footer />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        },
        success: {
          style: {
            background: '#10b981',
          },
        },
        error: {
          style: {
            background: '#ef4444',
          },
        },
      }}/>
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavbarWrapper />
        <main style={{ flex: 1, paddingTop: '0' }}> {/* Removed padding for admin overlap control in their layout */}
          <Routes>
            <Route path="/" element={<div style={{paddingTop: '80px'}}><Home /></div>} />
            <Route path="/login" element={<div style={{paddingTop: '80px'}}><Login /></div>} />
            <Route path="/signup" element={<div style={{paddingTop: '80px'}}><Signup /></div>} />
            <Route path="/dashboard" element={<div style={{paddingTop: '80px'}}><Dashboard /></div>} />
            <Route path="/profile" element={<div style={{paddingTop: '0px'}}><UserProfile /></div>} />
            <Route path="/courses" element={<div style={{paddingTop: '80px'}}><Courses /></div>} />
            <Route path="/course/:id" element={<div style={{paddingTop: '80px'}}><CourseOverview /></div>} />
            <Route path="/course-content/:id" element={<div style={{paddingTop: '0px'}}><CourseContent /></div>} />
            <Route path="/about" element={<div style={{paddingTop: '80px'}}><About /></div>} />
            <Route path="/contact" element={<div style={{paddingTop: '80px'}}><Contact /></div>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/instructors" element={<AdminInstructors />} />
            <Route path="/admin/earnings" element={<AdminEarnings />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* Instructor Routes */}
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/courses" element={<InstructorCourses />} />
            <Route path="/instructor/students" element={<InstructorStudents />} />
            <Route path="/instructor/profile" element={<InstructorProfile />} />
            <Route path="/instructor/settings" element={<InstructorSettings />} />
          </Routes>
        </main>
        <FooterWrapper />
      </div>
    </Router>
  );
}

export default App;
