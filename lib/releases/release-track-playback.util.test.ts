import { describe, expect, it } from "vitest";
import {
  clampSeekTime,
  formatTrackTime,
  getTrackProgressPercent,
  resolveTogglePlaybackAction,
} from "./release-track-playback.util";

describe("release-track-playback.util", () => {
  describe("resolveTogglePlaybackAction", () => {
    it("returns noop while another track is loading", () => {
      expect(
        resolveTogglePlaybackAction({
          activeTrackIndex: 0,
          loadingTrackIndex: 1,
          targetIndex: 0,
          audioPaused: false,
        }),
      ).toBe("noop");
    });

    it("pauses the active track when audio is playing", () => {
      expect(
        resolveTogglePlaybackAction({
          activeTrackIndex: 2,
          loadingTrackIndex: null,
          targetIndex: 2,
          audioPaused: false,
        }),
      ).toBe("pause");
    });

    it("resumes the active track when audio is paused", () => {
      expect(
        resolveTogglePlaybackAction({
          activeTrackIndex: 2,
          loadingTrackIndex: null,
          targetIndex: 2,
          audioPaused: true,
        }),
      ).toBe("resume");
    });

    it("loads a different track when another track is active", () => {
      expect(
        resolveTogglePlaybackAction({
          activeTrackIndex: 0,
          loadingTrackIndex: null,
          targetIndex: 1,
          audioPaused: false,
        }),
      ).toBe("load");
    });

    it("loads when no track is active yet", () => {
      expect(
        resolveTogglePlaybackAction({
          activeTrackIndex: null,
          loadingTrackIndex: null,
          targetIndex: 0,
          audioPaused: true,
        }),
      ).toBe("load");
    });
  });

  describe("clampSeekTime", () => {
    it("clamps negative values to zero", () => {
      expect(clampSeekTime(-5, 120)).toBe(0);
    });

    it("clamps to duration when provided", () => {
      expect(clampSeekTime(150, 120)).toBe(120);
    });

    it("allows seeking when duration is unknown", () => {
      expect(clampSeekTime(42, 0)).toBe(42);
    });
  });

  describe("formatTrackTime", () => {
    it("formats mm:ss", () => {
      expect(formatTrackTime(83)).toBe("1:23");
      expect(formatTrackTime(0)).toBe("0:00");
    });

    it("handles invalid values", () => {
      expect(formatTrackTime(Number.NaN)).toBe("0:00");
      expect(formatTrackTime(-1)).toBe("0:00");
    });
  });

  describe("getTrackProgressPercent", () => {
    it("returns zero when duration is missing", () => {
      expect(getTrackProgressPercent(30, 0)).toBe(0);
    });

    it("returns bounded progress", () => {
      expect(getTrackProgressPercent(30, 120)).toBe(25);
      expect(getTrackProgressPercent(200, 120)).toBe(100);
    });
  });
});
