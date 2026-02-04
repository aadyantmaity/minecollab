import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Pickaxe, User } from 'lucide-react';

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const usernameRef = useRef();
    const { signup, verifyEmail, updateUserProfile } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            const userCredential = await signup(emailRef.current.value, passwordRef.current.value);
            const user = userCredential.user;

            // Update Auth Profile
            await updateUserProfile(user, {
                displayName: usernameRef.current.value
            });

            // Create user document
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                username: usernameRef.current.value,
                createdAt: new Date().toISOString()
            });

            await verifyEmail(user);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Failed to create an account: ' + err.message);
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md p-8 rounded-2xl animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 border border-primary/20">
                        <Pickaxe className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Join MineCollab</h2>
                    <p className="text-muted" style={{ color: 'var(--color-text-muted)' }}>Start your adventure today</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg mb-4 flex items-center gap-2">
                        <AlertCircle size={18} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-gray-500" size={18} />
                        <input
                            type="text"
                            ref={usernameRef}
                            required
                            placeholder="Username"
                            className="pl-10"
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                        <input
                            type="email"
                            ref={emailRef}
                            required
                            placeholder="Email Address"
                            className="pl-10"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
                        <input
                            type="password"
                            ref={passwordRef}
                            required
                            placeholder="Password"
                            className="pl-10"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
                        <input
                            type="password"
                            ref={passwordConfirmRef}
                            required
                            placeholder="Confirm Password"
                            className="pl-10"
                        />
                    </div>

                    <button disabled={loading} className="btn-primary w-full mt-2" type="submit">
                        Sign Up
                    </button>
                </form>

                <div className="w-full text-center mt-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Already have an account? <Link to="/login" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Log In</Link>
                </div>
            </div>
        </div>
    );
}
