const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLID,
} = require("graphql");
const { promisify } = require("util");
const { MeetingType, UserType } = require("./types");
const meetingService = require("../../../services/meeting");
const userService = require("../../../services/user");

module.exports = new GraphQLObjectType({
  name: "RootQueries",
  fields: {
    services: {
      type: GraphQLList(MeetingType),
      args: {
        organization_id: { type: GraphQLInt },
        page: { type: GraphQLInt },
        size: { type: GraphQLInt },
      },
      resolve(parent, { organization_id, page, size }) {
        return new Promise((res, rej) => {
          meetingService.get(organization_id, page, size, (err, data) =>
            err ? rej([]) : res(data.data)
          );
        });
      },
    },

    service: {
      type: MeetingType,
      args: {
        organization_id: { type: GraphQLInt },
        id: { type: GraphQLInt },
      },
      resolve(parent, { organization_id, id }) {
        return promisify(meetingService.find)(organization_id, id)
          .then((data) => data)
          .catch((e) => []);
      },
    },

    users: {
      type: GraphQLList(UserType),
      args: {
        page: { type: GraphQLInt },
        size: { type: GraphQLInt },
      },
      resolve(parent, { page, size }) {
        return new Promise((res, rej) => {
          userService.get(page, size, (err, data) =>
            err ? rej([]) : res(data.data)
          );
        });
      },
    },

    user: {
      type: UserType,
      args: {
        organization_id: { type: GraphQLInt },
        id: { type: GraphQLID },
        email: { type: GraphQLString },
      },
      resolve(parent, { id, email }) {
        return email
          ? promisify(userService.findByEmail)(email, false)
              .then((data) => data)
              .catch((e) => [])
          : promisify(userService.find)(id)
              .then((data) => data)
              .catch((e) => []);
      },
    },
  },
});
