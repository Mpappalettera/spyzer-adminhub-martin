import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

export default function AuthRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
