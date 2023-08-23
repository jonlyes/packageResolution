var circleDiv = document.getElementById('circle');
var versionDiv = document.getElementById('multipleVersion');

async function getReport() {
    let { data } = await axios.get('../../src/data/report.json');
    let { conflict, circle } = data;

    // 多版本
    insertData(Object.keys(conflict), versionDiv);
    // 循环
    insertData(circle, circleDiv);
}

function insertData(arr, ele) {
    if (arr.length === 0)
        ele.innerHTML = '<p>无</p>';
    arr.forEach(item => {
        let tmpEle = document.createElement("p");
        tmpEle.innerHTML = item;
        ele.appendChild(tmpEle);
    })
}

getReport();