import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/axios';

interface Sweet {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: ''
  });

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/sweets');
      setSweets(response.data.sweets);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sweets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchName) params.name = searchName;
      if (searchCategory) params.category = searchCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const response = await apiClient.get('/api/sweets/search', { params });
      setSweets(response.data.sweets);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (id: string) => {
    try {
      const response = await apiClient.post(`/api/sweets/${id}/purchase`);
      setSweets(sweets.map(sweet =>
        sweet._id === id ? response.data.sweet : sweet
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Purchase failed');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/sweets', {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      });
      setShowAddForm(false);
      setFormData({ name: '', category: '', price: '', quantity: '' });
      fetchSweets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add sweet');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSweet) return;
    try {
      await apiClient.put(`/api/sweets/${editingSweet._id}`, {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      });
      setEditingSweet(null);
      setFormData({ name: '', category: '', price: '', quantity: '' });
      fetchSweets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update sweet');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) return;
    try {
      await apiClient.delete(`/api/sweets/${id}`);
      fetchSweets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete sweet');
    }
  };

  const handleRestock = async (id: string) => {
    const quantity = prompt('Enter quantity to add:');
    if (!quantity || isNaN(parseInt(quantity))) return;
    try {
      const response = await apiClient.post(`/api/sweets/${id}/restock`, {
        quantity: parseInt(quantity)
      });
      setSweets(sweets.map(sweet =>
        sweet._id === id ? response.data.sweet : sweet
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Restock failed');
    }
  };

  const startEdit = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      quantity: sweet.quantity.toString()
    });
  };

  const cancelEdit = () => {
    setEditingSweet(null);
    setFormData({ name: '', category: '', price: '', quantity: '' });
  };

  if (loading && sweets.length === 0) {
    return (
      <div className="min-h-screen p-8 max-w-7xl mx-auto flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
        <div className="text-2xl text-purple-600 font-semibold">🍬 Loading sweets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      <header className="flex justify-between items-center mb-8 pb-4 border-b-4 border-pink-300 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">
            🍭 SweetByte Shop
          </h1>
          <p className="text-gray-600 text-sm mt-1">Manage your sweet inventory</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-gray-700 font-medium block">Welcome, {user?.username}</span>
            <span className="text-sm text-purple-600 font-semibold">{user?.role === 'admin' ? '👑 Admin' : '👤 User'}</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-8 border-2 border-pink-200">
        <h2 className="mb-4 text-2xl text-purple-600 font-bold flex items-center gap-2">
          🔍 Search Sweets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all bg-white"
          />
          <input
            type="text"
            placeholder="Category"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all bg-white"
          />
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all bg-white"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all bg-white"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
          >
            🔍 Search
          </button>
          <button
            onClick={() => {
              setSearchName('');
              setSearchCategory('');
              setMinPrice('');
              setMaxPrice('');
              fetchSweets();
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all shadow-md hover:shadow-lg"
          >
            Clear
          </button>
        </div>
      </div>

      {isAdmin() && (
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg mb-8 border-2 border-purple-200">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingSweet(null);
              setFormData({ name: '', category: '', price: '', quantity: '' });
            }}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {showAddForm ? '❌ Cancel' : '➕ Add New Sweet'}
          </button>
          {showAddForm && (
            <form onSubmit={handleAdd} className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border-2 border-pink-200">
              <h3 className="col-span-full text-xl font-bold text-purple-600 mb-2">🍬 Add New Sweet</h3>
              <input
                type="text"
                placeholder="Sweet Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all bg-white"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all bg-white"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price (Rs/Kg)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all bg-white"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all bg-white"
                required
              />
              <button
                type="submit"
                className="col-span-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
              >
                🍬 Add Sweet
              </button>
            </form>
          )}
        </div>
      )}

      {editingSweet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border-2 border-pink-300">
            <form onSubmit={handleUpdate} className="space-y-4">
              <h3 className="text-2xl font-bold text-purple-600 mb-4">✏️ Edit Sweet</h3>
              <input
                type="text"
                placeholder="Sweet Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price ($)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all"
                required
              />
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
                >
                  ✏️ Update
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sweets.map((sweet) => (
          <div
            key={sweet._id}
            className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-pink-200 hover:border-pink-400"
          >
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🍬</div>
              <h3 className="text-gray-800 text-xl font-bold mb-2">{sweet.name}</h3>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-3">
                {sweet.category}
              </span>
            </div>
            <div className="text-center mb-4">
              <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                ${sweet.price.toFixed(2)}
              </p>
              <p className={`text-sm font-semibold ${sweet.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {sweet.quantity > 0 ? `📦 ${sweet.quantity} in stock` : '❌ Out of Stock'}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handlePurchase(sweet._id)}
                disabled={sweet.quantity === 0}
                className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {sweet.quantity === 0 ? '❌ Out of Stock' : '🛒 Purchase'}
              </button>
              {isAdmin() && (
                <>
                  <button
                    onClick={() => startEdit(sweet)}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all shadow-md hover:shadow-lg"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleRestock(sweet._id)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
                  >
                    📦 Restock
                  </button>
                  <button
                    onClick={() => handleDelete(sweet._id)}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg"
                  >
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {sweets.length === 0 && !loading && (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-pink-200">
          <div className="text-6xl mb-4">🍭</div>
          <div className="text-2xl text-purple-600 font-semibold">No sweets found</div>
          <p className="text-gray-600 mt-2">Add some sweets to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

