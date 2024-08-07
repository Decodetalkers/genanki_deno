import type { Database } from "@db/sqlite";
import type UniqueUid from "./uid.ts";
import type AnkiModel from "./model.ts";
import type AnkiNote from "./note.ts";

/**
 * Describe the data of Deck in Anki
 */
export default class AnkiDeck {
  deck_id: number;
  name: string;
  description: string;
  notes: Array<AnkiNote> = [];
  models: Map<number, AnkiModel> = new Map();
  constructor(deck_id: number, name: string, description: string = "") {
    this.deck_id = deck_id;
    this.name = name;
    this.description = description;
  }
  add_note(note: AnkiNote) {
    this.notes.push(note);
  }

  add_model(model: AnkiModel) {
    this.models.set(model.id, model);
  }

  // deno-lint-ignore no-explicit-any
  to_json(): any {
    return {
      collapsed: false,
      conf: 1,
      desc: this.description,
      dyn: 0,
      extendNew: 0,
      extendRev: 50,
      id: this.deck_id,
      lrnToday: [
        163,
        2,
      ],
      mod: 1425278051,
      name: this.name,
      newToday: [
        163,
        2,
      ],
      revToday: [
        163,
        0,
      ],
      timeToday: [
        163,
        23598,
      ],
      usn: -1,
    };
  }

  write_to_db(db: Database, timestamp: number, id_gen: UniqueUid) {
    const [decks_json_str] = db.prepare("SELECT decks FROM col").value<
      [string]
    >()!;
    const decks = JSON.parse(decks_json_str);
    decks[this.deck_id.toString()] = this.to_json();

    db.sql`
      UPDATE col SET decks = ${JSON.stringify(decks)}
    `;

    const [models_json_str] = db.prepare("SELECT models from col").value<
      [string]
    >()!;

    const models = JSON.parse(models_json_str);
    for (const note of this.notes) {
      this.add_model(note.model);
    }

    for (const [_id, model] of this.models) {
      models[model.id.toString()] = model.to_json(timestamp, this.deck_id);
    }
    db.sql`
      UPDATE col SET models = ${JSON.stringify(models)}
    `;

    for (const note of this.notes) {
      note.write_to_db(db, timestamp, this.deck_id, id_gen);
    }
  }
}
