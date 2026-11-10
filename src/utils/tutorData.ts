/**
 * Pure business logic for tutor landing page:
 * - Data models and validation for lead capture
 * - Review item transformations
 * - Diagnostic lesson booking validation
 */

export type LessonFormat = 'individual' | 'minigroup' | 'undecided';

export interface BookingFormData {
  name: string;
  phone: string;
  grade: string;
  format?: LessonFormat;
  goal?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const TELEGRAM_USERNAME = 'youkristin';
export const TELEGRAM_URL = 'https://t.me/youkristin';

export const LESSON_PRICING = {
  individual: {
    key: 'individual' as const,
    title: 'Индивидуальное занятие',
    shortTitle: 'Индивидуально',
    price: 3000,
    priceFormatted: '3 000 ₽',
    durationMin: 60,
    platform: 'Zoom',
    maxStudents: 1,
    description: '1 на 1 с преподавателем. 100% фокус на ваших пробелах и целевых баллах.',
  },
  minigroup: {
    key: 'minigroup' as const,
    title: 'Мини-группа до 4 человек',
    shortTitle: 'Мини-группа (до 4 чел.)',
    price: 1500,
    priceFormatted: '1 500 ₽',
    durationMin: 60,
    platform: 'Zoom',
    maxStudents: 4,
    description: 'Компактная группа равного уровня (до 4 учеников). Мотивация и разбор каждого решения.',
  },
};

export function getLessonPricing(format: 'individual' | 'minigroup') {
  return LESSON_PRICING[format];
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU').replace(/\u00A0/g, ' ')} ₽ / 60 мин`;
}

export function getTelegramBookingUrl(text?: string, format?: LessonFormat): string {
  if (text) {
    return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;
  }

  let defaultText = 'Здравствуйте, Кристина Юрьевна! Хочу записаться на подготовку к ЕГЭ по математике в Zoom.';
  if (format === 'individual') {
    defaultText = 'Здравствуйте, Кристина Юрьевна! Хочу записаться на индивидуальные занятия по ЕГЭ в Zoom (3 000 ₽ / 60 мин).';
  } else if (format === 'minigroup') {
    defaultText = 'Здравствуйте, Кристина Юрьевна! Хочу записаться на занятия в мини-группе по ЕГЭ в Zoom (1 500 ₽ / 60 мин).';
  }

  return `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(defaultText)}`;
}

export function validateBookingForm(data: BookingFormData): ValidationResult {
  const errors: Record<string, string> = {};

  const trimmedName = (data.name || '').trim();
  if (!trimmedName) {
    errors.name = 'Пожалуйста, укажите ваше имя';
  } else if (trimmedName.length < 2) {
    errors.name = 'Имя должно содержать не менее 2 символов';
  }

  const rawPhone = (data.phone || '').trim();
  const isPhone = /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/.test(rawPhone.replace(/\s+/g, ''));
  const isTelegram = /^@[a-zA-Z0-9_]{3,}$/.test(rawPhone);

  if (!rawPhone) {
    errors.phone = 'Укажите номер телефона или ник в Telegram';
  } else if (!isPhone && !isTelegram && rawPhone.replace(/\D/g, '').length < 10) {
    errors.phone = 'Укажите корректный номер (+7 999 123-45-67) или Telegram (@username)';
  }

  const validGrades = ['10-ege', '11-profile', '11-base', 'retake'];
  if (!data.grade || !validGrades.includes(data.grade)) {
    errors.grade = 'Выберите класс или формат подготовки к ЕГЭ';
  }

  const validFormats: (LessonFormat | undefined)[] = ['individual', 'minigroup', 'undecided', undefined];
  if (data.format && !validFormats.includes(data.format)) {
    errors.format = 'Выберите корректный формат занятий';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatReviewSnippet(text: string, maxLength: number = 140): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

export function getGradeLabel(gradeKey: string): string {
  switch (gradeKey) {
    case '11-profile':
      return '11 класс — ЕГЭ Профиль (80+ баллов)';
    case '11-base':
      return '11 класс — ЕГЭ База (сдать на 5)';
    case '10-ege':
      return '10 класс — Системный старт к ЕГЭ';
    case 'retake':
      return 'Пересдача / Повышение балла ЕГЭ';
    default:
      return 'Подготовка к ЕГЭ по математике';
  }
}

