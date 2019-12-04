import { fileLoader, mergeTypes } from 'merge-graphql-schemas';
import * as path from 'path';

const typesArray = fileLoader(path.join(__dirname, './**/*.gql'));

export const typeDefs = mergeTypes(
    typesArray,
    { all: true }
);