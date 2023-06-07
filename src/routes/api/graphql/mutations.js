const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  // GraphQLBoolean,
} = require("graphql");
const { UserType } = require("./types");
const userService = require("../../../services/user");

module.exports = new GraphQLObjectType({
  name: "RootMutations",
  fields: {
    addUser: {
      type: UserType,
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        first_name: { type: GraphQLNonNull(GraphQLString) },
        last_name: { type: GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve(
        parent,
        { title, first_name, last_name, email, phone, password }
      ) {
        return userService.create({
          title,
          first_name,
          last_name,
          email,
          phone,
          password,
        });
      },
    },
  },
});
