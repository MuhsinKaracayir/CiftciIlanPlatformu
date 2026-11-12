import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, PlusCircle, User, LogOut, Menu, X, ListOrdered } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Oturum kapatıldı.');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-cherry-950 via-cherry-900 to-cherry-800 text-white shadow-lg border-b border-cherry-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition">
              <Sprout className="h-6 w-6 text-cherry-200" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight block leading-tight">Çiftçi Pazarı</span>
              <span className="text-[10px] text-cherry-200 tracking-wider uppercase block font-medium">Tarım Pazar Yeri</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-3">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                isActive('/') ? 'bg-white/20 text-white shadow-inner' : 'text-cherry-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              Tüm İlanlar
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/listings/new"
                  className="flex items-center space-x-1.5 bg-white text-cherry-900 hover:bg-cherry-50 px-3.5 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Yeni İlan Ver</span>
                </Link>

                <Link
                  to="/my-listings"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive('/my-listings') ? 'bg-white/20 text-white shadow-inner' : 'text-cherry-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <ListOrdered className="h-4 w-4" />
                  <span>İlanlarım</span>
                </Link>

                {/* Belirginleştirilmiş Profil Butonu */}
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-sm font-bold transition border ${
                    isActive('/profile')
                      ? 'bg-white text-cherry-950 border-white shadow-md'
                      : 'bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-sm'
                  }`}
                  title="Profil Sayfama Git"
                >
                  <div className={`p-1 rounded-lg ${isActive('/profile') ? 'bg-cherry-100 text-cherry-900' : 'bg-white/20 text-rose-100'}`}>
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="tracking-wide">
                    {user?.fullName?.split(' ')[0] || 'Profilim'}
                  </span>
                </Link>

                {/* Çıkış Butonu */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-200 hover:text-white hover:bg-white/10 transition"
                  title="Çıkış Yap"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Çıkış</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2 pl-2">
                <Link
                  to="/login"
                  className="text-white hover:bg-white/10 px-3 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-cherry-900 hover:bg-cherry-50 px-4 py-2 rounded-lg text-sm font-bold shadow transition"
                >
                  Üye Ol
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-cherry-100 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Menüyü Aç"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cherry-800 bg-cherry-950 px-4 pt-3 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-cherry-100 hover:bg-white/10 hover:text-white"
          >
            Tüm İlanlar
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/listings/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-bold bg-white text-cherry-900"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Yeni İlan Ver</span>
              </Link>
              <Link
                to="/my-listings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-cherry-100 hover:bg-white/10 hover:text-white"
              >
                <ListOrdered className="h-5 w-5" />
                <span>İlanlarım</span>
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-bold bg-white/20 text-white border border-white/20"
              >
                <User className="h-5 w-5 text-rose-200" />
                <span>Profilim ({user?.fullName})</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-white/10"
              >
                <LogOut className="h-5 w-5" />
                <span>Çıkış Yap</span>
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-cherry-800 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-3 py-2 rounded-md text-base font-medium text-cherry-100 hover:bg-white/10"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-3 py-2 rounded-md text-base font-bold bg-white text-cherry-900"
              >
                Üye Ol
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
