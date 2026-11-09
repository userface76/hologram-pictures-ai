# HOLO AI Daily Skill Update — 2026-11-09 (KST)

## 검토 및 중복 배제
광고·브랜드, 시네마틱, 숏폼, 제품·푸드, 인물·캐릭터, 애니·판타지, 패션·뷰티, 아트·실험 8개 영역 검토. Runway Dev 공식 API changelog(2026-10-21 MOV, 2026-09-28 draft) 및 2026-11-08 기존 문서를 비교. 지난 업데이트의 FPS 변환, 색상 매칭, 모델 비용 dry-run, 제품 첫 프레임 승인과 역할을 구분함. 아래 기능은 **Runway Dev의 Seedance 2.5 전용**이며 현재 HOLO의 MiniMax H3 직접 연동에서 지원된다는 뜻이 아님.

## 신규 스킬 1 — Color-Precision Delivery Format Gate
- **원리:** 영상의 최종 색보정·합성이 필요한 경우, 지원 모델에서 MP4 대신 더 높은 색상 정밀도를 유지하는 MOV 출력을 선택하고 최종 플랫폼용 MP4는 별도로 인코딩한다. Runway Dev는 2026-10-21 Seedance 2.5의 `outputFormat: "mov"`를 공식 추가했다. MOV는 후반 색보정/합성에 유리하며 해당 API에서 MP4와 동일 요금이라고 안내한다.
- **조건:** 전문 광고, 뷰티 피부색·제품 패키지 색상, 시네마틱 합성 등 후반 보정이 예정되고 공급자가 MOV 출력을 지원할 때.
- **좋은 예:** 15초 세럼 광고를 MOV 마스터로 받아 피부톤·용기 색상을 기준 프레임과 비교해 보정한 후 9:16 MP4 배포본을 만든다.
- **피할 것:** MOV 확장자만으로 무손실·정확한 색상·일관성을 보장한다고 가정하거나, 단순 SNS 초안에 무조건 대용량 MOV를 사용. HDR/색공간은 별도 확인.
- **QA:** provider, model, output_format, codec, bit_depth_if_known, color_space_if_known, master_hash, reference_color_diff, delivery_transcode, face_logo_label_check.
- **차별점:** 기존 Scene Color Reference Match는 *색상 비교*, 이번 스킬은 *보정 전 원본 전달 포맷 선택*.
- **근거:** Runway Dev API Changelog, 2026-10-21, https://docs.dev.runwayml.com/api-details/api_changelog/

## 신규 스킬 2 — Draft-to-Final Reuse & Expiry Gate
- **원리:** 저해상도 초안에서 구도·동작·인물/제품 일관성을 승인한 뒤, 지원 모델의 동일 생성 작업을 고해상도로 승격해 불필요한 완전 재생성을 줄인다. Runway Dev Seedance 2.5는 2026-09-28부터 `draft: true` 480p 미리보기와 `draftTaskId` 기반 1080p enhancement를 제공하며, 초안의 프롬프트·레퍼런스·길이·시드·오디오 설정을 재사용하고 **생성 후 7일 이내** 승격 가능하다.
- **조건:** 동일 컨셉을 반복 검토해야 하는 광고·패션·캐릭터·숏폼; 모델/계정에서 draft enhancement 지원을 확인했을 때.
- **좋은 예:** 15초 제품 광고를 480p 초안으로 검수해 제품 로고와 모델 얼굴이 정확할 때만 1080p로 승격한다.
- **피할 것:** 480p에서 읽기 어려운 미세 라벨까지 최종 승인하거나, 만료된 draftTaskId를 사용하거나, 모든 모델에 초안 승격이 있다고 가정.
- **QA:** draft_task_id, created_at, expiry_at, prompt_hash, reference_hash, seed, duration, audio_mode, preview_approval, final_identity_check, final_cost.
- **차별점:** 기존 Approved Hero Frame은 *정지 이미지 승인*, 이번 스킬은 *영상 초안 검수 후 동일 작업 고해상도 승격*. 기존 비용 dry-run은 추정, 이번은 실제 미리보기 승인.
- **근거:** Runway Dev API Changelog, 2026-09-28, https://docs.dev.runwayml.com/api-details/api_changelog/

## 카테고리별 반영
| 카테고리 | 컬러 마스터 포맷 | 초안→최종 승격 |
|---|---|---|
| 광고·브랜드 | 로고·브랜드 색상 보정용 마스터 | 광고 콘셉트 승인 |
| 시네마틱 | 후반 합성/그레이딩 | 카메라 동선 승인 |
| 숏폼 | 색보정 필요 시 선택 | 15초 훅/엔딩 검수 |
| 제품·푸드 | 패키지/식품 색감 보호 | 제품 형태·동작 검수 |
| 인물·캐릭터 | 피부색/의상 색상 | 얼굴·제스처 검수 |
| 애니·판타지 | VFX 색상 작업 | 캐릭터 동작 승인 |
| 패션·뷰티 | 피부·메이크업·의상 색 | 모델/제품 연속성 |
| 아트·실험 | 합성 마스터 선택 | 실험 결과 선별 |

## 변경 전후
- **이전:** 모델·참조·비용 검증 → 영상 생성 → 색상/음성/FPS QA → 납품.
- **이후(지원 모델에 한함):** 모델·참조·비용 검증 → 480p 영상 초안 → 승인·만료 검사 → 1080p 승격 → 필요 시 MOV 마스터 색보정 → 최종 MP4 납품 및 기존 얼굴/제품/대사/FPS QA.

## 구현 상태
스킬 문서에만 추가. HOLO MiniMax H3 엔진 코드·Railway 배포·영상 A/B 테스트는 수행하지 않음. 공급자별 지원 및 실제 비용/색 정밀도 개선은 테스트 전 미검증.
