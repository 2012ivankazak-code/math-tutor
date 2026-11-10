import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  validateBookingForm, 
  formatReviewSnippet, 
  getGradeLabel, 
  getTelegramBookingUrl,
  LESSON_PRICING,
  formatPrice,
  getLessonPricing,
  TELEGRAM_USERNAME 
} from './tutorData.ts';

test('getTelegramBookingUrl generates correct link for @youkristin', () => {
  assert.equal(TELEGRAM_USERNAME, 'youkristin');
  const url = getTelegramBookingUrl();
  assert.ok(url.startsWith('https://t.me/youkristin?text='));
  assert.ok(decodeURIComponent(url).includes('ЕГЭ'));
  assert.ok(decodeURIComponent(url).includes('Zoom'));
});

test('getTelegramBookingUrl includes format specific pricing and Zoom info', () => {
  const indUrl = getTelegramBookingUrl(undefined, 'individual');
  const decodedInd = decodeURIComponent(indUrl);
  assert.ok(decodedInd.includes('3 000 ₽'));
  assert.ok(decodedInd.includes('Zoom'));

  const groupUrl = getTelegramBookingUrl(undefined, 'minigroup');
  const decodedGroup = decodeURIComponent(groupUrl);
  assert.ok(decodedGroup.includes('1 500 ₽'));
  assert.ok(decodedGroup.includes('мини-групп'));
  assert.ok(decodedGroup.includes('Zoom'));
});

test('LESSON_PRICING holds correct rates and formats', () => {
  assert.equal(LESSON_PRICING.individual.price, 3000);
  assert.equal(LESSON_PRICING.individual.durationMin, 60);
  assert.equal(LESSON_PRICING.individual.platform, 'Zoom');

  assert.equal(LESSON_PRICING.minigroup.price, 1500);
  assert.equal(LESSON_PRICING.minigroup.durationMin, 60);
  assert.equal(LESSON_PRICING.minigroup.maxStudents, 4);
  assert.equal(LESSON_PRICING.minigroup.platform, 'Zoom');

  assert.equal(formatPrice(3000), '3 000 ₽ / 60 мин');
  assert.equal(formatPrice(1500), '1 500 ₽ / 60 мин');
});

test('validateBookingForm accepts valid ЕГЭ profiles and formats', () => {
  const result = validateBookingForm({
    name: 'Елена',
    phone: '+7 999 123-45-67',
    grade: '11-profile',
    format: 'individual',
    goal: 'Сдать ЕГЭ Профиль на 85+',
  });
  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
});

test('validateBookingForm accepts telegram username and minigroup format', () => {
  const result = validateBookingForm({
    name: 'Алексей',
    phone: '@alex_math',
    grade: '10-ege',
    format: 'minigroup',
  });
  assert.equal(result.isValid, true);
});

test('validateBookingForm catches invalid grade', () => {
  const result = validateBookingForm({
    name: 'Аня',
    phone: '+7 999 000-00-00',
    grade: 'unknown_grade',
  });
  assert.equal(result.isValid, false);
  assert.ok(result.errors.grade);
});

test('getGradeLabel returns correct ЕГЭ labels', () => {
  assert.equal(getGradeLabel('11-profile'), '11 класс — ЕГЭ Профиль (80+ баллов)');
  assert.equal(getGradeLabel('11-base'), '11 класс — ЕГЭ База (сдать на 5)');
});

