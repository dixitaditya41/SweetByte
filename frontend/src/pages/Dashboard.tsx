import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

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
      const response = await axios.get('/api/sweets');
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

      const response = await axios.get('/api/sweets/search', { params });
      setSweets(response.data.sweets);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (id: string) => {
    try {
      const response = await axios.post(`/api/sweets/${id}/purchase`);
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
      await axios.post('/api/sweets', {
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
      await axios.put(`/api/sweets/${editingSweet._id}`, {
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
      await axios.delete(`/api/sweets/${id}`);
      fetchSweets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete sweet');
    }
  };

  const handleRestock = async (id: string) => {
    const quantity = prompt('Enter quantity to add:');
    if (!quantity || isNaN(parseInt(quantity))) return;
    try {
      const response = await axios.post(`/api/sweets/${id}/restock`, {
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
      <div className="min-h-screen p-8 max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto bg-gray-50">
      <header className="flex justify-between items-center mb-8 pb-4 border-b-2 border-indigo-600">
        <h1 className="text-indigo-600 text-3xl font-bold">Sweet Shop Management</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">Welcome, {user?.username} ({user?.role})</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4 text-center">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="mb-4 text-xl text-gray-800 font-semibold">Search Sweets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Category"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearchName('');
              setSearchCategory('');
              setMinPrice('');
              setMaxPrice('');
              fetchSweets();
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md font-semibold hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {isAdmin() && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingSweet(null);
              setFormData({ name: '', category: '', price: '', quantity: '' });
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors text-lg"
          >
            {showAddForm ? 'Cancel' : 'Add New Sweet'}
          </button>
          {showAddForm && (
            <form onSubmit={handleAdd} className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="col-span-full text-lg font-semibold text-gray-800 mb-2">Add New Sweet</h3>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="submit"
                className="col-span-full px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors"
              >
                Add Sweet
              </button>
            </form>
          )}
        </div>
      )}

      {editingSweet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
            <form onSubmit={handleUpdate} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Sweet</h3>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md font-semibold hover:bg-gray-700 transition-colors"
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
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow hover:-translate-y-1"
          >
            <h3 className="text-gray-800 text-xl font-semibold mb-2">{sweet.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{sweet.category}</p>
            <p className="text-indigo-600 text-2xl font-bold mb-2">${sweet.price.toFixed(2)}</p>
            <p className="text-gray-700 mb-4">Stock: {sweet.quantity}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handlePurchase(sweet._id)}
                disabled={sweet.quantity === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
              </button>
              {isAdmin() && (
                <>
                  <button
                    onClick={() => startEdit(sweet)}
                    className="px-4 py-2 bg-yellow-500 text-gray-800 rounded-md font-semibold hover:bg-yellow-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRestock(sweet._id)}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-md font-semibold hover:bg-cyan-700 transition-colors"
                  >
                    Restock
                  </button>
                  <button
                    onClick={() => handleDelete(sweet._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {sweets.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-600 text-xl">No sweets found</div>
      )}
    </div>
  );
};

export default Dashboard;

