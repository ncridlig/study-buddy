import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateTopicModal from '@/components/CreateTopicModal';

const mockOnClose = jest.fn();
const mockOnTopicCreated = jest.fn();

const defaultProps = {
  open: true,
  onClose: mockOnClose,
  onTopicCreated: mockOnTopicCreated,
  apiBaseUrl: 'http://localhost:8000/api',
  authToken: 'mock-token',
};

describe('CreateTopicModal', () => {
  beforeEach(() => {
    mockOnClose.mockReset();
    mockOnTopicCreated.mockReset();
  });

  it('renders the modal with input fields', () => {
    render(<CreateTopicModal {...defaultProps} />);

    expect(screen.getByLabelText(/topic title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/topic description/i)).toBeInTheDocument();
    expect(screen.getByText(/create/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('shows error if title is missing on create', async () => {
    render(<CreateTopicModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('create-button'));

    expect(await screen.findByTestId('error-message')).toHaveTextContent(/title is required/i);
  });

  it('submits form and calls onTopicCreated when API succeeds', async () => {
    const mockResponse = {
      id: '123',
      title: 'Test Topic',
      description: 'A test topic',
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      status: 201,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    }) as jest.Mock;

    render(<CreateTopicModal {...defaultProps} />);

    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'Test Topic' },
    });
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'A test topic' },
    });

    fireEvent.click(screen.getByTestId('create-button'));

    await waitFor(() => {
      expect(mockOnTopicCreated).toHaveBeenCalledWith(mockResponse);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error when API returns non-201 response', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      status: 400,
      json: jest.fn().mockResolvedValueOnce({ detail: 'Bad request' }),
    }) as jest.Mock;

    render(<CreateTopicModal {...defaultProps} />);

    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'Bad Topic' },
    });

    fireEvent.click(screen.getByTestId('create-button'));

    expect(await screen.findByTestId('error-message')).toHaveTextContent(/bad request/i);
    expect(mockOnTopicCreated).not.toHaveBeenCalled();
  });

  it('resets form and calls onClose when cancel is clicked', () => {
    render(<CreateTopicModal {...defaultProps} />);

    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'Some Topic' },
    });

    fireEvent.click(screen.getByText(/cancel/i));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
