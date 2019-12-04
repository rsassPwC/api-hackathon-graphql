export class Document {
  id: String;
  content: String;
  filetype: String;
  filename: String;
  client: String;
  tag: String;
  [key: string]: any

  constructor(id: String, content: String, filetype: String, filename: String, client: String, tag: String) {
    this.id = id;
    this.content = content;
    this.filetype = filetype;
    this.filename = filename;
    this.client = client;
    this.tag = tag;
  }
}
