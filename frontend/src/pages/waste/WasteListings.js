import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, MapPin, Clock, Package2, Eye } from 'lucide-react';
import { fetchListings, clearWaste } from '../../store/slices/wasteSlice';
import { Link } from 'react-router-dom';

const WasteListings = () => {
  const dispatch = useDispatch();
  const { listings, loading, error } = useSelector(state => state.waste);
  
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    location: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'newest'
  });
  
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    dispatch(fetchListings());
    return () => dispatch(clearWaste());
  }, [dispatch]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'plastic', label: 'Plastic' },
    { value: 'paper', label: 'Paper' },
    { value: 'glass', label: 'Glass' },
    { value: 'metal', label: 'Metal' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'organic', label: 'Organic' },
    { value: 'textile', label: 'Textile' },
    { value: 'other', label: 'Other' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredWaste = (listings || []).filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = filters.category === 'all' || item.category === filters.category;
    
    const matchesLocation = !filters.location || 
      item.location?.toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesPrice = 
      (!filters.priceMin || item.price >= parseFloat(filters.priceMin)) &&
      (!filters.priceMax || item.price <= parseFloat(filters.priceMax));
    
    return matchesSearch && matchesCategory && matchesLocation && matchesPrice;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      default: // newest
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const WasteCard = ({ item, isListView = false }) => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
      isListView ? 'flex' : ''
    }`}>
      <div className={`${isListView ? 'w-48 flex-shrink-0' : 'h-48'} relative`}>
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Package2 className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
            KSh {item.price}
          </span>
        </div>
      </div>
      
      <div className={`p-4 ${isListView ? 'flex-1' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {item.title}
          </h3>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium ml-2">
            {item.category}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <Package2 className="h-4 w-4 mr-1" />
            <span>{item.quantity} {item.unit}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Listed {formatDate(item.created_at)}</span>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Link
            to={`/waste/${item.id}`}
            className="btn-primary flex-1 text-center"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Link>
          <button className="btn-secondary">
            Contact Seller
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Waste Listings
          </h1>
          <p className="text-gray-600">
            Find recyclable materials and help reduce waste
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search waste listings..."
                  className="input-field pl-10"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="input-field"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="Enter location"
                className="input-field"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price (KSh)
              </label>
              <input
                type="number"
                placeholder="0"
                className="input-field"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price (KSh)
              </label>
              <input
                type="number"
                placeholder="1000000"
                className="input-field"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <label className="block text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                className="input-field w-auto"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400'
                }`}
              >
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="bg-current w-1.5 h-1.5 rounded-sm"></div>
                  <div className="bg-current w-1.5 h-1.5 rounded-sm"></div>
                  <div className="bg-current w-1.5 h-1.5 rounded-sm"></div>
                  <div className="bg-current w-1.5 h-1.5 rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400'
                }`}
              >
                <div className="space-y-1 w-4 h-4">
                  <div className="bg-current w-4 h-1 rounded-sm"></div>
                  <div className="bg-current w-4 h-1 rounded-sm"></div>
                  <div className="bg-current w-4 h-1 rounded-sm"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredWaste.length} of {(listings || []).length} listings
          </p>
        </div>

        {/* Listings Grid/List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">Error loading listings</div>
            <button 
              onClick={() => dispatch(fetchListings())}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : filteredWaste.length > 0 ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }`}>
            {filteredWaste.map((item) => (
              <WasteCard 
                key={item.id} 
                item={item} 
                isListView={viewMode === 'list'} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No listings found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button 
              onClick={() => setFilters({
                search: '',
                category: 'all',
                location: '',
                priceMin: '',
                priceMax: '',
                sortBy: 'newest'
              })}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteListings;