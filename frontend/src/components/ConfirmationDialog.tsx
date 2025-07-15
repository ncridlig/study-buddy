'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress, // Import for the loading indicator
} from '@mui/material';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  contentText: string;
  onClose: () => void;
  onConfirm: () => void;
  isConfirming?: boolean; // ✅ NEW: Prop to indicate the loading state
}

export default function ConfirmationDialog({
  open,
  title,
  contentText,
  onClose,
  onConfirm,
  isConfirming = false, // Destructure the new prop
}: ConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      // Prevent closing the dialog by clicking outside while an action is in progress
      onClose={isConfirming ? () => {} : onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {contentText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {/* Disable the cancel button while the delete is in progress */}
        <Button onClick={onClose} disabled={isConfirming}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          autoFocus
          color="error"
          variant="contained"
          disabled={isConfirming} // ✅ Disable the button when confirming
          sx={{ width: '80px' }} // Set a fixed width to prevent size change
        >
          {/* ✅ Show a spinner when confirming, otherwise show text */}
          {isConfirming ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
