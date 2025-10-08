import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import PrivateRoute from '../PrivateRoute';

const mockStore = configureStore([]);

function renderWithStore(ui, { storeState, route = '/' } = {}) {
  const store = mockStore(storeState);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </Provider>
  );
}

describe('PrivateRoute', () => {
  it('redirects unauthenticated to login', () => {
    const storeState = { auth: { isAuthenticated: false, user: null } };
    const { getByText } = renderWithStore(
      <Routes>
        <Route path="/" element={<PrivateRoute><div>Protected</div></PrivateRoute>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { storeState }
    );
    expect(getByText(/Login Page/i)).toBeInTheDocument();
  });

  it('allows access when role matches requiredRole', () => {
    const storeState = { auth: { isAuthenticated: true, user: { role: 'generator' } } };
    const { getByText } = renderWithStore(
      <Routes>
        <Route path="/" element={<PrivateRoute requiredRole="generator"><div>Gen</div></PrivateRoute>} />
      </Routes>,
      { storeState }
    );
    expect(getByText(/Gen/i)).toBeInTheDocument();
  });

  it('redirects to role dashboard when requiredRole does not match', () => {
    const storeState = { auth: { isAuthenticated: true, user: { role: 'recycler' } } };
    const { getByText } = renderWithStore(
      <Routes>
        <Route path="/" element={<PrivateRoute requiredRole="generator"><div>Protected</div></PrivateRoute>} />
        <Route path="/dashboard/recycler" element={<div>Recycler Dashboard</div>} />
      </Routes>,
      { storeState }
    );
    expect(getByText(/Recycler Dashboard/i)).toBeInTheDocument();
  });
});

