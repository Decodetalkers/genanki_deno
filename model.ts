import * as Mustache from "./mustache.ts";

import { cached_property } from "@nobody/cached-property";

/**
 * Field information in model, please read the wiki of anki
 */
export interface AnkiModelFld {
  name: string;
  font?: string;
  media?: string[];
  rtl?: boolean;
  size?: number;
  sticky?: boolean;
}

interface AnkiModelFldReal {
  name: string;
  font: string;
  media: string[];
  ord: number;
  rtl: boolean;
  size: number;
  sticky: boolean;
}

interface AnkiModelTmplReal {
  afmt: string;
  bafmt: string;
  bqfmt: string;
  did: number | null;
  name: string;
  ord: number;
  qfmt: string;
}
/*
 * Field template in model, please read the wiki of anki
 */
export interface AnkiModelTemplate {
  afmt?: string;
  bafmt?: string;
  bqfmt?: string;
  did?: number | null;
  name: string;
  ord?: number;
  qfmt?: string;
}

const DEFAULT_LATEX_PRE = `
  \\documentclass[12pt]{article}
  \\special{papersize=3in,5in}
  \\usepackage[utf8]{inputenc}
  \\usepackage{amssymb,amsmath}
  \\pagestyle{empty}
  \\setlength{
    \\parindent}{0in}
  \\begin{document}
`;

const DEFAULT_LATEX_POST = `
  \\end{document}
`;

/**
 * 0 is standard, 1 for cloze
 */
export type AnkiModelType = 0 | 1;

/**
 * CLOSE_TYPE of ANKI
 */
const CLOSE_TYPE: AnkiModelType = 0;

/**
 * STANDER_TYPE for ANKI
 */
const STANDER_TYPE: AnkiModelType = 1;

export { CLOSE_TYPE, STANDER_TYPE };

/*
 * Describe what a model need, base type
 */
export default interface AnkiModel {
  /**
   * css in model
   */
  css: string;
  /**
   * the name of model
   */
  readonly name: string;
  /**
   * The unique id of model
   */
  readonly id: number;
  /**
   * the type of model
   */
  readonly model_type: AnkiModelType;
  readonly req: [number, string, number[]][];
  readonly sortf: number;
  latexPre: string;
  latexPost: string;
  templates: AnkiModelTemplate[];
  flds: AnkiModelFld[];
  /**
   * Generate the data
   * NOTE: do not use it, it will be auto used when be exported to database
   */
  // deno-lint-ignore no-explicit-any
  to_json: (timestamp: number, deck_id: number) => any;
}

/*
 * The most base model , whose css is empty
 */
export class AnkiModelBase implements AnkiModel {
  css: string = "";
  readonly name: string;
  readonly model_type: AnkiModelType;
  readonly id: number;
  readonly sortf: number = 0;
  latexPre: string = DEFAULT_LATEX_PRE;
  latexPost: string = DEFAULT_LATEX_POST;
  templates: AnkiModelTemplate[] = [];
  _req: [number, string, number[]][] = []; // what is this?
  flds: AnkiModelFld[] = [];

  constructor(
    id: number,
    name: string,
    model_type: AnkiModelType,
    fields?: AnkiModelFld[],
    templates?: AnkiModelTemplate[],
    sortf?: number,
  ) {
    this.name = name;
    this.id = id;
    this.model_type = model_type;
    if (fields) {
      this.flds = fields;
    }
    if (templates) {
      this.templates = templates;
    }
    if (sortf) {
      this.sortf = sortf;
    }
  }

  /**
   * NOTE: I do not know that is this. wiki does know too
   */
  @cached_property
  get req(): [number, string, number[]][] {
    const sentinel = "SeNtInEl";
    const fieldNames = this.flds.map((field) => field.name);
    const req: [number, string, number[]][] = [];

    this.templates.forEach((template, templateOrd) => {
      const requiredFields: number[] = [];

      fieldNames.forEach((field, fieldOrd) => {
        const fieldValues = Object.fromEntries(
          fieldNames.map((name) => [name, sentinel]),
        );
        fieldValues[field] = "";
        const rendered = Mustache.render(
          template.qfmt || "",
          fieldValues,
        );
        if (!rendered.includes(sentinel)) {
          requiredFields.push(fieldOrd);
        }
      });

      if (requiredFields.length) {
        req.push([templateOrd, "all", requiredFields]);
      } else {
        fieldNames.forEach((field, fieldOrd) => {
          const fieldValues = Object.fromEntries(
            fieldNames.map((name) => [name, ""]),
          );
          fieldValues[field] = sentinel;

          const rendered = Mustache.render(
            template.qfmt || "",
            fieldValues,
          );
          if (rendered.includes(sentinel)) {
            requiredFields.push(fieldOrd);
          }
        });

        if (!requiredFields.length) {
          throw new Error(
            `Could not compute required fields for this template; please check the formatting of "qfmt": ${template.qfmt}`,
          );
        }

        req.push([templateOrd, "any", requiredFields]);
      }
    });
    this._req = req;

    return req;
  }

  /**
   * Add new field to model
   */
  append_fields(fields: AnkiModelFld) {
    this.flds.push(fields);
  }

  appendTemplate(template: AnkiModelTemplate) {
    this.templates.push(template);
  }

  /**
   * set the latexPre, please read the wiki
   */
  set_latexPre(latexPre: string) {
    this.latexPre = latexPre;
  }

  set_latexPost(latexPost: string) {
    this.latexPost = latexPost;
  }

  /**
   * set css, but it is suggested to use the class factory to set css
   */
  set_css(css: string) {
    this.css = css;
  }

  /**
   * Generate the data
   * NOTE: do not use it, it will be auto used when be exported to database
   */
  // deno-lint-ignore no-explicit-any
  to_json(timestamp: number, deck_id: number): any {
    const tmpls = [];
    for (let index = 0; index < this.templates.length; index++) {
      const unit = this.templates[index];
      const tmp: AnkiModelTmplReal = {
        name: unit.name,
        afmt: unit.afmt || "",
        bafmt: unit.bafmt || "",
        bqfmt: unit.bqfmt || "",
        qfmt: unit.qfmt || "",
        did: unit.did || null,
        ord: index,
      };
      tmpls.push(tmp);
    }
    const fields = [];
    for (let index = 0; index < this.flds.length; index++) {
      const element = this.flds[index];
      const tmp: AnkiModelFldReal = {
        name: element.name,
        font: element.font || "Liberation Sans",
        media: element.media || [],
        rtl: element.rtl || false,
        size: element.size || 20,
        sticky: element.sticky || false,
        ord: index,
      };
      fields.push(tmp);
    }
    return {
      css: this.css,
      did: deck_id,
      flds: fields,
      id: this.id.toString(),
      latexPost: this.latexPost,
      latexPre: this.latexPre,
      mod: Math.ceil(timestamp),
      name: this.name,
      req: this.req,
      sortf: this.sortf,
      tags: [],
      tmpls: tmpls,
      type: this.model_type,
      usn: -1,
      vers: [],
    };
  }
}

/*
 * the model factory of AnkiModel
 * pass css into it, and you get a class
 */
export function AnkiModelTemplate(
  css: TemplateStringsArray,
): typeof AnkiModelBase {
  return class extends AnkiModelBase {
    css: string = css.join("");
  };
}
