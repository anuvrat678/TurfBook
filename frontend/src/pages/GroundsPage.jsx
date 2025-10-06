import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Grid, List, Search, ArrowLeft, Filter, X, Clock, MapPin, Star } from 'lucide-react';
import api from '../services/api';
import Footer from '../components/Footer';

function GroundsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [show24x7Only, setShow24x7Only] = useState(false);

  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get('search') || '';

  // Extract unique cities for filter options
  const availableCities = [...new Set(grounds.map(ground => ground.location.city))];

  useEffect(() => {
    const fetchGrounds = async () => {
      try {
        const { data } = await api.get('/grounds');
        setGrounds(data);
      } finally {
        setLoading(false);
      }
    };
    fetchGrounds();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle search functionality
  const handleSearch = (query) => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('search', query.trim());
    }
    navigate(`/grounds?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setPriceRange([0, 5000]);
    setSelectedCities([]);
    setShow24x7Only(false);
    setSortBy('name');
  };

  // Apply filters and sorting to grounds
  const filteredAndSortedGrounds = grounds
    .filter(ground => {
      // Search filter
      const matchesSearch = !urlSearchQuery ||
        ground.location.city.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
        ground.location.address.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
        ground.name.toLowerCase().includes(urlSearchQuery.toLowerCase());

      // Price filter
      const matchesPrice = ground.price >= priceRange[0] && ground.price <= priceRange[1];

      // City filter
      const matchesCity = selectedCities.length === 0 ||
        selectedCities.includes(ground.location.city);

      // 24x7 filter
      const matches24x7 = !show24x7Only || ground.is24x7;

      return matchesSearch && matchesPrice && matchesCity && matches24x7;
    })
    .sort((a, b) => {
      // Sort grounds based on selected criteria
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Calculate max price for range slider
  const maxPrice = grounds.length > 0 ? Math.max(...grounds.map(g => g.price)) : 5000;

  // Render individual ground card in grid view
  const renderGridCard = (ground, index) => (
    <motion.div
      key={ground._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
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
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-green-600">
            ₹{ground.price}/hour
          </span>
        </div>
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm line-clamp-2">
            {ground.location.address}
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
  );

  // Render individual ground card in list view
  const renderListCard = (ground, index) => (
    <motion.div
      key={ground._id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ x: 4 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group flex flex-col md:flex-row"
    >
      <div className="relative md:w-64 md:min-w-[256px] h-48 md:h-auto">
        <img
          src={ground.cover}
          alt={ground.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent md:hidden"></div>
        <div className="absolute top-3 right-3 flex gap-2">

          {ground.is24x7 && (
            <div className="bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs font-semibold">24/7</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {ground.name}
          </h3>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {ground.location.address}, {ground.location.city}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-2xl font-bold text-green-600">
            ₹{ground.price}/hour
          </div>
          <Link
            to={`/grounds/${ground._id}`}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );

  // Render content based on loading and results state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
        </div>
      );
    }

    if (filteredAndSortedGrounds.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No grounds found
          </h3>
          <p className="text-gray-600 mb-6">
            {urlSearchQuery
              ? `No results found for "${urlSearchQuery}". Try adjusting your search or filters.`
              : 'No grounds match your current filters. Try adjusting your criteria.'
            }
          </p>
          <button
            onClick={clearFilters}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`grid gap-6 ${viewMode === 'grid' || windowWidth < 750
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1'
          }`}
      >
        {filteredAndSortedGrounds.map((ground, index) =>
          viewMode === 'grid' || windowWidth < 750
            ? renderGridCard(ground, index)
            : renderListCard(ground, index)
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Search and Controls */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

            {/* Logo, Back Button and Search */}
            <div className="flex items-center gap-4 w-full md:flex-1">
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <Link to="/" className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    <span className="text-green-500">Turf</span>
                    <span className="text-gray-800">Book</span>
                  </span>
                </Link>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by ground name, city, or location..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={urlSearchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Controls - View Toggle and Filter Button */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Filter Button for Mobile */}
            <button
  onClick={() => setShowFilters(!showFilters)}
  className={`md:hidden flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
    showFilters 
      ? 'bg-green-600 text-white' 
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`}
>
  <Filter className="w-4 h-4" />
  Filters
</button>

              {/* View Toggle - Show on desktop */}
              {windowWidth >= 750 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    aria-label="Grid view"
                  >
                    <Grid className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    aria-label="List view"
                  >
                    <List className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Filter Button for Desktop */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:w-80 bg-white rounded-xl shadow-sm p-6 h-fit lg:sticky lg:top-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sort By */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="price-low">Price (Low to High)</option>
                    <option value="price-high">Price (High to Low)</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      step="100"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>₹0</span>
                      <span>₹{maxPrice}</span>
                    </div>
                  </div>
                </div>

                {/* City Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cities
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableCities.map(city => (
                      <label key={city} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCities.includes(city)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCities([...selectedCities, city]);
                            } else {
                              setSelectedCities(selectedCities.filter(c => c !== city));
                            }
                          }}
                          className="rounded text-green-500 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{city}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 24x7 Filter */}
                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={show24x7Only}
                      onChange={(e) => setShow24x7Only(e.target.checked)}
                      className="rounded text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Show only 24/7 grounds
                    </span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grounds List */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  Sports Grounds
                </h2>
                <p className="text-gray-600 text-lg">
                  {filteredAndSortedGrounds.length} ground{filteredAndSortedGrounds.length !== 1 ? 's' : ''} found
                  {urlSearchQuery && ` for "${urlSearchQuery}"`}
                </p>
              </div>
            </div>

            {/* Render Content */}
            {renderContent()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default GroundsPage;