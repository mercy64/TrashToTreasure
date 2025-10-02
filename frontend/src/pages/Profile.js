import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Save, 
  X,
  Camera,
  Shield,
  Package2,
  TrendingUp,
  Star
} from 'lucide-react';
import { updateUserProfile, fetchUserStats } from '../store/slices/authSlice';
import { toast } from 'react-toastify';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  const { userStats } = useSelector(state => state.waste);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
      });
    }
    dispatch(fetchUserStats());
  }, [user, dispatch]);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Image size should be less than 2MB');
        return;
      }
      setProfileImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const updateData = new FormData();
    Object.keys(formData).forEach(key => {
      updateData.append(key, formData[key]);
    });
    
    if (profileImage) {
      updateData.append('profile_image', profileImage);
    }

    try {
      const result = await dispatch(updateUserProfile(updateData));
      if (updateUserProfile.fulfilled.match(result)) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setProfileImage(null);
      } else {
        toast.error(result.payload || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
    });
    setProfileImage(null);
    setIsEditing(false);
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'waste_generator':
        return 'Waste Generator';
      case 'buyer':
        return 'Buyer/Recycler';
      case 'delivery':
        return 'Delivery Personnel';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={`${user.first_name} ${user.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-2 cursor-pointer hover:bg-green-700"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </h1>
                    <div className="flex items-center justify-center md:justify-start mt-2">
                      <Shield className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-blue-600 font-medium">
                        {getRoleDisplayName(user?.role)}
                      </span>
                    </div>
                  </div>
                  
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary mt-4 md:mt-0"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <button
                        onClick={handleCancel}
                        className="btn-secondary"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary"
                      >
                        {loading ? (
                          <div className="loading-spinner mr-2"></div>
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center justify-center md:justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center justify-center md:justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user?.location && (
                    <div className="flex items-center justify-center md:justify-start">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>

                {user?.bio && (
                  <p className="mt-4 text-gray-700">{user.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Edit Profile Information' : 'Profile Information'}
                </h2>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          className="input-field"
                          value={formData.first_name}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="text-gray-900">{user?.first_name || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          className="input-field"
                          value={formData.last_name}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <p className="text-gray-900">{user?.last_name || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="input-field"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-gray-900">{user?.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="input-field"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        id="location"
                        name="location"
                        className="input-field"
                        value={formData.location}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-gray-900">{user?.location || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        className="input-field"
                        placeholder="Tell us about yourself..."
                        value={formData.bio}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-gray-900">{user?.bio || 'No bio provided'}</p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Activity Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
              <div className="space-y-4">
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
                  color="bg-green-500"
                />
                <StatCard
                  title="Rating"
                  value={userStats?.rating || 'N/A'}
                  icon={Star}
                  color="bg-yellow-500"
                />
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
              <div className="space-y-3">
                <button className="w-full btn-secondary justify-start">
                  Change Password
                </button>
                <button className="w-full btn-secondary justify-start">
                  Notification Settings
                </button>
                <button className="w-full btn-secondary justify-start">
                  Privacy Settings
                </button>
                <button className="w-full text-red-600 hover:text-red-700 text-left">
                  Delete Account
                </button>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userStats?.co2_saved || 0}kg
                  </div>
                  <p className="text-sm text-gray-600">CO₂ Emissions Saved</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userStats?.waste_diverted || 0}kg
                  </div>
                  <p className="text-sm text-gray-600">Waste Diverted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;