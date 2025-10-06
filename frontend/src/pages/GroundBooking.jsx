import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, ArrowLeft, ChevronLeft, ChevronRight, 
  MapPin, Users,  Shield, Heart
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const GroundBooking = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ground, setGround] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    const fetchGround = async () => {
      try {
        const { data } = await api.get(`/grounds/${id}`);
        setGround({ ...data, price: parseFloat(data.price) });
      } catch (err) {
        console.error('Error fetching ground:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGround();
  }, [id]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (selectedDate) {
        try {
          const { data } = await api.get(`/bookings/slots?ground=${id}&date=${selectedDate}`);
          setBookedSlots(data);
        } catch (err) {
          console.error('Error fetching bookings:', err);
        }
      }
    };
    fetchBookings();
  }, [selectedDate, id]);

  const generateTimeSlots = () => {
    if (!ground) return [];
    const start = ground.is24x7 ? 0 : parseInt(ground.openingTime.split(':')[0]);
    const end = ground.is24x7 ? 24 : parseInt(ground.closingTime.split(':')[0]);
    return Array.from({ length: (end - start) / 2 }, (_, i) => {
      const hour = start + i * 2;
      return `${hour.toString().padStart(2, '0')}:00 - ${(hour + 2).toString().padStart(2, '0')}:00`;
    });
  };

  const handleSlotClick = (slot) => {
    setSelectedSlots(prev => {
      const slots = generateTimeSlots();
      const slotIndex = slots.indexOf(slot);
      
      if (!prev.includes(slot)) {
        if (prev.length === 0) return [slot];
        
        const prevIndices = prev.map(p => slots.indexOf(p));
        const minIndex = Math.min(...prevIndices);
        const maxIndex = Math.max(...prevIndices);

        if (slotIndex === minIndex - 1) return [slot, ...prev];
        if (slotIndex === maxIndex + 1) return [...prev, slot];
        return [slot];
      }

      const currentIndex = prev.indexOf(slot);
      const isFirst = currentIndex === 0;
      const isLast = currentIndex === prev.length - 1;
      
      if (isFirst || isLast) {
        return prev.filter((_, i) => i !== currentIndex);
      }

      return prev.slice(0, currentIndex);
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (selectedSlots.length === 0) {
      alert('Please select at least one time slot');
      return;
    }
  
    try {
      const response = await api.post('/bookings', {
        ground: id,
        date: selectedDate,
        timeSlots: selectedSlots,
        totalAmount: parseFloat(ground.price) * selectedSlots.length * 2
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
  
      navigate('/receipt', {
        state: {
          booking: {
            ...response.data,
            ground: {
              name: ground.name,
              location: ground.location,
              price: ground.price
            },
            user: {
              name: user.name,
              email: user.email
            }
          }
        }
      });
  
    } catch (err) {
      console.error('Booking error:', err.response?.data);
      alert(err.response?.data?.message || 'Booking failed. Please try again.');
    }
  };

  
 

  if (loading) return <Loader />;
  if (!ground) return <div className="text-center py-8">Ground not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-green-600 hover:text-green-700 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="text-center flex-1 mx-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {ground.name}
            </h1>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {ground.location.city}, {ground.location.state}
              </span>
            
            </div>
          </div>
          
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-full transition-all ${
              isFavorite 
                ? 'bg-red-50 text-red-500' 
                : 'bg-white text-gray-400 hover:text-red-500'
            } shadow-sm`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Enhanced Ground Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Premium Image Carousel */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-64 sm:h-80 md:h-96">
                <img 
                  src={ground.gallery[currentImage]} 
                  alt={ground.name} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {ground.gallery.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full hover:bg-white shadow-lg transition-transform hover:scale-110"
                      onClick={() => setCurrentImage(prev => (prev - 1 + ground.gallery.length) % ground.gallery.length)}
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full hover:bg-white shadow-lg transition-transform hover:scale-110"
                      onClick={() => setCurrentImage(prev => (prev + 1) % ground.gallery.length)}
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </>
                )}
                
                {/* Image Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
                  {ground.gallery.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentImage 
                          ? 'bg-white scale-125 shadow-lg' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                      onClick={() => setCurrentImage(index)}
                    />
                  ))}
                </div>
                
                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  ₹{ground.price}/hour
                </div>
              </div>

              {/*  Info Bar */}
              <div className="p-6 border-t">

                <div className="grid grid-cols-3  gap-1 sm:gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold text-green-700 text-sm">
                      {ground.is24x7 ? '24/7 Open' : `${ground.openingTime} - ${ground.closingTime}`}
                    </div>
                  </div>
                  
                
                  
                  <div className="text-center  p-3 bg-orange-50  rounded-lg">
                    <MapPin className="w-5 h-5 text-orange-600 mx-auto mb-2" />
                    <div className="font-semibold text-orange-700 text-sm">
                      {ground.location.city}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                    <div className="font-semibold text-purple-700 text-sm">
                      Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="border-b">
                <nav className="flex overflow-x-auto">
                  {['overview', 'location'].map((tab) => (
                    <button
                      key={tab}
                      className={`flex-1 min-w-max py-4 px-6 border-b-2 font-medium text-sm transition-all ${
                        activeTab === tab
                          ? 'border-green-500 text-green-600 bg-green-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Ground Overview</h2>
                    <div 
                      className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: ground.description }} 
                    />
                  </div>
                )}
                
                
                
                {activeTab === 'location' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Location Details</h2>
                    <div className="space-y-4 text-gray-700">
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <strong className="block mb-1">Full Address:</strong>
                          {ground.location.address},{ground.location.landmark}, {ground.location.city}, {ground.location.state} - {ground.location.pincode}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <strong>City:</strong> {ground.location.city}
                        </div>
                        <div>
                          <strong>State:</strong> {ground.location.state}
                        </div>
                        <div>
                          <strong>Pincode:</strong> {ground.location.pincode}
                        </div>
                        {ground.location.landmark && (
                          <div>
                            <strong>Landmark:</strong> {ground.location.landmark}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Premium Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6 border border-gray-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                  Book Your Slot
                </h2>
                <p className="text-gray-600 text-sm mt-1">Instant confirmation • Secure booking</p>
              </div>
              
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Calendar className="inline mr-2 w-4 h-4" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    min={minDate}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlots([]);
                    }}
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Clock className="inline mr-2 w-4 h-4" />
                      Available Time Slots (2-hour blocks)
                    </label>
                    <div className="grid grid-cols-2 gap-3 max-h-90 overflow-y-auto p-1">
                      {generateTimeSlots().map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = selectedSlots.includes(slot);

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() => handleSlotClick(slot)}
                            className={`p-3 text-sm rounded-xl transition-all transform hover:scale-105 ${
                              isSelected 
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                                : isBooked
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                                  : 'border-2 border-gray-200 hover:border-green-500 hover:bg-green-50'
                            }`}
                          >
                            {slot}
                            {isBooked && ' (Booked)'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedSlots.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-green-800">Total Amount</span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{(ground.price * selectedSlots.length * 2).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-green-700">
                      <div>{selectedSlots.length} slots × 2 hours × ₹{ground.price}/hour</div>
                      <div className="mt-1 font-medium">Selected: {selectedSlots.join(' • ')}</div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={selectedSlots.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:scale-100"
                >
                  {selectedSlots.length === 0 
                    ? 'Select Time Slots' 
                    : `Book Now - ₹${(ground.price * selectedSlots.length * 2).toFixed(2)}`
                  }
                </button>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
                  <div>
                    <Shield className="w-4 h-4 mx-auto mb-1 text-green-500" />
                    <span>Secure</span>
                  </div>
                  <div>
                    <Clock className="w-4 h-4 mx-auto mb-1 text-green-500" />
                    <span>Instant</span>
                  </div>
                  <div>
                    <Users className="w-4 h-4 mx-auto mb-1 text-green-500" />
                    <span>Support 24/7</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroundBooking;