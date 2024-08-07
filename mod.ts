/**
 * @module
 *
 * This module contains all types needed to gen apkg
 *
 * @example
 * ```ts
 * import { BuiltinModels ,AnkiDeck, AnkiPackage, AnkiNote } from "@nobody/anki-deno";
 * const BASE_MODEL = BuiltinModels.BASE_MODEL;
 *
 * const my_deck = new AnkiDeck(
 *   2059400110,
 *   "Example Deck",
 * );
 *
 * const my_note = new AnkiNote(
 *   BASE_MODEL,
 *   "abcd",
 *   ["What is the capital of France?", "Paris"],
 * );
 *
 * my_deck.add_note(my_note);
 *
 * const min_package = new AnkiPackage(my_deck);
 *
 * await min_package.write_to_file("abcd.apkg");
 * ```
 */

export * as BuiltinModels from "./builtin_models.ts";

import AnkiCard from "./card.ts";

import AnkiNote from "./note.ts";

import {
  AnkiModelBase,
  AnkiModelTemplate,
  CLOSE_TYPE,
  STANDER_TYPE,
} from "./model.ts";

import type { AnkiModelType } from "./model.ts";

import type AnkiModel from "./model.ts";

import AnkiDeck from "./deck.ts";

import UniqueUid from "./uid.ts";

import AnkiPackage from "./package.ts";

export {
  AnkiCard,
  AnkiDeck,
  AnkiModelBase,
  AnkiModelTemplate,
  AnkiNote,
  AnkiPackage,
  CLOSE_TYPE,
  STANDER_TYPE,
  UniqueUid,
};

export type { AnkiModel, AnkiModelType };
