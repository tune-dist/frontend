import { describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { applyUploadApiErrors } from './upload-api-errors';

describe('applyUploadApiErrors', () => {
  it('maps genre field errors to the credits step and keeps the real message', () => {
    const setError = vi.fn();
    const error = {
      isAxiosError: true,
      response: {
        data: {
          message: 'Genre validation failed.',
          errors: [
            {
              field: 'secondaryGenre',
              message: 'Sub-genre "Boom Bap" is not valid for genre "Pop".',
            },
          ],
        },
      },
    };
    Object.setPrototypeOf(error, axios.AxiosError.prototype);

    const result = applyUploadApiErrors(error, setError);

    expect(result.fieldErrors[0]?.message).toContain('Boom Bap');
    expect(result.globalErrors).toHaveLength(0);
    expect(result.targetStep).toBe(3);
    expect(setError).toHaveBeenCalledWith('secondaryGenre', {
      type: 'server',
      message: 'Sub-genre "Boom Bap" is not valid for genre "Pop".',
    });
  });

  it('sends album track genre errors to the credits step', () => {
    const setError = vi.fn();
    const error = {
      isAxiosError: true,
      response: {
        data: {
          message: 'Genre validation failed.',
          errors: [
            {
              field: 'tracks.1.primaryGenre',
              message: 'Primary genre is required.',
            },
          ],
        },
      },
    };
    Object.setPrototypeOf(error, axios.AxiosError.prototype);

    const result = applyUploadApiErrors(error, setError);

    expect(result.targetStep).toBe(3);
    expect(setError).toHaveBeenCalledWith(
      'tracks.1.primaryGenre',
      expect.objectContaining({ message: 'Primary genre is required.' }),
    );
  });
});
