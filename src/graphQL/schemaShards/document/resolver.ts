import { UserInputError } from 'apollo-server'
import { pubsub } from "../../subscriptionManager";
import { Document } from "./document";
const lodash = require("lodash");

const documents: Document[] = [
    new Document("1", "Text from Document with IT-Sicherheitsrichtlinie", "docx", "IT-Sicherheitsrichtlinie.docx", "NordLB", "tag1"),
    new Document("2", "Text from Document with IT-Berechtigungskonzept", "doc", "IT-Berechtigungskonzept.docx", "LBB", "tag2"),
    new Document("3", "Text from Document with IT-Berechtigungsrichtlinie", "docx", "IT-Berechtigungsrichtlinie.docx", "Sparkasse", "tag3"),
    new Document("4", "Text from Document with IT-Strategie", "doc", "IT-Strategie.doc", "TAB", "tag4"),
    new Document("5", "Text from Document with IT-Strategie Test", "doc", "IT-Test-Strategie2.doc", "TAB", "tag5"),
    new Document("6", "Text from Document with Test-Strategie", "doc", "Test-Strategie3.doc", "TAB", "tag5")
];

export default {
    Query: {
        document: (root: any, args: any, context: any, info: any) => {
            return lodash.find(documents, { id: args.id });
        },
        documents: (root: any, args: any, context: any, info: any) => {
            let regexFilter: { [index: string]: RegExp } = {
                tag: /tag\:([^\s]*)/gm,
                filename: /filename\:([^\s]*)/gm,
                filetype: /filetype\:([^\s]*)/gm,
                client: /client\:([^\s]*)/gm,
            }

            let result: { [index: string]: [string] } = {};
            let filteredDocuments: Array<Document> = [];
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
                    if (term[0] == '&') { //and-conjunction
                        Object.keys(result).map(key => {
                            result[key].map((filter: string) => {
                                filteredDocuments = filteredDocuments.filter((document: Document) => document[key].includes(filterterms[1].length >= 1 ? filterterms[1] : false));
                            });
                        });
                    }
                    else {
                        Object.keys(result).map(key => {
                            result[key].map((filter: string) => {
                                filteredDocuments = [...filteredDocuments, ...documents.filter((document: Document) => document[key].includes(filter))];
                            });
                        });
                    }

                } else {
                    if (term.length > 0) {
                        if (term[0] == '&') {
                            filteredDocuments = filteredDocuments.filter((document: Document) =>
                                document.content.includes(term.substring(1))
                                || document.filetype.includes(term.substring(1))
                                || document.filename.includes(term.substring(1))
                                || document.client.includes(term.substring(1))
                                || document.tag.includes(term.substring(1))
                            )
                        }
                        else {
                            filteredDocuments = [...filteredDocuments,
                            ...documents.filter((document: Document) =>
                                document.content.includes(term)
                                || document.filetype.includes(term)
                                || document.filename.includes(term)
                                || document.client.includes(term)
                                || document.tag.includes(term)
                            )
                            ];
                        }

                    }
                }
            });
            return filteredDocuments.reduce((unique: Array<Document>, item: Document) => unique.includes(item) ? unique : [...unique, item], []);
        }
    },
    Mutation: {
        addDocument: async (root: any, args: any, context: any, info: any) => {
            const document = new Document(args.input.id, args.input.content, args.input.filetype, args.input.client, args.input.filename, args.input.tag);
            pubsub.publish('documentAdded', {
                documentAdded: document,
            });
            documents.push(document);
            return document;
        },
        addFile: async (root: any, args: any, context: any, info: any) => {
            //send args.input.fileContent to backend
            //receive response from backend 
            if (!args.input.fileContent) {
                throw new UserInputError("Upload failed: No File Uploaded")
            }

            return {
                message: "File successfully uploaded"
            }
        }
    },
    Subscription: {
        documentAdded: {
            subscribe: (root: any, args: any, context: any, info: any) => {
                return pubsub.asyncIterator('documentAdded');
            },
        },
    },

};