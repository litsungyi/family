const GREAT_HASH = 'LEE_707C64227E697F67781E506C35551268';
let datas = {};
let dataList = [];

document.addEventListener('DOMContentLoaded', (event) => {
    let url = 'https://script.google.com/macros/s/AKfycbxJioDtaMSxOFCfu2H0lJeG2Rzu7oS9QY3xgPbWpLgztoBoG1d_9OviwGARBkEFnH2x8w/exec';
    fetch(url, { method: 'POST'}).then(response => {
        if (!response.ok) {
            console.log(response.status);
            throw new Exception('Error');
        } else {
            return response.json();
        }
    }).then(response => {
        response.forEach(value =>  {
            id = value['id'].toString();
            datas[id] = value;
        });

        dataList = Object.values(datas);
    }).then(response => {
        let hash = location.hash;
        hash = hash.replace('#', '');
        if (location.hash == '') {
            hash = GREAT_HASH;
        }

        drawNode(hash);
    });
});

function changeId(id) {
    location.href = `#${id}`;
    drawNode(id);
}

function isMyFather(id, data) {
    return id == null ? false : data['father_id'] == id;
}

function isMyMother(id, data) {
    return id == null ? false : data['mother_id'] == id;
}

function isMyCompanion(id, data) {
    return id == null ? false : data['companion_id'] == id;
}

function isMySibling(id, fatherId, motherId, data) {
    return data['id'] != id && 
        ((fatherId !== '' && data['father_id'] == fatherId) ||
        (motherId !== '' && data['mother_id'] == motherId));
}

function getFatherData(myData) {
    let fatherId = myData.hasOwnProperty('father_id') ? myData['father_id'] : null;
    if (fatherId == null) {
        return null;
    }

    let father = dataList.filter((value, _) => value['id'] == fatherId);
    return father == null || father.length == 0 ? null : father[0];
}

function getMotherData(myData) {
    let motherId = myData.hasOwnProperty('mother_id') ? myData['mother_id'] : null;
    if (motherId == null) {
        return null;
    }

    let mother = dataList.filter((value, _) => value['id'] == motherId);
    return mother == null || mother.length == 0 ? null : mother[0];
}

function getCompanionDatas(myData) {
    let id = myData['id'];
    return dataList.filter((value, _) => isMyCompanion(id, value));
}

function getSiblingDatas(myData) {
    let fatherId = myData.hasOwnProperty('father_id') ? myData['father_id'] : '';
    let motherId = myData.hasOwnProperty('mother_id') ? myData['mother_id'] : '';
    if (fatherId === '' && motherId === '') {
        return [];
    }

    let id = myData['id'];
    return dataList.filter((value, _) => isMySibling(id, fatherId, motherId, value));
}

function getChildDatas(myData) {
    let id = myData['id'];
    return dataList.filter((value, _) => isMyFather(id, value) || isMyMother(id, value));
}

function onMouseOver(event) {
    let id = event.target.dataset.id;
    if (id === undefined) {
        return;
    }

    console.log(id);
}

function updateNode(node, data, currentData, options = {}) {
    let rootNode = node.querySelectorAll('.node')[0];
    rootNode.id = data['id'];
    rootNode.setAttribute("data-id", data['id']);
    rootNode.addEventListener('mouseover', onMouseOver);

    if (data['gender'] == 'M') {
        rootNode.classList.add('male');
    } else {
        rootNode.classList.add('female');
    }

    if (options['showLife'] !== undefined && options['showLife']) {
        let lifeNode = node.querySelectorAll('.life')[0];
        if (data['birth_day'] !== undefined && data['birth_day'] !== '' &&
            data['death_day'] !== undefined && data['death_day'] !== '') {
            lifeNode.innerHTML += `<div>享年 ${data['death_day'] - data['birth_day'] + 1} (${data['birth_day']} - ${data['death_day']})</div>`;
        }

        let titleNode = node.querySelectorAll('.title')[0];
        if (data['death_day'] !== undefined && data['death_day'] !== '') {
            if (data['generation'] == 1) {
                titleNode.innerHTML += `<div>${data['room']}</div>`;
            } else if (data['generation'] <= 3) {
                if (data['gender'] == 'M') {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}世祖</div>`;
                } else {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}世祖媽</div>`;
                }
            } else if (data['generation'] < 6) {
                if (data['gender'] == 'M') {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}世祖 (${data['room']})</div>`;
                } else if (data['companion_type'] === '') {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}世祖媽</div>`;
                } else {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}世祖${data['companion_type']}</div>`;
                }
            } else {
                if (data['gender'] == 'M') {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}世公 (${data['room']})</div>`;
                } else if (data['companion_type'] === '') {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}世媽</div>`;
                } else {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}世${data['companion_type']}</div>`;
                }
            }
        } else {
            if (data['gender'] == 'M') {
                titleNode.innerHTML += `<div>${numberToString(data['generation'])}世 (${data['room']})</div>`;
            } else {
                titleNode.innerHTML += `<div>${numberToString(data['generation'])}世</div>`;
            }
        }

        if (data['birth_text'] !== undefined && data['birth_text'] !== '') {
            lifeNode.innerHTML += `<div>生於 ${data['birth_text']}</div>`;
        }

        if (data['death_text'] !== undefined && data['death_text'] !== '') {
            lifeNode.innerHTML += `<div>卒於 ${data['death_text']}</div>`;
        }
    }

    let isSelf = false;
    if (options['relation'] === undefined) {
        rootNode.classList.add('other');
    } else {
        let descriptionNode = node.querySelectorAll('.description')[0];
        switch (options['relation']) {
            case 'self':
                isSelf = true;
                rootNode.classList.add('self');
                break;

            case 'father':
                descriptionNode.innerHTML += `<div>父親</div>`;
                break;

            case 'mother':
                descriptionNode.innerHTML += `<div>母親</div>`;
                break;

            case 'companion':
                if (data['gender'] == 'M') {
                    descriptionNode.innerHTML += `<div>丈夫</div>`;
                } else {
                    descriptionNode.innerHTML += `<div>妻子</div>`;
                }
                break;

            case 'sibling':
                if (data['gender'] == 'M') {
                    if (data['order'] === '' || currentData['order'] === '') {
                        descriptionNode.innerHTML += `<div>兄弟 (${data['order']})</div>`;
                    } else if (data['order'] < currentData['order']) {
                        descriptionNode.innerHTML += `<div>哥哥 (${data['order']})</div>`;
                    } else if (data['order'] > currentData['order']) {
                        descriptionNode.innerHTML += `<div>弟弟 (${data['order']})</div>`;
                    } else {
                        descriptionNode.innerHTML += `<div>兄弟 (${data['order']})</div>`;
                    }
                } else {
                    if (data['order'] === '' || currentData['order'] === '') {
                        descriptionNode.innerHTML += `<div>姐妹 (${data['order']})</div>`;
                    } else if (data['order'] < currentData['order']) {
                        descriptionNode.innerHTML += `<div>姐姐 (${data['order']})</div>`;
                    } else if (data['order'] > currentData['order']) {
                        descriptionNode.innerHTML += `<div>妹妹 (${data['order']})</div>`;
                    } else {
                        descriptionNode.innerHTML += `<div>姐妹 (${data['order']})</div>`;
                    }
                }
                break;

            case 'child':
                if (data['gender'] == 'M') {
                    descriptionNode.innerHTML += `<div>兒子 (${data['order']})</div>`;
                } else {
                    descriptionNode.innerHTML += `<div>女兒 (${data['order']})</div>`;
                }
                break;
        }
    }

    let nameNode = node.querySelectorAll('.name')[0];
    if (data['member_type'] == '宗族') {
        if (isSelf) {
            nameNode.textContent = data['first_name'];
        } else {
            nameNode.innerHTML = `<a href="javascript: changeId('${data['id']}');">${data['first_name']}</a>`;
        }
    } else {
        if (data['gender'] == 'M') {
            nameNode.textContent = `${data['last_name']}${data['first_name']}`;
        } else if (data['generation'] <= 7 ) {
            nameNode.textContent = `${data['last_name']}氏 ${data['first_name']}`;
        } else {
            nameNode.textContent = `${data['last_name']}${data['first_name']}`;
        }
    }
}

function drawNode(id) {
    let currentData = datas[id];
    if (currentData == undefined) {
        currentData = datas[GREAT_HASH];
    } else if (currentData['member_type'] != '宗族') {
        currentData = datas[GREAT_HASH];
    }

    let selfNodeTemplate = document.getElementById("selfNodeTemplate");
    let nodeTemplate = document.getElementById("nodeTemplate");

    let root = document.getElementById('familyNode');
    root.innerHTML = "";

    var currentNode = selfNodeTemplate.content.cloneNode(true);
    updateNode(currentNode, currentData, currentData, {relation: 'self', showLife: true});
    root.appendChild(currentNode);

    let parentsNodes = document.getElementsByClassName('parentsNodes')[0];
    let fatherData = getFatherData(currentData);
    if (fatherData != null) {
        var fatherNode = nodeTemplate.content.cloneNode(true);
        updateNode(fatherNode, fatherData, currentData, {relation: 'father'});
        parentsNodes.appendChild(fatherNode);
    }

    let motherData = getMotherData(currentData);
    if (motherData != null) {
        var motherNode = nodeTemplate.content.cloneNode(true);
        updateNode(motherNode, motherData, currentData, {relation: 'mother'});
        parentsNodes.appendChild(motherNode);
    }

    let companionNodes = document.getElementsByClassName('companionNodes')[0];
    let companionDatas = getCompanionDatas(currentData);
    for (let index in companionDatas)
    {
        let companionData = companionDatas[index];
        var companionNode = nodeTemplate.content.cloneNode(true);
        updateNode(companionNode, companionData, currentData, {showLife: true, relation: 'companion'});
        companionNodes.appendChild(companionNode);
    }

    let siblingNodes = document.getElementsByClassName('siblingNodes')[0];
    let siblingDatas = getSiblingDatas(currentData);
    for (let index in siblingDatas)
    {
        let siblingData = siblingDatas[index];
        var siblingNode = nodeTemplate.content.cloneNode(true);
        updateNode(siblingNode, siblingData, currentData, {relation: 'sibling'});
        siblingNodes.appendChild(siblingNode);
    }

    let childrenNodes = document.getElementsByClassName('childrenNodes')[0];
    let childDatas = getChildDatas(currentData);
    for (let index in childDatas)
    {
        let childData = childDatas[index];
        var childNode = nodeTemplate.content.cloneNode(true);
        updateNode(childNode, childData, currentData, {relation: 'child'});
        childrenNodes.appendChild(childNode);
    }
}

function numberToString(num) {
    const strList = '零一二三四五六七八九十';
    let numStr = '';
    if (num === 10) {
        return strList[10];
    } else if ( num % 10 === 0) {
        let ten = Math.floor(num / 10);
        if (ten > 1) {
            numStr += strList[ten];
        }

        numStr += strList[10];
    }

    let one = Math.floor(num % 10);
    numStr += strList[one];

    return numStr;
}

function toYear() {
    // 清領時期 -1895年
    // 順治（1644-1661年）
    // 康熙（1662-1722年）
    // 雍正（1723-1735年）
    // 乾隆（1736-1795年）
    // 嘉慶（1796-1820年）
    // 道光（1821-1850年）
    // 咸豐（1851-1861年）
    // 同治（1862-1874年）
    // 光緒（1875-1908年）
    // 宣統（1909-1911年）

    // 日治時期 1895年－1945年
    // 明治（1868-1911年）
    // 大正（1912-1925年）
    // 昭和（1926-1947年）

    // 民國時期 1945年－
    // 民國（1912-）

    // 甲子 1684, 1744...
    // 天干: 甲乙丙丁戊己庚辛壬癸
    // 地支: 子丑寅卯辰巳午未申酉戌亥
}
