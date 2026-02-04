import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, RefreshCw, LogOut, CheckCircle } from 'lucide-react';

export default function VerifyEmail() {
    const { currentUser, verifyEmail, logout } = useAuth();
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleResendEmail() {
        setMessage('');
        setError('');
        setLoading(true);
        try {
            await verifyEmail(currentUser);
            setMessage('Verification email sent! Check your inbox.');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/too-many-requests') {
                setError('Too many requests. Please wait a moment before trying again.');
            } else {
                setError('Failed to send verification email: ' + err.message);
            }
        }
        setLoading(false);
    }

    async function handleCheckVerification() {
        setMessage('');
        setError('');
        setLoading(true);
        try {
            // Reload user to get updated emailVerified status
            await currentUser.reload();
            if (currentUser.emailVerified) {
                navigate('/');
            } else {
                setError('Email not verified yet. Please check your inbox and click the link.');
            }
        } catch (err) {
            setError('Failed to check status.');
        }
        setLoading(false);
    }

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch {
            setError('Failed to log out');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-dark">
            <div className="glass-panel w-full max-w-md p-8 rounded-2xl text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 mb-6 border border-yellow-500/20">
                    <Mail className="w-10 h-10 text-yellow-500" />
                </div>

                <h2 className="text-3xl font-bold mb-2 text-white">Verify your Email</h2>
                <p className="text-gray-400 mb-8">
                    We sent a verification link to <span className="text-white font-medium">{currentUser?.email}</span>.
                    Please verify your email to access MineCollab.
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-200 p-3 rounded-lg mb-6 flex items-center justify-center gap-2 text-sm">
                        <CheckCircle size={16} />
                        {message}
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={handleCheckVerification}
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        I've Verified My Email
                    </button>

                    <button
                        onClick={handleResendEmail}
                        disabled={loading}
                        className="btn-secondary w-full"
                    >
                        Resend Verification Email
                    </button>

                    <button
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-white text-sm mt-4 flex items-center justify-center gap-1 mx-auto transition-colors"
                    >
                        <LogOut size={14} />
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
