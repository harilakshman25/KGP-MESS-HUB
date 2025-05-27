import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Layout from './components/Layout/Layout'
import AdminLayout from './components/Layout/AdminLayout'
import DashboardLayout from './components/Layout/DashboardLayout'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import NotFound from './pages/NotFound'

// Auth Components
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'

// Admin Components
import AdminDashboard from './components/Admin/AdminDashboard'
import RegistrationRequests from './components/Admin/RegistrationRequests'
import AdminStats from './components/Admin/AdminStats'

// Manager Dashboard Components
import ManagerDashboard from './components/Dashboard/ManagerDashboard'
import CSVUpload from './components/Dashboard/CSVUpload'
import StudentList from './components/Dashboard/StudentList'
import HallInfo from './components/Dashboard/HallInfo'

// Student Components
import StudentAccess from './components/Student/StudentAccess'
import StudentProfile from './components/Student/StudentProfile'
import Cart from './components/Student/Cart'
import OrderHistory from './components/Student/OrderHistory'
import ComplaintForm from './components/Student/ComplaintForm'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-secondary-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="registration-requests" element={<RegistrationRequests />} />
                <Route path="stats" element={<AdminStats />} />
              </Route>

              {/* Manager Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard/overview" replace />} />
                <Route path="overview" element={<ManagerDashboard />} />
                <Route path="csv-upload" element={<CSVUpload />} />
                <Route path="students" element={<StudentList />} />
                <Route path="hall-info" element={<HallInfo />} />
                <Route path="student-access" element={<StudentAccess />} />
                <Route path="student-profile/:studentId" element={<StudentProfile />} />
                <Route path="cart" element={<Cart />} />
                <Route path="order-history/:studentId" element={<OrderHistory />} />
                <Route path="complaint-form" element={<ComplaintForm />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
