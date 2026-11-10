# HOLO AI Daily Skill Update — 2026-11-10 (KST)

## 검토 범위와 중복 배제
8개 영역(광고·브랜드/시네마틱/숏폼/제품·푸드/인물·캐릭터/애니·판타지/패션·뷰티/아트·실험) 검토. 2026-11-09 스킬 문서와 기존 Hero Frame, Color Precision, FPS, Identity Lock, Draft-to-Final 스킬을 비교. 아래 기능은 **Runway Dev 제공 기능 기준**이며 HOLO MiniMax 직접 API의 지원을 뜻하지 않는다.

## 신규 스킬 1 — Template-Safe Product Swap & Geometry QA
- **원리:** 검증된 광고 영상의 카메라 움직임·조명·구도를 유지하면서 등장 제품만 새 제품의 여러 참조 이미지로 교체하는 워크플로. Runway Dev Product Swap Recipe는 원본 영상, 교체 전 제품 이미지, 교체 후 제품 참조 이미지를 입력받는다.
- **조건:** 교체할 제품의 사용 맥락·크기·형태·파지 방식이 원본과 호환되고, 영상/제품 이미지의 이용 권한을 확보했을 때. 공급자 지원 확인 후 사용.
- **좋은 예:** 동일 규격의 세럼 병 A 광고를 승인된 세럼 병 B의 정면·측면 사진으로 교체하고 카메라 오비트/조명 유지. 결과에서 라벨·캡·손가락 접촉·반사 검수.
- **피할 것:** 크기/물성이 전혀 다른 제품(립스틱→대형 가전), 액체 흐름이나 손가락 가림이 심한 영상, 법적 승인 없는 경쟁사 광고 재사용. 로고와 작은 글씨의 정확성을 생성 모델에만 맡기지 않음.
- **QA:** template_rights, reference_video_duration, old_product_image, new_product_multiview, product_geometry, logo_label_ocr_manual, hand_occlusion, shadow_reflection, final_approval.
- **차별점:** Approved Hero Frame은 생성 전 정지 제품 승인, 이번은 **기존 영상의 움직임을 재활용하면서 제품만 교체**.
- **근거:** Runway Dev Product Swap Recipe https://docs.dev.runwayml.com/recipes/product-swap/ (2026-11-10 확인).

## 신규 스킬 2 — Detail-Sensitive Bitrate Selection Gate
- **원리:** 영상 생성 출력의 압축 수준을 목적에 맞게 선택. Runway Dev는 2026-10-27 Seedance 2.0 / Fast / Mini의 text/image/video-to-video에서 `bitrate: high`를 추가, 기본 standard보다 압축 아티팩트를 줄이고 파일 크기가 커지며 API 요금은 동일하다고 안내.
- **조건:** 미세 제품 텍스트·헤어 디테일·반짝이는 질감·입자/연기·빠른 움직임이 중요한 최종 마스터이고 해당 모델/엔드포인트가 지원할 때.
- **좋은 예:** 15초 향수병 광고의 유리 반사와 작은 패키지 무늬가 압축으로 뭉개질 경우 high 선택, 동일 장면 standard/high 프레임 비교 후 납품 규격으로 재인코딩.
- **피할 것:** 작은 모바일 미리보기, 전송량 제약이 큰 상황에서 무조건 high 선택. 높은 비트레이트가 생성된 글자 오류·얼굴 왜곡을 고치는 것으로 오해하지 않음.
- **QA:** provider, model, endpoint, bitrate_mode, output_bytes, keyframe_detail_comparison, delivery_codec, final_logo_face_check.
- **차별점:** 11-09 MOV는 **컨테이너/색상 정밀도**, 11-08 FPS는 **시간축 프레임**, 이번은 **압축 아티팩트 관리**.
- **근거:** Runway Dev API Changelog, 2026-10-27 https://docs.dev.runwayml.com/api-details/api_changelog/

## 8개 카테고리 적용
| 카테고리 | Product Swap | Bitrate Gate |
|---|---|---|
| 광고·브랜드 | 승인 광고 템플릿의 SKU 교체 | 로고·재질 디테일 |
| 시네마틱 | 소품 제품 교체 시 제한적 | 그레인·암부·움직임 |
| 숏폼 | 같은 후킹 영상의 제품 변형 | 최종본에서 선택 |
| 제품·푸드 | 용기/패키지 교체 | 유리·식감·텍스처 |
| 인물·캐릭터 | 손에 든 제품 교체 시 접촉 QA | 머리카락·피부 디테일 |
| 애니·판타지 | 세계관 소품 교체 시 선택 | 입자·마법 효과 |
| 패션·뷰티 | 화장품 SKU 교체 | 메이크업·모발 디테일 |
| 아트·실험 | 오브젝트 변형 실험 | 고주파 질감 실험 |

## 변경 전후
- **이전:** 참조/첫 프레임 승인 → 생성/초안 승격 → MOV/색상/FPS QA → 납품.
- **이후(지원 공급자 한정):** 광고 템플릿 재사용 적합성·저작권·제품 기하 검사 → 제품 교체 또는 기존 생성 → 디테일 중요도에 따라 bitrate 선택 → 기존 얼굴/제품/로고/색상/FPS/음성 QA → 납품.
- 두 스킬은 provider capability gate를 통과하지 않으면 비활성화하며 기존 엔진의 기본값을 변경하지 않는다.

## 구현 상태
공식 자료 기반 스킬 문서 추가만 수행. HOLO MiniMax 엔진 코드 수정, A/B 실험, Railway 배포 없음. Runway Recipe/Seedance API 연동 및 품질 효과는 실측 전.
