import scheduleSource from '@/data/schedules.ugto.2026-1.json';

export const DAY_ORDER = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'] as const;

export type Day = (typeof DAY_ORDER)[number];

export type CourseSession = {
  day: Day;
  start: string;
  end: string;
  room: string;
};

export type CourseEntry = {
  id: number;
  name: string;
  group: string;
  teachers: string[];
  sessions: CourseSession[];
  source_letter_range: string;
};

export type ScheduleSourcePage = {
  letter_range: string;
  url: string;
  updated_at: string;
};

export type ScheduleDataset = {
  period: string;
  updated_at: string;
  source_pages: ScheduleSourcePage[];
  courses: CourseEntry[];
};

export type ScheduleOption = {
  id: string;
  courses: CourseEntry[];
  sessionsByDay: Record<
    Day,
    Array<CourseSession & { courseName: string; group: string; teachers: string[] }>
  >;
};

export type GenerationResult = {
  options: ScheduleOption[];
  totalFound: number;
  truncated: boolean;
  countCapped: boolean;
  selectedCourseNames: string[];
};

export type ConflictCoursePair = {
  leftCourseName: string;
  rightCourseName: string;
  totalGroupPairs: number;
  conflictingGroupPairs: number;
  fullyConflicting: boolean;
  sampleConflictLabels: string[];
};

export type ConflictAnalysis = {
  status: 'idle' | 'clear' | 'warning' | 'impossible';
  selectedCourseNames: string[];
  totalCourses: number;
  totalGroups: number;
  coursePairs: ConflictCoursePair[];
  coursePairsWithConflicts: number;
  fullyConflictingPairs: number;
  comparedGroupPairs: number;
  conflictingGroupPairs: number;
  coursesWithoutGroups: string[];
};

export type FavoriteSchedule = {
  id: string;
  savedAt: string;
  title: string;
  courses: CourseEntry[];
};

const scheduleData = scheduleSource as ScheduleDataset;

export const dataset = scheduleData;

export const allCourses = [...dataset.courses].sort((left, right) => {
  const byName = left.name.localeCompare(right.name, 'es');
  if (byName !== 0) {
    return byName;
  }

  return left.group.localeCompare(right.group, 'es');
});

export const uniqueCourseNames = [...new Set(allCourses.map((course) => course.name))].sort((left, right) =>
  left.localeCompare(right, 'es')
);

const coursesByName = new Map<string, CourseEntry[]>();

for (const course of allCourses) {
  const current = coursesByName.get(course.name) ?? [];
  current.push(course);
  coursesByName.set(course.name, current);
}

export function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function formatTeachers(teachers: string[]) {
  return teachers.join(' · ');
}

export function formatCourseLabel(course: CourseEntry) {
  return `${course.name} · ${course.group}`;
}

export function getCourseOptions(courseName: string) {
  return [...(coursesByName.get(courseName) ?? [])].sort((left, right) => left.group.localeCompare(right.group, 'es'));
}

export function searchCourseNames(query: string, selectedNames: string[], limit = 8) {
  const normalizedQuery = normalizeSearchValue(query);
  const selectedSet = new Set(selectedNames);

  return uniqueCourseNames
    .filter((name) => {
      if (selectedSet.has(name)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return normalizeSearchValue(name).includes(normalizedQuery);
    })
    .slice(0, limit);
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function sessionsConflict(left: CourseSession, right: CourseSession) {
  if (left.day !== right.day) {
    return false;
  }

  return toMinutes(left.start) < toMinutes(right.end) && toMinutes(right.start) < toMinutes(left.end);
}

function coursesConflict(left: CourseEntry, right: CourseEntry) {
  return left.sessions.some((leftSession) => right.sessions.some((rightSession) => sessionsConflict(leftSession, rightSession)));
}

export function analyzeCourseConflicts(selectedCourseNames: string[], hasValidCombination?: boolean): ConflictAnalysis {
  if (selectedCourseNames.length === 0) {
    return {
      status: 'idle',
      selectedCourseNames,
      totalCourses: 0,
      totalGroups: 0,
      coursePairs: [],
      coursePairsWithConflicts: 0,
      fullyConflictingPairs: 0,
      comparedGroupPairs: 0,
      conflictingGroupPairs: 0,
      coursesWithoutGroups: [],
    };
  }

  const optionsPerCourse = selectedCourseNames.map((courseName) => ({
    courseName,
    groups: getCourseOptions(courseName),
  }));

  const coursesWithoutGroups = optionsPerCourse.filter((entry) => entry.groups.length === 0).map((entry) => entry.courseName);
  const coursePairs: ConflictCoursePair[] = [];
  let comparedGroupPairs = 0;
  let conflictingGroupPairs = 0;

  for (let index = 0; index < optionsPerCourse.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < optionsPerCourse.length; otherIndex += 1) {
      const left = optionsPerCourse[index];
      const right = optionsPerCourse[otherIndex];

      if (left.groups.length === 0 || right.groups.length === 0) {
        continue;
      }

      const totalGroupPairs = left.groups.length * right.groups.length;
      let pairConflicts = 0;
      const sampleConflictLabels: string[] = [];

      for (const leftGroup of left.groups) {
        for (const rightGroup of right.groups) {
          comparedGroupPairs += 1;

          if (!coursesConflict(leftGroup, rightGroup)) {
            continue;
          }

          pairConflicts += 1;
          conflictingGroupPairs += 1;

          if (sampleConflictLabels.length < 3) {
            sampleConflictLabels.push(`${leftGroup.group} x ${rightGroup.group}`);
          }
        }
      }

      coursePairs.push({
        leftCourseName: left.courseName,
        rightCourseName: right.courseName,
        totalGroupPairs,
        conflictingGroupPairs: pairConflicts,
        fullyConflicting: totalGroupPairs > 0 && pairConflicts === totalGroupPairs,
        sampleConflictLabels,
      });
    }
  }

  const coursePairsWithConflicts = coursePairs.filter((pair) => pair.conflictingGroupPairs > 0).length;
  const fullyConflictingPairs = coursePairs.filter((pair) => pair.fullyConflicting).length;
  const totalGroups = optionsPerCourse.reduce((sum, entry) => sum + entry.groups.length, 0);

  let status: ConflictAnalysis['status'] = 'clear';

  if (selectedCourseNames.length < 2) {
    status = 'idle';
  } else if (coursesWithoutGroups.length > 0 || hasValidCombination === false) {
    status = 'impossible';
  } else if (coursePairsWithConflicts > 0) {
    status = 'warning';
  }

  return {
    status,
    selectedCourseNames,
    totalCourses: selectedCourseNames.length,
    totalGroups,
    coursePairs,
    coursePairsWithConflicts,
    fullyConflictingPairs,
    comparedGroupPairs,
    conflictingGroupPairs,
    coursesWithoutGroups,
  };
}

function buildSessionsByDay(courses: CourseEntry[]): ScheduleOption['sessionsByDay'] {
  const initial = DAY_ORDER.reduce<ScheduleOption['sessionsByDay']>((accumulator, day) => {
    accumulator[day] = [];
    return accumulator;
  }, {} as ScheduleOption['sessionsByDay']);

  for (const course of courses) {
    for (const session of course.sessions) {
      initial[session.day].push({
        ...session,
        courseName: course.name,
        group: course.group,
        teachers: course.teachers,
      });
    }
  }

  for (const day of DAY_ORDER) {
    initial[day].sort((left, right) => toMinutes(left.start) - toMinutes(right.start));
  }

  return initial;
}

export function buildScheduleOptionFromCourses(courses: CourseEntry[], id?: string): ScheduleOption {
  const sortedCourses = [...courses].sort((left, right) => left.name.localeCompare(right.name, 'es'));

  return {
    id: id ?? sortedCourses.map((course) => `${course.name}:${course.group}`).join('|'),
    courses: sortedCourses,
    sessionsByDay: buildSessionsByDay(sortedCourses),
  };
}

export function createFavoriteSchedule(option: ScheduleOption): FavoriteSchedule {
  const title = option.courses.map((course) => course.group).join(' · ');

  return {
    id: option.id,
    savedAt: new Date().toISOString(),
    title,
    courses: option.courses,
  };
}

export function formatFavoriteExportText(favorite: FavoriteSchedule) {
  const lines = [`${favorite.title}`, '', `Guardado: ${favorite.savedAt}`, ''];

  for (const course of favorite.courses) {
    lines.push(`${course.name} · ${course.group}`);
    lines.push(`Docentes: ${formatTeachers(course.teachers)}`);

    for (const session of course.sessions) {
      lines.push(`- ${session.day} ${session.start}-${session.end} · ${session.room}`);
    }

    lines.push('');
  }

  return lines.join('\n').trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildFavoriteListPage(favorite: FavoriteSchedule) {
  const groupedSessions = favorite.courses
    .map((course) => {
      const sessions = course.sessions
        .map(
          (session) => `
            <li>
              <strong>${escapeHtml(session.day)}</strong>
              <span>${escapeHtml(session.start)} – ${escapeHtml(session.end)}</span>
              <span>${escapeHtml(session.room)}</span>
            </li>
          `
        )
        .join('');

      return `
        <section class="course-card">
          <div class="course-header">
            <div>
              <h3>${escapeHtml(course.name)}</h3>
              <p class="group">Grupo ${escapeHtml(course.group)}</p>
            </div>
            <div class="teachers">${escapeHtml(formatTeachers(course.teachers))}</div>
          </div>
          <ul class="session-list">${sessions}</ul>
        </section>
      `;
    })
    .join('');

  return `
    <section class="page page-break">
      <div class="eyebrow">Comunidad DCI</div>
      <h1>${escapeHtml(favorite.title)}</h1>
      <p class="subtitle">Horario exportado desde la app · ${favorite.courses.length} materias</p>
      <div class="meta-row">
        <div class="meta-pill">Guardado: ${escapeHtml(new Date(favorite.savedAt).toLocaleString('es-MX'))}</div>
        <div class="meta-pill">Formato: Vista lista</div>
      </div>
      ${groupedSessions}
      <div class="footer">Generado por Mtro. Luis Alberto Pérez Martínez</div>
    </section>
  `;
}

function buildFavoriteWeeklyPage(favorite: FavoriteSchedule) {
  const option = buildScheduleOptionFromCourses(favorite.courses, favorite.id);
  const allSessions = favorite.courses.flatMap((course) => course.sessions);
  const startMinutes = allSessions.map((session) => toMinutes(session.start));
  const endMinutes = allSessions.map((session) => toMinutes(session.end));
  const startHour = Math.max(7, Math.floor(Math.min(...startMinutes) / 60));
  const endHour = Math.max(startHour + 1, Math.ceil(Math.max(...endMinutes) / 60));
  const totalRows = endHour - startHour;
  const rowHeight = 78;
  const gridHeight = totalRows * rowHeight;
  const palette = ['#38BDF8', '#8B5CF6', '#22C55E', '#F97316', '#EF4444', '#14B8A6', '#3B82F6', '#E879F9'];
  const courseColors = new Map<string, string>();

  option.courses.forEach((course, index) => {
    courseColors.set(`${course.name}:${course.group}`, palette[index % palette.length]);
  });

  const hourLabels = Array.from({ length: totalRows + 1 }, (_, index) => {
    const hour = startHour + index;
    return `<div class="time-label" style="top:${index * rowHeight - 8}px">${hour.toString().padStart(2, '0')}:00</div>`;
  }).join('');

  const gridLines = Array.from({ length: totalRows + 1 }, (_, index) => {
    const top = index * rowHeight;
    return `<div class="hour-line" style="top:${top}px"></div>`;
  }).join('');

  const dayColumns = DAY_ORDER.map((day) => {
    const sessionBlocks = option.sessionsByDay[day]
      .map((session) => {
        const key = `${session.courseName}:${session.group}`;
        const color = courseColors.get(key) ?? palette[0];
        const top = ((toMinutes(session.start) - startHour * 60) / 60) * rowHeight;
        const height = ((toMinutes(session.end) - toMinutes(session.start)) / 60) * rowHeight;

        return `
          <div class="weekly-block" style="top:${top}px;height:${height}px;background:${color}DD;border-color:${color}">
            <div class="weekly-block-title">${escapeHtml(session.courseName)}</div>
            <div class="weekly-block-meta">${escapeHtml(session.group)} · ${escapeHtml(session.room)}</div>
            <div class="weekly-block-meta">${escapeHtml(session.start)} – ${escapeHtml(session.end)}</div>
          </div>
        `;
      })
      .join('');

    return `
      <div class="weekly-column">
        <div class="weekly-column-header">${escapeHtml(day)}</div>
        <div class="weekly-column-body" style="height:${gridHeight}px">
          ${gridLines}
          ${sessionBlocks}
        </div>
      </div>
    `;
  }).join('');

  const legend = option.courses
    .map((course) => {
      const key = `${course.name}:${course.group}`;
      const color = courseColors.get(key) ?? palette[0];

      return `
        <div class="legend-item">
          <span class="legend-swatch" style="background:${color}"></span>
          <div>
            <div class="legend-title">${escapeHtml(course.name)} · ${escapeHtml(course.group)}</div>
            <div class="legend-meta">${escapeHtml(formatTeachers(course.teachers))}</div>
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <section class="page page-break">
      <div class="eyebrow">Comunidad DCI</div>
      <h1>${escapeHtml(favorite.title)}</h1>
      <p class="subtitle">Vista semanal del horario</p>
      <div class="weekly-layout">
        <div class="time-column" style="height:${gridHeight}px">
          ${hourLabels}
        </div>
        <div class="weekly-grid">${dayColumns}</div>
      </div>
      <div class="legend-block">
        <h2>Materias y profesores por color</h2>
        <div class="legend-list">${legend}</div>
      </div>
      <div class="footer">Generado por Mtro. Luis Alberto Pérez Martínez</div>
    </section>
  `;
}

function buildPdfDocument(content: string) {
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * { box-sizing: border-box; }
          @page { size: A4; margin: 18px; }
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #07111f;
            color: #e8f2ff;
          }
          .page {
            border-radius: 28px;
            padding: 28px;
            background: linear-gradient(180deg, #0b1526 0%, #122238 100%);
            border: 1px solid #1b324d;
            min-height: 1000px;
            page-break-inside: avoid;
          }
          .page-break {
            page-break-after: always;
            margin-bottom: 18px;
          }
          .page-break:last-child {
            page-break-after: auto;
          }
          .eyebrow {
            color: #6ee7ff;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            margin-bottom: 12px;
          }
          h1 {
            margin: 0 0 8px;
            font-size: 32px;
          }
          h2 {
            margin: 0 0 12px;
            font-size: 18px;
          }
          .subtitle {
            color: #91a4bd;
            margin: 0 0 24px;
            font-size: 14px;
          }
          .meta-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 24px;
          }
          .meta-pill {
            background: rgba(110, 231, 255, 0.12);
            color: #6ee7ff;
            border-radius: 999px;
            padding: 8px 14px;
            font-size: 12px;
            font-weight: 600;
          }
          .course-card {
            background: #0e1c31;
            border: 1px solid #19314b;
            border-radius: 18px;
            padding: 18px;
            margin-bottom: 14px;
            box-shadow: 0 12px 32px rgba(2, 6, 23, 0.22);
          }
          .course-header {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: flex-start;
            margin-bottom: 14px;
          }
          h3 {
            margin: 0;
            font-size: 18px;
          }
          .group {
            margin: 6px 0 0;
            color: #91a4bd;
            font-size: 13px;
          }
          .teachers {
            max-width: 260px;
            color: #6ee7ff;
            font-size: 13px;
            text-align: right;
          }
          .session-list { list-style: none; padding: 0; margin: 0; }
          .session-list li {
            display: grid;
            grid-template-columns: 110px 110px 1fr;
            gap: 12px;
            padding: 10px 0;
            border-top: 1px solid #19314b;
            font-size: 13px;
          }
          .session-list li:first-child { border-top: none; padding-top: 0; }
          .weekly-layout {
            display: flex;
            gap: 12px;
            align-items: flex-start;
          }
          .time-column {
            position: relative;
            width: 62px;
          }
          .time-label {
            position: absolute;
            left: 0;
            font-size: 12px;
            color: #91a4bd;
          }
          .weekly-grid {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 8px;
          }
          .weekly-column-header {
            background: #182d47;
            color: #e8f2ff;
            font-size: 12px;
            font-weight: 700;
            text-align: center;
            border-radius: 12px;
            padding: 10px 8px;
            margin-bottom: 8px;
          }
          .weekly-column-body {
            position: relative;
            border-radius: 16px;
            background: #0e1c31;
            border: 1px solid #19314b;
            overflow: hidden;
          }
          .hour-line {
            position: absolute;
            left: 0;
            right: 0;
            border-top: 1px solid #19314b;
          }
          .weekly-block {
            position: absolute;
            left: 6px;
            right: 6px;
            border-radius: 14px;
            border: 1px solid;
            padding: 8px;
            color: #ffffff;
            box-shadow: 0 10px 20px rgba(2, 6, 23, 0.25);
          }
          .weekly-block-title {
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .weekly-block-meta {
            font-size: 10px;
            opacity: 0.96;
          }
          .legend-block {
            margin-top: 22px;
            padding: 18px;
            border-radius: 20px;
            background: #0e1c31;
            border: 1px solid #19314b;
          }
          .legend-list {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .legend-item {
            display: flex;
            gap: 10px;
            align-items: flex-start;
          }
          .legend-swatch {
            width: 14px;
            height: 14px;
            border-radius: 999px;
            margin-top: 4px;
          }
          .legend-title {
            font-size: 13px;
            font-weight: 700;
          }
          .legend-meta {
            font-size: 12px;
            color: #91a4bd;
          }
          .footer {
            margin-top: 24px;
            color: #91a4bd;
            font-size: 12px;
          }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `;
}

export function buildFavoritePdfHtml(favorite: FavoriteSchedule) {
  return buildPdfDocument(`${buildFavoriteListPage(favorite)}${buildFavoriteWeeklyPage(favorite)}`);
}

export function buildFavoritesPdfHtml(favorites: FavoriteSchedule[]) {
  const pages = favorites.map((favorite) => `${buildFavoriteListPage(favorite)}${buildFavoriteWeeklyPage(favorite)}`).join('');
  return buildPdfDocument(pages);
}

export function generateSchedules(selectedCourseNames: string[], limit = 30, countLimit = 500): GenerationResult {
  if (selectedCourseNames.length === 0) {
    return {
      options: [],
      totalFound: 0,
      truncated: false,
      countCapped: false,
      selectedCourseNames,
    };
  }

  const optionsPerCourse = selectedCourseNames
    .map((courseName) => ({ courseName, groups: getCourseOptions(courseName) }))
    .filter((entry) => entry.groups.length > 0)
    .sort((left, right) => left.groups.length - right.groups.length);

  const results: ScheduleOption[] = [];
  let totalFound = 0;
  let countCapped = false;

  function backtrack(index: number, chosen: CourseEntry[]) {
    if (countCapped) {
      return;
    }

    if (index === optionsPerCourse.length) {
      totalFound += 1;

      if (totalFound >= countLimit) {
        countCapped = true;
      }

      if (results.length < limit) {
        results.push(buildScheduleOptionFromCourses(chosen));
      }

      return;
    }

    for (const candidate of optionsPerCourse[index].groups) {
      const hasConflict = chosen.some((existing) => coursesConflict(existing, candidate));

      if (hasConflict) {
        continue;
      }

      chosen.push(candidate);
      backtrack(index + 1, chosen);
      chosen.pop();
    }
  }

  backtrack(0, []);

  return {
    options: results,
    totalFound,
    truncated: totalFound > limit || countCapped,
    countCapped,
    selectedCourseNames,
  };
}

export function filterCourses(query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return allCourses;
  }

  return allCourses.filter((course) => {
    const haystacks = [course.name, course.group, ...course.teachers, ...course.sessions.map((session) => session.room)];
    return haystacks.some((value) => normalizeSearchValue(value).includes(normalizedQuery));
  });
}
