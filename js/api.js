/**
 * Grok API 프록시 호출 (Cloudflare Worker)
 */
async function requestGrokChat(systemPrompt, userMessage) {
    const url = typeof GROK_PROXY_URL !== 'undefined' ? GROK_PROXY_URL : (window.GROK_PROXY_URL || '/api/chat');
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system: systemPrompt,
            user: userMessage
        })
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(res.status === 401 ? 'API 인증에 실패했습니다. 프록시 설정을 확인하세요.' : (errText || `API 오류 (${res.status})`));
    }
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || String(data.error));
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return data.text != null ? data.text : (content || '');
}

/**
 * 요청 데이터로 사용자 메시지 문자열 생성
 */
function buildUserMessage(requestData) {
    let msg = `[사용자 정보]\n이름: ${requestData.primaryUser.userName}\n성별: ${requestData.primaryUser.gender}\n양음력: ${requestData.primaryUser.calendarType}\n생년월일시: ${requestData.primaryUser.year}년 ${requestData.primaryUser.month}월 ${requestData.primaryUser.day}일 ${requestData.primaryUser.time}\n`;
    if (requestData.targetYear) msg += `대상 연도: ${requestData.targetYear}년\n`;
    if (requestData.partnerUser) {
        msg += `[상대방 정보]\n이름: ${requestData.partnerUser.userName}\n성별: ${requestData.partnerUser.gender}\n양음력: ${requestData.partnerUser.calendarType}\n생년월일시: ${requestData.partnerUser.year}년 ${requestData.partnerUser.month}월 ${requestData.partnerUser.day}일 ${requestData.partnerUser.time}\n`;
    }
    if (requestData.hanjaName) msg += `한자 이름: ${requestData.hanjaName}\n`;
    if (requestData.eventType) msg += `택일 목적: ${requestData.eventType}\n`;
    if (requestData.targetMonth) msg += `예정 월: ${requestData.targetMonth}월\n`;
    return msg.trim();
}
