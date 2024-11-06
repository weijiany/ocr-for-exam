const XLSX = require('xlsx');
const data = require('./tarot-data.json');

let sheet = XLSX.utils.json_to_sheet(data.map(item => {
    let answers = item.answers;
    item.answers = answers.join("\n");
    item.id ++;
    return item;
}));

let workbook = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(workbook, sheet, 'TarotData');

XLSX.writeFile(workbook, 'tarot-data.xlsx');
