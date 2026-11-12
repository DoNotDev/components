import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSwipeToClose } from '../useSwipeToClose';

/** Dialog-like content: swipe handlers on the container, a label + checkbox and plain text inside. */
function Content() {
  const { ref, ...handlers } = useSwipeToClose({ onClose: () => {} });
  return (
    <div ref={ref} data-testid="content" {...handlers}>
      <button id="remember" type="button" />
      <label htmlFor="remember">Remember me</label>
      <p>Body text</p>
    </div>
  );
}

describe('useSwipeToClose pointer capture', () => {
  let capture: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    capture = vi.fn();
    // jsdom has no pointer capture
    HTMLElement.prototype.setPointerCapture = capture as never;
  });

  it('never captures a mouse press (labels and clicks keep their target)', () => {
    render(<Content />);
    fireEvent.pointerDown(screen.getByText('Remember me'), { pointerType: 'mouse', pointerId: 1 });
    fireEvent.pointerDown(screen.getByText('Body text'), { pointerType: 'mouse', pointerId: 1 });
    expect(capture).not.toHaveBeenCalled();
  });

  it('does not capture a touch on a label', () => {
    render(<Content />);
    fireEvent.pointerDown(screen.getByText('Remember me'), { pointerType: 'touch', pointerId: 1 });
    expect(capture).not.toHaveBeenCalled();
  });

  it('still captures a touch on non-interactive content (swipe works)', () => {
    render(<Content />);
    fireEvent.pointerDown(screen.getByText('Body text'), { pointerType: 'touch', pointerId: 1 });
    expect(capture).toHaveBeenCalledWith(1);
  });
});
