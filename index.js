const { ApolloServer, gql, makeExecutableSchema } = require('apollo-server-lambda');
const logger = require('pino')({level: 'info'})

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const schema = makeExecutableSchema({typeDefs, resolvers})

const server = new ApolloServer({ 
  schema,
  debug: true,
  playground: {
    settings: {
      'schema.polling.enable': false
    }
  },
  formatError: (error) => {
    logger.error(error);
    return error 
  },
  formatResponse: (response) => {
    logger.info(response)
    return response
  }
});

exports.graphqlHandler = (event, lambdaContext, callback) => {
  if (event.httpMethod === 'GET') {
    server.createHandler()(
      { ...event, path: event.requestContext.path || event.path },
      lambdaContext,
      callback,
    );
  } else {
    server.createHandler()(event, lambdaContext, callback);
  }
}