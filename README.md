# Calendar Slots

Calendar availability engine for TypeScript projects, with a browser demo and a Vercel-ready API.

## What is included

- Library helpers for finding bookable time slots
- Support for Google Calendar and iCalendar feeds
- A lightweight demo page served from Vercel
- A serverless `POST /api/slots` endpoint for quick testing

## Quick start

Install dependencies and build the library:

```bash
npm install
npm run build
```

Run tests:

```bash
npm test
```

Deploy the demo to Vercel:

```bash
vercel --prod
```

## Library usage

```ts
import { getSlots } from "calendar-slots";

const slots = await getSlots({
  slotDuration: 30,
  slots: 3,
  from: new Date(),
  to: new Date(Date.now() + 1000 * 60 * 60 * 24),
  days: [1, 2, 3, 4, 5],
  daily: {
    timezone: "Asia/Kolkata",
    from: [9],
    to: [18],
  },
});

console.log(slots);
```

## Demo API

Send a `POST` request to `/api/slots` with JSON like this:

```json
{
  "from": "2026-04-18T00:00:00",
  "to": "2026-04-25T23:59:59",
  "timezone": "Asia/Kolkata",
  "slotDuration": 30,
  "slots": 6,
  "padding": 0,
  "days": [1, 2, 3, 4, 5],
  "strategies": ["heavy-mornings"],
  "dailyFromHour": 9,
  "dailyToHour": 18
}
```

Successful responses return:

```json
{
  "timezone": "Asia/Kolkata",
  "slots": [
    {
      "start": "2026-04-20T03:30:00.000Z",
      "end": "2026-04-20T04:00:00.000Z"
    }
  ]
}
```

## Configuration reference

| Key | Type | Description |
| --- | --- | --- |
| `slotDuration` | `number` | Slot duration in minutes |
| `slots` | `number` | Number of recommendations to return |
| `from` | `Date`-like | Start of the search window |
| `to` | `Date`-like | End of the search window |
| `days` | `number[]` | Weekdays to include (`0` is Sunday) |
| `daily.timezone` | `string` | Timezone used for daily limits |
| `daily.from` | `[number, number?, number?]` | Daily start time |
| `daily.to` | `[number, number?, number?]` | Daily end time |
| `padding` | `number` | Minutes to keep between events and slots |
| `strategies` | `Strategy[]` | Biasing rules such as `heavy-mornings` |
| `url` | `string` | iCalendar feed URL |
| `calendarId` | `string` | Google Calendar ID |
| `auth` | `OAuth2Client` | Explicit Google auth client |
| `user.accessToken` | `string` | Google access token |
| `user.refreshToken` | `string` | Google refresh token |
| `slotFilter` | `(slot) => boolean` | Custom filter hook |

## Notable fixes in this refresh

- Afternoon and evening weighting now target the correct hours
- Saturday preferences work with the legacy `heavy-saturday` option
- Google Calendar event fetching now requests a realistic page size and ordered single events
- CI now builds and tests on modern Node versions

## Repository structure

- `index.ts`: calendar slot engine
- `index.spec.ts`: Jest coverage for weighting and event fetching
- `api/slots.ts`: Vercel serverless endpoint
- `demo.html`, `demo.css`, `demo.js`: live demo frontend
- `vercel.json`: Vercel routing and runtime config
