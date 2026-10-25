import { mishnahJoinRoles } from '../mishnahJoin';

describe('mishnahJoinRoles', () => {
  it('marks a single mishnah as solo', () => {
    expect(mishnahJoinRoles([false, true, false])).toEqual([null, 'solo', null]);
  });

  it('joins two consecutive mishnah parts', () => {
    expect(mishnahJoinRoles([true, true, false])).toEqual(['start', 'end', null]);
  });

  it('joins a longer mishnah run', () => {
    expect(mishnahJoinRoles([true, true, true, false, true])).toEqual([
      'start',
      'middle',
      'end',
      null,
      'solo',
    ]);
  });

  it('splits runs when a gap appears between them', () => {
    expect(mishnahJoinRoles([true, true, false, true, true])).toEqual([
      'start',
      'end',
      null,
      'start',
      'end',
    ]);
  });
});
