import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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

        const username = usernameRef.current.value.trim();
        const usernameLower = username.toLowerCase();

        // Basic validation
        if (username.length < 3) return setError('Username must be at least 3 characters.');
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return setError('Username can only contain letters, numbers, and underscores.');

        try {
            setError('');
            setLoading(true);

            // 1. Check if username is already taken (optimization to avoid creating auth user unnecessarily)
            const usernameDocRef = doc(db, 'usernames', usernameLower);
            const usernameDoc = await getDoc(usernameDocRef);
            if (usernameDoc.exists()) {
                throw new Error('Username is already taken.');
            }

            // 2. Create Auth User
            const userCredential = await signup(emailRef.current.value, passwordRef.current.value);
            const user = userCredential.user;

            try {
                // 3. Reserve Username
                await setDoc(usernameDocRef, { uid: user.uid });

                // 4. Update Auth Profile
                await updateUserProfile(user, {
                    displayName: username
                });

                // 5. Create user document
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    username: username,
                    usernameLower: usernameLower,
                    createdAt: new Date().toISOString()
                });

                await verifyEmail(user);
                navigate('/');
            } catch (innerError) {
                // Cleanup: If database writes fail, delete the auth user so they can try again
                console.error("Signup flow failed after auth creation:", innerError);
                await user.delete();
                throw innerError;
            }

        } catch (err) {
            console.error(err);
            setError(err.message);
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
