import { pubsub } from "../../subscriptionManager";
import { Paragraph } from "./paragraph";
const lodash = require("lodash");

const paragraphs: Paragraph[] = [
  new Paragraph("1", "IT-Sicherheitsrichtlinie.docx", "tag1", "Text from Paragraph 1"),
  new Paragraph("2", "IT-Berechtigungskonzept.docx", "tag2", "Text from Paragraph 2 Strategie"),
  new Paragraph("3", "IT-Berechtigungsrichtlinie.docx", "tag3", "Text from Paragraph 3 IT Strategie Test"),
  new Paragraph("4", "IT-Strategie.doc", "tag4", "Text from Paragraph 4 IT Strategie"),
  new Paragraph("5", "IT.doc", "tag5", "Text from Paragraph 5 IT IT"),
];

const synonymMockdata: String = "Berechtigungskonzept Berechtigungsrichtlinie tag1 tag2";

export default {
  Query: {
    paragraph: (root: any, args: any, context: any, info: any) => {
      return lodash.find(paragraphs, { id: args.id });
    },
    paragraphs: (root: any, args: any, context: any, info: any) => {

      const exampleQuery1 = "IT Strategie";
      const exampleQuery2 = "IT Strategie Test";
      const exampleQuery3 = "IT or Strategie"
      const exampleQuery4 = "tag:tag1 or tag:tag2"
      const exampleQuery5 = "IT tag:tag5"

      if (args.filter === exampleQuery1) {
        return [paragraphs[2], paragraphs[3]]
      }

      else if (args.filter === exampleQuery2 && args.includeSynoyms) {
        return paragraphs
      }

      else if (args.filter === exampleQuery2) {
        return [paragraphs[2]]
      }

      else if (args.filter === exampleQuery3) {
        return paragraphs
      }

      else if (args.filter === exampleQuery4) {
        return [paragraphs[0], paragraphs[1]]
      }

      else if (args.filter === exampleQuery5) {
        return [paragraphs[4]]
      }

      else {
        if (!args.filter) {
          return paragraphs;
        }

        if (args.includeSynoyms) {
          args.filter = args.filter + synonymMockdata;
        }

        let regexFilter: { [index: string]: RegExp } = {
          tag: /tag\:([^\s]*)/gm,
        }

        let result: { [index: string]: [string] } = {};
        let filteredParagraphs: Array<Paragraph> = [];
        let filterterms: Array<string> = args.filter.split(" ");

        //manipulating array for and-conjunction
        for (let i = 0; i < filterterms.length - 1; i++) {
          if (filterterms[i] == '&' && i > 0) {
            filterterms[i + 1] = '&' + filterterms[i + 1];
          }
        }
        filterterms = filterterms.filter(term => {
          return term !== '&'
        })

        filterterms.forEach(term => {
          if (term.includes(":")) {
            Object.keys(regexFilter).map(key => {
              let matches;
              while (matches = regexFilter[key].exec(term)) {
                if (!Array.isArray(result[key])) {
                  result[key] = [matches[1]];
                } else {
                  result[key].push(matches[1]);
                }
              }
            });
            if (term[0] == '&') {
              Object.keys(result).map(key => {
                result[key].map((filter: string) => {
                  filteredParagraphs = filteredParagraphs.filter((paragraph: Paragraph) => paragraph[key].includes(filterterms[1].length >= 1 ? filterterms[1] : false));
                });
              });
            }
            else {
              Object.keys(result).map(key => {
                result[key].map((filter: string) => {
                  filteredParagraphs = [...filteredParagraphs, ...paragraphs.filter((paragraph: Paragraph) => paragraph[key].includes(filter))];
                });
              });
            }

          } else {
            if (term.length > 0) {
              if (term[0] == '&') {
                filteredParagraphs = filteredParagraphs.filter((paragraph: Paragraph) =>
                  paragraph.content.includes(term)
                  || paragraph.content.includes(term)
                  || paragraph.tag.includes(term)
                )
              } else {
                filteredParagraphs = [...filteredParagraphs,
                ...paragraphs.filter((paragraph: Paragraph) =>
                  paragraph.content.includes(term)
                  || paragraph.content.includes(term)
                  || paragraph.tag.includes(term)
                )
                ];
              }


            }
          }
        });
        return filteredParagraphs.reduce((unique: Array<Paragraph>, item: Paragraph) => unique.includes(item) ? unique : [...unique, item], []);
      }
    }
  },
  Mutation: {
    addParagraph: async (root: any, args: any, context: any, info: any) => {
      const paragraph = new Paragraph(args.input.id, args.input.isPartOf, args.input.tag, args.input.content);
      pubsub.publish('paragraphAdded', {
        documentAdded: paragraph,
      });
      paragraphs.push(paragraph);
      return paragraph;
    },


  },
  Subscription: {
    documentAdded: {
      subscribe: (root: any, args: any, context: any, info: any) => {
        return pubsub.asyncIterator('documentAdded');
      },
    },
  },

};