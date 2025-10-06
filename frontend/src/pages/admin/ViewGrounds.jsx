import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import AdminSidebar from '../../components/admin/AdminSidebar'

const AdminGrounds = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const { data } = await api.get('/grounds');
        setGrounds(data);
      } catch (error) {
        console.error('Error fetching grounds:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrounds();
  }, []);

  const handleStatusToggle = async (groundId) => {
    try {
      const { data } = await api.patch(`/grounds/${groundId}/status`);
      setGrounds(grounds.map(ground => 
        ground._id === groundId ? { ...ground, isActive: data.isActive } : ground
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (groundId) => {
    if (window.confirm('Are you sure you want to delete this ground?')) {
      try {
        await api.delete(`/grounds/${groundId}`);
        setGrounds(grounds.filter(ground => ground._id !== groundId));
      } catch (error) {
        console.error('Error deleting ground:', error);
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
        <AdminSidebar />
    <div className="ml-64 p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Grounds</h2>
          <p className="text-gray-600">Total {grounds.length} grounds listed</p>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {grounds.map(ground => (
              <tr key={ground._id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={ground.cover} 
                      alt={ground.name} 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium">{ground.name}</p>
                      <p className="text-sm text-gray-500">₹{ground.price}/hour</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-600">
                    {ground.location.address}, {ground.location.city}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    ground.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {ground.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-4">
                  <button
                    onClick={() => handleStatusToggle(ground._id)}
                    className="text-gray-600 hover:text-green-600"
                  >
                    {ground.isActive ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => navigate(`/admin/grounds/edit/${ground._id}`)}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ground._id)}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {grounds.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No grounds found. Click "Add New Ground" to create one.
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default AdminGrounds;