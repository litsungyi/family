// NOTE: The hash of 2nd gen.
const GREAT_HASH = 'LEE_707C64227E697F67781E506C35551268';
let datas = {};
let dataList = [];

function toGenerationTitle(generation, room, isMale, companionType) {
    if (generation === 1) {
        return `來台祖`;
    } else if (generation <= 3) {
        if (isMale) {
            // NOTE: 前三世皆為獨子，不分房
            return `${numberToString(generation)}世祖`;
        } else {
            // NOTE: 前三世沒有繼媽、小媽
            return `${numberToString(generation)}世祖媽`;
        }
    } else if (generation <= 5) {
        // NOTE: 五世祖以前稱 "祖"、"祖媽"
        if (isMale) {
            return `${numberToString(generation)}世祖 (${room})`;
        } else {
            if (companionType === '') {
                companionType = '媽';
            }
            return `${numberToString(generation)}世祖${companionType}`;
        }
    } else {
        // NOTE: 五世祖以前稱 "公"、"媽"
        if (isMale) {
            return `${numberToString(generation)}世公 (${room})`;
        } else {
            if (companionType === '') {
                companionType = '媽';
            }
            return `${numberToString(generation)}世${companionType}`;
        }
    }
}

function getLifeNote(year) {
    // NOTE: 29歲以下過世稱之得年，30至59歲用享年，60歲至89歲則用享壽，90歲至99歲稱之享耆壽，100以上稱享嵩壽。
    //       http://www.funeralinformation.com.tw/Detail.php?LevelNo=369
    if (year < 30) {
        return `得年 ${year} 歲`;
    } else if (year < 60) {
        return `享年 ${year} 歲`;
    } else if (year < 90) {
        return `享壽 ${year} 歲`;
    } else if (year < 100) {
        return `享耆壽 ${year} 歲`;
    } else {
        return `享嵩壽 ${year} 歲`;
    }
}

function toYearOfBirthAndDeath(isAlive, birthYear, deathYear) {
    if (birthYear === '') {
        birthYear = '?';
    }

    if (deathYear === '') {
        deathYear = '?';
    }

    if (isAlive) {
        return `(${birthYear} - )`;
    } else {
        let year = deathYear - birthYear + 1;
        if (isNaN(year)) {
            return `(${birthYear} - ${deathYear})`;
        } else {
            return `${getLifeNote(year)} (${birthYear} - ${deathYear})`;
        }
    }
}

function toBirthText(birthText) {
    if (birthText !== '') {
        return `<i class="fas fa-fw fa-solid fa-baby"></i> 生於 ${birthText}`;
    } else {
        return '';
    }
}

function toDeathText(deathText) {
    if (deathText !== '') {
        return `<i class="fas fa-fw fa-solid fa-skull"></i> 卒於 ${deathText}`;
    } else {
        return '';
    }
}

function toTomb(tomb) {
    if (tomb !== '') {
        return `<i class="fas fa-fw fa-solid fa-cross"></i> 葬於 ${tomb}`;
    } else {
        return '';
    }
}

function purifyData(value) {
    // NOTE: 是否為宗族， true: 宗族, false: 姻親
    const isClan = value['member_type'] == '宗族';
    // NOTE: 是否為男性， true: 男, false: 女
    const isMale = value['gender'] == 'M';
    // NOTE: 存歿， true: 存, false: 歿
    const isAlive = !value['dead'];

    let data = {};
    data['id'] = value['id'];
    data['order'] = value['order'];
    data['order2'] = value['order2'];
    data['is_male'] = isMale;
    data['is_clan'] = isClan;
    data['is_alive'] = isAlive;
    data['last_name'] = value['last_name'];
    data['first_name'] = value['first_name'];
    data['courtesy_name'] = value['courtesy_name'];
    data['art_name'] = value['art_name'];
    data['generation_title'] = toGenerationTitle(value['generation'], value['room'], isMale, value['companion_type']);
    data['year_of_birth_and_death'] = toYearOfBirthAndDeath(isAlive, value['birth_day'], value['death_day']);
    data['birth_text'] = toBirthText(value['birth_text']);
    data['death_text'] = toDeathText(value['death_text']);
    data['tomb'] = toTomb(value['tomb']);
    data['father_id'] = value['father_id'];
    data['mother_id'] = value['mother_id'];
    data['adoption_father_id'] = value['adoption_father_id'];
    data['adoption_mother_id'] = value['adoption_mother_id'];
    // NOTE: adoption_type
    //       "立" 不確定定義
    //         沒有 adoption_father_id, adoption_mother_id 作為一般子女顯示
    //           order 為在原生家庭的順序
    //       "承" 表示給家族無祀的長輩接續香火，
    //         此時的 father_id, mother_id 為生父母 (在原父母底下顯示為 "出")
    //           order 為在原生家庭的順序
    //         adoption_father_id, adoption_mother_id 為過繼的父母 (在繼父母底下顯示為 "承")
    //           order2 為在繼父母家庭的順序
    //       "出XXX" 表示給其他家族做養子女
    //         此時的 father_id, mother_id 為生父母 (在生父母底下顯示為 "出")
    //           order 為在原生家庭的順序
    //       "入" 表示給其他宗族做養子女
    //         此時的 father_id, mother_id 為養父母 (在養父母底下顯示為 "入")
    //           order 為在養父母家庭的順序
    //         adoption_father_id, adoption_mother_id 為生父母 (在生父母底下顯示為 "出")
    //           order2 為在原生家庭的順序
    //       "嗣孫" 中間隔一代沒有男性成員，其中女性成員的孩子從母姓 (在原父母底下顯示為 "嗣孫")
    data['adoption_type'] = value['adoption_type'];
    data['companion_id'] = value['companion_id'];
    data['companion_type'] = value['companion_type'];
    return data;
}

document.addEventListener('DOMContentLoaded', (event) => {
    let url = 'https://script.google.com/macros/s/AKfycbx3Q6IWt8KjVvziVAA_wvaVcPtARR_bYV50mv5WpDTtv_0HZekBf-Gp8wk05-uR8GcKPQ/exec';
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
            datas[id] = purifyData(value);
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

function getRelatedClanDatas(myData) {
    let relationDatas = [{ data: myData, relation: 'self' }];
    if (myData['father_id'] !== '') {
        // NOTE: 找出我的父親
        let foundData = dataList.filter((data, _) => data['id'] === myData['father_id'])[0];
        relationDatas.push({ data: foundData, relation: 'father' });
    }

    if (myData['mother_id'] !== '') {
        // NOTE: 找出我的母親
        let foundData = dataList.filter((data, _) => data['id'] === myData['mother_id'])[0];
        relationDatas.push({ data: foundData, relation: 'mother' });
    }

    if (myData['adoption_father_id'] !== '') {
        // NOTE: 找出我的養父
        let foundData = dataList.filter((data, _) => data['id'] === myData['adoption_father_id'])[0];
        relationDatas.push({ data: foundData, relation: 'adoptive father' });
    }

    if (myData['adoption_mother_id'] !== '') {
        // NOTE: 找出我的養母
        let foundData = dataList.filter((data, _) => data['id'] === myData['adoption_mother_id'])[0];
        relationDatas.push({ data: foundData, relation: 'adoptive mother' });
    }

    if (myData['father_id'] !== '' || myData['mother_id'] !== '') {
        // NOTE: 找出我的兄弟姊妹
        let foundDatas = dataList.filter((value, _) => isMySibling(myData['id'], myData['father_id'], myData['mother_id'], value));
        foundDatas.forEach(foundData => relationDatas.push({ data: foundData, relation: 'sibling' }));
    }

    if (myData['adoption_father_id'] !== '' || myData['adoption_mother_id'] !== '') {
        // NOTE: 找出我的養兄弟姊妹
        let foundDatas = dataList.filter((value, _) => isMySibling(myData['id'], myData['adoption_father_id'], myData['adoption_mother_id'], value));
        foundDatas.forEach(foundData => relationDatas.push({ data: foundData, relation: 'adoptive sibling' }));
    }

    {
        // NOTE: 找出我的配偶
        let foundDatas = dataList.filter((value, _) => isMyCompanion(myData['id'], value));
        foundDatas.forEach(foundData => relationDatas.push({ data: foundData, relation: 'companion' }));
    }

    {
        // NOTE: 找出我的子女
        let foundDatas = dataList.filter((value, _) => isMyParents(myData['id'], value) || isMyAdoptveParents(myData['id'], value))
            .sort(sortChildOrder);
        foundDatas.forEach(foundData => relationDatas.push({ data: foundData, relation: 'child' }));
    }

    return relationDatas;
}

function isMyParents(id, data) {
    return id == null ? false : data['father_id'] == id || data['mother_id'] == id;
}

function isMyFather(id, data) {
    return id == null ? false : data['father_id'] == id;
}

function isMyMother(id, data) {
    return id == null ? false : data['mother_id'] == id;
}

function isMyAdoptveParents(id, data) {
    return id == null ? false : data['adoption_father_id'] == id || data['adoption_mother_id'] == id;
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

    if (data['is_male']) {
        rootNode.classList.add('male');
    } else {
        rootNode.classList.add('female');
    }

    if (options['showLife'] !== undefined && options['showLife']) {
        let lifeNode = node.querySelectorAll('.life')[0];

        let name_alias = [];
        if (data['courtesy_name'] !== undefined && data['courtesy_name'] !== '') {
            name_alias.push(`字 ${data['courtesy_name']}`);
        }

        if (data['art_name'] !== undefined && data['art_name'] !== '') {
            name_alias.push(`號 ${data['art_name']}`);
        }

        if (name_alias.length !== 0) {
            lifeNode.innerHTML += `<div>${name_alias.join('，')}</div>`;
        }

        if (!data['is_alive']) {
            lifeNode.innerHTML += `<div>${data['year_of_birth_and_death']}</div>`;
        }

        let titleNode = node.querySelectorAll('.title')[0];
        if (!data['is_alive']) {
            titleNode.innerHTML += `<div>${data['generation_title']}</div>`;
        }

        if (data['birth_text'] !== '') {
            lifeNode.innerHTML += `<div>${data['birth_text']}</div>`;
        }

        if (data['death_text'] !== '') {
            lifeNode.innerHTML += `<div>${data['death_text']}</div>`;
        }

        if (data['tomb'] !== '') {
            lifeNode.innerHTML += `<div>${data['tomb']}</div>`;
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
                descriptionNode.innerHTML += `<div>父親 (出)</div>`;
                break;

            case 'father':
                rootNode.classList.add('other');
                if (currentData['adoption_type'] === '入' ) {
                    descriptionNode.innerHTML += `<div>父親 (入)</div>`;
                } else {
                    descriptionNode.innerHTML += `<div>父親</div>`;
                }
                break;

            case 'mother':
                rootNode.classList.add('other');
                descriptionNode.innerHTML += `<div>母親</div>`;
                break;

            case 'companion':
                rootNode.classList.add('self');
                if (data['is_male']) {
                    descriptionNode.innerHTML += `<div>丈夫</div>`;
                } else {
                    descriptionNode.innerHTML += `<div>妻子</div>`;
                }
                break;

            case 'sibling':
                rootNode.classList.add('other');
                if (data['is_male']) {
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
                rootNode.classList.add('other');
                let orderChild = data['order'];
                if (data['adoption_type'] === '入' && currentData['id'] === data['adoption_id']) {
                    orderChild = data['order2']
                } else if (data['adoption_type'] === '承' && currentData['id'] === data['adoption_id']) {
                    orderChild = data['order2']
                }

                if (data['is_male']) {
                    descriptionNode.innerHTML += `<div>兒子 (${orderChild})</div>`;
                } else {
                    descriptionNode.innerHTML += `<div>女兒 (${orderChild})</div>`;
                }
                break;

            case 'adoptive child':
                rootNode.classList.add('other');
                if (data['is_male']) {
                    descriptionNode.innerHTML += `<div>兒子 (${data['order']})</div>`;
                } else {
                    descriptionNode.innerHTML += `<div>女兒 (${data['order']})</div>`;
                }
                break;
        }
    }

    let nameNode = node.querySelectorAll('.name')[0];
    let genderIcon = '';
    if (data['is_male']) {
        genderIcon = "<i class=\"fas fa-solid fa-mars fa-fw\"></i>"
    } else {
        genderIcon = "<i class=\"fas fa-solid fa-venus fa-fw\"></i>"
    }

    if (data['is_clan']) {
        if (isSelf) {
            nameNode.innerHTML = `${genderIcon} ${data['first_name']}`;
        } else {
            if (data['adoption_type'] === '入' && currentData['id'] === data['adoption_id']) {
                nameNode.innerHTML = `${genderIcon} <a href="javascript: changeId('${data['id']}');">${data['first_name']} (出) <i class="fas fa-solid fa-link fa-sm"></i></a>`;
            } else if (data['adoption_type'] === '承' && currentData['adoption_id'] === data['id']) {
                nameNode.innerHTML = `${genderIcon} <a href="javascript: changeId('${data['id']}');">${data['first_name']} (出) <i class="fas fa-solid fa-link fa-sm"></i></a>`;
            } else if (data['adoption_type'] !== '') {
                nameNode.innerHTML = `${genderIcon} <a href="javascript: changeId('${data['id']}');">${data['first_name']} (${data['adoption_type']}) <i class="fas fa-solid fa-link fa-sm"></i></a>`;
            } else {
                nameNode.innerHTML = `${genderIcon} <a href="javascript: changeId('${data['id']}');">${data['first_name']} <i class="fas fa-solid fa-link fa-sm"></i></a>`;
            }
        }
    } else {
        if (data['is_male']) {
            nameNode.innerHTML = `${genderIcon} ${data['last_name']}${data['first_name']}`;
        } else if (data['generation'] <= 7 ) {
            nameNode.innerHTML = `${genderIcon} ${data['last_name']}氏 閨名${data['first_name']}`;
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
        if (adoption == '入') {
            order1 = parseInt(data1['order2']);
        }
    }
    if (data2['adoption_type'] !== '') {
        let adoption = data2['adoption_type'];
        if (adoption == '入') {
            order2 = parseInt(data1['order2']);
        }
    }

    return order1 > order2 ? 1 : order1 < order2 ? -1 : 0;
}

function drawNode(id) {
    let currentData = datas[id];
    if (currentData == undefined) {
        currentData = datas[GREAT_HASH];
    } else if (!currentData['is_clan']) {
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

    let dataResult = getRelatedClanDatas(currentData);
    console.log(dataResult);
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
