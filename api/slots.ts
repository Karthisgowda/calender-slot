import { getSlots } from "../index";

const sendJson = (res: any, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
};

const parseBody = (body: any) => {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const body = parseBody(req.body);
  const from = body.from ? new Date(body.from) : new Date();
  const to = body.to
    ? new Date(body.to)
    : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const timezone = body.timezone || "Asia/Kolkata";

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return sendJson(res, 400, { error: "Invalid date range" });
  }

  try {
    const slots = await getSlots({
      from,
      to,
      slots: Number(body.slots) || 6,
      slotDuration: Number(body.slotDuration) || 30,
      padding: Number(body.padding) || 0,
      days: Array.isArray(body.days) ? body.days.map(Number) : [1, 2, 3, 4, 5],
      daily: {
        timezone,
        from: [Number(body.dailyFromHour) || 9, Number(body.dailyFromMinute) || 0],
        to: [Number(body.dailyToHour) || 18, Number(body.dailyToMinute) || 0],
      },
      strategies: Array.isArray(body.strategies) ? body.strategies : ["linear"],
    });

    return sendJson(res, 200, {
      timezone,
      slots: slots.map((slot) => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
      })),
    });
  } catch (error) {
    return sendJson(res, 500, {
      error:
        (error && typeof error === "object" && "message" in error
          ? (error as { message?: string }).message
          : undefined) || "Unable to generate slots",
    });
  }
}
