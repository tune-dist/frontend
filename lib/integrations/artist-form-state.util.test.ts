import { describe, expect, it } from 'vitest';
import {
  artistRosterOptionNames,
  matchingRosterName,
  showArtistRosterSelect,
} from './artist-form-state.util';

const roster = ['Aamir', 'Neha', 'Kabir', 'Riya', 'Dev'];

describe('artist roster select on edit', () => {
  it('shows the roster while editing even when the account is already at the plan limit', () => {
    expect(showArtistRosterSelect({ creatingNew: false, rosterCount: 5 })).toBe(true);
    expect(showArtistRosterSelect({ creatingNew: false, rosterCount: 2 })).toBe(true);
  });

  it('hides the roster only while the user is typing a new artist name', () => {
    expect(showArtistRosterSelect({ creatingNew: true, rosterCount: 5 })).toBe(false);
    expect(showArtistRosterSelect({ creatingNew: false, rosterCount: 0 })).toBe(false);
  });

  it('lists every account artist during edit, including the one already on the release', () => {
    expect(artistRosterOptionNames({ rosterNames: roster, currentName: 'Aamir' })).toEqual(roster);
  });

  it('keeps a saved name that only differs by case, without dropping the other artists', () => {
    expect(artistRosterOptionNames({ rosterNames: roster, currentName: 'aamir' })).toEqual(roster);
    expect(matchingRosterName(roster, 'aamir')).toBe('Aamir');
  });

  it('keeps a release artist that is not on the roster so the saved name stays selected', () => {
    expect(
      artistRosterOptionNames({ rosterNames: roster, currentName: 'Guest DJ' }),
    ).toEqual([...roster, 'Guest DJ']);
    expect(matchingRosterName(roster, 'Guest DJ')).toBe('Guest DJ');
  });
});
