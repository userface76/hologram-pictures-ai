# HOLO Daily Skill Update — 2026-09-19

## 검토 범위
광고·브랜드 / 시네마틱 / 숏폼 / 제품·푸드 / 인물·캐릭터 / 애니·판타지 / 패션·뷰티 / 아트·실험

## 신규 스킬 1 — Reference Motion Isolation

**핵심 원리**
카메라 움직임이 품질의 핵심인 장면에서는 텍스트로 pan/tilt/zoom/path를 과도하게 묘사하기보다, 검증된 5–10초 레퍼런스 영상의 카메라 움직임을 별도 제어 신호로 사용한다. 레퍼런스의 내용/캐릭터가 아니라 카메라 궤적만 가져오는 것이 핵심이다.

**적용 조건**
- 시네마틱 reveal, 제품 hero shot, 패션 tracking, 숏폼 dynamic intro
- 동일한 카메라 궤적을 재현해야 하는 장면
- 모델이 motion-reference 또는 video-reference 입력을 지원할 때

**좋은 예시**
제품은 고정된 identity reference로 유지하고, 별도의 짧은 dolly/orbit reference에서 카메라 운동만 추출해 적용한다.

**피해야 할 경우**
- 레퍼런스 자체에 심한 흔들림/복합 줌/불명확한 피사체 이동이 섞인 경우
- 인물 동작과 카메라 동작을 하나의 레퍼런스로 동시에 강제해 제어 목적이 충돌하는 경우

**우선 적용 카테고리**
시네마틱, 광고·브랜드, 제품·푸드, 패션·뷰티, 숏폼

## 신규 스킬 2 — Multi-shot Asset Lock

**핵심 원리**
멀티샷 영상에서는 매 샷마다 캐릭터·제품·장소를 텍스트로 재설명하기보다, 승인된 reference asset을 Character/Object/Location 역할로 고정하고 각 샷에서는 행동·카메라·시간 변화만 기술한다. identity와 motion 지시를 분리해 장면 간 드리프트를 줄인다.

**적용 조건**
- 동일 인물/제품/장소가 2개 이상의 샷에 반복 등장
- 브랜드 광고, 캐릭터 서사, 제품 데모, 패션 룩 영상
- Elements/Ingredients/멀티모달 reference를 지원하는 생성 모델

**좋은 예시**
6-shot 브랜드 영상에서 제품 패키지와 주인공을 고정 reference로 등록하고, shot별로 framing과 action만 변화시킨다.

**피해야 할 경우**
- 매 샷에서 제품 형태나 의상 자체가 의도적으로 변해야 하는 변신 장면
- 서로 모순되는 reference 이미지를 과도하게 넣는 경우

**우선 적용 카테고리**
광고·브랜드, 제품·푸드, 인물·캐릭터, 패션·뷰티, 애니·판타지, 시네마틱

## 기존 구조와의 관계
- Reference Role Router를 대체하지 않고 하위 실행 규칙으로 추가한다.
- Natural Motion QA / Reaction Chain과 충돌하지 않는다. 이 스킬들은 identity/camera 제어를 담당하고, 기존 QA는 생성된 움직임의 자연스러움을 검사한다.
- 동일 레퍼런스에 여러 역할을 과도하게 부여하지 않는 기존 원칙을 강화한다.

## 변경 전 → 후
**전:** reference를 역할별로 구분하고 복잡한 인간 동작에 performance reference를 우선 검토.

**후:** 여기에 (1) 카메라 궤적만 독립적으로 가져오는 Motion Isolation, (2) 멀티샷에서 Character/Object/Location을 고정하는 Asset Lock을 추가. HOLO가 장면마다 무엇을 새로 생성하고 무엇을 고정해야 하는지 더 명확히 판단하도록 한다.

## 근거 메모
- Adobe Firefly 공식 문서(2026-08-18 업데이트): 5–10초 reference video에서 pan, zoom, tilt, motion path를 추출해 생성 영상의 camera motion을 가이드.
- Adobe Firefly의 Kling 3.0/Omni 안내: 최대 6개 연속 shot, Elements에 최대 4개 이미지를 등록해 Character/Object/Location 일관성 유지.
- Adobe Firefly의 Seedance 2.0 안내: image/video/audio/text multimodal references와 connected multi-shot에서 character/environment/lighting continuity 지원.

단순 유행성 스타일이나 검증되지 않은 프롬프트 팁은 이번 업데이트에서 제외했다.