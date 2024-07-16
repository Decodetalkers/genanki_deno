import type AnkiModel from "./model.ts";
import { AnkiModelTemplate, STANDER_TYPE } from "./model.ts";

const BuiltinModel = AnkiModelTemplate`.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
}`;

export const BASE_MODEL: AnkiModel = new BuiltinModel(
  1559383000,
  "Basic (genanki)",
  STANDER_TYPE,
  [
    {
      name: "Front",
      font: "Arial",
    },
    {
      name: "Back",
      font: "Arial",
    },
  ],
  [
    {
      name: "Card 1",
      qfmt: "{{Front}}",
      afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}",
    },
  ],
);

export const BASIC_AND_REVERSED_CARD_MODEL: AnkiModel = new BuiltinModel(
  1485830179,
  "Basic (and reversed card) (genanki)",
  STANDER_TYPE,
  [
    {
      name: "Front",
      font: "Arial",
    },
    {
      name: "Back",
      font: "Arial",
    },
  ],
  [
    {
      name: "Card 1",
      qfmt: "{{Front}}",
      afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}",
    },
    {
      name: "Card 2",
      qfmt: "{{Back}}",
      afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Front}}",
    },
  ],
);
