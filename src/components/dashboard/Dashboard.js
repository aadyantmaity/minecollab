import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Plus, Globe, ArrowRight, Loader } from 'lucide-react';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const [worlds, setWorlds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWorldName, setNewWorldName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        // Query worlds where the user is the owner OR where they are a member (TODO: Members)
        // For now, just owner.
        const q = query(
            collection(db, 'worlds'),
            where('ownerId', '==', currentUser.uid)
            // orderBy('createdAt', 'desc') // Requires index, simpler to sort client side for now or add index later
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const worldsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Client side sort since index might not be ready
            worldsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

            setWorlds(worldsData);
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser]);

    async function handleCreateWorld(e) {
        e.preventDefault();
        if (!newWorldName.trim()) return;

        setCreating(true);
        try {
            await addDoc(collection(db, 'worlds'), {
                name: newWorldName,
                ownerId: currentUser.uid,
                ownerEmail: currentUser.email,
                createdAt: serverTimestamp(),
            });
            setNewWorldName('');
            setShowCreateModal(false);
        } catch (error) {
            console.error("Error creating world:", error);
        }
        setCreating(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="animate-spin text-green-500" size={32} />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Worlds</h1>
                    <p className="text-gray-400">Manage and collaborate on your Minecraft servers.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Create World
                </button>
            </div>

            {worlds.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-2xl border-dashed border-2 border-white/20">
                    <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No worlds found</h3>
                    <p className="text-gray-400 mb-6">Get started by creating your first collaboration space.</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-secondary"
                    >
                        Create New World
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {worlds.map((world) => (
                        <Link
                            key={world.id}
                            to={`/worlds/${world.id}`}
                            className="glass-panel p-6 rounded-xl hover:scale-[1.02] transition-transform group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-green-500/10 p-3 rounded-lg">
                                    <Globe className="text-green-500" size={24} />
                                </div>
                                {/* <span className="text-xs font-mono text-gray-500 bg-black/30 px-2 py-1 rounded">v1.20.4</span> */}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                                {world.name}
                            </h3>
                            <p className="text-sm text-gray-400 mb-6">
                                Created {world.createdAt?.toDate().toLocaleDateString()}
                            </p>

                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <div className="flex -space-x-2">
                                    {/* Avatar Placeholder */}
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs border-2 border-[#18181b] z-10" title={world.ownerEmail}>
                                        {world.ownerEmail?.[0].toUpperCase()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-medium text-green-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                                    Open <ArrowRight size={16} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-panel w-full max-w-md p-6 rounded-2xl relative">
                        <h2 className="text-2xl font-bold mb-4">Create New World</h2>
                        <form onSubmit={handleCreateWorld}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-400 mb-2">World Name</label>
                                <input
                                    type="text"
                                    value={newWorldName}
                                    onChange={(e) => setNewWorldName(e.target.value)}
                                    placeholder="e.g. Survival Season 4"
                                    autoFocus
                                    className="w-full"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !newWorldName.trim()}
                                    className="btn-primary"
                                >
                                    {creating ? 'Creating...' : 'Create World'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
