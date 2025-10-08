import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Upload, X, Plus, MapPin, DollarSign } from 'lucide-react';
import { createListing, fetchMyListings, fetchUserStats } from '../../store/slices/wasteSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CreateListing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.waste);
  const [fieldErrors, setFieldErrors] = useState({});
  const [topError, setTopError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    unit: 'kg',
    price: '',
    location: '',
    contact_phone: '',
    pickup_available: true,
    delivery_available: false,
  });
  
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'plastic', label: 'Plastic' },
    { value: 'paper', label: 'Paper' },
    { value: 'glass', label: 'Glass' },
    { value: 'metal', label: 'Metal' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'organic', label: 'Organic' },
    { value: 'textile', label: 'Textile' },
    { value: 'other', label: 'Other' }
  ];

  const units = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'tons', label: 'Tons' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'liters', label: 'Liters' },
    { value: 'cubic_meters', label: 'Cubic Meters' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, e.target.result]);
        setImageFiles(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    const submitData = new FormData();
    
    // Add form data. Map frontend field names to backend model fields.
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('type', formData.category);
    submitData.append('quantity', formData.quantity);
    submitData.append('unit', formData.unit);
    submitData.append('location', formData.location);
    submitData.append('price_per_unit', formData.price);
    submitData.append('contact_phone', formData.contact_phone);
    submitData.append('pickup_available', formData.pickup_available);
    submitData.append('delivery_available', formData.delivery_available);
    
    // Add image files
    imageFiles.forEach((file, index) => {
      submitData.append(`image_${index}`, file);
    });

    // clear previous errors
    setFieldErrors({});
    setTopError('');

    try {
      const action = await dispatch(createListing(submitData));
      unwrapResult(action);
      toast.success('Listing created successfully!');

      // Refresh user's listings and stats immediately so dashboard shows updated analytics
      try {
        dispatch(fetchMyListings());
        dispatch(fetchUserStats());
      } catch (e) {
        console.warn('Failed to refresh listings/stats after create:', e);
      }

      navigate('/dashboard');
    } catch (err) {
      // Network errors (no response) vs validation/server errors
      const payload = err?.payload;
      if (!payload && err?.message) {
        // Likely a network error or connection refused
        const networkMsg = err.message.includes('Network Error') || err.message.includes('ECONNREFUSED')
          ? "Network error: can't reach the server. Please ensure the backend is running (127.0.0.1:8001)."
          : err.message;
        setTopError(networkMsg);
        toast.error(networkMsg);
      } else if (payload && typeof payload === 'object') {
        // DRF error dict: map to fieldErrors
        setFieldErrors(payload);
        // show a compact summary toast
        const nonField = payload.non_field_errors || payload.detail;
        if (nonField) toast.error(Array.isArray(nonField) ? nonField.join(' ') : nonField);
        else toast.error('Validation errors occurred. See the form for details.');
      } else {
        const fallback = payload || err?.message || 'Failed to create listing';
        setTopError(fallback);
        toast.error(fallback);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
            <p className="text-gray-600">List your recyclable waste for others to purchase</p>
          </div>
          {topError && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                {topError}
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      className="input-field"
                      placeholder="e.g., Clean Plastic Bottles - 50kg"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                    {fieldErrors.title && (
                      <p className="mt-1 text-sm text-red-600">{Array.isArray(fieldErrors.title) ? fieldErrors.title[0] : fieldErrors.title}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={4}
                      className="input-field"
                      placeholder="Describe the condition, type, and any other relevant details..."
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">Tip: include how clean/sorted the waste is, contamination level, and whether it's baled or loose.</p>
                    {fieldErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{Array.isArray(fieldErrors.description) ? fieldErrors.description[0] : fieldErrors.description}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      className="input-field"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Choose the primary material type (this helps buyers find your listing).</p>
                    {fieldErrors.type && (
                      <p className="mt-1 text-sm text-red-600">{Array.isArray(fieldErrors.type) ? fieldErrors.type[0] : fieldErrors.type}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      id="contact_phone"
                      name="contact_phone"
                      required
                      className="input-field"
                      placeholder="+254 700 000 000"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                    />
                    {fieldErrors.contact_phone && (
                      <p className="mt-1 text-sm text-red-600">{Array.isArray(fieldErrors.contact_phone) ? fieldErrors.contact_phone[0] : fieldErrors.contact_phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity and Pricing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity & Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      required
                      min="0"
                      step="0.1"
                      className="input-field"
                      placeholder="50"
                      value={formData.quantity}
                      onChange={handleInputChange}
                    />
                    {fieldErrors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{Array.isArray(fieldErrors.quantity) ? fieldErrors.quantity[0] : fieldErrors.quantity}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <select
                      id="unit"
                      name="unit"
                      required
                      className="input-field"
                      value={formData.unit}
                      onChange={handleInputChange}
                    >
                      {units.map(unit => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price (KSh) *
                    </label>
                    <div className="relative">
                      <DollarSign className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        id="price"
                        name="price"
                        required
                        min="0"
                        step="0.01"
                        className="input-field pl-10"
                        placeholder="5000"
                        value={formData.price}
                        onChange={handleInputChange}
                      />
                      {fieldErrors.price_per_unit && (
                        <p className="mt-1 text-sm text-red-600">{Array.isArray(fieldErrors.price_per_unit) ? fieldErrors.price_per_unit[0] : fieldErrors.price_per_unit}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location and Logistics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Logistics</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="location"
                        name="location"
                        required
                        className="input-field pl-10"
                        placeholder="e.g., Nairobi CBD, Kenya"
                        value={formData.location}
                        onChange={handleInputChange}
                      />
                      {fieldErrors.location && (
                        <p className="mt-1 text-sm text-red-600">{Array.isArray(fieldErrors.location) ? fieldErrors.location[0] : fieldErrors.location}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="pickup_available"
                        checked={formData.pickup_available}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Pickup available</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="delivery_available"
                        checked={formData.delivery_available}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Delivery available</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                          <span>Upload images</span>
                          <input
                            id="image-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB (Max 5 images). Tip: show close-up of material and a photo of the full pile for clarity.</p>
                      {fieldErrors.images && (
                        <p className="mt-1 text-sm text-red-600">{Array.isArray(fieldErrors.images) ? fieldErrors.images[0] : fieldErrors.images}</p>
                      )}
                    </div>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Listing
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;