import { Database } from "sqlite";
import UniqueUid from "./uid.ts";

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
      INSERT INTO cards (
        ${id_gen.next()},           # id
        ${note_id},                 # nid
        ${deck_id},                 # did
        ${this.order},              # ord
        ${Math.ceil(timestamp)},    # mod
        -1,                         # usn
        0,                          # type (=0 for non-Cloze)
        ${queue},                   # queue
        ${due},                     # due
        0,                          # ivl
        0,                          # factor
        0,                          # reps
        0,                          # lapses
        0,                          # left
        0,                          # odue
        0,                          # odid
        0,                          # flags
        "",                         # data
      );
      `;
  }
}
