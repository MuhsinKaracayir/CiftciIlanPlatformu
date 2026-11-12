import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import MyListings from './pages/MyListings';
import ListingForm from './pages/ListingForm';
import Profile from './pages/Profile';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1c1917',
                color: '#fff',
                fontSize: '13px',
                borderRadius: '12px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f43f5e',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Açık Rotalar */}
              <Route path="/" element={<Home />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Korumalı (Protected) Rotalar */}
              <Route
                path="/my-listings"
                element={
                  <ProtectedRoute>
                    <MyListings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/listings/new"
                element={
                  <ProtectedRoute>
                    <ListingForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/listings/:id/edit"
                element={
                  <ProtectedRoute>
                    <ListingForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* 404 Rota Yakalama */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Vişne Temalı Sade Footer */}
          <footer className="bg-stone-900 text-stone-400 py-8 border-t border-stone-800 mt-16 text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <p className="font-semibold text-stone-300">Çiftçi İlan Platformu - Tarım Pazar Yeri</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Üreticiden doğrudan pazara tarımsal alışveriş ağı.</p>
              </div>
              <div className="text-stone-500 text-[11px]">
                Her hakkı saklıdır &copy; {new Date().getFullYear()}
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
