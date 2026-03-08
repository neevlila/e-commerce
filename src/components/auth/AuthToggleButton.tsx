import { useNavigate, useLocation } from 'react-router-dom'
import { FlipButton } from '../ui/FlipButton'

interface AuthToggleButtonProps {
  className?: string
}

export function AuthToggleButton({ className }: AuthToggleButtonProps) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Determine which page we're on
  const isLoginPage = location.pathname === '/login'
  const isSignUpPage = location.pathname === '/signup'
  
  const handleToggle = () => {
    if (isLoginPage) {
      navigate('/signup', { state: { from: location.state?.from } })
    } else if (isSignUpPage) {
      navigate('/login', { state: { from: location.state?.from } })
    } else {
      // Default to login if not on either page
      navigate('/login', { state: { from: location } })
    }
  }
  
  // If not on login or signup page, show the default login button
  if (!isLoginPage && !isSignUpPage) {
    return (
      <FlipButton 
        text1="Sign Up"
        text2="Login" 
        className={className}
        onClick={() => navigate('/login', { state: { from: location } })}
      />
    )
  }
  
  // Show SignUp when on login page, Login when on signup page
  return (
    <FlipButton 
      text1={isLoginPage ? "Sign Up" : "Login"}
      text2={isLoginPage ? "Sign Up" : "Login"}
      className={className}
      onClick={handleToggle}
    />
  )
}