import type { CalendarEvent } from "./types";

/** External action boundary: the agent never talks to calendar providers directly. */
export interface CalendarService {
  readonly provider: "demo" | "google";
  create(event: Omit<CalendarEvent, "id" | "provider">): Promise<CalendarEvent>;
  update(event: CalendarEvent): Promise<CalendarEvent>;
}

export class MockCalendarService implements CalendarService {
  readonly provider = "demo" as const;
  async create(event: Omit<CalendarEvent, "id" | "provider">): Promise<CalendarEvent> { return { ...event, id: crypto.randomUUID(), provider: this.provider }; }
  async update(event: CalendarEvent): Promise<CalendarEvent> { return event; }
}

/**
 * Server-side integration point. Instantiate only after OAuth has supplied a
 * Google access token; the browser stays on the Mock service otherwise.
 */
export class GoogleCalendarService implements CalendarService {
  readonly provider = "google" as const;
  constructor(private accessToken: string, private calendarId = "primary") {}
  private async request(path: string, init: RequestInit) {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}${path}`, { ...init, headers: { Authorization: `Bearer ${this.accessToken}`, "Content-Type": "application/json", ...init.headers } });
    if (!response.ok) throw new Error(`Google Calendar request failed (${response.status})`);
    return response.json();
  }
  async create(event: Omit<CalendarEvent, "id" | "provider">): Promise<CalendarEvent> { const item = await this.request("/events", { method: "POST", body: JSON.stringify({ summary: event.title, start: { dateTime: event.start }, end: { dateTime: event.end } }) }); return { ...event, id: item.id, provider: this.provider }; }
  async update(event: CalendarEvent): Promise<CalendarEvent> { await this.request(`/events/${encodeURIComponent(event.id)}`, { method: "PUT", body: JSON.stringify({ summary: event.title, start: { dateTime: event.start }, end: { dateTime: event.end } }) }); return { ...event, provider: this.provider }; }
}
