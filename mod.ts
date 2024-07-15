import { Database } from "sqlite";
import AnkiDeck from "./deck.ts";
import apkg_db_init from "./schema.ts";
import UniqueUid from "./uid.ts";

import { BlobWriter, Uint8ArrayReader, ZipWriter } from "@zip-js/zip-js";

export class AnkiPackage {
  decks: Array<AnkiDeck> = [];

  constructor(deck_or_decks: Array<AnkiDeck> | AnkiDeck) {
    if (deck_or_decks instanceof AnkiDeck) {
      this.decks.push(deck_or_decks);
    } else {
      this.decks = deck_or_decks;
    }
  }

  add_deck(deck: AnkiDeck) {
    this.decks.push(deck);
  }

  async write_to_file(file: string, timestamp?: number) {
    const db = apkg_db_init("tmp.db");
    if (!timestamp) {
      const date_ob = new Date();
      timestamp = date_ob.getTime();
    }
    const id_gen = new UniqueUid(Math.ceil(timestamp * 1000));
    this.write_to_db(db, timestamp, id_gen);

    db.close();

    const dbData = await Deno.readFile("tmp.db");
    const zipFileWriter: BlobWriter = new BlobWriter();

    const zipWritter = new ZipWriter(zipFileWriter);
    const dbDataReader = new Uint8ArrayReader(dbData);
    await zipWritter.add("collection.anki2", dbDataReader);

    zipWritter.close();

    const zipFileBlob: Blob = await zipFileWriter.getData();

    await Deno.writeFile(file, zipFileBlob.stream());
  }

  private write_to_db(db: Database, timestamp: number, id_gen: UniqueUid) {
    for (const deck of this.decks) {
      deck.write_to_db(db, timestamp, id_gen);
    }
  }
}

const deck = new AnkiDeck(1000, "ehllo", "bbb");
const apkg_package = new AnkiPackage(deck);
await apkg_package.write_to_file("hello.apkg")
