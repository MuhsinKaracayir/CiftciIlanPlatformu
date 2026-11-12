import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Sprout, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setError('Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(formData);
      toast.success('Giriş başarılı. Hoş geldiniz!');
      navigate(from, { replace: true });
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || 'Giriş yapılamadı.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo / Üst Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-rose-100 text-cherry-900 rounded-2xl mb-3 shadow-inner">
            <Sprout className="h-8 w-8 text-cherry-800" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900">Hesabınıza Giriş Yapın</h1>
          <p className="text-stone-500 text-xs mt-1">
            Tarım Pazar Yeri ilanlarınızı yönetmek için giriş yapın
          </p>
        </div>

        {/* Form Kartı */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-8">
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-2.5 text-xs">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                E-Posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@ciftci.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cherry-800 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cherry-800 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-cherry-800 hover:bg-cherry-900 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition transform active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Giriş Yap</span>
                </>
              )}
            </button>
          </form>

          {/* Alt Bilgi */}
          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Henüz bir hesabınız yok mu?{' '}
              <Link to="/register" className="font-bold text-cherry-800 hover:underline">
                Hemen Üye Olun
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
