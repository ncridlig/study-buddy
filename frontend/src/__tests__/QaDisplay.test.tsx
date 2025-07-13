// __tests__/QaDisplay.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QaDisplay from '@/components/QaDisplay';
import '@testing-library/jest-dom';

// Mock QuestionCard
jest.mock('@/components/QuestionCard', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ question }: { question: any }) => <div data-testid="question-card">{question.text}</div>,
}));

describe('QaDisplay', () => {
  const onGenerateMock = jest.fn();

const mockQuestions = [
  {
    id: 'q1',
    q: 'What is AI?',
    a: 'Artificial Intelligence',
    ats: ['Artificial Intelligence', 'Advanced Interface'],
  },
  {
    id: 'q2',
    q: 'Define ML',
    a: 'Machine Learning',
    ats: ['Machine Learning', 'Manual Learning'],
  },
];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no questions exist', () => {
    render(
      <QaDisplay
        questions={[]}
        onGenerate={onGenerateMock}
        isLoading={false}
        isGenerating={false}
      />
    );

    expect(screen.getByText(/No questions yet/i)).toBeInTheDocument();
  });

  it('renders a list of QuestionCards', () => {
    render(
      <QaDisplay
        questions={mockQuestions}
        onGenerate={onGenerateMock}
        isLoading={false}
        isGenerating={false}
      />
    );

    const cards = screen.getAllByTestId('question-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('What is AI?')).toBeInTheDocument();
    expect(screen.getByText('Define machine learning.')).toBeInTheDocument();
  });

  it('disables generate button and shows spinner when isGenerating is true', () => {
    render(
      <QaDisplay
        questions={mockQuestions}
        onGenerate={onGenerateMock}
        isLoading={false}
        isGenerating={true}
      />
    );

    const button = screen.getByRole('button', { name: /generating/i });
    expect(button).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('calls onGenerate when button is clicked', () => {
    render(
      <QaDisplay
        questions={mockQuestions}
        onGenerate={onGenerateMock}
        isLoading={false}
        isGenerating={false}
      />
    );

    const button = screen.getByRole('button', { name: /generate questions/i });
    fireEvent.click(button);
    expect(onGenerateMock).toHaveBeenCalledTimes(1);
  });
});
