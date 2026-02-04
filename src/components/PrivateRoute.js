import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, requireVerification = true }) {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (requireVerification && !currentUser.emailVerified) {
        return <Navigate to="/verify-email" />;
    }

    return children;
}
