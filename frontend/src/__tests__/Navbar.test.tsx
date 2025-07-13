// __tests__/Navbar.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '@/components/Navbar';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/'),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('@mui/material/useMediaQuery', () => jest.fn(() => false)); // assume desktop view

describe('Navbar', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    jest.clearAllMocks();
  });

  it('renders site title', () => {
    render(<Navbar />);
    expect(screen.getByText('Study Buddy')).toBeInTheDocument();
  });

  it('shows Login and Sign Up buttons if not logged in', () => {
    (Cookies.get as jest.Mock).mockReturnValue(undefined); // not logged in

    render(<Navbar />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows avatar menu if logged in', () => {
    (Cookies.get as jest.Mock).mockReturnValue('mock-token'); // logged in

    render(<Navbar />);
    const avatarButton = screen.getByRole('button', { name: '' }); // avatar has no text
    fireEvent.click(avatarButton);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  it('logs out and redirects to /login', () => {
    (Cookies.get as jest.Mock).mockReturnValue('mock-token');

    render(<Navbar />);
    const avatarButton = screen.getByRole('button', { name: '' });
    fireEvent.click(avatarButton);

    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);

    expect(Cookies.remove).toHaveBeenCalledWith('access_token');
    expect(Cookies.remove).toHaveBeenCalledWith('refresh_token');
    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('opens and closes drawer in mobile view', () => {
    // Override useMediaQuery to simulate mobile
    jest.mock('@mui/material/useMediaQuery', () => jest.fn(() => true));

    render(<Navbar />);
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    expect(screen.getByRole('presentation')).toBeInTheDocument(); // Drawer
  });
});
