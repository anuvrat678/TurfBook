import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, Clock, MapPin, Users, Award, Shield, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';

function Home() {
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [featuredGrounds, setFeaturedGrounds] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const { data } = await api.get('/grounds');
        setGrounds(data);
        // Get top 6 highly rated grounds or first 6 if no ratings
        const sortedGrounds = data
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6);
        setFeaturedGrounds(sortedGrounds);
      } finally {
        setLoading(false);
      }
    };
    fetchGrounds();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/grounds?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section with Background Image */}
      <div className="relative h-screen bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="assets\images\homebgnav.jpg"
            alt="Sports Ground"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-gray-900/40"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl text-white font-bold mb-6 leading-tight"
          >
            Find Your Perfect
            <span className="block text-green-400">Playground</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl leading-relaxed"
          >
            Book premium sports grounds instantly. From casual games to professional matches, we've got you covered.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-4xl mx-auto"
          >
            <form onSubmit={handleSearch} className="flex flex-col items-center">
              <div className="relative w-full mb-6">
                <input
                  type="text"
                  placeholder="Search by city, location, or sport type..."
                  className="w-full py-6 pl-20 pr-6 text-xl rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm focus:ring-4 focus:ring-green-400 focus:ring-opacity-50 transition-all placeholder-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-500" />
              </div>
              <button
                type="submit"
                className="px-16 py-5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-xl shadow-2xl transition-all transform hover:scale-105 hover:shadow-2xl flex items-center gap-3"
              >
                <Search className="w-6 h-6" />
                Find Turfs Now
              </button>
            </form>
          </motion.div>

          {/* Quick Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex flex-wrap justify-center gap-8 text-white"
          >
            <div className="text-center">
              <div className="text-2xl font-bold">Instant</div>
              <div className="text-gray-300">Booking</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-gray-300">Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">Best</div>
              <div className="text-gray-300">Prices</div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-3 bg-white rounded-full mt-2"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Platform Statistics Section */}
      <div className="bg-gradient-to-br from-gray-50 to-green-50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { 
                icon: Users, 
                number: '2K+', 
                text: 'Active Players', 
                color: 'text-blue-600',
                description: 'Demo data for portfolio'
              },
              { 
                icon: Award, 
                number: '50+', 
                text: 'Premium Grounds', 
                color: 'text-green-600',
                description: 'Sample ground count'
              },
              { 
                icon: MapPin, 
                number: '15+', 
                text: 'Cities Covered', 
                color: 'text-orange-600',
                description: 'Mock location data'
              },
              { 
                icon: Star, 
                number: '4.8', 
                text: 'Average Rating', 
                color: 'text-yellow-600',
                description: 'Sample rating data'
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.text}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <stat.icon className={`w-12 h-12 ${stat.color} mx-auto mb-4`} />
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
                <div className="text-gray-600 font-medium mb-2">{stat.text}</div>
                <div className="text-xs text-gray-400 italic">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Featured Grounds Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Featured Grounds
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Handpicked selection of premium sports venues with top ratings
            </p>
            <div className="text-sm text-gray-500 mt-2">
              Showing 6 featured grounds from our demo database
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
              >
                {featuredGrounds.map((ground, index) => (
                  <motion.div
                    key={ground._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={ground.cover}
                        alt={ground.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute top-4 right-4 flex gap-2">
                        {ground.rating && (
                          <div className="bg-white bg-opacity-95 px-3 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold">{ground.rating}</span>
                          </div>
                        )}
                        {ground.is24x7 && (
                          <div className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-sm font-semibold">24/7</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-xl font-bold text-white">{ground.name}</h3>
                        <div className="flex items-center text-gray-200">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">
                            {ground.location.city}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="  mb-4">
                        <span className="text-2xl font-bold text-green-600">
                          ₹{ground.price}/hour
                        </span>
                        
                      </div>
                      <Link
                        to={`/grounds/${ground._id}`}
                        className="block w-full text-center bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Book Now
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Call to Action Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-12 text-white"
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Play?
                </h3>
                <p className="text-green-100 text-xl mb-8 max-w-2xl mx-auto">
                  Explore our complete collection of sports grounds with advanced filters and real-time availability
                </p>
                <Link
                  to="/grounds"
                  className="inline-flex items-center gap-3 bg-white text-green-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
                >
                  View All Grounds
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Platform Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Why Choose TurfBook?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A modern platform designed to make sports ground booking seamless and enjoyable
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure Booking',
                description: 'Safe and reliable booking process with instant confirmations'
              },
              {
                icon: Clock,
                title: 'Real-time Availability',
                description: 'See live availability and book your preferred time slots instantly'
              },
              {
                icon: Heart,
                title: 'Curated Experience',
                description: 'Handpicked grounds with verified facilities and amenities'
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;