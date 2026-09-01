import { BadRequestException } from '@nestjs/common';
import { ParseFrenchDatePipe } from './parse-french-date.pipe';

describe('ParseFrenchDatePipe', () => {
  const pipe = new ParseFrenchDatePipe();

  it('returns undefined when no value is given', () => {
    expect(pipe.transform(undefined as unknown as string)).toBeUndefined();
  });

  it('parses a DD/MM/YYYY string into a Date', () => {
    const date = pipe.transform('15/01/2026') as Date;
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(15);
  });

  it('rejects a non-French format', () => {
    expect(() => pipe.transform('2026-01-15')).toThrow(BadRequestException);
  });

  it('rejects an impossible calendar date', () => {
    expect(() => pipe.transform('32/13/2026')).toThrow(BadRequestException);
  });
});
