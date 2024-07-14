let origin_uid: number = 0;

let lock = false;

export function reset_uid() {
  lock = false;
  origin_uid = 0;
}

export function set_start_uid(startid: number) {
  if (lock) {
    console.log("you should not set start uid twice");
    return;
  }
  lock = true;
  origin_uid = startid;
}

export function uid() {
  return ++origin_uid;
}
