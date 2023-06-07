const { graphqlHTTP } = require("express-graphql");
const { GraphQLSchema } = require("graphql");
const { authenticate } = require("../../../utils/middlewares");

const Queries = require("./queries");
const Mutations = require("./mutations");

module.exports = (router) => {
  router.use(
    "/graphql",
    // authenticate,
    graphqlHTTP({
      schema: new GraphQLSchema({
        query: Queries,
        mutation: Mutations,
      }),
      rootValue: { hello: () => "Hello GraphQL!" },
      graphiql: !process.env.NODE_ENV || process.env.NODE_ENV === "development",
    })
  );
};
