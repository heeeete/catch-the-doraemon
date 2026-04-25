# 🔫 Catch the Doraemon

> React와 Canvas API를 활용한 인터랙티브 슈팅 웹 게임

**[🎮 게임하기](https://catch-the-doraemon.vercel.app/)** | **인원**: 개인

사용자의 마우스 커서를 따라다니는 조준경으로 화면 속을 빠르게 움직이는 캐릭터를 맞추는 슈팅 게임입니다.
외부 에셋 의존도를 낮추기 위해 Canvas API와 Web Audio API로 그래픽과 사운드를 직접 제어하는 데 초점을 맞췄습니다.

---

## ✨ 핵심 기능

- **Canvas 기반 애니메이션** - requestAnimationFrame으로 60FPS 구현
- **지능형 랜덤 이동** - 벡터 정규화, 방향 보간, 경계 반사
- **실시간 미니맵** - Canvas 드로잉 API로 직접 그린 아이콘 + 실시간 좌표 동기화
- **사운드 합성** - Web Audio API로 오디오 파일 없이 발사음·타격음 생성 **(AI 활용)**
- **난이도 조절** - 타격 누적 시 속도 증가 + 크기 감소

---

## 🧠 기술적 도전 및 해결

### 1. 상태 업데이트와 렌더링 분리

- **문제**: React 상태 변경이 Canvas 애니메이션 루프에 영향을 줘 성능이 저하됐습니다.
- **해결**: 물리 연산 데이터는 **`useRef`** 로 관리해 불필요한 리렌더링을 방지했습니다.

### 2. 조준경 좌표 보정

- **문제**: 커스텀 마우스 커서(조준경)의 위치와 Canvas 내부 히트박스 판정이 일치하지 않았습니다.
- **해결**: **뷰포트 좌표와 이미지 오프셋을 계산**하는 로직을 정교화해 정확한 충돌 판정을 구현했습니다.

### 3. 메모리 누수 방지

- **해결**: 애니메이션 종료 시 **`cancelAnimationFrame`** 과 **`clearTimeout`** 으로 타이머와 루프를 명시적으로 정리했습니다.

---

## 🛠 기술 스택

- **Frontend**: React, SCSS, Canvas API
- **Audio**: Web Audio API

---

# 대기 화면

<img width="1722" alt="스크린샷 2024-11-09 오후 2 06 40" src="https://github.com/user-attachments/assets/2ef81097-8a5d-496b-8b7d-783ecbddc2fd">

# 게임 플레이

![Nov-09-2024 14-09-19](https://github.com/user-attachments/assets/ad2667ce-c6be-422c-b491-e80a7f36ea90)

# 게임 클리어

![Nov-09-2024 14-10-02](https://github.com/user-attachments/assets/9c4a5559-1ac0-4949-9627-04ce165351c8)
