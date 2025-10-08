import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Package2, Plus, Search, Filter, TrendingUp, Users, DollarSign, MessageSquare } from 'lucide-react';
import { fetchUserWaste, fetchUserStats } from '../store/slices/wasteSlice';
import { fetchConversations } from '../store/slices/messageSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { myListings, userStats, loading } = useSelector(state => state.waste);
  const { conversations } = useSelector(state => state.messages);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Calculate unread count from conversations
  const unreadCount = (conversations || []).reduce((count, conversation) => {
    return count + (conversation.unread_count || 0);
  }, 0);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserWaste());
      dispatch(fetchUserStats());
      dispatch(fetchConversations());
    }
  }, [dispatch, user]);

  const filteredWaste = (myListings || []).filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.category === filterType;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
  case 'available': return 'text-white bg-primary';
      case 'sold': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600">
            Manage your waste listings and track your environmental impact
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Listings"
            value={userStats?.total_listings || 0}
            icon={Package2}
            color="bg-blue-500"
          />
          <StatCard
            title="Items Sold"
            value={userStats?.items_sold || 0}
            icon={TrendingUp}
            color="bg-primary"
            style={{backgroundColor: '#8dc6ff'}}
          />
          <StatCard
            title="Total Earnings"
            value={`KSh ${userStats?.total_earnings || 0}`}
            icon={DollarSign}
            color="bg-yellow-500"
          />
          <StatCard
            title="Messages"
            value={unreadCount || 0}
            icon={MessageSquare}
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Listings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Your Listings</h2>
                  <button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Listing
                  </button>
                </div>
                
                {/* Search and Filter */}
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search listings..."
                      className="input-field pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      className="input-field pl-10 pr-8"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      <option value="plastic">Plastic</option>
                      <option value="paper">Paper</option>
                      <option value="glass">Glass</option>
                      <option value="metal">Metal</option>
                      <option value="electronic">Electronic</option>
                      <option value="organic">Organic</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="loading-spinner"></div>
                  </div>
                ) : filteredWaste.length > 0 ? (
                  <div className="space-y-4">
                    {filteredWaste.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{item.title}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Category: {item.category}</span>
                              <span>Quantity: {item.quantity} {item.unit}</span>
                              <span>Price: KSh {item.price}</span>
                            </div>
                          </div>
                          {item.images && item.images.length > 0 && (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg ml-4"
                            />
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button className="btn-secondary text-sm">Edit</button>
                          <button className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No listings found</p>
                    <button className="btn-primary mt-4">
                      Create Your First Listing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Listing
                </button>
                <button className="w-full btn-secondary justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Waste
                </button>
                <button className="w-full btn-secondary justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button className="w-full btn-secondary justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Profile Settings
                </button>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {userStats?.co2_saved || 0}kg
                  </div>
                  <p className="text-sm text-gray-600">CO₂ Emissions Saved</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {userStats?.waste_diverted || 0}kg
                  </div>
                  <p className="text-sm text-gray-600">Waste Diverted from Landfills</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {userStats?.recent_activity && userStats.recent_activity.length > 0 ? (
                  userStats.recent_activity.map((activity, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: '#8dc6ff'}}></div>
                      <span className="text-gray-600">{activity}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;