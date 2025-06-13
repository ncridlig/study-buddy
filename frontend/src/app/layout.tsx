'use client';

import './globals.css';
import { ReactNode } from 'react';
import { ThemeRegistry } from '@/context/ThemeContext';
import Navbar from '../components/Navbar'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <Navbar />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
