export class Paragraph {
  id: String;
  isPartOf: String;
  tag: String;
  content: String;
  [key: string]: any

  constructor(id: String, isPartOf: String, tag: String, content: String) {
    this.id = id;
    this.isPartOf = isPartOf;
    this.tag = tag;
    this.content = content;
  }
}