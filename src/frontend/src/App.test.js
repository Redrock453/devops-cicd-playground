import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders DevOps CI/CD Playground heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/DevOps CI\/CD Playground/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders technology stack section', () => {
  render(<App />);
  const techStackElement = screen.getByText(/Technology Stack:/i);
  expect(techStackElement).toBeInTheDocument();
});
