// __tests__/PdfSidebar.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PdfSidebar from '@/components/PdfSidebar';
import '@testing-library/jest-dom';

describe('PdfSidebar', () => {
const mockFiles = [
  { id: '1', filename: 'Document1.pdf', download_url: 'http://example.com/doc1.pdf' },
  { id: '2', filename: 'Notes.pdf', download_url: 'http://example.com/notes.pdf' },
];


  const onDeleteMock = jest.fn();
  const onUploadMock = jest.fn();

  const renderComponent = (propsOverride = {}) =>
    render(
      <PdfSidebar
        files={mockFiles}
        onDelete={onDeleteMock}
        onUpload={onUploadMock}
        isLoading={false}
        isUploading={false}
        {...propsOverride}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner when isLoading is true', () => {
    renderComponent({ isLoading: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument(); // MUI CircularProgress
  });

  it('renders list of files', () => {
    renderComponent();

    expect(screen.getByText('Document1.pdf')).toBeInTheDocument();
    expect(screen.getByText('Notes.pdf')).toBeInTheDocument();
  });

  it('calls onDelete when delete icon is clicked', () => {
    renderComponent();

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(onDeleteMock).toHaveBeenCalledWith('1');
  });

  it('calls onUpload when upload button is clicked', () => {
    renderComponent();

    const uploadButton = screen.getByRole('button', { name: /upload pdf/i });
    fireEvent.click(uploadButton);

    expect(onUploadMock).toHaveBeenCalled();
  });

  it('shows uploading state and disables upload button', () => {
    renderComponent({ isUploading: true });

    const button = screen.getByRole('button', { name: /uploading/i });
    expect(button).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
