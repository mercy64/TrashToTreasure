// Mock the API module so importing the slice doesn't pull in axios (ESM) during Jest run
jest.mock('../../../services/api', () => ({
  wasteAPI: {
    getListings: jest.fn(),
    getMyListings: jest.fn(),
    getMyTransactions: jest.fn(),
    getUserStats: jest.fn(),
    createListing: jest.fn(),
  },
}));

import reducer from '../wasteSlice';

describe('wasteSlice reducers', () => {
  it('increments userStats.total_listings on createListing.fulfilled', () => {
    const initialState = {
      listings: [],
      myListings: [],
      currentListing: null,
      transactions: [],
      userStats: { total_listings: 2 },
      loading: false,
      error: null,
      filters: {},
    };

    const action = { type: 'waste/createListing/fulfilled', payload: { id: 99, title: 'New' } };
    const next = reducer(initialState, action);
    expect(next.userStats.total_listings).toBe(3);
    expect(next.myListings.some(l => l.id === 99)).toBe(true);
  });
});
