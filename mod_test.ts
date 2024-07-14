import UniqueUid from "./uid.ts";

import { assertEquals } from "jsr:@std/assert";

Deno.test(function addTest() {
  const uid = new UniqueUid(-1);
  assertEquals(uid.next(), 0);
  assertEquals(uid.next(), 1);
  assertEquals(uid.next(), 2);
  const uid_2 = new UniqueUid();
  assertEquals(uid_2.next(), 1);
});
