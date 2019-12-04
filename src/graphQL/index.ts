import { mergeTypes } from 'merge-graphql-schemas';
import { gql } from 'apollo-server';
import { typeDefs as shardsTypeDefs } from './schemaShards/typeDefs';
import { resolvers as shardsResolvers } from './schemaShards/resolvers';

export const typeDefs = mergeTypes(
  [
    gql`
      type Query {
          _empty: String
      }

      type Mutation {
          _empty: String
      }

      type Subscription {
          _empty: String
      }
    `,
    shardsTypeDefs
  ],
  { all: true }
);

export const resolvers = shardsResolvers;