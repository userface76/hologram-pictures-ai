# HOLO AI Daily Skill Update — 2026-11-07 (KST)

## 검토
2026-11-07 확인한 공식 문서: Luma Dream Machine Video Generation API(카메라 모션 목록 엔드포인트), Adobe Premiere Text-Based Editing(2026-01-21 갱신) 및 자동 전사(2026-05-25 갱신). 기존 HOLO 2026-11-05~06 문서의 레퍼런스 모드, 역확장, 장면 경계 추출, Morph Cut과 비교. 8개 카테고리 검토. 공식 API 지원과 HOLO 자체 제안 로직을 구분.

## 스킬 1: Provider-Verified Camera Motion Vocabulary
- **핵심 원리:** 공급자별 카메라 모션 목록을 실제 지원 API로 조회하고, 요청된 동작을 검증된 용어로 정규화한다. Luma Dream Machine API의 `GET /dream-machine/v1/generations/camera_motion/list`는 지원되는 카메라 움직임 문자열을 제공한다. 자연어 유사 표현도 가능하나 결과가 다를 수 있다고 공식 문서가 명시한다.
- **적용 조건:** 카메라 오비트/푸시인/트래킹을 정밀하게 지정하는 제품 광고, 시네마틱, 패션, 숏폼. Luma API 사용 시 직접 조회 가능. MiniMax H3에 동일 목록을 그대로 적용하지 않는다.
- **좋은 예:** 세럼 용기 주변을 천천히 도는 광고에서 Luma가 반환한 정확한 모션 문자열(예: `camera orbit left`)을 사용하고, 제품 로고·라벨 가독성을 QA한다. 공급자별 모델·지원 용어·응답 시점을 기록한다.
- **피할 것:** 미지원 카메라 명령을 지원한다고 단정, 한 컷에 상충하는 카메라 모션 다수 지시, 카메라 이동 때문에 제품 글자·얼굴이 변형되는데 그대로 승인.
- **QA:** provider/model/version, fetched_motion_list, chosen_motion, prompt, actual_camera_direction, subject_geometry, label/face stability.
- **기존과 차이:** Multi-Shot Intent는 컷 구성, Motion Cue Conflict는 이미지 운동 단서, 이번 스킬은 **모델별 검증된 카메라 명령어 선택**.
- **출처:** Luma Video Generation API, 2026-11-07 확인, https://docs.lumalabs.ai/docs/video-generation (문서 최초 게시일 미확인).

## 스킬 2: Transcript-Grounded Dialogue Cut & Caption QA
- **핵심 원리:** 영상 생성 후 전사 결과를 원본 승인 대사와 대조해 누락·반복·언어 혼입을 검출하고, 단어/구간 타임코드 기반으로 편집 컷과 자막을 검수한다. Adobe Premiere Text-Based Editing은 전사 타임코드와 영상 컷을 연동하고 텍스트 기반으로 구간 편집할 수 있다. 자막은 최종 편집된 시퀀스에서 생성하도록 공식 문서가 권장한다.
- **적용 조건:** 한국어 멘트가 있는 브랜드 광고, 인물 소개, 뷰티·제품 쇼츠. HOLO에서 자동 적용하려면 전사·정렬·비교 파이프라인을 별도 구현해야 한다.
- **좋은 예:** 15초 세럼 광고에서 승인 대사와 자동 전사를 나란히 비교하고, 대사 누락/중국어 혼입 의심 구간을 사람이 확인한다. 불필요한 침묵을 편집하되 단어 중간에서 자르지 않으며, 최종 컷 기준으로 자막 타임코드를 다시 생성한다.
- **피할 것:** ASR 오인식을 실제 언어 오류로 확정, 전사 텍스트만 수정하고 실제 음성을 고치지 않기, 단어 중간 컷, 편집 전 자막 타임코드를 최종본에 그대로 사용.
- **QA:** approved_script, transcript, language_confidence, word_alignment, omissions/insertions, speaker, cut_boundary, final_caption_sync, human_review.
- **기존과 차이:** Dialogue Duration Gate는 생성 전 예상 길이, Auto Ducking은 음악/대사 믹싱, Scene-Boundary Extraction은 시각적 컷 검출, 이번 스킬은 **승인 대사 대비 실제 발화 검증과 타임코드 기반 편집**.
- **출처:** Adobe Premiere Text-Based Editing, updated 2026-01-21, https://helpx.adobe.com/ie/premiere/desktop/edit-projects/edit-video-using-text-based-editing/overview-of-text-based-editing.html ; Adobe Speech-to-Text, updated 2026-05-25, https://helpx.adobe.com/in/premiere/desktop/add-text-images/insert-captions/auto-transcribe-video-using-speech-to-text.html

## 8개 카테고리 매핑
| 카테고리 | 카메라 모션 검증 | 대사·자막 QA |
|---|---|---|
| 광고·브랜드 | 브랜드 히어로 샷 | 한국어 카피 검수 |
| 시네마틱 | 오비트/트래킹 검증 | 대사 컷 |
| 숏폼 | 훅 푸시인/트래킹 | 자막·멘트 일치 |
| 제품·푸드 | 제품 회전·라벨 보존 | 제품 설명 |
| 인물·캐릭터 | 얼굴 보호 카메라 이동 | 대사·화자 일치 |
| 애니·판타지 | 장면 이동 연출 | 캐릭터 대사 |
| 패션·뷰티 | 워킹/제품 오비트 | 뷰티 멘트 |
| 아트·실험 | 검증 명령의 선택적 변형 | 필요시 적용 |

## 변경 전후
- **이전:** 레퍼런스/프롬프트 → 생성 → 시각적 컷 감지 및 음성 검수.
- **이후:** 공급자별 카메라 명령 지원 검증 → 기존 생성 → 승인 대사와 전사 비교 → 단어 경계 컷/최종 자막 싱크 검사 → 기존 색상·인물·제품 검수.

## 구현 상태
공식 자료는 Luma 및 Adobe 기능에 관한 것이며 HOLO MiniMax 엔진에서 동등한 API를 제공한다는 의미가 아니다. 이번 변경은 스킬 문서 추가에 한정하며 HOLO 엔진 코드 수정, 영상 A/B 테스트, Railway 배포 없음. 효과·비용 절감 미측정.
