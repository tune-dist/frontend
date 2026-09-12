import { describe, expect, it } from 'vitest';
import axios from 'axios';
import { getErrorMessage } from './get-error-message';

describe('getErrorMessage', () => {
  it('prefers genre field errors over the summary toast text', () => {
    const error = {
      isAxiosError: true,
      response: {
        data: {
          message: 'Genre validation failed.',
          errors: [
            {
              field: 'secondaryGenre',
              message: 'Sub-genre is required.',
            },
          ],
        },
      },
    };
    Object.setPrototypeOf(error, axios.AxiosError.prototype);

    expect(getErrorMessage(error)).toBe('Sub-genre is required.');
  });
});
