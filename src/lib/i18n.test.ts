import { describe, expect, it } from 'vitest';
import { COPY, localizeActionValue, localizePrescription, resolveLanguage } from './i18n';

describe('language handling', () => {
  it('uses a stored manual preference first', () => {
    expect(resolveLanguage('en', 'de-AT')).toBe('en');
    expect(resolveLanguage('de', 'en-US')).toBe('de');
  });

  it('detects German from the primary browser language and otherwise falls back to English', () => {
    expect(resolveLanguage(null, 'de-AT')).toBe('de');
    expect(resolveLanguage(null, 'fr-FR')).toBe('en');
    expect(resolveLanguage(null)).toBe('en');
  });

  it('localizes stored prescriptions and action values without changing their canonical values', () => {
    expect(localizePrescription('10 / side', 'de')).toBe('10 / Seite');
    expect(localizePrescription('15 reps', 'de')).toBe('15 Wdh.');
    expect(localizeActionValue('Air squat', 'de')).toBe('Kniebeuge');
    expect(localizeActionValue('Air squat', 'en')).toBe('Air squat');
  });

  it('uses five neutral numbered levels in both languages', () => {
    expect(Object.values(COPY.en.levels)).toEqual(['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5']);
    expect(Object.values(COPY.de.levels)).toEqual(['Stufe 1', 'Stufe 2', 'Stufe 3', 'Stufe 4', 'Stufe 5']);
  });
});
