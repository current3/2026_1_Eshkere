const path = require('path');
const express = require('express');

const app = express();
const projectRoot = path.join(__dirname, '..');

app.use('/assets', express.static(path.join(projectRoot, 'assets')));
app.use('/components', express.static(path.join(projectRoot, 'components')));
app.use('/layouts', express.static(path.join(projectRoot, 'layouts')));
app.use('/pages', express.static(path.join(projectRoot, 'pages')));

app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Frontend server is running on http://localhost:${PORT}`);
});
