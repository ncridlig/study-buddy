// __tests__/ConfirmationDialog.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import '@testing-library/jest-dom';

describe('ConfirmationDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Delete Project',
    contentText: 'Are you sure you want to delete this project?',
    onClose: jest.fn(),
    onConfirm: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with title and content', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    
    expect(screen.getByText('Delete Project')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this project?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when Delete is clicked', () => {
    render(<ConfirmationDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Delete'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not render when open is false', () => {
    render(<ConfirmationDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Delete Project')).not.toBeInTheDocument();
  });
});
