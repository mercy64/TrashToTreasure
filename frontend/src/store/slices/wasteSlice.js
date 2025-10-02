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
      return rejectWithValue(error.response?.data || 'Failed to fetch listings');
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
    try {
      // This would typically clear or reset waste data
      return {};
    } catch (error) {
      return rejectWithValue('Failed to clear waste data');
    }
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
        state.listings = action.payload;
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
      })
      .addCase(createListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch my listings
      .addCase(fetchMyListings.fulfilled, (state, action) => {
        state.myListings = action.payload;
      })
      // Fetch my transactions
      .addCase(fetchMyTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
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