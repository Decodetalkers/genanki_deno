import { reset_uid, set_start_uid, uid } from "./uid.ts";

import { assertEquals } from "jsr:@std/assert";

Deno.test(function addTest() {
  set_start_uid(-1);
  assertEquals(uid(), 0);
  assertEquals(uid(), 1);
  assertEquals(uid(), 2);
  reset_uid();
  assertEquals(uid(), 1);
});
