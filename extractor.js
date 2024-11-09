const XLSX = require('xlsx');
const R = require('ramda');
const fs = require('fs');

const trimSpaces = R.replace(/\s+/g, "")
const trimArrSpaces = R.map(R.replace(/\s+/g, ""))

const sheet1 = () => {
    let workBook = XLSX.readFile('./data/2024年塔罗达人初级(包过）.xls');
    let sheet = workBook.Sheets['小牌题意'];
    let sheetToJson = XLSX.utils.sheet_to_json(sheet);
    return R.pipe(
        R.map(R.values()),
        R.map(raw => ({
            question: trimSpaces(raw[1]),
            answers: trimArrSpaces(raw[2].split(/\s{3,}/g)).filter(R.identity)
        }))
    )(sheetToJson);
}

const sheet2 = () => {
    let workBook = XLSX.readFile('./data/2024年塔罗达人初级(包过）.xls');
    let sheet = workBook.Sheets['小牌补充'];
    let sheetToJson = XLSX.utils.sheet_to_json(sheet);
    return R.pipe(
        R.map(R.values()),
        R.map(raw => ({question: trimSpaces(raw[2]), answers: [trimSpaces(raw[1])]}))
    )(sheetToJson)
}

const sheet3 = () => {
    let workBook = XLSX.readFile('./data/2024年塔罗达人初级(包过）.xls');
    let sheet = workBook.Sheets['牌阵案例'];
    let sheetToJson = XLSX.utils.sheet_to_json(sheet);
    return R.pipe(
        R.map(R.values()),
        R.map(raw => ({
            question: trimSpaces(raw[1]),
            answers: trimArrSpaces(
                raw[2].split("\n").filter(item => raw[3].toString().split(/\s+/g).some(prefix => item.startsWith(prefix)))
            )
        })),
    )(sheetToJson)
}

const sheet4 = () => {
    let workBook = XLSX.readFile('./data/2024年塔罗达人初级(包过）.xls');
    let sheet = workBook.Sheets['基础信息'];
    let sheetToJson = XLSX.utils.sheet_to_json(sheet);
    return R.pipe(
        R.map(R.values()),
        R.map(raw => ({
            question: trimSpaces(raw[1]),
            answers: raw[2].split("\n").filter(item => raw[3].toString().split("").some(prefix => item.startsWith(prefix)))
        })),
    )(sheetToJson)
}

const latestFileSheet1 = () => {
    let workBook = XLSX.readFile('./data/塔罗专业技能弹窗最新版本.xlsx');
    let sheet = workBook.Sheets['Sheet1'];
    let sheetToJson = XLSX.utils.sheet_to_json(sheet).filter(R.prop("题号"));
    const numToChar = {
        "1": "A",
        "2": "B",
        "3": "C",
        "4": "D",
    }
    return R.pipe(
        R.map(R.values()),
        R.map(raw => ({
            question: trimSpaces(raw[1]),
            answers: raw[2].split("\r\n").filter(
                item => raw[3]
                        .toString()
                        .split("")
                        .some(prefix => item.startsWith(numToChar[prefix]))
            )
        })),
    )(sheetToJson)
}

let alertSheet1 = () => {
    let workBook = XLSX.readFile('./data/星盘弹窗试题 最新.xlsx');
    let sheet = workBook.Sheets['Sheet1'];
    let sheetToJson = XLSX.utils.sheet_to_json(sheet);
    const numToChar = {
        "1": "A",
        "2": "B",
        "3": "C",
        "4": "D",
    }
    return R.pipe(
        R.map(R.values()),
        R.map(raw =>
            ({
                question: trimSpaces(raw[0]),
                answers: raw[1].trim().split("\r\n").filter(
                    item =>
                        raw[2]
                            .toString()
                            .split(/\s*/)
                            .some(prefix => item.startsWith(numToChar[prefix]))
                )
            }))
    )(sheetToJson);
};

let num2 = () => {
    let workBook = XLSX.readFile('./data/题库2号完整版格式.xlsx');
    let sheet = workBook.Sheets['Sheet1'];
    let sheetToJson = XLSX.utils.sheet_to_json(sheet);
    const charToNum = {
        "A": 1,
        "B": 2,
        "C": 3,
        "D": 4,
        "E": 5,
        "F": 6,
        "G": 7,
    }
    return R.pipe(
        R.map(R.values()),
        R.map(raw =>
            ({
                question: trimSpaces(raw[0]),
                answers: raw[1].split("").map(option => raw[charToNum[option] + 1])
            }))
    )(sheetToJson);
}

const txt = (fileNames) => {
    const readFile = R.pipe(
        R.filter(R.identity),
        R.map(line => JSON.parse(line)),
        R.map(item => ({
            question: item.q,
            answers: item.ans.split("")
                .filter(R.identity)
                .map(option => option.charCodeAt(0) - 65)
                .map(option => item.a[option])
        }))
    );

    return fileNames
        .map(i => readFile(fs.readFileSync(`./data/${i}.txt`, "utf-8").split("\n")))
        .flat();
}

const distinctByQuestionAndMergeAnswers = R.pipe(
    R.groupBy(R.prop("question")),
    R.values(),
    R.map(items => (
        {
            question: items[0].question,
            answers: R.uniq(items.map(R.prop("answers")).flat())
        }))
)

const injectId = (arr) => arr.map((val, index) => ({id: index, ...val}));

let data = R.pipe(
    distinctByQuestionAndMergeAnswers,
    injectId
)([
    ...sheet1(),
    ...sheet2(),
    ...sheet3(),
    ...sheet4(),
    ...latestFileSheet1(),
    ...alertSheet1(),
    ...num2(),
    ...txt([1, 2, 3, 4, "星盘"]),
]);

console.log(JSON.stringify(data, null, 2));
