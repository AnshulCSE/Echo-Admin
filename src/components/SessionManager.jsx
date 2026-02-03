import { useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

// Idle time in milliseconds (15 minutes * 60 seconds * 1000)
const IDLE_TIMEOUT = 10* 60 * 1000; 

const SessionManager = ({ children }) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Function to log out the user
  const logoutUser = async () => {
    try {
      await signOut(auth);
      console.log("User logged out due to inactivity.");
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Function to reset the timer
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logoutUser, IDLE_TIMEOUT);
  };

  useEffect(() => {
    // List of events that count as "activity"
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    // Attach listeners
    const handleActivity = () => resetTimer();
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Start the timer initially
    resetTimer();

    // Cleanup listeners on unmount
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  return <>{children}</>;
};

export default SessionManager;