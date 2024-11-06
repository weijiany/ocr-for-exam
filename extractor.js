const XLSX = require('xlsx');
const R = require('ramda');

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

let data = [
    ...sheet1(),
    ...sheet2(),
    ...sheet3(),
    ...sheet4(),
    ...latestFileSheet1(),
].map((val, index) => ({id: index, ...val}));

console.log(JSON.stringify(data, null, 2));
