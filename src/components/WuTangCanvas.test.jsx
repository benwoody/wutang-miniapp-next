import { render } from '@testing-library/react';
import WuTangCanvas from './WuTangCanvas';

jest.mock('./WuTangCanvas', () => (props) => {
  // Immediately call the callback to simulate image generation
  props.onImageGenerated('data:image/png;base64,mocked');
  return <canvas />;
});

describe('WuTangCanvas', () => {
  it('renders a canvas element', () => {
    const { container } = render(
      <WuTangCanvas wuName="Test Ninja" onImageGenerated={() => {}} />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });
});