export default class UniqueUid {
  uid: number = 0;
  constructor(uid?: number) {
    if (uid) {
      this.uid = uid;
    }
  }
  next(): number {
    return ++this.uid;
  }
}
