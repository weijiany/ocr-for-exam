const Fuse = require('fuse.js');
const R = require('ramda');

const express = require('express')
const path = require("path");
const app = express();
const port = 3000;

const tarotData = require("./tarot-data.json");

const distinctBy = prop => R.uniqBy(R.prop(prop))

const options = {
    keys: ['question'],
    includeScore: true,
    threshold: 0.2,
};

const fuse = new Fuse(tarotData, options);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index', { serverUrl: req.protocol + '://' + req.get('host') });
});

app.post("/analyse", (req, res) => {
    let body = req.body;
    let matchedQuestion = body.map(line => fuse.search(line))
        .filter(result => result.length > 0)
        .map(R.head())
        .map(R.prop("item"));
    res.json(distinctBy("id")(matchedQuestion));
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
