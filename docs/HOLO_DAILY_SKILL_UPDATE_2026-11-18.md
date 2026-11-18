# HOLO AI Daily Skill Update — 2026-11-18 (KST)

## 검토 및 중복 판정
8개 카테고리(광고·브랜드, 시네마틱, 숏폼, 제품·푸드, 인물·캐릭터, 애니·판타지, 패션·뷰티, 아트·실험)를 검토했다. 기존 HOLO 일일 스킬의 색상 매칭, MOV 마스터, 고비트레이트, 프레임레이트 변환, 참조 잠금, 컷 연속성, 대사 QA와 비교했다. 오늘 신규 채택 1개는 **SDR→HDR 변환의 소스 기준 색·하이라이트 검수**다. 새로운 11월 출시 기능이라는 주장은 하지 않는다.

## 신규 스킬 — Plate-Referenced HDR Highlight & SDR-Roundtrip QA
- **원리:** Runway Dev의 2026-09-12 API 변경 기록에 따르면 Ruby ACEScg EXR 시퀀스는 원본 SDR 플레이트를 ACEScg로 변환한 뒤 복원된 하이라이트 정보를 더하는 방식으로 수정되었다. ACES SDR 뷰에서 원본에 가깝게 재현하고 HDR 뷰에서 확장된 하이라이트를 보도록 의도된 변경이다. 기존 방식은 SDR 뷰에서 중간톤 상승·채도 저하를 초래할 수 있었다. 따라서 HOLO는 HDR 변환 후 HDR만이 아니라 SDR 왕복 보기(적절한 색관리 변환)도 검수한다.
- **적용 조건:** 승인된 SDR 원본을 HDR/ACEScg 후반 합성으로 확장하고, 실제로 해당 Runway Dev HDR/ACEScg 경로를 사용할 때. 제품 색상 기준, 피부톤 기준, 소스/출력 색공간, 뷰 트랜스폼을 기록한다. 원본이 이미 HDR이면 SDR 전용 변환 경로에 넣지 않는다.
- **좋은 예:** 15초 향수 광고에서 유리병의 강한 스펙큘러 하이라이트를 HDR로 확장하되, SDR Rec.709 뷰에서 병 색상·라벨·피부톤이 원본과 과도하게 달라지지 않는지 확인. HDR 디스플레이와 SDR 뷰 양쪽을 검수하고 승인본만 납품.
- **피할 것:** 단순 밝기 증폭을 진정한 HDR 생성이라고 주장, 잘못된 ACES 입력/출력 변환 적용, HDR 미지원 디스플레이에서 HDR 품질 확정, 색상 편차를 수치 검증 없이 '완전 보존'으로 표기, MiniMax 직접 API가 같은 기능을 지원한다고 추정.
- **선택적 QA 필드:** source_color_space, output_profile, provider, model, aces_version, view_transform, reference_frame_ids, skin_tone_review, product_color_review, highlight_clipping_review, sdr_roundtrip_review, reviewer, verdict.
- **기존과 차이:** 11월 9일 MOV 마스터/색정밀도 스킬은 컨테이너·후반 편집 적합성을 다룬다. 이번 스킬은 **SDR 원본과 HDR 결과 간 색관리 변환 및 하이라이트 확장의 양방향 검수**를 다룬다.

## 8개 카테고리 적용
| 카테고리 | 적용 |
|---|---|
| 광고·브랜드 | 브랜드 색상/로고의 SDR 복귀 검사 (우선) |
| 시네마틱 | 야간 조명·하이라이트 확장 (우선) |
| 숏폼 | HDR 마스터와 SDR SNS 납품본 분리 |
| 제품·푸드 | 유리·금속 반사와 음식 색상 검사 (우선) |
| 인물·캐릭터 | 피부톤·눈 하이라이트 보호 |
| 애니·판타지 | 발광 효과의 하이라이트 클리핑 확인 |
| 패션·뷰티 | 메이크업·의상 색상 일관성 (우선) |
| 아트·실험 | HDR 표현 실험과 SDR 호환성 비교 |

## 변경 전후
- **이전:** 승인 원본 → 영상 생성 → 색상·제품·인물 QA → 납품.
- **이후(지원 경로에서만 선택적):** 승인 SDR 원본/색공간 기록 → HDR/ACEScg 변환 → HDR 하이라이트·SDR 뷰 왕복 검수 → 기존 제품·얼굴·대사 QA → 채널별 납품.
- 문서만 업데이트한다. 엔진 코드, 실제 영상 A/B, Railway 배포는 변경하지 않는다. HOLO MiniMax 직접 API의 해당 경로 지원은 미확인이다.

## 근거
- Runway Dev API Changelog, 2026-09-12 'Ruby ACEScg sequences are now referenced to the source'; 2026-08-31 ACEScg EXR delivery: https://docs.dev.runwayml.com/api-details/api_changelog/
- 기존 구조: docs/HOLO_COMPOSER.md 및 docs/HOLO_DAILY_SKILL_UPDATE_2026-11-09.md.
