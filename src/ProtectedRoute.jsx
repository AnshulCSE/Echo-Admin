import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-indigo-500">Loading...</div>;
  
  // If no user is logged in, redirect to Login
  if (!user) return <Navigate to="/login" />;

  // If user exists, show the dashboard
  return children;
}