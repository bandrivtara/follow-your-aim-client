export interface IGroupData extends IGroup {
  id: string;
}

export interface IGroup {
  id: string;
  title: string;
  description: string;
  relatedWords: string[];
}

export interface IWordData extends IWord {
  id: string;
}

export interface IWord {
  title: string;
  translation: string;
  example: string;
  description: string;
  group: string;
  progress: number;
}
