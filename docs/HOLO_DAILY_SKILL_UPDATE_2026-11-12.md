# HOLO AI Daily Skill Update — 2026-11-12 (KST)

## 검토 범위·중복 배제
광고·브랜드 / 시네마틱 / 숏폼 / 제품·푸드 / 인물·캐릭터 / 애니·판타지 / 패션·뷰티 / 아트·실험. 기존 11월 기록의 제품 교체, 첫 프레임 승인, 역확장, 카메라 명령 검증, FPS/비트레이트, 버전 고정, 물리 동작 명료화와 구분되는 **후반 화면비 재구성** 및 **원본 영상 수정 강도 선택**을 선정. 아래는 공급자 문서에 근거한 HOLO 적용 설계안이며 엔진 구현/성능 검증은 아님.

## 신규 스킬 1 — Subject-Safe Aspect-Ratio Reframe Gate
- **원리:** 원본 영상의 단순 중앙 크롭 대신 재구성 가능한 리프레임 경로를 분리한다. Luma API는 video/reframe에 목표 aspect_ratio 및 위치/크롭 관련 필드를 제공한다.
- **조건:** 16:9 마스터를 9:16 쇼츠 또는 1:1 피드용으로 변환할 때, 얼굴·손·제품·로고가 화면 안전영역을 벗어나는 경우. 원본/목표 화면비, 필수 피사체 바운딩 영역, 텍스트 안전영역, 승인 레퍼런스를 기록한다.
- **좋은 예:** 가로형 세럼 광고를 세로형으로 전환하며 모델 얼굴과 세럼 라벨을 모두 보존하도록 샷별 구도 재검토.
- **피할 것:** 원본에 없는 제품 라벨·손가락을 생성으로 복원한 결과를 사실적 원본으로 간주하거나, 단순 크롭으로 충분한 장면에 불필요한 재생성을 수행.
- **QA:** source_ratio, target_ratio, must_keep_regions, logo_legibility, face_identity, hand_geometry, synthetic_content_flag, manual_approval.
- **차별점:** 기존 카메라 모션/첫 프레임/제품 교체는 샷 생성 또는 교체; 본 스킬은 **완성본의 플랫폼별 구도 납품**.
- **공식 근거:** Luma Reframe a video API, https://docs.lumalabs.ai/reference/reframevideo (2026-11-12 확인; 페이지의 'Updated 4 months ago' 표시). Luma 전용 기능으로 MiniMax 직접 API 지원은 미확인.

## 신규 스킬 2 — Source-Fidelity Modification Strength Ladder
- **원리:** 원본 영상 편집 시 변경 강도를 단계적으로 선택한다. Luma Modify Video 문서는 adhere_1~3, flex_1~3, reimagine_1~3 모드를 명시한다. 모드별 실제 보존율은 테스트로 검증해야 한다.
- **조건:** 이미 승인된 인물/제품/동작을 바탕으로 배경 또는 스타일만 수정하려는 경우. 원본 보존이 최우선이면 낮은 변경 강도부터 시도하고 변경 항목을 제한한다.
- **좋은 예:** 모델 얼굴·세럼 패키지·손 동작은 유지하면서 배경의 분위기만 바꾸는 테스트를 낮은 변경 강도부터 진행.
- **피할 것:** 법적·광고적 정확성이 필요한 로고/성분표를 생성 모델에 재작성하게 하거나, 강한 reimagine 결과를 원본과 동일하다고 승인하는 경우.
- **QA:** source_asset_id, intended_changes, locked_identity_fields, mode, face_diff_review, product_geometry_review, text_label_review, approval.
- **차별점:** 기존 Product Swap은 **교체 대상 제품** 중심; 이번은 **원본 보존 대비 전체 수정 강도**를 선택하는 범용 후처리 제어.
- **공식 근거:** Luma Modify Video, https://docs.lumalabs.ai/docs/modify-video ; API https://docs.lumalabs.ai/reference/modifyvideo (2026-11-12 확인). MiniMax 직접 API의 동일 모드 지원은 확인되지 않음.

## 카테고리별 적용
| 카테고리 | Reframe | Modification ladder |
|---|---|---|
| 광고·브랜드 | 로고/제품 안전영역 | 승인 광고의 배경 수정 |
| 시네마틱 | 가로/세로 구도 재구성 | 장면 분위기 선택적 수정 |
| 숏폼 | 9:16 후킹 피사체 유지 | 기존 숏폼 변형 제작 |
| 제품·푸드 | 라벨/음식 핵심 부분 보호 | 플레이팅/배경 수정 |
| 인물·캐릭터 | 얼굴/손 화면 내 유지 | 캐릭터 정체성 보호 |
| 애니·판타지 | 주요 캐릭터 구도 보존 | 효과/세계관 스타일 조정 |
| 패션·뷰티 | 얼굴/의상/제품 안전영역 | 피부·의상 색상 검수 |
| 아트·실험 | 의도적 화면비 변형 | 강한 재해석은 별도 승인 |

## 변경 전후·운영
- 이전: 레퍼런스/버전 기록 → 생성 → 음성·색상·제품·얼굴 QA → 납품.
- 이후(설계): 기존 흐름 → **채널별 화면비/필수 피사체 영역 검사** → 필요 시 reframe → **수정 목적에 맞는 보존 강도 선택** → 기존 얼굴·로고·손·대사 QA 재검사 → 납품.
- **상태:** 문서 스킬만 추가. 실제 HOLO 코드, MiniMax 어댑터, Railway 배포, 영상 A/B 테스트 미변경. 공급자별 API 지원 및 비용 확인 후 구현 판단.
