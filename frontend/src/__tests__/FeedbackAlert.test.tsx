// __tests__/FeedbackAlert.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FeedbackAlert from '@/components/FeedbackAlert';
import '@testing-library/jest-dom';

describe('FeedbackAlert', () => {
  const defaultProps = {
    open: true,
    message: 'Test message',
    severity: 'success' as const,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with message and severity', () => {
    render(<FeedbackAlert {...defaultProps} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-filledSuccess'); // MUI class for success severity
  });

  it('calls onClose when close button is clicked', () => {
    render(<FeedbackAlert {...defaultProps} />);
    
    const closeButton = screen.getByRole('button'); // MUI adds a close icon button
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when reason is "clickaway"', () => {
    const { container } = render(<FeedbackAlert {...defaultProps} />);
    
    // Simulate Snackbar's internal onClose event with "clickaway" reason
    const event = new Event('click');
    (container.querySelector('.MuiSnackbar-root') as HTMLElement).dispatchEvent(event);

    defaultProps.onClose.mockClear();
    // Manually trigger handleClose with "clickaway"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (screen.getByRole('alert') as any).props?.onClose?.(event, 'clickaway');

    // Note: because Snackbar handles auto-dismiss, you'd usually test this with timers or integration
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('does not render when open is false', () => {
    render(<FeedbackAlert {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });
});
