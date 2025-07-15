'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Project } from '@/types'; // Adjust path if needed

interface CreateTopicModalProps {
  open: boolean;
  onClose: () => void;
  onTopicCreated: (newTopic: Project) => void;
  apiBaseUrl: string;
  authToken: string | undefined;
}

export default function CreateTopicModal({
  open,
  onClose,
  onTopicCreated,
  apiBaseUrl,
  authToken,
}: CreateTopicModalProps) {
  const [newTopic, setNewTopic] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTopic({ ...newTopic, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!newTopic.title) {
      setError('Title is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/topic/topics/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTopic),
      });

      if (response.status !== 201) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to create topic. Status: ${response.status}`);
      }

      const createdTopic: Project = await response.json();
      
      // Call the callback prop to notify the parent component
      onTopicCreated(createdTopic);
      
      // Close the modal
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form state when the modal is closed
  const handleOnClose = () => {
    setError(null);
    setNewTopic({ title: '', description: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleOnClose} fullWidth maxWidth="sm">
      <DialogTitle>Create a New Topic</DialogTitle>
      <DialogContent>
        {error && <Alert data-testid="error-message" severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          required
          margin="dense"
          id="title"
          name="title"
          label="Topic Title"
          type="text"
          fullWidth
          variant="outlined"
          value={newTopic.title}
          onChange={handleInputChange}
          inputProps={{ "data-testid": "title-input" }}
        />
        <TextField
          margin="dense"
          id="description"
          name="description"
          label="Topic Description (Optional)"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={newTopic.description}
          onChange={handleInputChange}
          inputProps={{ "data-testid": "description-input" }}
        />
      </DialogContent>
      <DialogActions sx={{ p: '0 24px 20px' }}>
        <Button onClick={handleOnClose}>Cancel</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          data-testid="create-button"
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}