import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, updateDoc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { User, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function Settings() {
    const { currentUser, updateUserProfile } = useAuth();
    const usernameRef = useRef();
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleUpdateProfile(e) {
        e.preventDefault();

        const newUsername = usernameRef.current.value.trim();
        const currentUsername = currentUser.displayName;

        if (newUsername === currentUsername) {
            return setError('New username is the same as current one.');
        }

        const newUsernameLower = newUsername.toLowerCase();

        // Validation
        if (newUsername.length < 3) return setError('Username must be at least 3 characters.');
        if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) return setError('Username can only contain letters, numbers, and underscores.');

        setLoading(true);
        setError('');
        setMessage('');

        try {
            // 1. Check if new username is available
            const newUsernameRef = doc(db, 'usernames', newUsernameLower);
            const newUsernameDoc = await getDoc(newUsernameRef);

            if (newUsernameDoc.exists()) {
                throw new Error('Username is already taken.');
            }

            // 2. Reserve new username (we can do this because we are auth'd)
            await setDoc(newUsernameRef, { uid: currentUser.uid });

            // 3. Update Auth Profile
            await updateUserProfile(currentUser, {
                displayName: newUsername
            });

            // 4. Update User Document
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                username: newUsername,
                usernameLower: newUsernameLower
            });

            // 5. Release old username (if it existed)
            if (currentUsername) {
                const oldUsernameLower = currentUsername.toLowerCase();
                // Only delete if it's different (which it should be)
                if (oldUsernameLower !== newUsernameLower) {
                    try {
                        await deleteDoc(doc(db, 'usernames', oldUsernameLower));
                    } catch (releaseErr) {
                        console.error("Failed to release old username", releaseErr);
                        // Non-critical error, proceed
                    }
                }
            }

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
