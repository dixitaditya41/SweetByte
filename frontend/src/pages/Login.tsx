import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-pink-200 via-purple-200 to-rose-200">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-pink-200">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 bg-clip-text text-transparent mb-2">
            🍭 SweetByte
          </h1>
          <p className="text-gray-600 text-sm">Your Sweet Shop Management</p>
        </div>
        <h2 className="text-center text-purple-600 mb-6 text-2xl font-semibold">Welcome Back!</h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-gray-700 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? 'Logging in...' : '🍬 Login'}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-pink-600 font-semibold hover:text-purple-600 hover:underline transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

