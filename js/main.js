/**
 * 정통 명리 사주풀이 - 메인 진입점 및 폼/결과 처리
 */
let currentMenu = 'lifetime';
let originalResultText = '';
let cachedSimplifiedText = '';
let isSimplified = false;

/**
 * Grok 응답에 섞여 올 수 있는 마크다운/HTML/영문/과도한 반복 표현을 정리
 */
function stripMarkdownFormatting(text) {
    if (!text) return '';
    let s = String(text);

    // 제목 기호 (#, ## 등) 제거
    s = s.replace(/^#{1,6}\s+/gm, '');

    // 이미지/링크: ![alt](url), [text](url) -> alt 또는 text만 남김
    s = s.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
    s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // 굵게/기울임: **text**, *text*, __text__, _text_ -> 텍스트만
    s = s.replace(/(\*\*|__)(.*?)\1/g, '$2');
    s = s.replace(/(\*|_)(.*?)\1/g, '$2');

    // 인라인 코드: `code` -> code
    s = s.replace(/`([^`]+)`/g, '$1');

    // 인용문: > text -> text
    s = s.replace(/^\s*>\s?/gm, '');

    // 글머리 기호/번호 목록: "- ", "* ", "1. " 등 -> "• "로 통일
    s = s.replace(/^[\s>*-]*[-*+]\s+/gm, '• ');
    s = s.replace(/^\s*\d+\.\s+/gm, '• ');

    // 수평선(---, ***) 제거
    s = s.replace(/^[-*_]{3,}\s*$/gm, '');

    // 3글자 이상 연속 영문 단어 제거 (impulsiveness 등)
    s = s.replace(/[A-Za-z]{3,}/g, '');

    // '사주사주', '운세운세' 등 같은 한글 단어 반복 제거 (2~4글자 기준)
    s = s.replace(/([가-힣]{2,4})\1+/g, '$1');

    // 연속 공백을 하나로
    s = s.replace(/[ \t]{2,}/g, ' ');

    // 불필요한 빈 줄 여러 개를 두 줄 이하로 축소
    s = s.replace(/\n{3,}/g, '\n\n');

    return s.trim();
}

document.addEventListener('DOMContentLoaded', function () {
    populateDateSelects('birthYear', 'birthMonth', 'birthDay', 1990);
    populateDateSelects('partnerBirthYear', 'partnerBirthMonth', 'partnerBirthDay', 1992);

    const targetMonthSelect = document.getElementById('targetMonth');
    for (let i = 1; i <= 12; i++) {
        targetMonthSelect.options.add(new Option(`${i}월`, i));
    }
    targetMonthSelect.value = new Date().getMonth() + 1;

    (function startSajuLoaderCycle() {
        const desc = ['생장의 기운을 읽는 중…', '열정의 기운을 읽는 중…', '중화의 기운을 읽는 중…', '결실의 기운을 읽는 중…', '지혜의 기운을 읽는 중…'];
        const items = document.querySelectorAll('#saju-loader .oh');
        const txt = document.getElementById('saju-loader-text');
        if (!items.length || !txt) return;
        let i = 0;
        function activate(idx) {
            items.forEach(function (el) { el.classList.remove('active'); });
            for (let n = 0; n < 5; n++) {
                const line = document.getElementById('al-' + n);
                if (line) line.classList.remove('active');
            }
            items[idx].classList.add('active');
            var prev = idx === 0 ? 4 : idx - 1;
            var line = document.getElementById('al-' + prev);
            if (line) line.classList.add('active');
            txt.textContent = desc[idx];
        }
        activate(0);
        setInterval(function () { i = (i + 1) % 5; activate(i); }, 2000);
    })();
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
    const sajuLoader = document.getElementById('saju-loader');
    const resultDisplay = document.getElementById('result-display');
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-text');

    resultArea.style.display = 'block';
    sajuLoader.style.display = 'flex';
    resultDisplay.style.display = 'none';

    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';

    try {
        const userMessage = buildUserMessage(requestData);
        const sajuRawResult = await requestGrokChat(requestData.systemPromptTemplate, userMessage);
        const sajuResult = stripMarkdownFormatting(sajuRawResult);

        let titleStr = '';
        if (currentMenu === 'lifetime') titleStr = `${name} 님의 평생 사주 분석 결과`;
        else if (currentMenu === 'tojeong') titleStr = `${name} 님의 ${requestData.targetYear}년 토정비결 신수`;
        else if (currentMenu === 'gunghap') titleStr = `${requestData.primaryUser.userName} 님과 ${requestData.partnerUser.userName} 님의 궁합 분석`;
        else if (currentMenu === 'name') titleStr = `${name} (${requestData.hanjaName || '한글이름'}) 님의 성명학 풀이`;
        else if (currentMenu === 'date') titleStr = `${name} 님의 ${requestData.targetMonth}월 ${requestData.eventType} 택일 결과`;

        originalResultText = sajuResult;
        cachedSimplifiedText = '';
        isSimplified = false;
        const simplifyBtn = document.getElementById('btn-simplify');
        simplifyBtn.style.display = 'block';
        simplifyBtn.textContent = '어려운 용어 AI 간소화';

        resultTitle.textContent = titleStr;
        resultText.textContent = sajuResult;

        sajuLoader.style.display = 'none';
        resultDisplay.style.display = 'block';
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
        sajuLoader.style.display = 'none';
        alert('명식을 분석하는 중 오류가 발생하였습니다. 다시 시도해 주십시오.\n' + (err.message || ''));
        console.error(err);
    } finally {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
});

document.getElementById('btn-simplify').addEventListener('click', async function () {
    const resultText = document.getElementById('result-text');
    const simplifyBtn = this;

    if (!isSimplified) {
        simplifyBtn.textContent = '원본 풀이로 복구';

        function escapeHtml(s) {
            return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        if (cachedSimplifiedText) {
            resultText.innerHTML = `<div style="background-color: #fdfaf6; border: 1px dashed #cbb8a0; padding: 15px; margin-bottom: 20px; font-size: 14px; color: #665243;"><b>※ AI 용어 간소화 모드</b>: 일반인이 이해하기 쉬운 말로 풀어 쓴 버전입니다.</div>${escapeHtml(cachedSimplifiedText)}`;
            isSimplified = true;
            return;
        }

        resultText.innerHTML = '<div style="text-align:center; color:#7a4b3a; margin: 40px 0; font-weight: bold; animation: blink 2s infinite;">쉬운 말로 풀어 쓰는 중입니다. 잠시만 기다려 주십시오...</div>';
        simplifyBtn.disabled = true;

        try {
            const raw = await requestGrokChat(SIMPLIFY_PROMPT, originalResultText);
            const simplified = stripMarkdownFormatting(raw);
            cachedSimplifiedText = simplified;
            resultText.innerHTML = `<div style="background-color: #fdfaf6; border: 1px dashed #cbb8a0; padding: 15px; margin-bottom: 20px; font-size: 14px; color: #665243;"><b>※ AI 용어 간소화 모드</b>: 일반인이 이해하기 쉬운 말로 풀어 쓴 버전입니다.</div>${escapeHtml(simplified)}`;
            isSimplified = true;
        } catch (err) {
            alert('간소화 중 오류가 발생하였습니다. 다시 시도해 주십시오.\n' + (err.message || ''));
            resultText.textContent = originalResultText;
            simplifyBtn.textContent = '어려운 용어 AI 간소화';
        } finally {
            simplifyBtn.disabled = false;
        }
    } else {
        simplifyBtn.textContent = '어려운 용어 AI 간소화';
        resultText.textContent = originalResultText;
        isSimplified = false;
    }
});
