import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: 'admin@example.com',
    password: 'password123',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      // Error is displayed via toast
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'admin@example.com',
      password: 'password123',
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl border border-gray-100 animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-600/20">
            <span className="text-white font-black text-xl">CO</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Consultancy Outfit</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to your collaboration workspace</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="mb-6 p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Demo Credentials
            </span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Auto-Fill
            </button>
          </div>
          <div className="space-y-1 text-xs text-indigo-950 font-mono">
            <p>
              <strong className="font-sans text-gray-600">Email:</strong> admin@example.com
            </p>
            <p>
              <strong className="font-sans text-gray-600">Password:</strong> password123
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                name="email"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                name="password"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-600/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing In...
              </span>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline font-bold">
              Create New Account (Sign Up)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
