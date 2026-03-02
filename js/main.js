/**
 * 정통 명리 사주풀이 - 메인 진입점 및 폼/결과 처리
 */
let currentMenu = 'lifetime';
let originalResultText = '';
let isSimplified = false;

document.addEventListener('DOMContentLoaded', function () {
    populateDateSelects('birthYear', 'birthMonth', 'birthDay', 1990);
    populateDateSelects('partnerBirthYear', 'partnerBirthMonth', 'partnerBirthDay', 1992);

    const targetMonthSelect = document.getElementById('targetMonth');
    for (let i = 1; i <= 12; i++) {
        targetMonthSelect.options.add(new Option(`${i}월`, i));
    }
    targetMonthSelect.value = new Date().getMonth() + 1;
});

document.querySelectorAll('#main-nav a').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('#main-nav a').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        currentMenu = this.getAttribute('data-menu');
        updateFormUI(currentMenu);
    });
});

document.getElementById('saju-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('userName').value;
    const gender = document.querySelector('input[name="gender"]:checked').parentElement.textContent.trim();
    const calendar = document.querySelector('input[name="calendar"]:checked').parentElement.textContent.trim();
    const year = document.getElementById('birthYear').value;
    const month = document.getElementById('birthMonth').value;
    const day = document.getElementById('birthDay').value;
    let timeValue = document.getElementById('birthTime').value;
    let time = document.getElementById('birthTime').options[document.getElementById('birthTime').selectedIndex].text;
    if (timeValue === 'unknown') time = '오시 (낮 12시 기준)';

    const requestData = {
        menuType: currentMenu,
        systemPromptTemplate: SYSTEM_PROMPTS[currentMenu],
        primaryUser: {
            userName: name,
            gender: gender,
            calendarType: calendar,
            year: year,
            month: month,
            day: day,
            time: time
        }
    };

    if (currentMenu === 'tojeong') {
        requestData.targetYear = document.getElementById('targetYear').value;
    } else if (currentMenu === 'gunghap') {
        let pTimeValue = document.getElementById('partnerBirthTime').value;
        let pTime = document.getElementById('partnerBirthTime').options[document.getElementById('partnerBirthTime').selectedIndex].text;
        if (pTimeValue === 'unknown') pTime = '오시 (낮 12시 기준)';
        requestData.partnerUser = {
            userName: document.getElementById('partnerName').value,
            gender: document.querySelector('input[name="partnerGender"]:checked').parentElement.textContent.trim(),
            calendarType: document.querySelector('input[name="partnerCalendar"]:checked').parentElement.textContent.trim(),
            year: document.getElementById('partnerBirthYear').value,
            month: document.getElementById('partnerBirthMonth').value,
            day: document.getElementById('partnerBirthDay').value,
            time: pTime
        };
    } else if (currentMenu === 'name') {
        requestData.hanjaName = document.getElementById('userHanja').value;
    } else if (currentMenu === 'date') {
        requestData.eventType = document.getElementById('eventType').value;
        requestData.targetMonth = document.getElementById('targetMonth').value;
    }

    const resultArea = document.getElementById('result-area');
    const loadingState = document.getElementById('loading-state');
    const resultDisplay = document.getElementById('result-display');
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-text');

    resultArea.style.display = 'block';
    loadingState.style.display = 'block';
    resultDisplay.style.display = 'none';

    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';

    try {
        const userMessage = buildUserMessage(requestData);
        const sajuResult = await requestGrokChat(requestData.systemPromptTemplate, userMessage);

        let titleStr = '';
        if (currentMenu === 'lifetime') titleStr = `${name} 님의 평생 사주 분석 결과`;
        else if (currentMenu === 'tojeong') titleStr = `${name} 님의 ${requestData.targetYear}년 토정비결 신수`;
        else if (currentMenu === 'gunghap') titleStr = `${requestData.primaryUser.userName} 님과 ${requestData.partnerUser.userName} 님의 궁합 분석`;
        else if (currentMenu === 'name') titleStr = `${name} (${requestData.hanjaName || '한글이름'}) 님의 성명학 풀이`;
        else if (currentMenu === 'date') titleStr = `${name} 님의 ${requestData.targetMonth}월 ${requestData.eventType} 택일 결과`;

        originalResultText = sajuResult;
        isSimplified = false;
        const simplifyBtn = document.getElementById('btn-simplify');
        simplifyBtn.style.display = 'block';
        simplifyBtn.textContent = '어려운 용어 AI 간소화';

        resultTitle.textContent = titleStr;
        resultText.textContent = sajuResult;

        loadingState.style.display = 'none';
        resultDisplay.style.display = 'block';
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
        loadingState.style.display = 'none';
        alert('명식을 분석하는 중 오류가 발생하였습니다. 다시 시도해 주십시오.\n' + (err.message || ''));
        console.error(err);
    } finally {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
});

document.getElementById('btn-simplify').addEventListener('click', async function () {
    const resultText = document.getElementById('result-text');

    if (!isSimplified) {
        this.textContent = '원본 풀이로 복구';
        resultText.innerHTML = '<div style="text-align:center; color:#7a4b3a; margin: 40px 0; font-weight: bold; animation: blink 2s infinite;">AI가 어려운 명리학 용어를 현대어로 쉽게 풀이하고 있습니다...</div>';

        await new Promise(resolve => setTimeout(resolve, 1500));

        const easyText = originalResultText
            .replace(/명식\(命式\)|명식/g, '사주(태어난 생년월일시)')
            .replace(/생극제화\(生剋制化\)/g, '기운들의 상호작용(서로 돕고 견제하는 흐름)')
            .replace(/용신\(用神\)/g, '나에게 가장 필요한 수호신 같은 기운')
            .replace(/운로\(運路\)/g, '앞으로의 운의 흐름')
            .replace(/천간\(天干\)/g, '겉으로 드러나는 기운(생각, 이상)')
            .replace(/지지\(地支\)/g, '현실적으로 작용하는 기운(환경, 실천)')
            .replace(/형살\(刑殺\)/g, '강하게 부딪히거나 조정해야 하는 기운')
            .replace(/하심\(下心\)/g, '자신을 낮추고 양보하는 마음')
            .replace(/재성\(財星\)/g, '재물과 결과를 만들어내는 기운')
            .replace(/정재\(正財\)/g, '안정적이고 고정적인 수입')
            .replace(/대운\(大運\)/g, '10년 단위로 크게 바뀌는 운의 흐름')
            .replace(/관성\(官星\)/g, '명예, 직장, 책임감을 의미하는 기운')
            .replace(/신수\(身數\)/g, '한 해의 개인적인 운세')
            .replace(/구설수\(口舌數\)/g, '남의 입에 오르내리며 겪는 다툼')
            .replace(/조후\(調候\)/g, '온도와 계절의 균형')
            .replace(/육합\(六合\)/g, '서로 강하게 끌리고 합쳐지는 기운')
            .replace(/원진\(怨嗔\)/g, '서로 미워하고 원망하는 기운')
            .replace(/수리성명학 \(數理姓名學\)/g, '이름의 획수를 바탕으로 운을 보는 학문')
            .replace(/원형이정\(元亨利貞\)/g, '사계절의 흐름처럼 일생의 4가지 단계')
            .replace(/형격\(亨格\)/g, '청장년기의 운세')
            .replace(/자원오행\(字源五行\)/g, '한자 자체가 가지고 있는 자연의 기운')
            .replace(/희용신\(喜用神\)/g, '사주에서 가장 반갑고 필요한 좋은 기운')
            .replace(/생기\(生氣\)/g, '활력이 넘치는 좋은 기운')
            .replace(/천의\(天醫\)/g, '하늘이 돕는 치유와 구원의 기운')
            .replace(/흉살\(凶殺\)/g, '불길하고 해로운 기운')
            .replace(/천덕귀인\(天德貴人\)/g, '하늘의 덕을 받아 재난을 피하게 해주는 귀인')
            .replace(/일진\(日辰\)/g, '그날그날의 운세')
            .replace(/상충\(相沖\)/g, '강하게 부딪혀 깨지는 기운');

        resultText.innerHTML = `<div style="background-color: #fdfaf6; border: 1px dashed #cbb8a0; padding: 15px; margin-bottom: 20px; font-size: 14px; color: #665243;"><b>※ AI 용어 간소화 모드</b>: 어려운 한자어와 전문 명리 용어를 이해하기 쉬운 말로 풀어서 설명합니다.</div>${easyText}`;
        isSimplified = true;
    } else {
        this.textContent = '어려운 용어 AI 간소화';
        resultText.textContent = originalResultText;
        isSimplified = false;
    }
});
