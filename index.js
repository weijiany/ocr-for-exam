const Fuse = require('fuse.js');
const R = require('ramda');

const express = require('express')
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
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

const upload = multer({ dest: 'uploads/' });
app.post("/analyse", upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({error: '没有文件被上传'});
    }

    try {
        const {data: {text}} = await Tesseract.recognize(req.file.path, 'chi_sim');
        let matchedQuestion = text.split("\n")
            .map(line => fuse.search(line.replace(/\s+/g, "")))
            .filter(result => result.length > 0)
            .map(R.head())
            .map(R.prop("item"));
        matchedQuestion = distinctBy("id")(matchedQuestion);

        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error(`删除文件时出错: ${err}`);
            } else {
                console.log(`已删除文件: ${req.file.path}`);
            }
        });
        console.log(JSON.stringify({
            time: new Date().toISOString(),
            recognized_strs: text,
            matchedQuestion
        }));

        res.json(matchedQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: '识别失败，错误:' + error.message});
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
