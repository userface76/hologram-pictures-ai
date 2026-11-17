# HOLO AI Daily Skill Update — 2026-11-17 (KST)

## 검토 및 중복 판정
8개 카테고리(광고·브랜드, 시네마틱, 숏폼, 제품·푸드, 인물·캐릭터, 애니·판타지, 패션·뷰티, 아트·실험) 검토. 기존 11월 문서의 참조 관리·명확한 물리 동작 프롬프트·버전 고정·음성 QA·제품 교체·컷 예산 관리와 비교. 오늘 신규 채택 1개: **Prompt-Expansion Fidelity A/B Gate**. 2026-09-03 공식 발표된 MiniMax H3 Max의 구체적인 API 옵션을 근거로 선정(11월 17일 재확인). 새로 출시된 기능이라는 뜻은 아님.

## 신규 스킬 — Prompt-Expansion Fidelity A/B Gate
- **핵심 원리:** MiniMax H3 Max를 Runway Dev 경유로 호출하는 경우 `promptExpansionMode`는 `disabled`(원문 유지), `balanced`(기본값, 짧은 재작성), `quality`(더 적극적 재작성)를 제공한다. 광고 문구, 로고, 손 동작, 얼굴·제품 레퍼런스가 고정된 작업에서는 모델이 프롬프트를 확장하면서 의도를 바꿀 가능성을 QA 위험으로 관리한다. 확장 자체가 품질을 개선한다는 실측 주장은 하지 않는다.
- **적용 조건:** 해당 옵션을 지원하는 공급자/모델을 확인한 경우에만 적용. 먼저 승인 프롬프트를 고정하고 `disabled` 기준 결과를 만들며, 같은 승인 참조·길이·해상도에서 `balanced` 또는 `quality` 후보와 비교. 비결정적 생성 특성상 1회 비교로 일반화하지 않는다.
- **좋은 예:** 10초 세럼 광고에서 '모델은 오른손으로 병을 들어 라벨을 정면에 유지하고 카메라는 고정'이라는 승인 동작을 입력. 원문 유지 모드와 기본 확장 모드의 결과를 비교하여 라벨·손·시선·얼굴 일치율과 대사 오염 여부를 사람이 판정한다.
- **피해야 할 경우:** MiniMax 직접 API에 같은 필드가 있다고 가정, 공급자 미지원 옵션 전송, 한국어 대사 원문·법적 효능 표현을 임의 확장, 실험 결과 없이 `quality`를 일괄 우수하다고 간주.
- **선택적 문서 QA 필드:** provider, model_id, expansion_mode, approved_prompt_hash, reference_ids, duration_s, resolution, script_exact_match, identity_pass, product_geometry_pass, camera_motion_pass, reviewer, verdict.
- **기존 스킬과 차이:** 11월 11일 Physical-Action Prompt Clarity는 사람이 작성하는 동작 명령의 명료성을 다룸. 이번 스킬은 **공급자 내부 프롬프트 재작성 모드가 승인 의도와 일치하는지 비교**하는 통제 규칙.

## 8개 카테고리 적용
| 카테고리 | 적용 |
|---|---|
| 광고·브랜드 | 승인 카피·브랜드 정체성 유지 (핵심) |
| 시네마틱 | 카메라·액션 지시의 재작성 영향 |
| 숏폼 | 첫 2초 후킹 지시 보존 |
| 제품·푸드 | 제품 외형·사용 순서·라벨 유지 (핵심) |
| 인물·캐릭터 | 얼굴·손동작·화자 일관성 |
| 애니·판타지 | 캐릭터 설정과 물리 동작 비교 |
| 패션·뷰티 | 의상·메이크업·포즈 유지 (핵심) |
| 아트·실험 | 창의적 확장 모드 실험, 예외 기록 |

## 변경 전후
- 변경 전: 승인 참조 → 동작 명료화 → 영상 생성 → 얼굴·제품·한국어 대사 QA.
- 변경 후(문서 수준 선택적 게이트): 승인 참조 → 동작 명료화 → **모델별 prompt expansion 지원 확인 → 원문 유지 기준과 확장 후보 비교** → 기존 QA → 모드/판정 기록.
- 엔진 코드 수정, 실제 유료 영상 생성 A/B, Railway 배포는 수행하지 않음. MiniMax 직접 API의 동일 파라미터 지원은 미확인.

## 출처 및 검증
- Runway Dev API Changelog, 2026-09-03 MiniMax H3 Max 항목 (2026-11-17 재확인): https://docs.dev.runwayml.com/api-details/api_changelog/
- HOLO 기존 구조: docs/HOLO_COMPOSER.md 및 2026-11-11 / 2026-11-16 일일 스킬 문서.
