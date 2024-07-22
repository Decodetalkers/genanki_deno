# genanki in typescript

[![JSR](https://jsr.io/badges/@nobody/genanki-deno)](https://jsr.io/@nobody/genanki-deno)

just a typescript version of genanki

Min example:

```ts
import {
  AnkiDeck,
  AnkiNote,
  AnkiPackage,
  BuiltinModels,
} from "@nobody/anki-deno";
const BASE_MODEL = BuiltinModels.BASE_MODEL;

const my_deck = new AnkiDeck(
  2059400110,
  "Example Deck",
);

const my_note = new AnkiNote(
  BASE_MODEL,
  "abcd",
  ["What is the capital of France?", "Paris"],
);

my_deck.add_note(my_note);

const min_package = new AnkiPackage(my_deck);

await min_package.write_to_file("abcd.apkg");
```
