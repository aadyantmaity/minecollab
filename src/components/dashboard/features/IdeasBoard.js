import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { Plus, Trash2, ExternalLink, Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react';

export default function IdeasBoard({ worldId }) {
    const [ideas, setIdeas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', url: '', description: '' });

    useEffect(() => {
        const q = query(
            collection(db, 'worlds', worldId, 'ideas'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setIdeas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return unsubscribe;
    }, [worldId]);

    async function handleAdd(e) {
        e.preventDefault();
        if (!formData.title || !formData.url) return;

        // Basic URL validation/fix
        let url = formData.url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        await addDoc(collection(db, 'worlds', worldId, 'ideas'), {
            ...formData,
            url,
            createdAt: serverTimestamp()
        });
        setFormData({ title: '', url: '', description: '' });
        setShowModal(false);
    }

    async function handleDelete(id) {
        if (window.confirm('Delete this idea?')) {
            await deleteDoc(doc(db, 'worlds', worldId, 'ideas', id));
        }
    }

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} /> Add Idea
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map(idea => (
                    <div key={idea.id} className="glass-panel p-5 rounded-xl group relative flex flex-col h-full">
                        <button
                            onClick={() => handleDelete(idea.id)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="flex items-start gap-4 mb-4">
                            <div className="bg-purple-500/10 p-3 rounded-lg flex-shrink-0">
                                <ImageIcon className="text-purple-500" size={24} />
                            </div>
                            <div className="flex-grow min-w-0">
                                <h3 className="text-lg font-bold text-white truncate" title={idea.title}>{idea.title}</h3>
                                <a
                                    href={idea.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 truncate"
                                >
                                    <LinkIcon size={12} />
                                    {new URL(idea.url).hostname}
                                </a>
                            </div>
                        </div>

                        {idea.description && (
                            <p className="text-gray-400 text-sm mb-4 flex-grow break-words">{idea.description}</p>
                        )}

                        <a
                            href={idea.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto btn-secondary text-center text-sm py-2 flex items-center justify-center gap-2"
                        >
                            Visit Link <ExternalLink size={14} />
                        </a>
                    </div>
                ))}

                {ideas.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        <p>No build ideas saved yet.</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-panel w-full max-w-md p-6 rounded-2xl relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Add Idea</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g. Iron Farm Design"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Link URL</label>
                                <input
                                    type="text"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    required
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Start build near the swamp..."
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    className="btn-primary w-full"
                                >
                                    Save Idea
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
