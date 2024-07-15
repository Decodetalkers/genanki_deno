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

function any_contains(arr: Array<boolean>) {
  return !arr.some((e) => e == false);
}

function all_contains(arr: Array<boolean>) {
  return !arr.some((e) => e == false);
}

const INVALID_HTML_TAG_RE = new RegExp(
  /<(?!\/?[a-zA-Z0-9]+(?: .*|\/?)>|!--|!\[CDATA\[)(?:.|\n)*?>/g,
);

export default class AnkiNote {
  model: AnkiModel;
  due: number;
  fields: string[] = [];
  _tags: TagList = new TagList();

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

    if (this.model.model_type == CLOSE_TYPE) {
      this._cards = this._clozeCards();
    } else {
      this._cards = this._frontBackCards();
    }

    return this._cards;
  }

  public get tags() {
    return this._tags;
  }

  public set tags(val: string[]) {
    this.tags = new TagList(val);
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

  private _frontBackCards(): AnkiCard[] {
    const rv: AnkiCard[] = [];
    for (const [cardOrd, anyOrAll, requiredFieldOrds] of this.model.req) {
      const op = anyOrAll === "any" ? any_contains : all_contains;
      if (op(requiredFieldOrds.map((ord) => this.fields[ord] != undefined))) {
        rv.push(new AnkiCard(cardOrd));
      }
    }
    return rv;
  }

  private _clozeCards(): AnkiCard[] {
    const cardOrds: Set<number> = new Set();
    const clozeReplacements = new Set(
      [
        ...this.model.templates[0].qfmt.matchAll(
          new RegExp("{{[^}]*?cloze:(?:[^}]?:)*(.+?)}}", "g"),
        ),
        ...this.model.templates[0].qfmt.matchAll(
          new RegExp("<%cloze:(.+?)%>", "g"),
        ),
      ].map((match) => match[1]),
    );
    for (const fieldName of clozeReplacements) {
      const fieldIndex = this.model.flds.findIndex(
        (field) => field.name === fieldName,
      );
      const fieldValue = this.fields[fieldIndex] || "";
      for (
        const match of fieldValue.matchAll(
          new RegExp("{{c(\\d+)::.+?}}", "g"),
        )
      ) {
        cardOrds.add(parseInt(match[1]) - 1);
      }
    }
    if (cardOrds.size === 0) {
      cardOrds.add(0);
    }
    return [...cardOrds].map((ord) => new AnkiCard(ord));
  }

  private _findInvalidHtmlTagsInField(field: string): RegExpMatchArray | null {
    return INVALID_HTML_TAG_RE.exec(field);
  }

  private _checkInvalidHtmlTagsInFields() {
    for (const field of this.fields) {
      const invalidTags = this._findInvalidHtmlTagsInField(field);
      if (invalidTags) {
        console.warn(
          `Field contained the following invalid HTML tags. Make sure you are calling html.escape() if your field data isn't already HTML-encoded: ${
            invalidTags.join(
              " ",
            )
          }`,
        );
      }
    }
  }

  private _checkNumberModelFieldsMatchesNumFields() {
    if (this.model.flds.length !== this.fields.length) {
      throw new Error(
        `Number of fields in Model does not match number of fields in Note: ${this.model} has ${this.model.flds.length} fields, but ${this} has ${this.fields.length} fields.`,
      );
    }
  }
  write_to_db(
    db: Database,
    timestamp: number,
    deck_id: number,
    id_gen: UniqueUid,
  ) {
    this._checkInvalidHtmlTagsInFields();
    this._checkNumberModelFieldsMatchesNumFields();
    db.sql`
      INSERT INTO notes VALUES (
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
