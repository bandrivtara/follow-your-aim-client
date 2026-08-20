import dayjs from "dayjs";
import {
  buildAppleHealthCallbackUrl,
  buildAppleHealthShortcutUrl,
  parseAppleHealthCallback,
} from "./appleHealthSync";

describe("Apple Health shortcut bridge", () => {
  const now = dayjs("2026-08-20T12:00:00");
  const pending = { nonce: "safe-nonce", createdAt: Date.now() };

  it("builds a callback for the current deployed application path", () => {
    const callback = buildAppleHealthCallbackUrl(
      "https://example.com",
      "/follow-your-aim-client/",
      "safe-nonce",
    );

    expect(callback).toBe(
      "https://example.com/follow-your-aim-client/#/?healthSync=safe-nonce",
    );
    expect(decodeURIComponent(buildAppleHealthShortcutUrl(callback))).toContain(
      callback,
    );
  });

  it("accepts today's steps and active calories", () => {
    expect(
      parseAppleHealthCallback(
        "?healthSync=safe-nonce&date=2026-08-20&steps=10234&activeCalories=543.4",
        pending,
        now,
      ),
    ).toEqual({
      payload: {
        nonce: "safe-nonce",
        date: "2026-08-20",
        steps: 10234,
        activeCalories: 543,
      },
    });
  });

  it("supports localized values returned by Shortcuts", () => {
    expect(
      parseAppleHealthCallback(
        "?healthSync=safe-nonce&date=2026-08-20&steps=10%20234%20steps&activeCalories=543%2C4%20kcal",
        pending,
        now,
      ).payload,
    ).toMatchObject({ steps: 10234, activeCalories: 543 });
  });

  it("recognizes common thousands separators", () => {
    expect(
      parseAppleHealthCallback(
        "?healthSync=safe-nonce&date=2026-08-20&steps=10%2C234&activeCalories=543",
        pending,
        now,
      ).payload,
    ).toMatchObject({ steps: 10234, activeCalories: 543 });
  });

  it("rejects callbacks without the matching local request", () => {
    expect(
      parseAppleHealthCallback(
        "?healthSync=other&date=2026-08-20&steps=10000&activeCalories=500",
        pending,
        now,
      ).error,
    ).toMatch(/не підтверджено/i);
  });

  it("rejects values for another date", () => {
    expect(
      parseAppleHealthCallback(
        "?healthSync=safe-nonce&date=2026-08-19&steps=10000&activeCalories=500",
        pending,
        now,
      ).error,
    ).toMatch(/не за сьогоднішню/i);
  });
});
