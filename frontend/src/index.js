import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { store } from './store';
import App from './App';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Quiet known React Router future-flag warnings in dev unless explicitly enabled.
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_VERBOSE_ROUTER !== 'true') {
  const originalWarn = console.warn.bind(console);
  console.warn = (...args) => {
    try {
      const msg = String(args[0] || '');
      if (msg.includes('React Router Future Flag Warning')) return;
    } catch (e) {
      // ignore parsing errors and fall through to original
    }
    originalWarn(...args);
  };
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);