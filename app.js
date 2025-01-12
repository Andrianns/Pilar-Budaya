if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); //development
}
// console.log(process.env.SECRET_KEY);
const cors = require('cors');
const express = require('express');
const errorHandler = require('./middleware/errorHandle');
const router = require('./routes');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', router);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
app.use(errorHandler);

module.exports = app;
