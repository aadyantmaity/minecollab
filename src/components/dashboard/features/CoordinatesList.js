import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { Plus, Trash2, MapPin, Copy, Layers, Command } from 'lucide-react';

export default function CoordinatesList({ worldId }) {
    const [coords, setCoords] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', x: '', y: '', z: '', dimension: 'Overworld' });
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const q = query(
            collection(db, 'worlds', worldId, 'coordinates'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setCoords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return unsubscribe;
    }, [worldId]);

    async function handleAdd(e) {
        e.preventDefault();
        if (!formData.name || !formData.x || !formData.z) return;

        await addDoc(collection(db, 'worlds', worldId, 'coordinates'), {
            ...formData,
            createdAt: serverTimestamp()
        });
        setFormData({ name: '', x: '', y: '', z: '', dimension: 'Overworld' });
        setShowModal(false);
    }

    async function handleDelete(id) {
        if (window.confirm('Delete these coordinates?')) {
            await deleteDoc(doc(db, 'worlds', worldId, 'coordinates', id));
        }
    }

    function copyToClipboard(text, id) {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    const dimensionColors = {
        'Overworld': 'text-green-500 bg-green-500/10',
        'Nether': 'text-red-500 bg-red-500/10',
        'End': 'text-purple-500 bg-purple-500/10'
    };

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} /> Add Coordinates
                </button>
            </div>

            <div className="space-y-4">
                {coords.map(coord => (
                    <div key={coord.id} className="glass-panel p-4 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${dimensionColors[coord.dimension] || 'text-gray-500 bg-gray-500/10'}`}>
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{coord.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-400 font-mono mt-1">
                                    <span className={`px-2 py-0.5 rounded text-xs ${dimensionColors[coord.dimension] || 'bg-gray-800'}`}>
                                        {coord.dimension}
                                    </span>
                                    <span>
                                        X: {coord.x} / Y: {coord.y || '~'} / Z: {coord.z}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => copyToClipboard(`/tp ${coord.x} ${coord.y || '~'} ${coord.z}`, coord.id)}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors relative"
                                title="Copy TP Command"
                            >
                                {copiedId === coord.id ? <span className="text-green-500 text-xs font-bold">Copied!</span> : <Command size={18} />}
                            </button>
                            <button
                                onClick={() => handleDelete(coord.id)}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {coords.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>No locations saved. Don't lose your base!</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-panel w-full max-w-md p-6 rounded-2xl relative">
                        <h2 className="text-2xl font-bold mb-6">Add Location</h2>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Main Base"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">X</label>
                                    <input
                                        type="number"
                                        value={formData.x}
                                        onChange={(e) => setFormData({ ...formData, x: e.target.value })}
                                        required
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Y (Opt)</label>
                                    <input
                                        type="number"
                                        value={formData.y}
                                        onChange={(e) => setFormData({ ...formData, y: e.target.value })}
                                        placeholder="64"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Z</label>
                                    <input
                                        type="number"
                                        value={formData.z}
                                        onChange={(e) => setFormData({ ...formData, z: e.target.value })}
                                        required
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Dimension</label>
                                <select
                                    value={formData.dimension}
                                    onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
                                >
                                    <option value="Overworld">Overworld</option>
                                    <option value="Nether">The Nether</option>
                                    <option value="End">The End</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
