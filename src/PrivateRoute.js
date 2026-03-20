// PrivateRoute.js - Rota privada para proteger o Dashboard
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, authLoading } = useContext(AuthContext);

  if (authLoading) {
    return (
      <div className="page-shell">
        <div className="container-app">
          <div className="state-card">
            <div className="loading-dot" />
            <p>Carregando sessão...</p>
          </div>
        </div>
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
