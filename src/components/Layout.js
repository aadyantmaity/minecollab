import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Pickaxe, LogOut, Map, Menu, X, User, Settings } from 'lucide-react';

export default function Layout({ children }) {
    const { currentUser, logout } = useAuth();
    const [, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    async function handleLogout() {
        setError('');
        try {
            await logout();
            navigate('/login');
        } catch {
            setError('Failed to log out');
        }
    }

    const navItems = [
        { label: 'Worlds', icon: Map, path: '/' },
        { label: 'Settings', icon: Settings, path: '/settings' },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <nav className="glass-panel sticky top-0 z-50 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <Pickaxe className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">MineCollab</span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.label}
                                            to={item.path}
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isActive
                                                ? 'bg-white/10 text-white shadow-lg shadow-green-500/20'
                                                : 'text-gray-300 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <item.icon size={16} />
                                            {item.label}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>

                        {/* User & Logout */}
                        <div className="hidden md:flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                <User size={14} className="text-gray-400" />
                                <span className="text-xs text-gray-300">
                                    {currentUser?.displayName || currentUser?.email}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                title="Log Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="-mr-2 flex md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden glass-panel border-t border-white/10">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                                >
                                    <div className="flex items-center gap-2">
                                        <item.icon size={18} />
                                        {item.label}
                                    </div>
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="w-full text-left text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                            >
                                <div className="flex items-center gap-2">
                                    <LogOut size={18} />
                                    Log Out
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {children}
            </main>
        </div>
    );
}
