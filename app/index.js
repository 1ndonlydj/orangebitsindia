// index.js

const express = require('express');

const app = express();app.get('/__BUILDID__', (req, res) => {
  res.send('{<br/>"hello": "world",<br/>"built_at": __build_at__,<br/>"deployed_at": __deployed_at__<br/>}')})

app.listen(5007, () => console.log('Server is up and running'));
