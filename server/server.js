const { makeExecutableSchema } = require("graphql-tools");
const { ApolloServer, gql } = require("apollo-server-express");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const expressJwt = require("express-jwt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const db = require("./db");

const port = 9000;
const jwtSecret = Buffer.from("Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt", "base64");

const typeDefs = fs.readFileSync("./schema.graphql", { encoding: "utf-8" });
const resolvers = require("./resolvers");

const app = express();
app.use(
  morgan('combined'),
  cors(),
  bodyParser.json(),
  expressJwt({
    secret: jwtSecret,
    credentialsRequired: false
  })
);

// const schema = makeExecutableSchema({ typeDefs, resolvers });
// app.use("/graphql", graphqlExpress(
//   req => ({
//     schema,
//     context: {
//       user: req.user ? db.users.get(req.user.sub) : null
//     }
//   })
// ));
// app.use("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));

const apolloServer = new ApolloServer({
  typeDefs: gql(typeDefs),
  resolvers,
  playground: true,
  context: {
    user: ({req}) => ({ user: req.user ? db.users.get(req.user.sub) : null })
  }
})

apolloServer.applyMiddleware({ app });

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.list().find(user => user.email === email);
  if (!(user && user.password === password)) {
    res.sendStatus(401);
    return;
  }
  const token = jwt.sign({ sub: user.id }, jwtSecret);
  res.send({ token });
});

app.listen(port, () => console.info(`Server started on port ${port}`));
