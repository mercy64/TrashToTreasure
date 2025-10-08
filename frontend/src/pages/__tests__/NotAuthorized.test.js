import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotAuthorized from '../NotAuthorized';

describe('NotAuthorized page', () => {
  it('renders heading and action links with ARIA labels', () => {
    render(
      <MemoryRouter>
        <NotAuthorized />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /not authorized/i })).toBeInTheDocument();
    const homeLink = screen.getByRole('link', { name: /go to home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.getAttribute('href')).toBe('/');

    const dashLink = screen.getByRole('link', { name: /go to your dashboard/i });
    expect(dashLink).toBeInTheDocument();
    expect(dashLink.getAttribute('href')).toBe('/dashboard');
  });
});
