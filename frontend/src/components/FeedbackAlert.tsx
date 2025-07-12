'use client';

import { Snackbar, Alert, AlertColor } from '@mui/material';

interface FeedbackAlertProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
}

export default function FeedbackAlert({ open, message, severity, onClose }: FeedbackAlertProps) {
  // This handler prevents closing the alert if the user clicks away from it
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000} // Alert will disappear after 6 seconds
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Position at the top-center
    >
      {/* The Alert component provides the styling (color, icon) */}
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}