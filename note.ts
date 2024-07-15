import { Database } from "sqlite";
import AnkiModel from "./model.ts";
import UniqueUid from "./uid.ts";
import { CLOSE_TYPE } from "./model.ts";
import AnkiCard from "./card.ts";

class TagList extends Array<string> {
  static validateTag(tag: string) {
    if (tag.includes(" ")) {
      throw new Error(`Tag "${tag}" contains a space; this is not allowed!`);
    }
  }

  constructor(tags: string[] = []) {
    super();
    this.push(...tags);
  }

  push(...items: string[]): number {
    items.forEach(TagList.validateTag);
    return super.push(...items);
  }

  splice(start: number, deleteCount: number, ...items: string[]): string[] {
    items.forEach(TagList.validateTag);
    return super.splice(start, deleteCount, ...items);
  }
}

const INVALD_HTML_TAG_RE = new RegExp(
  "<(?!/?[a-zA-Z0-9]+(?: .*|/?)>|!--|!\[CDATA\[)(?:.|\n)*?>",
);

function fix_deprecated_model(model: AnkiModel, fields: string[]) {
  const fixed_fields = fields;
  if (model.model_type == CLOSE_TYPE && fields.length == 1) {
    fixed_fields.push("");
  }
  return fixed_fields;
}

export default class AnkiNote {
  model: AnkiModel;
  due: number;
  fields: string[] = [];
  tags: string[] = [];

  guid: string;
  _sorted_field?: number;

  private card_cached: boolean = false;
  private _cards: AnkiCard[] = [];
  constructor(model: AnkiModel, guid: string, due: number) {
    this.model = model;
    this.due = due;
    this.guid = guid;
  }

  append_field(field: string) {
    this.fields.push(field);
  }

  public get cards(): AnkiCard[] {
    if (this.card_cached) {
      return this._cards;
    }
    this.card_cached = true;
    this._cards = []; // todo;
    return this._cards;
  }

  public get sorted_field(): number {
    return this._sorted_field ? this._sorted_field : this.model.sortf;
  }

  public set sorted_field(field: number) {
    this._sorted_field = field;
  }

  public get format_tags(): string {
    return " " + this.tags.join(" ") + " ";
  }

  public get format_fields(): string {
    return this.fields.join("\x1f");
  }

  write_to_db(
    db: Database,
    timestamp: number,
    deck_id: number,
    id_gen: UniqueUid,
  ) {
    this.fields = fix_deprecated_model(this.model, this.fields); // ??

    db.sql`
      INSERT INTO notes (
        ${id_gen.next()},
        ${this.guid},
        ${this.model.id},
        ${Math.ceil(timestamp)},
        -1,
        ${this.format_tags},
        ${this.format_fields},
        0,
        0,
        '',
      )`;
    const node_id = db.lastInsertRowId;
    for (const card of this.cards) {
      card.write_to_db(db, timestamp, deck_id, node_id, id_gen, this.due);
    }
  }
}
