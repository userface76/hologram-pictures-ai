# HOLO Daily Skill Update — 2026-09-21

## 검토 범위
광고·브랜드 / 시네마틱 / 숏폼 / 제품·푸드 / 인물·캐릭터 / 애니·판타지 / 패션·뷰티 / 아트·실험

## 신규 스킬 1 — Reference Budget Router

**핵심 원리**
레퍼런스를 많이 넣는 것을 품질 향상으로 간주하지 않는다. 장면의 핵심 제약을 먼저 분류하고, 각 레퍼런스에 하나의 명확한 역할(subject identity / product identity / environment / motion / audio)을 부여한다. 서로 충돌하는 레퍼런스는 제거하고 최소한의 강한 레퍼런스 세트로 생성한다.

**적용 조건**
- 인물·제품·배경·동작·오디오 등 여러 기준 자료를 동시에 사용해야 하는 멀티모달 생성
- 동일 인물/제품을 유지하면서 장소·동작·카메라만 바꾸는 연속 샷
- 레퍼런스가 늘면서 identity drift나 프롬프트 충돌이 발생하는 경우

**좋은 예시**
화장품 광고에서 이미지 A는 제품 패키지 identity, 이미지 B는 모델 identity, 영상 C는 손의 동작, 오디오 D는 타이밍만 담당하게 지정한다. 조명과 카메라는 텍스트 지시로 두어 역할 중복을 피한다.

**피해야 할 경우**
- 같은 역할을 하는 유사 이미지를 근거 없이 다수 투입하는 경우
- 서로 다른 얼굴·제품 형태·공간 구조를 동시에 identity reference로 지정하는 경우
- 단순한 한 장면인데 레퍼런스 수를 늘리는 것 자체를 품질 전략으로 사용하는 경우

**우선 적용 카테고리**
광고·브랜드, 제품·푸드, 인물·캐릭터, 패션·뷰티, 시네마틱, 애니·판타지

## 신규 스킬 2 — Timing Anchor, Not Frame Promise

**핵심 원리**
생성 모델의 timestamp는 프레임 정확한 편집점이 아니라 장면의 pacing anchor로 취급한다. 중요한 사건은 한 타임코드에 여러 동작을 몰아넣지 않고, 준비 → 핵심 행동 → 반응/회복의 3단계 beat로 분리한다. 프레임 단위 정확성이 필요한 컷은 생성 단계가 아니라 후반 편집 단계에서 확정한다.

**적용 조건**
- 5~30초 숏폼·광고·시네마틱에서 특정 순간에 행동을 배치해야 할 때
- 회피, 제품 reveal, 표정 변화, 변신, 충돌처럼 원인과 결과의 순서가 중요한 장면
- 생성 영상에서 행동 타이밍이 앞뒤로 흔들리는 경우

**좋은 예시**
8초 좀비 회피 장면을 `0–2초 위협 인지 / 2–5초 회피 / 5–8초 균형 회복과 탈출`로 설계하고, 실제 컷 포인트는 생성 후 타임라인에서 확정한다.

**피해야 할 경우**
- `3.20초에 손이 정확히 접촉`처럼 생성 모델에 프레임 정확도를 요구하는 경우
- 한 타임스탬프에 카메라 이동, 표정 변화, 충돌, 대사, 제품 reveal을 동시에 요구하는 경우

**우선 적용 카테고리**
숏폼, 시네마틱, 광고·브랜드, 인물·캐릭터, 애니·판타지, 패션·뷰티

## 기존 구조와의 관계
- Reference Motion Isolation / Multi-shot Asset Lock을 대체하지 않는다. Reference Budget Router는 여러 reference가 동시에 들어올 때 역할 충돌과 과잉 입력을 줄이는 상위 선택 규칙이다.
- Timeline Patch Generation과 결합할 때 timestamp는 patch 후보 구간을 찾는 pacing 기준으로 사용하고, 실제 교체 범위는 편집 타임라인에서 확정한다.
- Reaction Chain과 결합해 복잡한 상호작용을 준비 → 행동 → 반응 beat로 나눠 시간축 자연스러움을 높인다.

## 변경 전 → 후
**전:** reference 역할을 구분하고 asset identity를 고정하며, 오류 발생 시 국소 patch를 우선한다.

**후:** 생성 전에는 필요한 reference만 역할별로 선별하고, 생성 중에는 timestamp를 프레임 명령이 아닌 pacing anchor로 사용한다. 결과적으로 reference 충돌, 과도한 제약, 행동 타이밍 붕괴를 줄이고 인물·제품·브랜드 일관성과 재현성을 높인다.

## 근거 메모
- Runway Seedance 2.5 공식 가이드(2026): 한 생성에 최대 50개 reference를 지원하며 각 input을 prompt에서 직접 지칭하고 역할을 설명하도록 권장한다. timestamp는 frame-accurate edit point가 아니라 pacing guide이며 frame-level timing은 post에서 처리하도록 명시한다.
- Adobe Firefly 공식 문서(2026-08-18): motion reference를 별도 입력으로 사용해 pan/zoom/tilt/motion path를 추출하고, first/last frame 등 일부 제약과 motion/composition controls가 동시에 사용되지 않는 경우가 있음을 명시한다. 이는 reference 역할과 제약의 사전 라우팅 필요성을 뒷받침한다.

단순 유행성 스타일이나 검증되지 않은 프롬프트 팁은 제외했다. 이번 업데이트는 reference 충돌 감소, 시간축 재현성, identity/product consistency를 우선한다.