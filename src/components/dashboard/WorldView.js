import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, CheckSquare, Lightbulb, MapPin, Loader } from 'lucide-react';

// Sub-components (will import later)
import TodoList from './features/TodoList';
import IdeasBoard from './features/IdeasBoard';
import CoordinatesList from './features/CoordinatesList';

export default function WorldView() {
    const { worldId } = useParams();
    const [world, setWorld] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('todo'); // todo, ideas, coords

    useEffect(() => {
        async function fetchWorld() {
            const docRef = doc(db, 'worlds', worldId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setWorld({ id: docSnap.id, ...docSnap.data() });
            } else {
                // Handle not found
            }
            setLoading(false);
        }
        fetchWorld();
    }, [worldId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="animate-spin text-green-500" size={32} />
            </div>
        );
    }

    if (!world) {
        return <div className="text-center py-20">World not found</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2 mb-2 text-sm">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white">{world.name}</h1>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-white/5 rounded-lg border border-white/10 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('todo')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'todo' ? 'bg-primary/20 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        <CheckSquare size={18} /> To-Do
                    </button>
                    <button
                        onClick={() => setActiveTab('ideas')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'ideas' ? 'bg-primary/20 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Lightbulb size={18} /> Ideas
                    </button>
                    <button
                        onClick={() => setActiveTab('coords')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'coords' ? 'bg-primary/20 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        <MapPin size={18} /> Coordinates
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="animate-fade-in">
                {activeTab === 'todo' && <TodoList worldId={worldId} />}
                {activeTab === 'ideas' && <IdeasBoard worldId={worldId} />}
                {activeTab === 'coords' && <CoordinatesList worldId={worldId} />}
            </div>
        </div>
    );
}
