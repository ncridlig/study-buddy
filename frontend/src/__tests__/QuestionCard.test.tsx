// __tests__/QuestionCard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import QuestionCard from '@/components/QuestionCard';
import '@testing-library/jest-dom';

describe('QuestionCard', () => {
  const mockQuestion = {
    id: 'q1',
    q: 'What is AI?',
    a: 'Artificial Intelligence',
    // ats: ['Artificial Intelligence', 'Advanced Interface'],
  };

  it('renders the question and answer text', () => {
    render(<QuestionCard question={mockQuestion} />);

    expect(screen.getByText(/^Q: What is AI\?/)).toBeInTheDocument();
    expect(screen.getByText(/^A: Artificial Intelligence/)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<QuestionCard question={mockQuestion} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
