import { Database } from "sqlite";

const apkg_db_init = (db_name: string) => {
  const db = new Database(db_name);
  db.sql`
CREATE TABLE col (
    id              integer primary key,
    crt             integer not null,
    mod             integer not null,
    scm             integer not null,
    ver             integer not null,
    dty             integer not null,
    usn             integer not null,
    ls              integer not null,
    conf            text not null,
    models          text not null,
    decks           text not null,
    dconf           text not null,
    tags            text not null
);`;

  db.sql`CREATE TABLE notes (
    id              integer primary key,   /* 0 */
    guid            text not null,         /* 1 */
    mid             integer not null,      /* 2 */
    mod             integer not null,      /* 3 */
    usn             integer not null,      /* 4 */
    tags            text not null,         /* 5 */
    flds            text not null,         /* 6 */
    sfld            integer not null,      /* 7 */
    csum            integer not null,      /* 8 */
    flags           integer not null,      /* 9 */
    data            text not null          /* 10 */
);`;
  db.sql`CREATE TABLE cards (
    id              integer primary key,   /* 0 */
    nid             integer not null,      /* 1 */
    did             integer not null,      /* 2 */
    ord             integer not null,      /* 3 */
    mod             integer not null,      /* 4 */
    usn             integer not null,      /* 5 */
    type            integer not null,      /* 6 */
    queue           integer not null,      /* 7 */
    due             integer not null,      /* 8 */
    ivl             integer not null,      /* 9 */
    factor          integer not null,      /* 10 */
    reps            integer not null,      /* 11 */
    lapses          integer not null,      /* 12 */
    left            integer not null,      /* 13 */
    odue            integer not null,      /* 14 */
    odid            integer not null,      /* 15 */
    flags           integer not null,      /* 16 */
    data            text not null          /* 17 */
);`;
  db.sql`
CREATE TABLE revlog (
    id              integer primary key,
    cid             integer not null,
    usn             integer not null,
    ease            integer not null,
    ivl             integer not null,
    lastIvl         integer not null,
    factor          integer not null,
    time            integer not null,
    type            integer not null
);`;
  db.sql`
CREATE TABLE graves (
    usn             integer not null,
    oid             integer not null,
    type            integer not null
);`;
  db.sql`CREATE INDEX ix_notes_usn on notes (usn);`;
  db.sql`CREATE INDEX ix_cards_usn on cards (usn);`;
  db.sql`CREATE INDEX ix_revlog_usn on revlog (usn);`;
  db.sql`CREATE INDEX ix_cards_nid on cards (nid);`;
  db.sql`CREATE INDEX ix_cards_sched on cards (did, queue, due);`;
  db.sql`CREATE INDEX ix_revlog_cid on revlog (cid);`;
  db.sql`CREATE INDEX ix_notes_csum on notes (csum);`;
  return db;
};

export default apkg_db_init;
