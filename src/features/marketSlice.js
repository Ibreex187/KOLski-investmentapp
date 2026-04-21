import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { API_ENDPOINTS, getApiErrorMessage } from '../services/api';

const normalizeWatchlistItem = (item = {}) => ({
  _id: item._id || item.id || `${String(item.symbol || '').toUpperCase()}-${item.createdAt || Date.now()}`,
  symbol: String(item.symbol || '').toUpperCase(),
  name: String(item.name || '').trim(),
  addedAt: item.addedAt || item.createdAt || null,
});

export const fetchPortfolioMarketPrices = createAsyncThunk(
  'market/fetchPortfolioMarketPrices',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.market.portfolioPrices);
      return data?.data ?? data ?? {};
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load market overview');
    }
  }
);

export const searchMarketSymbols = createAsyncThunk(
  'market/searchMarketSymbols',
  async (query, { rejectWithValue }) => {
    const trimmedQuery = String(query || '').trim();

    if (!trimmedQuery) {
      return {
        query: '',
        results: [],
        empty: true,
        message: 'Enter a symbol or company name to search.',
      };
    }

    try {
      const { data } = await api.get(API_ENDPOINTS.market.search, {
        params: { q: trimmedQuery },
      });

      return {
        query: trimmedQuery,
        results: Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [],
        empty: false,
        message: '',
      };
    } catch (err) {
      if (err.response?.status === 404) {
        return {
          query: trimmedQuery,
          results: [],
          empty: true,
          message: 'No matching symbols were returned for that search.',
        };
      }

      return rejectWithValue(getApiErrorMessage(err) || 'Failed to search symbols');
    }
  }
);

export const fetchMarketQuote = createAsyncThunk(
  'market/fetchMarketQuote',
  async (symbol, { rejectWithValue }) => {
    const normalizedSymbol = String(symbol || '').trim().toUpperCase();

    try {
      const { data } = await api.get(`${API_ENDPOINTS.market.quote}/${normalizedSymbol}`);
      return {
        symbol: normalizedSymbol,
        quote: data?.data ?? data ?? null,
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load stock quote');
    }
  }
);

export const fetchMarketHistory = createAsyncThunk(
  'market/fetchMarketHistory',
  async (symbol, { rejectWithValue }) => {
    const normalizedSymbol = String(symbol || '').trim().toUpperCase();

    try {
      const { data } = await api.get(`${API_ENDPOINTS.market.history}/${normalizedSymbol}`);
      return {
        symbol: normalizedSymbol,
        history: Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [],
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load historical data');
    }
  }
);

export const fetchWatchlist = createAsyncThunk(
  'market/fetchWatchlist',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.portfolio.watchlist);
      const rawItems = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      return rawItems.map(normalizeWatchlistItem).filter((item) => item.symbol);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to load watchlist');
    }
  }
);

export const addWatchlistItem = createAsyncThunk(
  'market/addWatchlistItem',
  async ({ symbol, name }, { rejectWithValue }) => {
    const normalizedSymbol = String(symbol || '').trim().toUpperCase();
    const normalizedName = String(name || '').trim();

    if (!normalizedSymbol) {
      return rejectWithValue('Symbol is required');
    }

    if (!normalizedName) {
      return rejectWithValue('Name is required');
    }

    try {
      const { data } = await api.post(API_ENDPOINTS.portfolio.watchlist, {
        symbol: normalizedSymbol,
        name: normalizedName,
      });
      return normalizeWatchlistItem(data?.data ?? data ?? { symbol: normalizedSymbol, name: normalizedName });
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to add watchlist item');
    }
  }
);

export const removeWatchlistItem = createAsyncThunk(
  'market/removeWatchlistItem',
  async (symbol, { rejectWithValue }) => {
    const normalizedSymbol = String(symbol || '').trim().toUpperCase();

    if (!normalizedSymbol) {
      return rejectWithValue('Symbol is required');
    }

    try {
      await api.delete(`${API_ENDPOINTS.portfolio.watchlist}/${normalizedSymbol}`);
      return normalizedSymbol;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err) || 'Failed to remove watchlist item');
    }
  }
);

const initialState = {
  portfolioPrices: {},
  searchResults: [],
  searchQuery: '',
  searchMessage: 'Search by ticker or company name.',
  quotesBySymbol: {},
  historyBySymbol: {},
  watchlist: [],
  overviewLoading: false,
  searchLoading: false,
  quoteLoading: false,
  historyLoading: false,
  watchlistLoading: false,
  watchlistActionLoading: false,
  lastWatchlistAction: null,
  error: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    clearMarketError: (state) => {
      state.error = null;
    },
    clearMarketSearch: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
      state.searchMessage = 'Search by ticker or company name.';
    },
    clearWatchlistAction: (state) => {
      state.lastWatchlistAction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolioMarketPrices.pending, (state) => {
        state.overviewLoading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioMarketPrices.fulfilled, (state, action) => {
        state.overviewLoading = false;
        state.portfolioPrices = action.payload || {};
      })
      .addCase(fetchPortfolioMarketPrices.rejected, (state, action) => {
        state.overviewLoading = false;
        state.error = action.payload;
      })
      .addCase(searchMarketSymbols.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchMarketSymbols.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.results;
        state.searchQuery = action.payload.query;
        state.searchMessage = action.payload.message;
      })
      .addCase(searchMarketSymbols.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMarketQuote.pending, (state) => {
        state.quoteLoading = true;
        state.error = null;
      })
      .addCase(fetchMarketQuote.fulfilled, (state, action) => {
        state.quoteLoading = false;
        state.quotesBySymbol[action.payload.symbol] = action.payload.quote;
      })
      .addCase(fetchMarketQuote.rejected, (state, action) => {
        state.quoteLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMarketHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchMarketHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.historyBySymbol[action.payload.symbol] = action.payload.history;
      })
      .addCase(fetchMarketHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchWatchlist.pending, (state) => {
        state.watchlistLoading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.watchlistLoading = false;
        state.watchlist = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.watchlistLoading = false;
        state.error = action.payload;
      })
      .addCase(addWatchlistItem.pending, (state) => {
        state.watchlistActionLoading = true;
        state.error = null;
        state.lastWatchlistAction = null;
      })
      .addCase(addWatchlistItem.fulfilled, (state, action) => {
        state.watchlistActionLoading = false;
        const item = action.payload;
        const exists = state.watchlist.some((watchlistItem) => watchlistItem.symbol === item.symbol);
        if (!exists) {
          state.watchlist.unshift(item);
        }
        state.lastWatchlistAction = {
          type: 'added',
          symbol: item.symbol,
          message: `${item.symbol} added to watchlist.`,
        };
      })
      .addCase(addWatchlistItem.rejected, (state, action) => {
        state.watchlistActionLoading = false;
        state.error = action.payload;
      })
      .addCase(removeWatchlistItem.pending, (state) => {
        state.watchlistActionLoading = true;
        state.error = null;
        state.lastWatchlistAction = null;
      })
      .addCase(removeWatchlistItem.fulfilled, (state, action) => {
        state.watchlistActionLoading = false;
        state.watchlist = state.watchlist.filter((item) => item.symbol !== action.payload);
        state.lastWatchlistAction = {
          type: 'removed',
          symbol: action.payload,
          message: `${action.payload} removed from watchlist.`,
        };
      })
      .addCase(removeWatchlistItem.rejected, (state, action) => {
        state.watchlistActionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMarketError, clearMarketSearch, clearWatchlistAction } = marketSlice.actions;
export default marketSlice.reducer;
