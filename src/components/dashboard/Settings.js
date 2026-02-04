import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function Settings() {
    const { currentUser, updateUserProfile } = useAuth();
    const usernameRef = useRef();
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleUpdateProfile(e) {
        e.preventDefault();

        if (usernameRef.current.value === currentUser.displayName) {
            return setError('New username is the same as current one.');
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await updateUserProfile(currentUser, {
                displayName: usernameRef.current.value
            });

            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                username: usernameRef.current.value
            });

            setMessage('Profile updated successfully!');
        } catch (err) {
            console.error("Failed to update profile", err);
            setError('Failed to update profile: ' + err.message);
        }

        setLoading(false);
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Manage your account preferences.</p>
            </div>

            <div className="glass-panel p-6 rounded-xl max-w-2xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <User size={20} className="text-primary" />
                    Profile Settings
                </h3>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg mb-4 flex items-center gap-2">
                        <AlertCircle size={18} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {message && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-200 p-3 rounded-lg mb-4 flex items-center gap-2">
                        <CheckCircle size={18} />
                        <span className="text-sm">{message}</span>
                    </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-gray-500" size={18} />
                            <input
                                type="text"
                                ref={usernameRef}
                                defaultValue={currentUser.displayName}
                                placeholder="Enter display name"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Email
                        </label>
                        <div className="p-3 bg-black/20 rounded border border-white/5 text-gray-500">
                            {currentUser.email}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
