import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { fetchMyListings, fetchUserStats } from '../store/slices/wasteSlice';
import { fetchConversations } from '../store/slices/messageSlice';

// Simple hook that attempts to connect to a Socket.IO server and dispatches
// updates on listing/stat events. If no server exists it will fail silently
// and the app's polling fallback continues to operate.
export default function useSocket(store) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!store) return undefined;

    // Try connect to the backend socket namespace.
    // Priority: explicit SOCKET URL -> API base URL -> window-injected URL
    // Only attempt a socket connection when an explicit socket URL is provided.
    // Previously we fell back to the API base URL which often does not host
    // a socket.io endpoint and caused noisy 404 polling requests. By requiring
    // an explicit REACT_APP_SOCKET_URL the app will silently skip sockets
    // when none are configured and rely on polling.
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || window.__API_SOCKET_URL__ || null;

    if (!SOCKET_URL || SOCKET_URL === '/') {
      // By default keep quiet in non-debug environments to avoid noisy logs.
      if (process.env.REACT_APP_DEBUG_SOCKETS === 'true') {
        console.info('useSocket: no explicit SOCKET URL provided; skipping socket connection');
      }
      return undefined;
    }

    const opts = { autoConnect: true, reconnectionAttempts: 5 };
    try {
      if (process.env.REACT_APP_DEBUG_SOCKETS === 'true') {
        console.info('Attempting socket.io connection to', SOCKET_URL);
      }
      socketRef.current = io(SOCKET_URL, opts);
    } catch (e) {
      // If socket.io-client throws, bail out and rely on polling
      if (process.env.REACT_APP_DEBUG_SOCKETS === 'true') {
        console.warn('Socket connection failed (falling back to polling):', e.message || e);
      }
      return undefined;
    }

    const socket = socketRef.current;

    socket.on('connect', () => {
      if (process.env.REACT_APP_DEBUG_SOCKETS === 'true') {
        console.info('Socket connected:', socket.id);
      }
    });

    socket.on('listing_created', (data) => {
      // Server can send a payload; we simply refresh lists and stats
      store.dispatch(fetchMyListings());
      store.dispatch(fetchUserStats());
    });

    socket.on('stats_updated', (data) => {
      store.dispatch(fetchUserStats());
    });

    socket.on('conversation_update', (data) => {
      store.dispatch(fetchConversations());
    });

    socket.on('connect_error', (err) => {
      if (process.env.REACT_APP_DEBUG_SOCKETS === 'true') {
        console.warn('Socket connect_error:', err.message || err);
      }
    });

    return () => {
      try {
        socket.off();
        socket.close();
      } catch (e) {
        // ignore
      }
    };
  }, [store]);
}
