import { beforeEach, describe, expect, it } from 'vitest';
import { initContactFormEnhancements } from '../src/lib/contact/formEnhancements';

describe('initContactFormEnhancements', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form data-contact-form>
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
});
