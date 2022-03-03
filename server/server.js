const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginLandingPageDisabled } = require('apollo-server-core');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

// const path = require('path');
const http = require('http');
const db = require('./config/connection');

// const PORT = process.env.PORT || 3001;
// const app = express();


async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
    cors: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
    process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  await server.start();

  // Additional middleware can be mounted at this point to run before Apollo.

  // app.get(express.urlencoded({ extended: false }));
  // app.get(express.json());

  // app.get('*', (req, res) => {
  //   res.sendFile(path.join(__dirname, '../client/build/index.html'));
  // });

  app.get('*');

  // Mount Apollo middleware here.
  server.applyMiddleware({ app, path: '/graphql', cors: false });

  db.once('open', () => {
    console.log('Mongoose DB connection established.')
  });

  await new Promise(resolve => httpServer.listen({ port: 3001 }, resolve));
  console.log(`🚀 Server ready at http://localhost:3001${server.graphqlPath}`);
  return { server, app };
}

startApolloServer();

// server.applyMiddleware({ app });

// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')));
// }



// db.once('open', () => {
//   app.listen(PORT, () => {
//     console.log(`API server running on port ${PORT}!`);
//     console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
//   });
// });
