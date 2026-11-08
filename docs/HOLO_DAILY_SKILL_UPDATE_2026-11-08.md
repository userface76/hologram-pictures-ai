# HOLO AI Daily Skill Update — 2026-11-08 (KST)

## 검토 범위 및 근거
8개 카테고리 전체 검토. 2026-11-08 확인한 Runway Dev 공식 API changelog(2026-11-05 Kling 4.0 Flash 추가, 2026-09-17 frame-rate enhancement) 및 API 가격/레퍼런스. 기존 2026-10-30~11-07 문서의 모델 기능·비용 dry-run, 레퍼런스 모드, 샷 구성, 카메라 용어, 프레임 연결, 인물·제품 일관성, 자막 검수와 중복 여부 비교. 새로운 모델 제공 사실은 Runway Dev 기준이며 HOLO MiniMax 직접 API에서 사용 가능하다는 의미가 아님.

## 신규 스킬 1 — Reference Budget & Native-Audio Routing (Kling 4.0 Flash)
- **원리:** 다중 이미지/영상 참조를 허용하는 모델에서 참조 입력을 목적별로 할당하고 길이·수량·비용을 사전 계산한다. 2026-11-05 Runway Dev에 추가된 Kling 4.0 Flash는 3–20초 720p, 생성 오디오 포함, 첫 프레임을 포함한 최대 10장 이미지 및 소스 영상을 포함해 최대 5개 영상(합산 최대 20초)을 지원한다.
- **적용 조건:** 인물·제품·카메라 동작의 참조를 동시에 필요로 하는 10~15초 광고/패션/캐릭터. 공급자 모델이 지원할 때만 활성화.
- **좋은 예:** 12초 세럼 광고에 승인된 모델 얼굴/제품 패키지/배경 3개 이미지와 카메라 동작 1개 영상 참조를 분리 배정하고, 최종 제품·얼굴 왜곡과 오디오를 확인한다.
- **피할 것:** 모든 참조를 무작정 추가, 상충하는 조명/제품 버전 혼합, 자동 오디오가 한국어 대사 정확도를 보장한다고 가정, H3에 동일 제한 적용.
- **QA:** model/provider/version, image_count, video_count, video_total_seconds, role_per_reference, generated_audio, identity_diff, quoted_cost, real_cost, Korean_ASR_review.
- **기존 스킬과 차이:** Model Capability & Cost Dry-Run은 일반 모델 적합성 검사, Exclusive Reference Mode Resolver는 입력 충돌 검사. 이번 스킬은 **신규 다중참조·오디오 지원 모델의 참조별 역할·예산 할당**.
- **공식 근거:** Runway Dev API Changelog, 2026-11-05, https://docs.dev.runwayml.com/api-details/api_changelog/ .

## 신규 스킬 2 — Frame-Rate Delivery & Motion-Artifact Gate
- **원리:** 생성된 클립의 실제 FPS와 최종 플랫폼 납품 FPS를 비교해 필요할 때만 프레임 보간/변환을 수행하고, 보간 후 움직임 왜곡을 검수한다. Runway Dev는 2026-09-17 Enhance Frame Rate 모델을 공개했으며 23.98, 24, 25, 29.97, 30, 48, 50, 59.94, 60, 120fps 대상 변환을 문서화했다. 최대 300초 입력, 가격은 2초당 1크레딧(해당 모델 기준).
- **적용 조건:** 서로 다른 FPS의 클립을 연결하거나 24/30/60fps 납품이 요구되는 광고·시네마틱·숏폼. 원본 FPS가 납품 요건을 만족하면 불필요한 보간을 생략한다.
- **좋은 예:** 24fps 인물 광고를 30fps로 납품해야 할 때 원본과 변환본을 비교해 머리카락, 손가락, 제품 라벨, 빠른 카메라 이동의 이중 윤곽/뒤틀림을 확인한다.
- **피할 것:** 높은 FPS 자체를 품질 향상으로 간주, 120fps를 무조건 선택, 보간으로 생성 실패 프레임이나 입술 싱크 오류를 해결하려고 시도, 비용 미확인 자동 처리.
- **QA:** source_fps, target_fps, clip_duration, cadence_judder, optical_flow_artifacts, face_hand_logo_integrity, audio_sync, added_cost, human_approval.
- **기존과 차이:** Seam QA는 클립 연결, Scene Color Match는 색상, 이번은 **납품 프레임 레이트와 보간 부작용 검수**.
- **공식 근거:** Runway Dev API Changelog (2026-09-17), https://docs.dev.runwayml.com/api-details/api_changelog/ ; API Pricing, https://docs.dev.runwayml.com/guides/pricing/ .

## 카테고리별 매핑
| 카테고리 | 참조 예산·오디오 | FPS 납품 검수 |
|---|---|---|
| 광고·브랜드 | 브랜드/제품/모델 레퍼런스 배정 | 광고 납품 규격 |
| 시네마틱 | 배우·카메라 참조 역할 분리 | 24fps 연출·모션 |
| 숏폼 | 10~15초 다중참조 | 30/60fps 플랫폼 납품 |
| 제품·푸드 | 제품 라벨/동작 참조 분리 | 제품 회전 보간 왜곡 |
| 인물·캐릭터 | 얼굴·동작·오디오 참조 | 손/얼굴/입술 왜곡 |
| 애니·판타지 | 캐릭터 설정·동작 참조 | 빠른 액션 보간 |
| 패션·뷰티 | 모델·의상·제품 고정 | 머리카락·워킹 아티팩트 |
| 아트·실험 | 다중참조 선택 실험 | 의도적 프레임 질감 보존 |

## 변경 전후
- **이전:** 레퍼런스/모델 검증 → 생성 → 클립·색상·대사 QA.
- **이후:** 모델별 다중참조 역할/총량/오디오/비용 예산 검증 → 생성 → 기존 QA → 납품 FPS 확인 → 필요한 경우만 변환 → 모션·얼굴·제품·음성 최종 QA.

## 구현 상태
이번 변경은 스킬 문서만 추가. HOLO 엔진 코드 변경, 실제 모델 연동, A/B 영상 테스트, Railway 배포 없음. 모델별 API 이용 권한·가격과 실측 품질은 추후 검증 필요.