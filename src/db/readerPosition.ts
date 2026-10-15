import { db } from './connection';

const MAX_STORED_POSITIONS = 300;

export function getReaderPosition(positionKey: string): number | null {
  const row = db.getFirstSync(
    'SELECT anchor_index FROM reader_position WHERE position_key = ?',
    [positionKey],
  ) as { anchor_index: number } | null;
  return row ? row.anchor_index : null;
}

export function saveReaderPosition(positionKey: string, anchorIndex: number) {
  db.runSync(
    'INSERT OR REPLACE INTO reader_position (position_key, anchor_index, updated_at) VALUES (?, ?, ?)',
    [positionKey, anchorIndex, Date.now()],
  );
  db.runSync(
    `DELETE FROM reader_position WHERE position_key NOT IN (
      SELECT position_key FROM reader_position ORDER BY updated_at DESC LIMIT ?
    )`,
    [MAX_STORED_POSITIONS],
  );
}

export function clearReaderPosition(positionKey: string) {
  db.runSync('DELETE FROM reader_position WHERE position_key = ?', [positionKey]);
}

export function clearAllReaderPositions() {
  db.runSync('DELETE FROM reader_position');
}
