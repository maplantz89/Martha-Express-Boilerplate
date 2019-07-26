const knex = require('knex');
const app = require('./app');
const { PORT, NODE_ENV, DATABASE_URL } = require('./config');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});

app.set('db', db);

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT} in ${NODE_ENV} mode...`);
});