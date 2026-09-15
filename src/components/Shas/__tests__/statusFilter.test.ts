import type { StatusFilter } from '../SederFilterBar';

describe('statusFilter types and mapping', () => {
  it('supports all valid status filter values', () => {
    const validStatuses: StatusFilter[] = ['all', 'completed', 'in_progress', 'not_started'];
    expect(validStatuses).toHaveLength(4);
    expect(validStatuses).toContain('all');
    expect(validStatuses).toContain('completed');
    expect(validStatuses).toContain('in_progress');
    expect(validStatuses).toContain('not_started');
  });
});
