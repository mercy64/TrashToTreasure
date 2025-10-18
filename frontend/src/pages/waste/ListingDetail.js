import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Package2, User, MessageSquare, Phone } from 'lucide-react';
import { wasteAPI, wasteExtrasAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const auth = useSelector(state => state.auth);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const resp = await wasteAPI.getListings({ id });
        // If backend supports /listings/?id= we expect results array; else fallback
        const data = Array.isArray(resp.data) ? resp.data[0] : resp.data;
        setListing(data);
      } catch (err) {
        console.warn('Failed to load listing', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Listing not found</h2>
          <p className="text-gray-600 mb-4">The listing you're looking for doesn't exist.</p>
          <Link to="/listings" className="btn-primary">
            Browse All Listings
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><Link to="/listings" className="text-gray-500 hover:text-gray-700">Listings</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-gray-900">{listing.title}</span></li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                    <span className="badge badge-primary">{listing.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">KSh {listing.price.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{listing.quantity} {listing.unit}</div>
                  </div>
                </div>

                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700">{listing.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Package2 className="h-4 w-4 mr-2" />
                      <span>{listing.quantity} {listing.unit}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Listed {formatDate(listing.created_at)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-900 mr-2">Pickup Available:</span>
                      <span className={listing.pickup_available ? "text-green-600" : "text-red-600"}>
                        {listing.pickup_available ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-900 mr-2">Delivery Available:</span>
                      <span className={listing.delivery_available ? "text-green-600" : "text-red-600"}>
                        {listing.delivery_available ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-900 mr-2">Status:</span>
                      <span className="badge badge-success">{listing.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{listing.seller.name}</p>
                  <p className="text-sm text-gray-500">Rating: {listing.seller.rating}/5</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Sales:</span>
                  <span className="font-medium">{listing.seller.total_sales}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button className="btn-primary w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Seller
                </button>
                <button className="btn-secondary w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call: {listing.contact_phone}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                {listing && listing.status === 'available' && (
                  <button
                    className="btn-primary w-full"
                    onClick={async () => {
                      if (!auth.user) {
                        toast.error('Please log in to claim listings');
                        return;
                      }
                      // optimistic UI
                      setClaiming(true);
                      const prev = { ...listing };
                      setListing({ ...listing, claimed_by: auth.user.username, status: 'reserved' });
                      try {
                        await wasteExtrasAPI.claimListing(listing.id);
                        toast.success('Listing claimed successfully');
                      } catch (err) {
                        // Rollback on error
                        setListing(prev);
                        if (err.response && err.response.status === 409) {
                          toast.error('Listing already claimed by another user');
                        } else {
                          toast.error('Failed to claim listing');
                        }
                      } finally {
                        setClaiming(false);
                      }
                    }}
                    disabled={claiming}
                  >
                    Claim Listing
                  </button>
                )}

                {listing && listing.claimed_by && listing.claimed_by === auth.user?.username && (
                  <button
                    className="btn-secondary w-full"
                    onClick={async () => {
                      setClaiming(true);
                      const prev = { ...listing };
                      setListing({ ...listing, claimed_by: null, status: 'available' });
                      try {
                        await wasteExtrasAPI.unclaimListing(listing.id);
                        toast.info('Listing unclaimed');
                      } catch (err) {
                        setListing(prev);
                        toast.error('Failed to unclaim');
                      } finally {
                        setClaiming(false);
                      }
                    }}
                  >
                    Unclaim
                  </button>
                )}

                <button className="btn-danger w-full">
                  Report Listing
                </button>
              </div>
            </div>

            {/* Similar Listings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Listings</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-sm text-gray-900 mb-1">
                    Plastic Containers - 30kg
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">KSh 3,500</p>
                  <p className="text-xs text-gray-500">Westlands, Nairobi</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-sm text-gray-900 mb-1">
                    Glass Bottles - 25kg
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">KSh 2,800</p>
                  <p className="text-xs text-gray-500">CBD, Nairobi</p>
                </div>
              </div>

              <Link to="/listings" className="btn-secondary w-full mt-4">
                View All Listings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;