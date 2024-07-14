import AnkiModel from "./model.ts";

export default class AnkiNote {
  model: AnkiModel;
  constructor(model: AnkiModel) {
    this.model = model;
  }
}
