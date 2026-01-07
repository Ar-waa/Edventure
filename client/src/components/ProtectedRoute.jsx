import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [authStatus, setAuthStatus] = useState({ authenticated: false, loading: true });

  useEffect(() => {
    fetch('http://localhost:3030/api/check-auth', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setAuthStatus({ authenticated: data.authenticated, loading: false });
        if (data.authenticated) {
          localStorage.setItem("userId", data.userId);
        }
      })
      .catch(() => {
        setAuthStatus({ authenticated: false, loading: false });
      });
  }, []);

  if (authStatus.loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>;
  }

  if (!authStatus.authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}