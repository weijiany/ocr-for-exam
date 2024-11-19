const XLSX = require('xlsx');
const mammoth = require('mammoth');
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
};

const groupBasedOnKeyWord = (array, condition) => {
    let indexes = array
        .map((s, index) => ({s, index}))
        .filter(({s}) => condition(s))
        .map(R.prop("index"));
    return R.range(0, indexes.length - 1)
        .map(i => array.slice(indexes[i], indexes[i + 1]))
};

const astrolabe001 = async () => {
    let content = fs.readFileSync("./data/星盘001.txt", "utf-8")
    let data = content.split("\r");
    return groupBasedOnKeyWord(data, s => s === "")
        .filter(item => item.length > 1)
        .map(group => {
            group = group.slice(1);
            let questionAndAnswerOptions = group[0];
            let index = R.findLastIndex(R.test(/[^1234\s]/g))(questionAndAnswerOptions.split(""));
            let question = questionAndAnswerOptions.slice(0, index + 1);
            if (group.length === 2) {
                return {
                    question,
                    answers: [group[1]]
                }
            }

            let options = questionAndAnswerOptions.slice(index + 1).split(/\s*/g).filter(R.identity);
            return {
                question,
                answers: options.map(option => group[option])
            }
        })
};

const astrolabe002 = async () => {
    let {value: content} = await mammoth.extractRawText({path: "./data/星盘002.docx"});
    let data = content
        .split(/[\n\t]/)
        .filter(R.identity);

    return groupBasedOnKeyWord(data, R.includes("(   )"))
        .flatMap(group => {
            let questionTemplate = group[0];
            let answers = groupBasedOnKeyWord(group.slice(1), R.includes("："));
            return answers.map(answer => ({
                question: questionTemplate.replace("(   )", answer[0].replace("：", "")),
                answers: answer.slice(1)
            }))
        });
};

const jacaranda = () => {
    let workBook = XLSX.readFile('./data/紫薇初级最新版本.xlsx', {
        cellHTML: true
    });
    let sheet = workBook.Sheets['Sheet1'];
    let data = XLSX.utils.sheet_to_json(sheet, {
        header: true,
        raw: true
    });

    return R.pipe(
        R.reduce((acc, item) => {
            if (item.Q) {
                acc.push([item]);
            } else {
                acc[acc.length - 1].push(item);
            }
            return acc;
        }, []),
        R.map(group => ({
            question: group[0].Q,
            answers: group.length === 1
                ? [group[0].A]
                : group.map(R.prop('A')).filter(R.includes('~~')).map(R.replace('~~', ''))
        }))
    )(data);
}

const distinctByQuestionAndMergeAnswers = R.pipe(
    R.groupBy(R.prop("question")),
    R.values(),
    R.map(items => (
        {
            question: items[0].question,
            answers: R.uniq(items.map(R.prop("answers")).flat())
        }))
);

const injectId = (arr) => arr.map((val, index) => ({id: index, ...val}));

const writeToXLSX = data => {
    let tmpData = data.map(item => ({
        ...item,
        ...{answers: item.answers.join('\n')}
    }));
    let sheet = XLSX.utils.json_to_sheet(tmpData);
    const maxWidth = R.pipe(
        R.map(R.pipe(
            R.toPairs,
            R.map(([_, value]) => typeof value === 'string' ? value.length : 3)
        )),
        R.apply(R.zipWith(R.max)),
        R.map(length => length * 24)
    );

    sheet['!cols'] = maxWidth(tmpData).map(width => ({ wpx: width }));
    sheet['!rows'] = data.map(R.prop('answers')).map(R.length).map(height => ({hpx: height * 15}))
    let workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, sheet);
    XLSX.writeFile(workBook, "题库.xlsx")
};

const main = async () => {
    let data = R.pipe(
        // distinctByQuestionAndMergeAnswers,
        R.sortBy(R.prop('question')),
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
        ...txt(["星盘"]),
        ...(await astrolabe001()),
        ...(await astrolabe002()),
        ...jacaranda(),
    ]);

    writeToXLSX(data);
    console.log(JSON.stringify(data, null, 2));
}

main();
