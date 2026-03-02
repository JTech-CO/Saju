/**
 * 메뉴별 폼 UI 전환
 */
function updateFormUI(menu) {
    document.getElementById('tbody-tojeong').classList.add('hidden');
    document.getElementById('tbody-partner').classList.add('hidden');
    document.getElementById('tbody-date').classList.add('hidden');
    document.getElementById('hanja-input-area').classList.add('hidden');

    const titleEl = document.getElementById('form-title');
    const introEl = document.getElementById('form-intro');
    const btnTextEl = document.getElementById('submitBtnText');

    switch (menu) {
        case 'lifetime':
            titleEl.textContent = "사주명식 입력 (평생사주)";
            introEl.innerHTML = "본 서비스는 정통 명리학의 음양오행 및 생극제화 원리를 바탕으로 개인의 선천적인 운명과 후천적인 운의 흐름을 분석합니다.<br>정확한 사주 풀이를 위하여 태어난 생년월일과 시간을 정확하게 입력하여 주십시오. (태어난 시간을 모를 경우, 낮 12시(오시)를 기준으로 임의 산정하여 풀이합니다.)";
            btnTextEl.textContent = "사주 분석하기";
            break;
        case 'tojeong':
            titleEl.textContent = "사주명식 및 연도 입력 (토정비결)";
            introEl.innerHTML = "토정비결은 주역의 음양설을 바탕으로 1년의 길흉화복을 짚어보는 것입니다.<br>대상 연도를 선택하시면 해당 연도의 월별 신수와 주의할 점을 세밀하게 풀어드립니다.";
            document.getElementById('tbody-tojeong').classList.remove('hidden');
            btnTextEl.textContent = "토정비결 보기";
            break;
        case 'gunghap':
            titleEl.textContent = "남녀 사주명식 입력 (궁합보기)";
            introEl.innerHTML = "궁합은 두 사람의 사주명식을 대조하여 상호 간의 조화와 상생, 상극을 살피는 중대한 과정입니다.<br>본인과 상대방의 명식을 모두 정확히 기재하여 주십시오.";
            document.getElementById('tbody-partner').classList.remove('hidden');
            btnTextEl.textContent = "궁합 분석하기";
            break;
        case 'name':
            titleEl.textContent = "사주명식 및 성명 입력 (이름풀이)";
            introEl.innerHTML = "좋은 이름은 사주의 부족한 기운을 채워주고 넘치는 기운을 눌러주는 역할을 합니다.<br>분석할 이름의 한자를 정확히 기재하여 주십시오. (한글 이름일 경우 한자란을 비워두십시오.)";
            document.getElementById('hanja-input-area').classList.remove('hidden');
            btnTextEl.textContent = "이름 풀이하기";
            break;
        case 'date':
            titleEl.textContent = "사주명식 및 목적 입력 (택일/이사)";
            introEl.innerHTML = "큰 대소사를 앞두고 우주의 기운이 본인에게 가장 유리하게 작용하는 날을 고르는 것이 택일입니다.<br>목적과 원하시는 달(月)을 선택해 주십시오.";
            document.getElementById('tbody-date').classList.remove('hidden');
            btnTextEl.textContent = "길일 택일하기";
            break;
    }
}
