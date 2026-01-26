# GH Memo (GitHub Memo) 📝

**GH Memo**는 GitHub 저장소를 백엔드로 사용하는 서버리스(Serverless) 메모 애플리케이션입니다. 
당신의 소중한 기록은 당신의 GitHub 저장소(`all-the-notes-of-my-world` 등)에 안전하게 저장되며, 앱은 오직 브라우저에서만 동작하여 완벽한 개인정보 보호를 제공합니다.

![App Icon](./public/icon.png)

## ✨ 주요 기능 (Key Features)

### 1. 🔒 완전한 데이터 소유권 (Data Privacy)
- 별도의 DB 서버를 거치지 않고, **브라우저 ↔ GitHub API**가 직접 통신합니다.
- 토큰(PAT)을 포함한 모든 설정은 사용자의 브라우저 **Local Storage**에만 저장됩니다.

### 2. ⚡️ 서버리스 & PWA (Serverless & PWA)
- **Next.js** 기반의 정적 웹사이트(Static Web App)로 동작합니다.
- **PWA(Progressive Web App)** 지원으로 앱처럼 설치하여 오프라인에서도 조회 가능합니다.
- Cloudflare Pages를 통해 전 세계 어디서나 빠르게 접속 가능합니다.

### 3. ☁️ 강력한 동기화 (Robust Sync)
- **양방향 동기화**: 로컬 변경사항과 원격 저장소의 내용을 똑똑하게 병합(Merge)합니다.
- **오프라인 지원**: 네트워크가 끊겨도 로컬에 저장하고, 연결 시 자동으로 동기화합니다.
- **데이터 보존**: 실수로 원격 저장소가 비워져 있어도, 로컬 데이터를 우선하여 유실을 방지합니다.

### 4. 📱 모바일 최적화 UX (Mobile First)
- **반응형 디자인**: 데스크탑과 모바일에서 완벽하게 동작합니다.
- **제스처 지원**: 모바일 사이드바에서 오른쪽에서 왼쪽으로 밀어서 삭제 (**Swipe to Delete**) 가능.
- **자동 사이드바 제어**: 글 작성 시 자동으로 사이드바가 닫혀 집중을 돕습니다.

### 5. 🎨 프리미엄 UI/UX
- **다크 모드**: 시스템 설정에 따른 자동 다크 모드 지원.
- **마크다운 에디터**: 실시간 미리보기와 깔끔한 글쓰기 환경.
- **우아한 삭제**: 실수 방지를 위한 안전한 삭제 모달(Confirm Modal).
- **새로운 브랜딩**: 직관적이고 깔끔한 v4.0 아이콘 적용.

## 🛠 기술 스택 (Tech Stack)

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks + Local Storage
- **API Client**: [Octokit](https://github.com/octokit/octokit.js) (GitHub API)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

## 🚀 시작하기 (Getting Started)

### 1. 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 2. 배포 (Deployment)

```bash
# 프로덕션 빌드
npm run build

# Cloudflare Pages 배포
npx wrangler pages deploy out --project-name=github-memo
```

## 📝 사용 방법

1. 앱 접속 후 **Settings** 버튼 클릭.
2. GitHub **Personal Access Token** 입력.
3. 메모를 저장할 **Repository Name** 입력 (예: `memo-backup`).
4. **Sync** 버튼을 눌러 동기화 시작!

---

Developed by **LeeChungYoung** & **Antigravity** 🤖
