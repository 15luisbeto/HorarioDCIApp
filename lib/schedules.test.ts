import {
  buildScheduleOptionFromCourses,
  formatCourseLabel,
  formatFavoriteExportText,
  formatTeachers,
  normalizeSearchValue,
  type CourseEntry,
  type FavoriteSchedule,
} from './schedules';

const algebraCourse: CourseEntry = {
  id: 1,
  name: 'Álgebra Lineal',
  group: 'A',
  teachers: ['Dra. Ada Lovelace', 'Dr. Alan Turing'],
  sessions: [
    {
      day: 'MIERCOLES',
      start: '11:00',
      end: '12:30',
      room: 'Aula 204',
    },
    {
      day: 'LUNES',
      start: '09:00',
      end: '10:30',
      room: 'Aula 101',
    },
  ],
  source_letter_range: 'A-B',
};

const calculusCourse: CourseEntry = {
  id: 2,
  name: 'Cálculo Diferencial',
  group: 'B',
  teachers: ['Dra. Grace Hopper'],
  sessions: [
    {
      day: 'MARTES',
      start: '08:00',
      end: '10:00',
      room: 'Laboratorio 1',
    },
  ],
  source_letter_range: 'C-D',
};

describe('schedule domain formatting helpers', () => {
  it('normalizes search values by removing accents, lowercasing, and trimming', () => {
    expect(normalizeSearchValue('  Álgebra Ñandú  ')).toBe('algebra nandu');
  });

  it('formats teacher names with the app separator', () => {
    expect(formatTeachers(algebraCourse.teachers)).toBe('Dra. Ada Lovelace · Dr. Alan Turing');
  });

  it('formats course labels with course name and group', () => {
    expect(formatCourseLabel(calculusCourse)).toBe('Cálculo Diferencial · B');
  });
});

describe('schedule option and favorite exports', () => {
  it('builds a schedule option from local fixtures with sorted courses and sessions by day', () => {
    const option = buildScheduleOptionFromCourses([calculusCourse, algebraCourse], 'fixture-option');

    expect(option.id).toBe('fixture-option');
    expect(option.courses.map((course) => course.name)).toEqual(['Álgebra Lineal', 'Cálculo Diferencial']);
    expect(option.sessionsByDay.LUNES).toEqual([
      expect.objectContaining({
        courseName: 'Álgebra Lineal',
        group: 'A',
        start: '09:00',
        end: '10:30',
        room: 'Aula 101',
      }),
    ]);
    expect(option.sessionsByDay.MARTES).toEqual([
      expect.objectContaining({
        courseName: 'Cálculo Diferencial',
        group: 'B',
        start: '08:00',
        end: '10:00',
      }),
    ]);
    expect(option.sessionsByDay.JUEVES).toEqual([]);
  });

  it('formats favorite export text without snapshots or production dataset coupling', () => {
    const favorite: FavoriteSchedule = {
      id: 'favorite-fixture',
      savedAt: '2026-01-15T12:00:00.000Z',
      title: 'Horario A · B',
      courses: [algebraCourse, calculusCourse],
    };

    expect(formatFavoriteExportText(favorite)).toBe(
      [
        'Horario A · B',
        '',
        'Guardado: 2026-01-15T12:00:00.000Z',
        '',
        'Álgebra Lineal · A',
        'Docentes: Dra. Ada Lovelace · Dr. Alan Turing',
        '- MIERCOLES 11:00-12:30 · Aula 204',
        '- LUNES 09:00-10:30 · Aula 101',
        '',
        'Cálculo Diferencial · B',
        'Docentes: Dra. Grace Hopper',
        '- MARTES 08:00-10:00 · Laboratorio 1',
      ].join('\n')
    );
  });
});
