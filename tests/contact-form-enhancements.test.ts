import { beforeEach, describe, expect, it } from 'vitest';
import { initContactFormEnhancements } from '../src/lib/contact/formEnhancements';

describe('initContactFormEnhancements', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form data-contact-form>
        <input type="hidden" name="cf-turnstile-response" value="token" />
        <button
          type="submit"
          data-contact-submit
          data-default-label="送信する"
          data-pending-label="送信中..."
        >
          送信する
        </button>
      </form>
    `;
  });

  it('disables the submit button and updates the label while submitting', () => {
    const cleanup = initContactFormEnhancements(document);
    const form = document.querySelector('[data-contact-form]') as HTMLFormElement;
    const button = document.querySelector('[data-contact-submit]') as HTMLButtonElement;

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe('送信中...');
    cleanup();
  });

  it('sets aria-invalid to true while showing field errors', () => {
    document.body.innerHTML = `
      <form data-contact-form>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          data-contact-control
          data-contact-label="メールアドレス"
          aria-errormessage="contact-email-error"
        />
        <p id="contact-email-error" data-contact-field-error></p>
        <input type="hidden" name="cf-turnstile-response" value="token" />
        <button type="submit" data-contact-submit>送信する</button>
      </form>
    `;
    const cleanup = initContactFormEnhancements(document);
    const email = document.querySelector('#contact-email') as HTMLInputElement;
    const error = document.querySelector('#contact-email-error') as HTMLElement;

    email.value = 'not-an-email';
    email.dispatchEvent(new Event('input', { bubbles: true }));

    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(error.textContent).toBe('有効なメールアドレスを入力してください');

    email.value = 'saku@example.com';
    email.dispatchEvent(new Event('input', { bubbles: true }));

    expect(email.hasAttribute('aria-invalid')).toBe(false);
    expect(error.textContent).toBe('');
    cleanup();
  });
});
