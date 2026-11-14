# HOLO AI Daily Skill Update — 2026-11-14 (KST)

## 조사 및 선정
8개 카테고리(광고·브랜드, 시네마틱, 숏폼, 제품·푸드, 인물·캐릭터, 애니·판타지, 패션·뷰티, 아트·실험)를 검토했다. 11월 1~13일 기존 기록의 제품 교체, 참조 수량 관리, 대사 QA, 버전 고정, 카메라/레이어/출력 기술과 비교했다. 오늘은 **크리에이터와 제품을 별도 승인 입력으로 구성하는 UGC 영상 제작** 1개를 신규 스킬로 선정한다. 기존 Product Swap(기존 영상의 제품 교체) 및 일반 참조 잠금(정체성 QA)과 구별되는 **영상 포맷/스토리·화자·제품 브리프의 역할 분리**다.

## 신규 스킬 — Dual-Reference Creator UGC & Claims-Safe Script Gate
- **원리:** 승인된 크리에이터 사진(characterImage)과 제품 사진(productImage)을 별도로 입력하고, 제품에 관한 확인된 사실(productInfo)과 화법/대사(userConcept)를 구분한다. Runway Dev의 Product UGC Recipe는 세로형 크리에이터 홍보 영상을 지원한다. 이는 공급자별 API 기능이지 MiniMax H3의 기본 기능이 아니다.
- **공식 지원 조건 (2026-11-14 확인):** Runway Dev Product UGC Recipe는 version(예: 2026-06), characterImage, productImage가 필수다. 각 참조 이미지 가로/세로 비율은 0.4~4. duration 4~15초, ratio 720:1280 또는 1080:1920, audio 기본 true. productInfo 최대 2500자, userConcept 최대 3500자. 얼굴이 명확하고 조명이 좋은 인물 사진과 깨끗한 제품 사진 권장.
- **HOLO 적용 조건:** 크리에이터의 초상권·동의, 제품 이미지 사용권, 승인된 제품명·표시·효능 주장, 한국어 스크립트 원문이 확보되어 있을 때. 제품 효과를 임의로 지어내지 않도록 productInfo에 검증된 사실만 입력한다. 실제 생성 후 대사와 립싱크, 얼굴·손·제품 형태·라벨을 별도 QA한다.
- **좋은 예:** 12초 세로형 세럼 UGC: 0–3초 카메라 정면에서 제품 소개, 3–8초 손에 든 병의 라벨을 정면으로 보이며 사용감에 관한 승인 문구만 설명, 8–12초 과장 없는 마무리. 캐릭터 사진/제품 사진/승인 한국어 대사/허용된 표현을 분리 기록한다. 화면·음성 결과는 실제 테스트 전 보장되지 않는다.
- **피해야 할 경우:** 실존 인물 동의 없는 얼굴 사용, 제품 효능·성분 검증 없이 광고 문구 생성, 한글 대사 정확성이 반드시 보장되어야 하는 단일 생성 의존, 손/라벨 변형을 허용할 수 없는 제품, 15초 초과 단일 Recipe 생성 요구.
- **QA 필드:** creator_reference_id, likeness_consent, product_reference_id, product_claims_approved, locked_script_ko, provider, recipe_version, duration, ratio, audio_requested, face_consistency, label_geometry, transcript_diff, lip_sync_review, human_approval.
- **기존과 차이:** Product Swap은 기성 광고 영상의 물체를 바꾼다. 이번 스킬은 **크리에이터/제품/승인 주장/대사를 분리해 새 UGC 광고를 설계**한다. 기존 대사 QA와 인물 참조 잠금은 그대로 재사용한다.

## 카테고리별 적용
| 카테고리 | 적용 |
|---|---|
| 광고·브랜드 | 승인된 제품 주장에 기반한 크리에이터 홍보 |
| 시네마틱 | 인물 1인칭 홍보 장면의 자연스러운 카메라 톤 (UGC 필요 시) |
| 숏폼 | 4–15초 세로형 후킹·멘트·엔딩 |
| 제품·푸드 | 제품 실물 이미지와 사용 장면의 일관성 |
| 인물·캐릭터 | 크리에이터 얼굴·발화 정합성 |
| 애니·판타지 | 가상 캐릭터의 제품 소개 실험 (초상/표시 규칙 동일) |
| 패션·뷰티 | 뷰티 크리에이터+화장품의 승인된 설명 |
| 아트·실험 | 핸드헬드 UGC 문법의 실험적 변형 (광고 주장 검증 유지) |

## 변경 전후
- **이전:** 인물/제품 참조 검증 → 일반 프롬프트 → 영상 생성 → 음성·얼굴·라벨 QA.
- **이후(선택적 문서 설계):** UGC 적합성 판단 → 인물 동의·제품 권리/주장 승인 → **인물 이미지/제품 이미지/제품 정보/대사 역할 분리** → 지원 공급자 Recipe 선택 → 생성 → 기존 대사·얼굴·제품 QA → 사람 승인.
- **실행 상태:** 문서 추가만 수행. HOLO MiniMax 엔진 코드, Railway 배포, 실제 영상 A/B 테스트는 변경하지 않았다. 공급자별 연동/비용 및 한국어 품질 검증 필요.

## 근거
- Runway Dev Product UGC Recipe (2026-11-14 확인): https://docs.dev.runwayml.com/recipes/product-ugc/
- Runway Dev API Changelog (2026-11-14 확인): https://docs.dev.runwayml.com/api-details/api_changelog/
