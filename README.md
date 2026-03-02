# 정통 명리 사주·운세

> **정통 명리학 기반 사주·운세 웹 앱으로, Grok API를 통해 실제 사주 풀이 텍스트를 생성하는 정적 웹 프로젝트입니다.**

## 1. 소개 (Introduction)

이 프로젝트는 **정통 명리학 스타일의 사주 풀이/토정비결/궁합/이름풀이/택일 결과를 자동으로 생성**하기 위해 개발된 정적 웹 애플리케이션입니다.  
프론트엔드는 GitHub Pages에 올릴 수 있는 단일 HTML/CSS/JS로 구성하고, **xAI Grok API는 Cloudflare Worker 프록시를 통해 호출**하여 브라우저에서 직접 API 키가 노출되지 않도록 설계했습니다.

**주요 기능**
- **사주 입력 UI**: 평생사주, 토정비결, 궁합, 이름풀이, 택일/이사 메뉴별로 다른 입력 폼을 표시
- **Grok 연동 사주풀이**: 메뉴와 입력값에 따라 다른 System Prompt를 구성해 Grok API로 텍스트를 생성
- **출력 정제 로직**: Grok 응답에 섞인 마크다운, 영문 단어, 과도한 반복 표현 등을 클라이언트에서 후처리로 정리
- **용어 간소화 모드**: 명리학 전문 용어를 정규식으로 감지해 현대어로 치환하고, 간소화 모드에서는 한자를 모두 제거해 순수 한글 설명만 보여줌
- **완전 정적 호스팅**: GitHub Pages, Netlify 등 어디서든 index.html 단일 진입점으로 배포 가능

## 2. 기술 스택 (Tech Stack)

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend/통신**: xAI Grok Chat Completions API (`https://api.x.ai/v1/chat/completions`)  
  → 직접 호출하지 않고, **Cloudflare Worker 프록시** 경유
- **Deployment**:
  - 정적 웹: GitHub Pages (repo root에 `index.html` 배치)
  - API 프록시: Cloudflare Workers (`cloudflare-worker/grok-proxy.js`)

## 3. 설치 및 실행 (Quick Start)

이 프로젝트는 빌드 도구가 없는 **순수 정적 사이트**입니다.  
Node.js는 필수는 아니지만, 로컬 테스트나 wrangler 사용 시 필요할 수 있습니다.

### 3-1. 프로젝트 클론

```bash
git clone <레포지토리 URL>
cd 정통-명리-사주풀이   # 실제 폴더명에 맞게 변경
```

### 3-2. 정적 사이트 확인 (로컬)

간단히 파일을 더블클릭해도 되지만, CORS 문제를 피하려면 로컬 서버를 권장합니다.

```bash
# Python 내장 서버 예시
python -m http.server 8080

# 또는 serve 패키지를 사용하는 경우
npx serve .
```

이후 브라우저에서 `http://localhost:8080` 로 접속합니다.

> ⚠️ Grok 프록시 Worker를 설정하지 않으면, 실제 API 호출은 실패하거나 기본 URL로 나가므로  
> 개발/운영 시 반드시 **GROK_PROXY_URL** 을 실제 Worker 주소로 맞춰야 합니다.

### 3-3. GitHub Pages 배포 요약

1. 이 레포지토리를 GitHub에 푸시
2. 저장소 **Settings → Pages** 이동
3. **Source**: `Deploy from a branch`  
   **Branch**: `main` (또는 기본 브랜치), **Folder**: `/ (root)`
4. 저장 후 `https://<username>.github.io/<repo-name>/` 에서 접속

### 3-4. Grok 프록시 URL 설정

브라우저는 Grok API 키를 알지 못하고, **Cloudflare Worker 프록시 URL** 만 알고 있습니다.

- **기본값**: `js/config.js` 내
  ```js
  var GROK_PROXY_URL = (typeof window !== 'undefined' && window.GROK_PROXY_URL)
      ? window.GROK_PROXY_URL
      : 'https://saju.mjwbryan131.workers.dev/chat'; // 예시: 현재 배포용 Worker URL
  ```

- **운영 환경에서 설정하는 방법**
  1. `index.html` 의 `</head>` 직전에 다음을 추가 (또는 수정):
     ```html
     <script>
       window.GROK_PROXY_URL = 'https://<your-worker-subdomain>.workers.dev/chat';
     </script>
     ```
  2. 혹은 `js/config.js` 의 기본값을 직접 Worker URL로 바꾸고 커밋.

## 4. 폴더 구조 (Structure)

```text
정통 명리 사주풀이/
├── index.html                 # 메인 진입점 (GitHub Pages 루트)
├── README_Info.md             # 서비스 이용자를 위한 안내문
├── README.md                  # (현재 파일) 개발자용 README
├── css/
│   └── style.css              # 전체 스타일, 레이아웃, 타이포그래피
├── js/
│   ├── config.js              # System Prompt 규칙, SYSTEM_PROMPTS, GROK_PROXY_URL 설정
│   ├── date-utils.js          # 날짜/시간 셀렉트 박스 채우기 유틸
│   ├── form-ui.js             # 메뉴별 입력 폼 토글 (평생/토정/궁합/이름/택일)
│   ├── api.js                 # Grok 프록시 호출(requestGrokChat), user 메시지 빌더
│   └── main.js                # 이벤트 바인딩, 제출 처리, 결과 렌더링, 용어 간소화
└── cloudflare-worker/
    ├── grok-proxy.js          # Cloudflare Worker 코드 (Grok API 프록시)
    └── wrangler.toml          # Worker 배포 설정 (wrangler CLI)
```

## 5. Cloudflare Worker / Grok 연동 메모

- **환경 변수**
  - Worker 환경(대시보드 또는 wrangler secret)에 **`GROK_API_KEY`** 를 등록
  - 이 값은 코드나 GitHub에 커밋하지 않음
- **엔드포인트**
  - Worker: `https://<your-worker>.workers.dev/chat` (예시)
  - Worker 내부에서 xAI Grok: `https://api.x.ai/v1/chat/completions`
- **요청 포맷 (Worker로)**
  ```json
  {
    "system": "<SYSTEM_PROMPTS[menu]>",
    "user": "<buildUserMessage(requestData)로 생성된 문자열>"
  }
  ```

## 6. 정보 (Info)

- **License**: MIT 라이센스
