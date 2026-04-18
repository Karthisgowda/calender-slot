import moment from "moment-timezone";
import {
  getEventsFromSingleCalendar,
  weightedItemFromArray,
  Slot,
} from "./index";

describe("weightedItemFromArray", () => {
  const originalRandom = Math.random;

  afterEach(() => {
    Math.random = originalRandom;
  });

  it("weights afternoon slots into the candidate pool", () => {
    const slots: Slot[] = [
      {
        start: new Date("2026-04-20T04:00:00.000Z"),
        end: new Date("2026-04-20T04:30:00.000Z"),
      },
      {
        start: new Date("2026-04-20T08:00:00.000Z"),
        end: new Date("2026-04-20T08:30:00.000Z"),
      },
    ];
    Math.random = jest.fn(() => 0.99);

    const slot = weightedItemFromArray(
      {
        from: moment("2026-04-20T00:00:00.000Z"),
        to: moment("2026-04-21T00:00:00.000Z"),
        daily: { timezone: "Asia/Kolkata" },
        weight: 5,
      },
      [...slots],
      ["heavy-afternoons"]
    );

    expect(slot).toEqual(slots[1]);
  });

  it("supports evening and legacy saturday strategies", () => {
    const slots: Slot[] = [
      {
        start: new Date("2026-04-18T04:00:00.000Z"),
        end: new Date("2026-04-18T04:30:00.000Z"),
      },
      {
        start: new Date("2026-04-18T13:00:00.000Z"),
        end: new Date("2026-04-18T13:30:00.000Z"),
      },
    ];
    Math.random = jest.fn(() => 0.99);

    const slot = weightedItemFromArray(
      {
        from: moment("2026-04-18T00:00:00.000Z"),
        to: moment("2026-04-19T00:00:00.000Z"),
        daily: { timezone: "Asia/Kolkata" },
        weight: 5,
      },
      [...slots],
      ["heavy-evenings", "heavy-saturday"]
    );

    expect(slot).toEqual(slots[1]);
  });
});

describe("getEventsFromSingleCalendar", () => {
  it("requests a complete ordered calendar window", async () => {
    const list = jest.fn().mockResolvedValue({ data: { items: [] } });
    const calendar = {
      events: {
        list,
      },
    } as any;

    await getEventsFromSingleCalendar({
      from: moment("2026-04-20T00:00:00.000Z"),
      to: moment("2026-04-21T00:00:00.000Z"),
      calendar,
      calendarId: "primary",
      auth: "token",
    });

    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: "primary",
        auth: "token",
        maxResults: 2500,
        orderBy: "startTime",
        singleEvents: true,
      })
    );
  });
});
