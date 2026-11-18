import { Navigate, Outlet } from 'react-router-dom'
import useAppStore from '../../store/useAppStore'

export default function ProtectedRoute() {
  const { user, token } = useAppStore()

  if (!user || !token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
