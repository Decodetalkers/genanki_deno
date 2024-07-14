export interface AnkiModelFld {
  name: string;
  font?: string;
  media?: string;
  ord?: string;
  rtl?: boolean;
  size?: number;
}

interface AnkiModelTmplPre {
  afmt: string;
  bafmt: string;
  bqfmt: string;
  did: number | null;
  name: string;
  ord: number;
  qfmt: string;
}

export interface AnkiModelTmpl {
  afmt: string;
  bafmt: string;
  bqfmt: string;
  did: number | null;
  name: string;
  ord: number;
  qfmt: string;
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

// 0 is standard, 1 for cloze
export type AnkiModelType = 0 | 1;

const CLOSE_TYPE: AnkiModelType = 0;

const STANDER_TYPE: AnkiModelType = 1;

export { CLOSE_TYPE, STANDER_TYPE };

export default interface AnkiModel {
  css: string;
  readonly name: string;
  readonly id: number;
  readonly model_type: AnkiModelType;
  readonly req: Array<string>;
  readonly sortf: number;
  latexPre: string;
  latexPost: string;
  templates: AnkiModelTmpl[];
  flds: AnkiModelFld[];
  to_json: (timestamp: number, deck_id: number) => void;
}

const AnkiModelBase = AnkiModelTemplate``;

export function AnkiModelTemplate(css: TemplateStringsArray) {
  return class implements AnkiModel {
    css: string = css.join("");
    readonly name: string;
    readonly model_type: AnkiModelType;
    readonly id: number;
    readonly sortf: number;
    latexPre: string = DEFAULT_LATEX_PRE;
    latexPost: string = DEFAULT_LATEX_POST;
    templates: AnkiModelTmpl[] = [];
    readonly req: string[] = []; // what is this?
    flds: AnkiModelFld[] = [];

    constructor(
      id: number,
      name: string,
      model_type: AnkiModelType,
      sortf: number = 0,
    ) {
      this.name = name;
      this.id = id;
      this.model_type = model_type;
      this.sortf = sortf;
    }

    appendTemplate(template: AnkiModelTmpl) {
      this.templates.push(template);
    }

    set_latexPre(latexPre: string) {
      this.latexPre = latexPre;
    }

    set_latexPost(latexPost: string) {
      this.latexPost = latexPost;
    }

    set_css(css: string) {
      this.css = css;
    }

    to_json(timestamp: number, deck_id: number) {
      const tmpls = [];
      for (let index = 0; index < this.templates.length; index++) {
        const unit = this.templates[index];
        const tmp: AnkiModelTmplPre = {
          name: unit.name,
          afmt: unit.afmt,
          bafmt: unit.bafmt,
          bqfmt: unit.bqfmt,
          qfmt: unit.qfmt,
          did: unit.did,
          ord: index,
        };
        tmpls.push(tmp);
      }
    }
  };
}

export { AnkiModelBase };
