import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateTopicModal from './CreateTopicModal';

// Mock the global fetch function
global.fetch = jest.fn();

const mockOnClose = jest.fn();
const mockOnTopicCreated = jest.fn();

const defaultProps = {
  open: true,
  onClose: mockOnClose,
  onTopicCreated: mockOnTopicCreated,
  apiBaseUrl: 'http://localhost:8000',
  authToken: 'test-token-123',
};

describe('CreateTopicModal', () => {

  beforeEach(() => {
    // Clear mock history before each test
    (fetch as jest.Mock).mockClear();
    mockOnClose.mockClear();
    mockOnTopicCreated.mockClear();
  });

  it('renders correctly when open', () => {
    render(<CreateTopicModal {...defaultProps} />);
    
    expect(screen.getByText('Create a New Topic')).toBeInTheDocument();
    expect(screen.getByLabelText(/Topic Title/i)).toBeInTheDocument();
    expect(screen.getByTestId('create-button')).toBeInTheDocument();
  });

  it('calls onClose when the cancel button is clicked', () => {
    render(<CreateTopicModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows a validation error if title is empty on submit', () => {
    render(<CreateTopicModal {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('create-button'));
    
    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('submits the form and calls onTopicCreated on successful API response', async () => {
    const newTopic = { id: '1', title: 'New Test Topic', description: 'A great description' };
    
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => newTopic,
    });

    render(<CreateTopicModal {...defaultProps} />);

    // Act: Fill in the form
    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'New Test Topic' } });
    fireEvent.change(screen.getByTestId('description-input'), { target: { value: 'A great description' } });
    fireEvent.click(screen.getByTestId('create-button'));

    // Assert
    await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('http://localhost:8000/topic/topics/', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ title: 'New Test Topic', description: 'A great description' })
        }));
    });

    await waitFor(() => {
        expect(mockOnTopicCreated).toHaveBeenCalledWith(newTopic);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('displays an error message on API failure', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'Topic with this title already exists.' }),
    });

    render(<CreateTopicModal {...defaultProps} />);

    // Act
    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Duplicate Topic' } });
    fireEvent.click(screen.getByTestId('create-button'));

    // Assert
    const errorMessage = await screen.findByTestId('error-message');
    expect(errorMessage).toHaveTextContent('Topic with this title already exists.');
    
    expect(mockOnTopicCreated).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});