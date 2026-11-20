import { render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// The calendar chunk fails to load
vi.mock('../index', () => {
  throw new Error('chunk load failed');
});

import LazyCalendar, {
  preloadCalendar,
  useIdlePreloadCalendar,
} from '../LazyCalendar';

describe('LazyCalendar load failure', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows the error label in place of the calendar, the rest of the tree intact', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <div>
        <span>form</span>
        <LazyCalendar mode="single" errorLabel="Calendar unavailable" />
      </div>
    );
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Calendar unavailable'
    );
    expect(screen.getByText('form')).toBeTruthy();
  });

  it('preloading a failing chunk leaves no unhandled rejection', async () => {
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    preloadCalendar();
    await new Promise((resolve) => setTimeout(resolve, 50));
    process.off('unhandledRejection', unhandled);
    expect(unhandled).not.toHaveBeenCalled();
  });

  it('schedules one idle preload per page', () => {
    const idle = vi.fn();
    vi.stubGlobal('requestIdleCallback', idle);
    renderHook(() => useIdlePreloadCalendar());
    renderHook(() => useIdlePreloadCalendar());
    expect(idle).toHaveBeenCalledTimes(1);
    expect(idle).toHaveBeenCalledWith(preloadCalendar);
    vi.unstubAllGlobals();
  });
});
