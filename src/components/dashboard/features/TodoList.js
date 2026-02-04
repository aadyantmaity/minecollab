import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

export default function TodoList({ worldId }) {
    const [todos, setTodos] = useState([]);
    const [newItem, setNewItem] = useState('');

    useEffect(() => {
        const q = query(
            collection(db, 'worlds', worldId, 'todo'),
            orderBy('completed', 'asc'), // Incomplete first
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return unsubscribe;
    }, [worldId]);

    async function handleAdd(e) {
        e.preventDefault();
        if (!newItem.trim()) return;

        await addDoc(collection(db, 'worlds', worldId, 'todo'), {
            text: newItem,
            completed: false,
            createdAt: serverTimestamp()
        });
        setNewItem('');
    }

    async function toggleComplete(todo) {
        await updateDoc(doc(db, 'worlds', worldId, 'todo', todo.id), {
            completed: !todo.completed
        });
    }

    async function handleDelete(id) {
        await deleteDoc(doc(db, 'worlds', worldId, 'todo', id));
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="glass-panel rounded-xl p-6 mb-6">
                <form onSubmit={handleAdd} className="flex gap-4">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-grow"
                    />
                    <button type="submit" className="btn-primary flex items-center gap-2">
                        <Plus size={20} /> Add
                    </button>
                </form>
            </div>

            <div className="space-y-3">
                {todos.map(todo => (
                    <div
                        key={todo.id}
                        className={`glass-panel p-4 rounded-lg flex items-center justify-between group transition-all ${todo.completed ? 'opacity-50' : 'opacity-100'}`}
                    >
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => toggleComplete(todo)}
                                className={`transition-colors ${todo.completed ? 'text-green-500' : 'text-gray-500 hover:text-green-400'}`}
                            >
                                {todo.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                            </button>
                            <span className={`text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                                {todo.text}
                            </span>
                        </div>
                        <button
                            onClick={() => handleDelete(todo.id)}
                            className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}

                {todos.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>No tasks yet. Plan your next build!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
