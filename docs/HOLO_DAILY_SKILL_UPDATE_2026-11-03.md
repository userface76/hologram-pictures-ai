# HOLO AI Daily Skill Update — 2026-11-03 (KST)

## 검토 범위 및 채택 판단
8개 영상 카테고리: 광고·브랜드 / 시네마틱 / 숏폼 / 제품·푸드 / 인물·캐릭터 / 애니·판타지 / 패션·뷰티 / 아트·실험.

2026-11-03에 공식 제작 문서 확인. 저장소의 기존 HOLO 일일 스킬 문서(2026-09-19~11-02)와 중복 점검: Reference Motion Isolation, Multi-shot Asset Lock, Reference Budget Router, Timing Anchor, Context-Matched Soundscape Anchor, Product Reference Acquisition Gate, Korean Dialogue Duration Gate, MiniMax Korean Speech Locale & Pause Contract, Last-Frame Bridge, Audio Rhythm Reference, Source-Preserving Video Edit, Scene Color Match, Multi-Shot Intent & Identity Anchor 등과 비교했다.

오늘은 **대사 가독성을 위한 오디오 레벨 자동 제어**와 **제품 영상 생성 전에 승인된 정지 프레임을 확보하는 제작 게이트** 2개만 채택. 두 규칙은 공급자 기능을 HOLO가 이미 지원한다는 주장이 아니라, 근거 있는 제작·검수 워크플로 제안이다.

## 신규 스킬 1 — Dialogue-First Auto-Ducking & Loudness QA
**한국어:** 대사 우선 배경음 자동 감쇠 및 클립 간 음량 균일화

### 핵심 원리
내레이션/대사가 나올 때 배경 음악·환경음 레벨을 일시적으로 낮추고, 대사가 끝나면 자연스럽게 복귀시킨다. 개별 클립의 음량을 일관되게 정렬해 갑작스러운 볼륨 점프를 막는다. Adobe Premiere 공식 문서(2026-01-07 갱신)는 Essential Sound의 Dialogue/Music/Ambience 분류, Duck Against, Sensitivity, Duck Amount, Fade Duration/Position, Generate Keyframes 및 Auto-Match(LUFS 표시)를 명시한다.

### 적용 조건
- 내레이션과 배경음악/효과음이 함께 있는 광고·숏폼·제품·뷰티 영상
- 여러 장면을 HOLO Composer로 합성하며 오디오 레벨이 다른 경우
- 한국어 음성이 작거나 배경음에 묻혀 발음이 불명확하게 들리는 경우
- 음성·음악·SFX를 별도 트랙으로 합성할 수 있을 때 최우선 적용

### 좋은 예시
15초 화장품 광고: 0~3초 음악과 물방울 효과음으로 훅을 만든다. 3~10초 한국어 제품 설명이 시작되면 음악을 부드럽게 감쇠하고 목소리를 유지한다. 10~13초 대사가 끝나면 음악을 복귀시키고 13~15초 브랜드 엔딩을 보여준다. 최종 합성물의 구간별 음량을 측정하고 갑작스러운 볼륨 점프나 클리핑이 없는지 청취한다. 페이드 길이·감쇠량은 콘텐츠별 청취 테스트로 정한다.

### 피해야 할 경우
- 대사 없는 음악 영상에 무조건 덕킹을 적용
- 음악과 대사가 이미 한 트랙에 섞인 파일을 분리 없이 완벽하게 덕킹할 수 있다고 가정
- 모든 플랫폼에 -23 LUFS 같은 단일 목표를 보편적으로 강제(Adobe UI 예시 수치이지 HOLO 출력 표준이 아님)
- 지나치게 짧은 페이드로 펌핑을 만들거나 음악의 중요한 비트를 파괴
- 음량 조절로 한국어 발음 오류/중국어 혼입/말하기 과속이 해결된다고 주장

### HOLO 운영/검수
1. Voice, Music, SFX, Ambience 트랙을 구분한다. 단일 믹스 파일이면 한계를 표시한다.
2. 한국어 대사 길이·언어 검사(기존 스킬)를 먼저 통과시킨다.
3. 대사 구간의 음악·환경음을 감쇠하고 짧은 쉼에서 불필요한 펌핑이 없는지 점검한다.
4. 전체 클립의 음량 일관성, 피크/클리핑, 대사 명료도, 엔딩 음악 복귀를 검사한다.
5. 원본 음성과 합성본을 비교해 재생 속도/피치가 의도치 않게 변하지 않았는지 확인한다.
6. 자동 덕킹 구현/적정 LUFS 목표/트랙 메타데이터 지원은 HOLO Composer 실제 코드와 렌더러 능력 검증 후 별도 개발한다.

### 기존 스킬과의 차이
- Context-Matched Soundscape Anchor: **어떤 소리를 언제 배치할지** 선택.
- Korean Dialogue Duration/Locale: **대사의 길이와 언어**를 관리.
- 오늘 스킬: **믹싱 단계에서 목소리와 음악의 상대 음량 및 전체 음량 일관성**을 관리.

### 공식 근거 (2026-11-03 확인)
- Adobe Premiere, Automatically duck audio (Last updated 2026-01-07): https://helpx.adobe.com/premiere/desktop/add-audio-effects/adjust-volume-and-levels/automatically-duck-audio.html
- Adobe Premiere, Auto-match audio loudness (Last updated 2026-01-07): https://helpx.adobe.com/premiere/desktop/add-audio-effects/adjust-volume-and-levels/auto-match-audio-loudness.html
- Adobe Premiere, Audio editing with Essential Sound (2026-01-07): https://helpx.adobe.com/premiere/desktop/add-audio-effects/adjust-volume-and-levels/audio-editing-with-essential-sound-panel.html

## 신규 스킬 2 — Approved Hero Frame Before Animation
**한국어:** 제품 광고 영상화 전 승인된 첫 프레임 확보

### 핵심 원리
제품 사진을 바로 영상화하기보다 먼저 **제품 배치·조명·배경·브랜드 색·구도**가 맞는 정지 프레임을 생성·검수하고 승인한 뒤, 그 이미지를 시작 프레임으로 영상화한다. Runway Product Shot Video Builder 공식 가이드는 (1) 제품 이미지·컬러 팔레트·타깃·환경·광고 콘셉트를 지정해 프레임 생성, (2) 첫 프레임 확인 후 선택적 모션 프롬프트로 애니메이션 생성의 2단계를 설명한다. 승인되지 않은 첫 프레임은 Redo로 다시 제작할 수 있다.

### 적용 조건
- 실제 제품 SKU, 패키지, 색상, 뚜껑, 로고 위치의 재현이 중요한 광고·브랜드 / 제품·푸드 / 패션·뷰티
- 촬영 배경·조명·구도 때문에 제품이 왜곡되거나 재생성 비용이 반복되는 경우
- 첫 프레임 입력을 지원하는 생성 모델이나 정지 이미지를 별도 영상화할 수 있는 워크플로
- MiniMax H3를 Runway에서 사용할 경우 공식 문서에 first-frame 모드가 있지만 **Runway UI의 H3 지원을 HOLO 직접 API 지원과 동일시하지 않음**

### 좋은 예시
실제 세럼 병의 승인된 정면 사진을 입력하고, 브랜드 컬러와 부드러운 측면 조명, 깨끗한 배경의 정지 제품 컷을 먼저 생성한다. 패키지 형태·라벨 위치·병뚜껑·색상을 비교해 승인한 다음, '카메라가 천천히 제품으로 다가간다' 정도의 단순한 모션만 부여한다. 완성 후에도 제품 형태와 라벨의 흔들림을 검수한다. 정확한 로고 텍스트는 기존 Tracked Brand Graphic 방식으로 후반 합성한다.

### 피해야 할 경우
- 제품 패키지 승인 없이 분위기만 보고 프레임을 통과시키는 것
- 첫 프레임이 정확하면 영상 전체에서 제품이 반드시 유지된다고 보장하는 것
- 움직임이 중심인 다큐멘터리/실사 액션에 불필요한 정지 프레임 승인 절차를 강제하는 것
- 첫 프레임과 다른 패키지 버전의 레퍼런스를 섞는 것
- 공급자별 키프레임/레퍼런스 조합 제약을 무시하는 것. Runway의 MiniMax H3 안내는 keyframes와 references를 함께 쓸 수 없다고 명시한다.

### HOLO 운영/검수
1. 기존 Product Reference Acquisition Gate로 승인된 제품 원본 확보.
2. 목표 SKU, 브랜드 색, 환경, 렌즈 느낌, 구도를 정해 정지 hero frame 초안 제작.
3. 첫 프레임에서 제품 실루엣·색·패키지 버전·라벨 위치·반사·가림·브랜드 톤 검사.
4. 승인된 프레임만 영상 엔진에 전달. 미승인 시 **정지 프레임 단계만 수정**.
5. 영상 생성 후 제품 정체성 드리프트, 카메라 움직임, 조명 일관성 검사.
6. 실제 비용 절감 여부는 이미지 프리플라이트 추가 비용까지 포함해 비교 측정한다.

### 기존 스킬과의 차이
- Product Reference Acquisition Gate: **입력 원본 이미지 품질** 검수.
- Multi-Shot Intent & Identity Anchor Plan: **여러 샷의 목적과 정체성** 설계.
- 오늘 스킬: **비용이 큰 영상 생성 이전에 결과물의 첫 프레임을 승인**하는 단계.
- Last-Frame Bridge: **이미 만들어진 영상들 사이** 연결. 이 스킬과 다름.

### 공식 근거 (2026-11-03 확인)
- Runway, Product Shot Video Builder (2026-11-03 확인, 페이지 게시일 미표기): https://help.runwayml.com/hc/en-us/articles/51200316594707-Product-Shot-Video-Builder
- Runway, Creating with Minimax H3 (2026-11-03 확인, 페이지 게시일 미표기): https://help.runwayml.com/hc/en-us/articles/54046029551379-Creating-with-Minimax-H3

## 8개 카테고리 적용 매핑
| 카테고리 | 대사 우선 덕킹/음량 QA | 승인된 제품 첫 프레임 |
|---|---|---|
| 광고·브랜드 | 최우선: 내레이션+음악 | 최우선: 패키지·브랜드 히어로샷 |
| 시네마틱 | 우선: 대사·음악·환경음 균형 | 조건부: 핵심 소품/오브젝트 클로즈업 |
| 숏폼 | 최우선: 짧은 멘트의 명료도 | 우선: 상품 훅 컷 |
| 제품·푸드 | 우선: 설명·조리 효과음 균형 | 최우선: 제품 형태·푸드 플레이팅 |
| 인물·캐릭터 | 최우선: 대사와 배경음 분리 | 조건부: 캐릭터 소품 소개 |
| 애니·판타지 | 우선: 대사·SFX 충돌 회피 | 조건부: 핵심 마법 소품/아이템 |
| 패션·뷰티 | 우선: 모델 멘트·BGM 균형 | 최우선: 뷰티 제품·의상 디테일 |
| 아트·실험 | 선택: 대사 중심일 때만 | 선택: 오브젝트 정체성이 중요할 때 |

## 변경 전후
- **이전:** 제품 참조/역할/대사 길이 → 생성 → 클립 연결·색상·리프레임·음성 검사 → 합성.
- **이후:** 기존 규칙 유지 + (제품 광고의 경우) **승인된 정지 hero frame 프리플라이트** → 생성 → (음성·음악이 공존하는 경우) **대사 우선 덕킹 및 음량 일관성 QA** → 합성 검수.

## 중복·근거 부족으로 제외
- '한국어 프롬프트만 길게 쓰면 중국어가 없어짐': 검증 근거 부족.
- '무조건 모든 영상에 고정 LUFS 적용': 플랫폼·콘텐츠별 목표 다름.
- 'MiniMax H3에서 모든 Runway UI 기능이 HOLO API에 그대로 제공': 지원 여부 불명.
- '첫 프레임 승인으로 영상 전체 identity 100% 보장': 과장.

## 적용·검증 상태
- 2026-11-03 공식 문서 검토: 완료.
- 저장소의 기존 일일 스킬 중복 점검: 완료.
- GitHub 문서 누적: 이 파일로 수행.
- HOLO 엔진/Composer 코드 수정, Railway 배포, 실제 영상 A/B 테스트: **수행하지 않음**.
- 비용·품질 개선 효과: 실측 전, 미확인.
