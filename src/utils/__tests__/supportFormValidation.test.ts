import {
  hasSupportFormFieldErrors,
  isValidIsraeliPhone,
  isValidSupportEmail,
  normalizeIsraeliPhoneInput,
  validateSupportFormInput,
} from '../supportFormValidation';

describe('supportFormValidation', () => {
  it('accepts valid reply emails and rejects bad ones', () => {
    expect(isValidSupportEmail('user@example.com')).toBe(true);
    expect(isValidSupportEmail(' bad@example.com ')).toBe(true);
    expect(isValidSupportEmail('not-an-email')).toBe(false);
    expect(isValidSupportEmail('')).toBe(false);
  });

  it('accepts Israeli mobile and landline numbers', () => {
    expect(isValidIsraeliPhone('050-123-4567')).toBe(true);
    expect(isValidIsraeliPhone('0501234567')).toBe(true);
    expect(isValidIsraeliPhone('02-1234567')).toBe(true);
    expect(isValidIsraeliPhone('+972501234567')).toBe(true);
    expect(isValidIsraeliPhone('972501234567')).toBe(true);
    expect(isValidIsraeliPhone('03 555 5555')).toBe(true);
  });

  it('rejects non-Israeli or incomplete phone numbers', () => {
    expect(isValidIsraeliPhone('123')).toBe(false);
    expect(isValidIsraeliPhone('051234567')).toBe(false);
    expect(isValidIsraeliPhone('0701234567')).toBe(false);
    expect(isValidIsraeliPhone('+441234567890')).toBe(false);
  });

  it('normalizes Israeli phone input to local digits', () => {
    expect(normalizeIsraeliPhoneInput('+972-50-123-4567')).toBe('0501234567');
    expect(normalizeIsraeliPhoneInput('02 123 4567')).toBe('021234567');
  });

  it('requires a message and validates optional fields only when filled', () => {
    expect(
      hasSupportFormFieldErrors(
        validateSupportFormInput({
          category: 'bug',
          message: '',
          replyEmail: '',
          phone: '',
        }),
      ),
    ).toBe(true);

    expect(
      hasSupportFormFieldErrors(
        validateSupportFormInput({
          category: 'question',
          message: 'שאלה על הדף היומי',
          replyEmail: '',
          phone: '',
        }),
      ),
    ).toBe(false);

    const errors = validateSupportFormInput({
      category: 'suggestion',
      message: 'הצעה',
      replyEmail: 'bad',
      phone: '123',
    });
    expect(errors.replyEmail).toBeTruthy();
    expect(errors.phone).toBeTruthy();
  });
});
