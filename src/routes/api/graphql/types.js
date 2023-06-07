const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLID,
  GraphQLString,
} = require("graphql");

const MeetingType = new GraphQLObjectType({
  name: "Meeting",
  fields: () => ({
    id: { type: GraphQLInt },
    meeting_type_id: { type: GraphQLInt },
    station_id: { type: GraphQLInt },
    tag: { type: GraphQLString },
    held_on: { type: GraphQLString },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    first_name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    phone: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
  }),
});

module.exports = {
  MeetingType,
  UserType,
};
