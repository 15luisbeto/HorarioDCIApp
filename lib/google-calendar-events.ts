import { getGoogleCalendarConfig, getScheduleTermValidationMessage } from '@/lib/google-calendar-config';
import { DAY_ORDER, formatTeachers, type Day, type FavoriteSchedule } from '@/lib/schedules';

type GoogleCalendarEventPayload = {
  description: string;
  end: {
    dateTime: string;
    timeZone: string;
  };
  extendedProperties: {
    private: {
      horarioDciApp: string;
      horarioDciFavoriteId: string;
    };
  };
  location: string;
  recurrence: string[];
  start: {
    dateTime: string;
    timeZone: string;
  };
  summary: string;
};

type GoogleCalendarTermOptions = {
  termEndDate: string;
  termStartDate: string;
};

type GoogleCalendarEventListResponse = {
  items?: Array<{ id?: string }>;
};

const DAY_TO_UTC_WEEKDAY: Record<Day, number> = {
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
};

function assertTimeString(value: string, label: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error(`${label} debe tener formato HH:mm.`);
  }
}

function addUtcDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function firstOccurrenceOnOrAfter(termStartDate: string, day: Day) {
  const startDate = new Date(`${termStartDate}T00:00:00.000Z`);
  const daysUntilTarget = (DAY_TO_UTC_WEEKDAY[day] - startDate.getUTCDay() + 7) % 7;

  return toDateString(addUtcDays(startDate, daysUntilTarget));
}

function lastOccurrenceOnOrBefore(termEndDate: string, day: Day) {
  const endDate = new Date(`${termEndDate}T00:00:00.000Z`);
  const daysAfterTarget = (endDate.getUTCDay() - DAY_TO_UTC_WEEKDAY[day] + 7) % 7;

  return toDateString(addUtcDays(endDate, -daysAfterTarget));
}

function toRecurrenceUntil(lastOccurrenceDate: string) {
  const nextUtcDate = addUtcDays(new Date(`${lastOccurrenceDate}T00:00:00.000Z`), 1);

  return nextUtcDate.toISOString().slice(0, 10).replaceAll('-', '') + 'T235959Z';
}

export function buildGoogleCalendarEventPayloads(
  favorite: FavoriteSchedule,
  { termEndDate, termStartDate }: GoogleCalendarTermOptions
): GoogleCalendarEventPayload[] {
  const config = getGoogleCalendarConfig();
  const validationMessage = getScheduleTermValidationMessage(termStartDate, termEndDate);

  if (!config.timeZone) {
    throw new Error('Falta configurar la zona horaria para Google Calendar.');
  }

  if (validationMessage) {
    throw new Error(validationMessage);
  }

  return favorite.courses.flatMap((course) =>
    course.sessions.map((session) => {
      if (!DAY_ORDER.includes(session.day)) {
        throw new Error(`El día ${session.day} no es válido para crear eventos.`);
      }

      assertTimeString(session.start, `La hora de inicio de ${course.name}`);
      assertTimeString(session.end, `La hora de fin de ${course.name}`);

      if (session.start >= session.end) {
        throw new Error(`El horario de ${course.name} tiene una hora de fin inválida.`);
      }

      const eventDate = firstOccurrenceOnOrAfter(termStartDate, session.day);

      if (eventDate > termEndDate) {
        throw new Error(`El periodo académico no incluye ningún ${session.day.toLowerCase()} para ${course.name}.`);
      }

      const lastEventDate = lastOccurrenceOnOrBefore(termEndDate, session.day);

      return {
        description: [`Materia: ${course.name}`, `Grupo: ${course.group}`, `Docente(s): ${formatTeachers(course.teachers) || 'Sin docente registrado'}`].join('\n'),
        end: {
          dateTime: `${eventDate}T${session.end}:00`,
          timeZone: config.timeZone,
        },
        extendedProperties: {
          private: {
            horarioDciApp: 'true',
            horarioDciFavoriteId: favorite.id,
          },
        },
        location: session.room,
        recurrence: [`RRULE:FREQ=WEEKLY;UNTIL=${toRecurrenceUntil(lastEventDate)}`],
        start: {
          dateTime: `${eventDate}T${session.start}:00`,
          timeZone: config.timeZone,
        },
        summary: `${course.name} · ${course.group}`,
      };
    })
  );
}

async function readGoogleError(response: Response) {
  try {
    const errorBody = (await response.json()) as { error?: { message?: string } };
    return errorBody.error?.message ? ` ${errorBody.error.message}` : '';
  } catch {
    return '';
  }
}

async function deletePreviousFavoriteEvents(favorite: FavoriteSchedule, accessToken: string, apiBaseUrl: string) {
  const query = new URLSearchParams({
    maxResults: '250',
    singleEvents: 'false',
  });
  query.append('privateExtendedProperty', 'horarioDciApp=true');
  query.append('privateExtendedProperty', `horarioDciFavoriteId=${favorite.id}`);

  const listResponse = await fetch(`${apiBaseUrl}/calendars/primary/events?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!listResponse.ok) {
    const detail = await readGoogleError(listResponse);
    throw new Error(`Google Calendar no permitió revisar eventos previos.${detail}`);
  }

  const eventList = (await listResponse.json()) as GoogleCalendarEventListResponse;
  const eventIds = (eventList.items ?? []).map((item) => item.id).filter((id): id is string => Boolean(id));

  for (const eventId of eventIds) {
    const deleteResponse = await fetch(`${apiBaseUrl}/calendars/primary/events/${encodeURIComponent(eventId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'DELETE',
    });

    if (!deleteResponse.ok && deleteResponse.status !== 404 && deleteResponse.status !== 410) {
      const detail = await readGoogleError(deleteResponse);
      throw new Error(`Google Calendar no permitió reemplazar un evento previo.${detail}`);
    }
  }
}

export async function syncFavoriteToGoogleCalendar(
  favorite: FavoriteSchedule,
  accessToken: string,
  termOptions: GoogleCalendarTermOptions
) {
  if (!accessToken) {
    throw new Error('Conectá Google Calendar antes de enviar el horario.');
  }

  const config = getGoogleCalendarConfig();
  const eventPayloads = buildGoogleCalendarEventPayloads(favorite, termOptions);

  await deletePreviousFavoriteEvents(favorite, accessToken, config.apiBaseUrl);

  for (const eventPayload of eventPayloads) {
    const response = await fetch(`${config.apiBaseUrl}/calendars/primary/events`, {
      body: JSON.stringify(eventPayload),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      const detail = await readGoogleError(response);

      throw new Error(`Google Calendar rechazó la creación del evento.${detail}`);
    }
  }

  return eventPayloads.length;
}
