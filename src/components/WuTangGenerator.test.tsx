import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import WuTangGenerator from './WuTangGenerator';
import '@testing-library/jest-dom';

// Mock the Farcaster SDK
jest.mock('@farcaster/frame-sdk', () => ({
  sdk: {
    actions: {
      ready: jest.fn().mockResolvedValue(undefined),
      composeCast: jest.fn().mockResolvedValue(undefined),
    },
    context: {
      user: {
        username: 'testuser'
      }
    }
  }
}));

// Mock the name generator
jest.mock('@/lib/wu-names', () => ({
  generateWuTangName: (username: string) => `Wu-${username}`,
}));

describe('WuTangGenerator', () => {
  it('renders the generator button', () => {
    render(<WuTangGenerator />);
    expect(screen.getByText('Enter the Wu-Tang')).toBeInTheDocument();
  });

  it('shows username when loaded', async () => {
    await act(async () => {
      render(<WuTangGenerator />);
    });

    expect(await screen.findByText('testuser')).toBeInTheDocument();
  });

  it('shows the Share to Farcaster button after generating', async () => {
    await act(async () => {
      render(<WuTangGenerator />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Enter the Wu-Tang/i));
    });

    expect(await screen.findByText(/Share to Farcaster/i)).toBeInTheDocument();
  });
});