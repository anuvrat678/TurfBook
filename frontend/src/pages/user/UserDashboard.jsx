import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, ArrowRight, LogOut } from 'lucide-react';
import api from '../../services/api';

function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const { data } = await api.get(`/bookings/user/${user.id}`);
        setBookings(data);
        setError('');
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'bookings') {
      fetchUserBookings();
    }
  }, [activeTab, user.id]);

  const getStatusBadge = (status) => {
    const statusColors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  const formatTimeRange = (timeSlots) => {
    if (!timeSlots || timeSlots.length === 0) return 'N/A';
    const firstSlot = timeSlots[0].split(' - ')[0]; // Start time of first slot
    const lastSlot = timeSlots[timeSlots.length - 1].split(' - ')[1]; // End time of last slot
    return `${firstSlot} - ${lastSlot}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-2xl font-bold">
              <span className="text-green-500">Turf</span>
              <span className="text-gray-800">Book</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-gray-600">
                <span>Welcome,</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 space-y-2">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full text-left px-4 py-3 rounded-lg ${
                activeTab === 'bookings' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => navigate('/grounds')}
              className="w-full text-left px-4 py-3 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Book New Ground
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Booking History</h2>
                
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No bookings found. 
                    <button 
                      onClick={() => navigate('/grounds')}
                      className="text-green-500 hover:text-green-600 ml-2"
                    >
                      Book a ground now!
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map(booking => (
                      <div key={booking._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg">{booking.ground?.name || 'Deleted Ground'}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-500" />
                            {new Date(booking.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-500" />
                            {formatTimeRange(booking.timeSlots)}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-green-500" />
                            {booking.ground?.location?.city || 'Unknown location'}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="font-medium">
                            Total: ₹{booking.totalAmount?.toFixed(2) || '0.00'}
                          </div>
                          <Link 
                            to={`/receipt`}
                            state={{booking: {
                              ...booking,
                              user: {
                                name: user.name,
                                email: user.email
                              }
                            } }} // Pass booking data via state
                            className="text-green-500 hover:text-green-600 flex items-center gap-2"
                          >
                            View Receipt
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;