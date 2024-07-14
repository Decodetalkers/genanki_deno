import apkg_db_init from "./schema.ts";

const db = apkg_db_init("test.db");

const [version] = db.prepare("select sqlite_version()").value<[string]>()!;
console.log(version);

db.close();
