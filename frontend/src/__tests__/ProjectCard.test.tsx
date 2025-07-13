// __tests__/ProjectCard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectCard from '@/components/ProjectCard';
import '@testing-library/jest-dom';

describe('ProjectCard', () => {
  const mockProject = {
    id: 'abc123',
    title: 'AI Research',
    description: 'Exploring GPT models and LLMs',
  };

  it('renders project title and description', () => {
    render(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText('AI Research')).toBeInTheDocument();
    expect(screen.getByText('Exploring GPT models and LLMs')).toBeInTheDocument();
  });

  it('renders a button linking to the project detail page', () => {
    render(<ProjectCard project={mockProject} />);
    
    const link = screen.getByRole('link', { name: /open project/i });
    expect(link).toHaveAttribute('href', '/dashboard/projects/abc123');
  });

  it('matches snapshot', () => {
    const { container } = render(<ProjectCard project={mockProject} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
