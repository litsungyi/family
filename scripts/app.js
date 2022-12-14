const GREAT_HASH = 'LEE_707C64227E697F67781E506C35551268';
let datas = {};
let dataList = [];

document.addEventListener('DOMContentLoaded', (event) => {
    let url = 'https://script.google.com/macros/s/AKfycbz9V-Su7h6JcjTAlXyVHHCGn4M-tu48ZhtXy78YlPq3-b3xIFw1m2tYcHbpMfBn8GSMyw/exec';
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

// window.addEventListener('hashchange', (event) => {
//     console.log('hashchange');
// });

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

function isMyAdoptveParents(id, data) {
    return id == null ? false : data['adoption_id'] == id;
}

function isMyCompanion(id, data) {
    return id == null ? false : data['companion_id'] == id;
}

function isMySibling(id, fatherId, motherId, data) {
    return data['id'] != id && 
        ((fatherId !== '' && data['father_id'] == fatherId) ||
        (motherId !== '' && data['mother_id'] == motherId));
}

function getAdoptiveFatherData(myData) {
    if (myData['adoption_id'] === '') {
        return null;
    }

    let fatherId = myData.hasOwnProperty('adoption_id') ? myData['adoption_id'] : null;
    if (fatherId == null) {
        return null;
    }

    let father = dataList.filter((value, _) => value['id'] == fatherId);
    return father == null || father.length == 0 ? null : father[0];
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

function getAdoptiveChildDatas(myData) {
    let id = myData['id'];
    return dataList.filter((value, _) => isMyAdoptveParents(id, value));
}

function getLifeNote(year) {
    if (year < 30) {
        return `?????? ${year} ???`;
    } else if (year < 60) {
        return `?????? ${year} ???`;
    } else if (year < 90) {
        return `?????? ${year} ???`;
    } else if (year < 100) {
        return `????????? ${year} ???`;
    } else {
        return `????????? ${year} ???`;
    }
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

        let name_alias = [];
        if (data['courtesy_name'] !== undefined && data['courtesy_name'] !== '') {
            name_alias.push(`??? ${data['courtesy_name']}`);
        }

        if (data['art_name'] !== undefined && data['art_name'] !== '') {
            name_alias.push(`??? ${data['art_name']}`);
        }

        if (name_alias.length !== 0) {
            lifeNode.innerHTML += `<div>${name_alias.join('???')}</div>`;
        }

        if (data['birth_day'] !== undefined && data['birth_day'] !== '' &&
            data['death_day'] !== undefined && data['death_day'] !== '') {
            console.log(data['birth_day']);
            console.log(data['death_day']);
            let lifeYear = parseInt(data['death_day']) - parseInt(data['birth_day']) + 1;
            let lifeNote = getLifeNote(lifeYear);
            lifeNode.innerHTML += `<div>${lifeNote} (${data['birth_day']} - ${data['death_day']})</div>`;
        }

        let titleNode = node.querySelectorAll('.title')[0];
        if (data['death_day'] !== undefined && data['death_day'] !== '') {
            if (data['generation'] == 1) {
                titleNode.innerHTML += `<div>${data['room']}</div>`;
            } else if (data['generation'] <= 3) {
                if (data['gender'] == 'M') {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}??????</div>`;
                } else {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}?????????</div>`;
                }
            } else if (data['generation'] < 6) {
                if (data['gender'] == 'M') {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}?????? (${data['room']})</div>`;
                } else if (data['companion_type'] === '') {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}?????????</div>`;
                } else {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}??????${data['companion_type']}</div>`;
                }
            } else {
                if (data['gender'] == 'M') {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}?????? (${data['room']})</div>`;
                } else if (data['companion_type'] === '') {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}??????</div>`;
                } else {
                    titleNode.innerHTML += `<div>${numberToString(data['generation'])}???${data['companion_type']}</div>`;
                }
            }
        } else {
            if (data['gender'] == 'M') {
                titleNode.innerHTML += `<div>${numberToString(data['generation'])}??? (${data['room']})</div>`;
            } else {
                titleNode.innerHTML += `<div>${numberToString(data['generation'])}???</div>`;
            }
        }

        if (data['birth_text'] !== undefined && data['birth_text'] !== '') {
            lifeNode.innerHTML += `<div><i class="fas fa-fw fa-solid fa-baby"></i> ?????? ${data['birth_text']}</div>`;
        }

        if (data['death_text'] !== undefined && data['death_text'] !== '') {
            lifeNode.innerHTML += `<div><i class="fas fa-fw fa-solid fa-skull"></i> ?????? ${data['death_text']}</div>`;
        }

        if (data['tomb'] !== undefined && data['tomb'] !== '') {
            lifeNode.innerHTML += `<div><i class="fas fa-fw fa-solid fa-cross"></i> ?????? ${data['tomb']}</div>`;
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

            case 'adoptive father':
                rootNode.classList.add('other');
                descriptionNode.innerHTML += `<div>?????? (???)</div>`;
                break;

            case 'father':
                rootNode.classList.add('other');
                if (currentData['adoption_type'] === '???' ) {
                    descriptionNode.innerHTML += `<div>?????? (???)</div>`;
                } else {
                    descriptionNode.innerHTML += `<div>??????</div>`;
                }
                break;

            case 'mother':
                rootNode.classList.add('other');
                descriptionNode.innerHTML += `<div>??????</div>`;
                break;

            case 'companion':
                rootNode.classList.add('self');
                if (data['gender'] == 'M') {
                    descriptionNode.innerHTML += `<div>??????</div>`;
                } else {
                    descriptionNode.innerHTML += `<div>??????</div>`;
                }
                break;

            case 'sibling':
                rootNode.classList.add('other');
                if (data['gender'] == 'M') {
                    if (data['order'] === '' || currentData['order'] === '') {
                        descriptionNode.innerHTML += `<div>?????? (${data['order']})</div>`;
                    } else if (data['order'] < currentData['order']) {
                        descriptionNode.innerHTML += `<div>?????? (${data['order']})</div>`;
                    } else if (data['order'] > currentData['order']) {
                        descriptionNode.innerHTML += `<div>?????? (${data['order']})</div>`;
                    } else {
                        descriptionNode.innerHTML += `<div>?????? (${data['order']})</div>`;
                    }
                } else {
                    if (data['order'] === '' || currentData['order'] === '') {
                        descriptionNode.innerHTML += `<div>?????? (${data['order']})</div>`;
                    } else if (data['order'] < currentData['order']) {
                        descriptionNode.innerHTML += `<div>?????? (${data['order']})</div>`;
                    } else if (data['order'] > currentData['order']) {
                        descriptionNode.innerHTML += `<div>?????? (${data['order']})</div>`;
                    } else {
                        descriptionNode.innerHTML += `<div>?????? (${data['order']})</div>`;
                    }
                }
                break;

            case 'child':
                rootNode.classList.add('other');
                let orderChild = data['order'];
                if (data['adoption_type'] === '???' && currentData['id'] === data['adoption_id']) {
                    orderChild = data['order2']
                } else if (data['adoption_type'] === '???' && currentData['id'] === data['adoption_id']) {
                    orderChild = data['order2']
                }

                if (data['gender'] == 'M') {
                    descriptionNode.innerHTML += `<div>?????? (${orderChild})</div>`;
                } else {
                    descriptionNode.innerHTML += `<div>?????? (${orderChild})</div>`;
                }
                break;

            case 'adoptive child':
                rootNode.classList.add('other');
                if (data['gender'] == 'M') {
                    descriptionNode.innerHTML += `<div>?????? (${data['order']})</div>`;
                } else {
                    descriptionNode.innerHTML += `<div>?????? (${data['order']})</div>`;
                }
                break;
        }
    }

    let nameNode = node.querySelectorAll('.name')[0];
    let genderIcon = '';
    if (data['gender'] == 'M') {
        genderIcon = "<i class=\"fas fa-solid fa-mars fa-fw\"></i>"
    } else {
        genderIcon = "<i class=\"fas fa-solid fa-venus fa-fw\"></i>"
    }

    if (data['member_type'] == '??????') {
        if (isSelf) {
            nameNode.innerHTML = `${genderIcon} ${data['first_name']}`;
        } else {
            if (data['adoption_type'] === '???' && currentData['id'] === data['adoption_id']) {
                nameNode.innerHTML = `${genderIcon} <a href="javascript: changeId('${data['id']}');">${data['first_name']} (???) <i class="fas fa-solid fa-link fa-sm"></i></a>`;
            } else if (data['adoption_type'] === '???' && currentData['adoption_id'] === data['id']) {
                nameNode.innerHTML = `${genderIcon} <a href="javascript: changeId('${data['id']}');">${data['first_name']} (???) <i class="fas fa-solid fa-link fa-sm"></i></a>`;
            } else if (data['adoption_type'] !== '') {
                nameNode.innerHTML = `${genderIcon} <a href="javascript: changeId('${data['id']}');">${data['first_name']} (${data['adoption_type']}) <i class="fas fa-solid fa-link fa-sm"></i></a>`;
            } else {
                nameNode.innerHTML = `${genderIcon} <a href="javascript: changeId('${data['id']}');">${data['first_name']} <i class="fas fa-solid fa-link fa-sm"></i></a>`;
            }
        }
    } else {
        if (data['gender'] == 'M') {
            nameNode.innerHTML = `${genderIcon} ${data['last_name']}${data['first_name']}`;
        } else if (data['generation'] <= 7 ) {
            nameNode.innerHTML = `${genderIcon} ${data['last_name']}??? ??????${data['first_name']}`;
        } else {
            nameNode.innerHTML = `${genderIcon} ${data['last_name']}${data['first_name']}`;
        }
    }
}

function sortChildOrder(data1, data2) {
    let order1 = parseInt(data1['order']);
    let order2 = parseInt(data2['order']);
    if (data1['adoption_type'] !== '') {
        let adoption = data1['adoption_type'];
        if (adoption == '???') {
            order1 = parseInt(data1['order2']);
        }
    }
    if (data2['adoption_type'] !== '') {
        let adoption = data2['adoption_type'];
        if (adoption == '???') {
            order2 = parseInt(data1['order2']);
        }
    }

    return order1 > order2 ? 1 : order1 < order2 ? -1 : 0;
}

function drawNode(id) {
    let currentData = datas[id];
    if (currentData == undefined) {
        currentData = datas[GREAT_HASH];
    } else if (currentData['member_type'] != '??????') {
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

    let adoptiveFatherData = getAdoptiveFatherData(currentData);
    if (adoptiveFatherData != null) {
        var fatherNode = nodeTemplate.content.cloneNode(true);
        updateNode(fatherNode, adoptiveFatherData, currentData, {relation: 'adoptive father'});
        parentsNodes.appendChild(fatherNode);
    }

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
    let adoptiveChildrenDatas = getAdoptiveChildDatas(currentData);
    childDatas = childDatas.concat(adoptiveChildrenDatas).sort(sortChildOrder);
    for (let index in childDatas)
    {
        let childData = childDatas[index];
        var childNode = nodeTemplate.content.cloneNode(true);
        updateNode(childNode, childData, currentData, {relation: 'child'});
        childrenNodes.appendChild(childNode);
    }
}

function numberToString(num) {
    const strList = '?????????????????????????????????';
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
    // ???????????? -1895???
    // ?????????1644-1661??????
    // ?????????1662-1722??????
    // ?????????1723-1735??????
    // ?????????1736-1795??????
    // ?????????1796-1820??????
    // ?????????1821-1850??????
    // ?????????1851-1861??????
    // ?????????1862-1874??????
    // ?????????1875-1908??????
    // ?????????1909-1911??????

    // ???????????? 1895??????1945???
    // ?????????1868-1911??????
    // ?????????1912-1925??????
    // ?????????1926-1947??????

    // ???????????? 1945??????
    // ?????????1912-???

    // ?????? 1684, 1744...
    // ??????: ??????????????????????????????
    // ??????: ????????????????????????????????????
}
