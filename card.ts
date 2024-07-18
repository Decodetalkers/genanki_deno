import type { Database } from "@db/sqlite";
import type UniqueUid from "./uid.ts";

/**
 * Describe the card information of Anki
 */
export default class AnkiCard {
  private order: number;
  private suspend: boolean;
  constructor(ord: number, suspend: boolean = false) {
    this.suspend = suspend;
    this.order = ord;
  }
  write_to_db(
    db: Database,
    timestamp: number,
    deck_id: number,
    note_id: number,
    id_gen: UniqueUid,
    due: number = 0,
  ) {
    const queue = this.suspend ? -1 : 0;
    db.sql`
      INSERT INTO cards VALUES (
        ${id_gen.next()},
        ${note_id},
        ${deck_id},
        ${this.order},
        ${Math.ceil(timestamp)},
        -1,
        0,
        ${queue},
        ${due},
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        ''
      );`;
  }
}
