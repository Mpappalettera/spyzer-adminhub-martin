import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout/MainLayout'
import AuthRoute from '@/components/AuthRoute/AuthRoute'

// Pages
import Login from '@/pages/Login/Login'
import Dashboard from '@/pages/Dashboard/Dashboard'
import Clients from '@/pages/ClientProfile/ClientProfile'
import ClientsList from '@/pages/ClientsList/ClientsList'
import Emails from '@/pages/Emails/Emails'
import Reviews from '@/pages/Reviews/Reviews'
import ReviewsForm from '@/pages/ReviewsForm/ReviewsForm'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reviews-form" element={<ReviewsForm />} />
      
      {/* Protected Routes */}
      <Route element={<AuthRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/clients/:id" element={<Clients />} />
          <Route path="/emails" element={<Emails />} />
          <Route path="/reviews" element={<Reviews />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
