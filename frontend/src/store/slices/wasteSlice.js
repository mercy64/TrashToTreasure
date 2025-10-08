import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wasteAPI } from '../../services/api';

const initialState = {
  listings: [],
  myListings: [],
  currentListing: null,
  transactions: [],
  userStats: {},
  loading: false,
  error: null,
  filters: {
    type: '',
    location: '',
    minQuantity: 0,
  },
};

// Async thunks
export const fetchListings = createAsyncThunk(
  'waste/fetchListings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await wasteAPI.getListings(params);
      return response.data;
    } catch (error) {
      // Return mock data if API fails (for development)
      const mockListings = [
        {
          id: 1,
          title: "Clean Plastic Bottles - 50kg",
          description: "High-quality clear plastic bottles, cleaned and sorted. Perfect for recycling.",
          category: "plastic",
          quantity: 50,
          unit: "kg",
          price: 150,
          location: "Nairobi, Kenya",
          images: [],
          created_at: new Date().toISOString(),
          user: { name: "John Doe" }
        },
        {
          id: 2,
          title: "Cardboard Boxes - 100 pieces",
          description: "Various sizes of cardboard boxes from office supplies. Clean and dry.",
          category: "paper",
          quantity: 100,
          unit: "pieces",
          price: 80,
          location: "Mombasa, Kenya",
          images: [],
          created_at: new Date(Date.now() - 86400000).toISOString(),
          user: { name: "Mary Smith" }
        },
        {
          id: 3,
          title: "Aluminum Cans - 25kg",
          description: "Sorted aluminum beverage cans, ready for recycling.",
          category: "metal",
          quantity: 25,
          unit: "kg",
          price: 200,
          location: "Kisumu, Kenya",
          images: [],
          created_at: new Date(Date.now() - 172800000).toISOString(),
          user: { name: "Peter Wilson" }
        }
      ];
      
      console.warn('API failed, using mock data:', error.response?.data || error.message);
      return mockListings;
    }
  }
);

export const createListing = createAsyncThunk(
  'waste/createListing',
  async (listingData, { rejectWithValue }) => {
    try {
      const response = await wasteAPI.createListing(listingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create listing');
    }
  }
);

export const fetchMyListings = createAsyncThunk(
  'waste/fetchMyListings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wasteAPI.getMyListings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch my listings');
    }
  }
);

export const fetchMyTransactions = createAsyncThunk(
  'waste/fetchMyTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wasteAPI.getMyTransactions();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch transactions');
    }
  }
);

// Additional exports that components are expecting
export const fetchUserWaste = fetchMyListings; // Alias for compatibility
export const fetchAllWaste = fetchListings; // Alias for compatibility
export const createWasteListing = createListing; // Alias for compatibility

export const fetchUserStats = createAsyncThunk(
  'waste/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wasteAPI.getUserStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch user stats');
    }
  }
);

export const clearWaste = createAsyncThunk(
  'waste/clearWaste',
  async (_, { rejectWithValue }) => {
    // This thunk simply resolves to an empty object (no API call needed)
    return {};
  }
);

const wasteSlice = createSlice({
  name: 'waste',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentListing: (state, action) => {
      state.currentListing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch listings
      .addCase(fetchListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure listings is always an array
        state.listings = Array.isArray(action.payload) ? action.payload : 
                        Array.isArray(action.payload?.results) ? action.payload.results : 
                        [];
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create listing
      .addCase(createListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.loading = false;
        state.myListings.push(action.payload);
        // Optimistically update user stats so dashboard shows the new listing immediately
        if (!state.userStats) state.userStats = {};
        state.userStats.total_listings = (state.userStats.total_listings || 0) + 1;
      })
      .addCase(createListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch my listings
      .addCase(fetchMyListings.fulfilled, (state, action) => {
        state.myListings = Array.isArray(action.payload) ? action.payload : 
                          Array.isArray(action.payload?.results) ? action.payload.results : 
                          [];
      })
      // Fetch my transactions
      .addCase(fetchMyTransactions.fulfilled, (state, action) => {
        state.transactions = Array.isArray(action.payload) ? action.payload : 
                           Array.isArray(action.payload?.results) ? action.payload.results : 
                           [];
      })
      // Fetch user stats
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload;
      })
      // Clear waste
      .addCase(clearWaste.fulfilled, (state) => {
        state.listings = [];
        state.myListings = [];
      });
  },
});

export const { setFilters, clearError, setCurrentListing } = wasteSlice.actions;
export default wasteSlice.reducer;