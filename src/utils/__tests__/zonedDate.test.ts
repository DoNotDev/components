// packages/components/src/utils/__tests__/zonedDate.test.ts

/**
 * @fileoverview Wall time <-> instant in the app's zone (owner decision 2026-11-25 T1):
 * the same result whatever the machine's zone (process.env.TZ).
 */

import { describe, expect, it } from 'vitest';

import {
  formatWallTime,
  isoToZonedWallTime,
  toZonedCalendarDate,
  zonedWallTimeToISO,
} from '../date';

const MACHINE_ZONES = ['UTC', 'America/Los_Angeles', 'Asia/Tokyo'];

/** Results of `fn` with the process in each machine zone. */
function acrossMachineZones<T>(fn: () => T): T[] {
  const previous = process.env.TZ;
  try {
    return MACHINE_ZONES.map((tz) => {
      process.env.TZ = tz;
      return fn();
    });
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
}

describe('isoToZonedWallTime', () => {
  it('reads an instant as its wall time in the app zone, whatever the machine zone', () => {
    const walls = acrossMachineZones(() =>
      isoToZonedWallTime('2026-11-24T23:30:00.000Z', 'Europe/Paris')
    );
    expect(walls).toEqual(['2026-11-25T00:30', '2026-11-25T00:30', '2026-11-25T00:30']);
    expect(isoToZonedWallTime('2026-11-24T23:30:00+00:00', 'America/New_York')).toBe(
      '2026-11-24T18:30'
    );
    expect(isoToZonedWallTime('not a date', 'Europe/Paris')).toBe('');
  });
});

describe('zonedWallTimeToISO', () => {
  it('stores a wall time as the UTC instant of that time in the app zone', () => {
    const isos = acrossMachineZones(() =>
      zonedWallTimeToISO('2026-11-25T00:30', 'Europe/Paris')
    );
    expect(new Set(isos)).toEqual(new Set(['2026-11-24T23:30:00.000Z']));
    expect(zonedWallTimeToISO('2026-07-01T12:00', 'Europe/Paris')).toBe(
      '2026-07-01T10:00:00.000Z'
    );
    expect(zonedWallTimeToISO('2026-11-24', 'Asia/Seoul')).toBe('2026-11-23T15:00:00.000Z');
  });

  it('round-trips with isoToZonedWallTime', () => {
    for (const zone of ['Europe/Paris', 'America/New_York', 'Asia/Kolkata', 'UTC']) {
      const wall = '2026-03-15T08:45';
      expect(isoToZonedWallTime(zonedWallTimeToISO(wall, zone)!, zone)).toBe(wall);
    }
  });

  it('handles daylight-saving changes (Paris: 29 Mar and 25 Oct 2026)', () => {
    // Clocks forward at 02:00: 02:30 does not exist, it moves forward by the jump
    expect(zonedWallTimeToISO('2026-03-29T02:30', 'Europe/Paris')).toBe(
      '2026-03-29T01:30:00.000Z'
    );
    expect(zonedWallTimeToISO('2026-03-29T01:30', 'Europe/Paris')).toBe(
      '2026-03-29T00:30:00.000Z'
    );
    expect(zonedWallTimeToISO('2026-03-29T03:30', 'Europe/Paris')).toBe(
      '2026-03-29T01:30:00.000Z'
    );
    // Clocks back at 03:00: 02:30 happens twice, the standard-time one is taken
    expect(zonedWallTimeToISO('2026-10-25T02:30', 'Europe/Paris')).toBe(
      '2026-10-25T01:30:00.000Z'
    );
    expect(zonedWallTimeToISO('2026-10-25T01:30', 'Europe/Paris')).toBe(
      '2026-10-24T23:30:00.000Z'
    );
  });

  it('returns null for text that is not a wall time', () => {
    expect(zonedWallTimeToISO('25/11/2026', 'Europe/Paris')).toBeNull();
  });
});

describe('toZonedCalendarDate', () => {
  it('keeps a calendar date; reads an instant as its day in the app zone', () => {
    expect(toZonedCalendarDate('2026-11-24', 'Pacific/Kiritimati')).toBe('2026-11-24');
    expect(toZonedCalendarDate('2026-11-24T23:30:00.000Z', 'Europe/Paris')).toBe('2026-11-25');
    expect(toZonedCalendarDate('2026-11-24T23:30:00.000Z', 'UTC')).toBe('2026-11-24');
  });
});

describe('formatWallTime', () => {
  it('formats the wall time as written, whatever the machine zone', () => {
    const texts = acrossMachineZones(() =>
      formatWallTime({ year: 2026, month: 11, day: 25, hour: 0, minute: 30 }, 'fr', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
    expect(new Set(texts).size).toBe(1);
    expect(texts[0]).toContain('25 novembre 2026');
    expect(texts[0]).toContain('00:30');
  });
});
