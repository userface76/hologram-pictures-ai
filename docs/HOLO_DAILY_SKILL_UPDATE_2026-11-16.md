# HOLO AI Daily Skill Update — 2026-11-16 (KST)

## 검토 범위·중복 판정
8개 카테고리(광고·브랜드, 시네마틱, 숏폼, 제품·푸드, 인물·캐릭터, 애니·판타지, 패션·뷰티, 아트·실험)를 검토. 기존 11월 6~15일의 컷 분리, 버전 고정, 프롬프트 명료화, 레퍼런스 관리, 제품 교체, UGC, 동작 전이 스킬과 대조. 신규 채택 1개: **Shot-Budgeted Multi-Cut Continuity Gate**. 모델별 기능을 HOLO/MiniMax 지원 기능으로 오인하지 않도록 문서 수준의 선택적 규칙으로 추가.

## 신규 스킬 — Shot-Budgeted Multi-Cut Continuity Gate
- **핵심 원리:** 짧은 영상의 컷 수·컷별 길이·서사 기능(후킹/증명/마무리)을 생성 전에 고정하고, 인접 컷의 제품 방향·손 위치·조명 방향·화자·화면 축을 연속성 표로 검사한다. Runway Dev 공식 Multi-Shot Video Recipe는 auto 모드의 이야기 분해 및 custom 모드의 3~5개 샷 목록과 각 샷 duration의 합계가 전체 duration과 같아야 함을 문서화한다. 이는 특정 공급자의 지원 규격이지 모든 생성 모델의 공통 능력은 아니다.
- **적용 조건:** 10~15초 내 여러 장면이 필요하고, 각 샷의 역할과 전체 러닝타임이 승인된 경우. 지원 공급자에서는 custom shot list 사용, 미지원 공급자에서는 샷별 독립 생성 후 편집. 얼굴·제품·로고는 기존 승인 참조와 QA 규칙을 그대로 유지.
- **좋은 예:** 12초 세럼 광고: 0~3초 제품 라벨 정면 후킹(3초) → 3~7초 오른손으로 병을 들어 사용 장면(4초) → 7~12초 동일 제품/라벨 정면의 엔딩 히어로 샷(5초). 컷 사이 제품 색·용기 크기·손 방향·키라이트 위치·한국어 멘트/자막 연속성을 검수.
- **피해야 할 경우:** 단일 롱테이크가 더 적합한 영상, 3초 내 지나치게 많은 액션, 제품이 컷마다 변형되는 경우, 광고 문구/초상/상표 권리가 불명확한 경우, 공급자 미지원 상태에서 multi-shot API 지원을 가정하는 경우.
- **선택적 QA 필드:** total_duration_s, shot_count, shot_id, shot_duration_s, shot_purpose, subject_reference_id, product_reference_id, screen_direction, hand_occupancy, key_light_direction, spoken_script_segment, cut_continuity_pass, human_approval.
- **기존 스킬과 차이:** Scene-Boundary Extraction은 생성된 영상의 컷을 사후 검출하고, Version-Pinned Workflow는 생성 파이프라인을 재현한다. 이번 스킬은 **생성 전 컷별 시간 예산과 컷 간 시각적·서사적 연속성**을 통제한다.

## 8개 카테고리 적용
| 카테고리 | 적용 |
|---|---|
| 광고·브랜드 | 제품 노출→사용→로고 엔딩의 컷별 예산 (핵심) |
| 시네마틱 | 설정샷→행동→반응샷의 시선·스크린 방향 |
| 숏폼 | 0~3초 훅과 마지막 CTA를 컷 단위로 배분 (핵심) |
| 제품·푸드 | 제품 회전 방향·손 접촉·조명 연속성 |
| 인물·캐릭터 | 컷 간 얼굴·의상·화자 일치 |
| 애니·판타지 | 액션 연쇄와 공간 축 유지 |
| 패션·뷰티 | 모델 포즈·의상·메이크업 컷 연속성 |
| 아트·실험 | 컷 길이 리듬 실험, 연속성 예외는 명시 |

## 변경 전후
- 변경 전: 승인 레퍼런스 → 장면별 프롬프트 → 생성 → 기존 얼굴/제품/음성/편집 QA.
- 변경 후(선택적): 승인 레퍼런스 → **전체 길이·컷 수·샷 목적·컷별 길이 합계 검사 → 컷 간 연속성 계획** → 지원 모델 또는 개별 샷 생성 → 기존 QA + 컷 간 연속성 재검사.
- 실제 HOLO 엔진 변경·MiniMax API 검증·영상 A/B 테스트·Railway 배포: 수행하지 않음. 효과는 실측 전.

## 근거 (2026-11-16 확인)
- Runway Dev, Multi-Shot Video Recipe: https://docs.dev.runwayml.com/recipes/multi-shot-video/
- Runway Dev, API Reference (multi-shot): https://docs.dev.runwayml.com/api/
