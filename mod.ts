import { Database } from "sqlite";
import AnkiDeck from "./deck.ts";
import apkg_db_init from "./schema.ts";
import UniqueUid from "./uid.ts";

import * as path from "@std/path";

import {
  BlobWriter,
  TextReader,
  Uint8ArrayReader,
  ZipWriter,
} from "@zip-js/zip-js";

export class AnkiPackage {
  decks: Array<AnkiDeck> = [];
  media_files: string[] = [];

  constructor(
    deck_or_decks: Array<AnkiDeck> | AnkiDeck,
    media_files?: string[],
  ) {
    if (deck_or_decks instanceof AnkiDeck) {
      this.decks.push(deck_or_decks);
    } else {
      this.decks = deck_or_decks;
    }
    if (media_files) {
      this.media_files = media_files;
    }
  }

  add_deck(deck: AnkiDeck) {
    this.decks.push(deck);
  }

  async write_to_file(file: string, timestamp?: number) {
    const tmpDir = await Deno.makeTempDir();
    const date_ob = new Date();
    const dbName = date_ob.getTime().toString() + ".db";

    const dbPath = path.join(tmpDir, dbName);

    const db = apkg_db_init(dbPath);
    if (!timestamp) {
      timestamp = date_ob.getTime();
    }
    const id_gen = new UniqueUid(Math.ceil(timestamp * 1000));
    this.write_to_db(db, timestamp, id_gen);

    db.close();

    const dbData = await Deno.readFile(dbPath);
    const zipFileWriter: BlobWriter = new BlobWriter();

    const zipWritter = new ZipWriter(zipFileWriter);
    const dbDataReader = new Uint8ArrayReader(dbData);
    await zipWritter.add("collection.anki2", dbDataReader);

    const media_json: { [index: number]: string } = {};

    for (let index = 0; index < this.media_files.length; index++) {
      const media = this.media_files[index];
      const baseName = path.basename(media);
      media_json[index] = baseName;
      const media_data = await Deno.readFile(media);
      const mvDataReader = new Uint8ArrayReader(media_data);
      await zipWritter.add(baseName, mvDataReader);
    }

    const mediaReader = new TextReader(JSON.stringify(media_json));

    zipWritter.add("media", mediaReader);

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
await apkg_package.write_to_file("hello.apkg");
