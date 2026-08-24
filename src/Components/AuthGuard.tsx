import React from 'react';
import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const authToken = localStorage.getItem('authToken');

  // If no token, redirect to the home page
  if (!authToken) {
    return <Navigate to="/" replace />;
  }

  // Render children if token exists
  return <>{children}</>;
};

export default AuthGuard;
