import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';

const PrivateRoute = ({ element, ...rest }) => {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
