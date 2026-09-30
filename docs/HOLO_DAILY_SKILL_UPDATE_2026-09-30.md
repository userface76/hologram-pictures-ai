# HOLO Daily Skill Update — 2026-09-30

## 오늘의 채택 스킬: Neighbor-Shot Context Bridge

### 핵심 원리
누락된 B-roll, 연결 컷, 전환용 샷을 독립 프롬프트로 새로 생성하지 않는다. 이미 승인된 타임라인의 인접 샷에서 대표 프레임을 가져와 시각적 문맥(reference context)으로 사용하고, 필요한 경우 시작/마지막 프레임을 경계조건으로 지정한다. 생성 결과는 기존 시퀀스의 화면비·프레임레이트·해상도에 맞춰 배치한다.

Adobe Premiere 26.5의 Generative Media Tool(2026-09-09)은 타임라인 범위를 직접 지정해 생성하고, 기존 시퀀스의 프레임을 하나 이상 reference frame으로 사용할 수 있으며, First frame/Last frame을 이용한 transition 생성과 sequence setting에 맞춘 생성 옵션 정렬을 지원한다.

### 적용 조건
- 이미 앞뒤에 승인된 샷이 있고 그 사이를 연결할 영상이 필요할 때
- 같은 인물·제품·장소·조명 분위기를 유지해야 하는 B-roll/insert/transition
- 광고·브랜드, 시네마틱, 숏폼, 제품·푸드에서 우선 적용
- 인물·캐릭터, 패션·뷰티, 애니·판타지, 아트·실험에서도 연속 편집이 필요한 경우 적용

### 좋은 예시
제품 광고에서 A컷은 모델이 병을 집는 장면, C컷은 병 Hero Shot이 승인된 상태다. B컷을 텍스트만으로 새로 생성하지 않고 A컷의 손·제품·조명 프레임과 C컷의 Hero 상태를 reference로 사용해 연결 동작을 만든다. 이후 제품 형태, 라벨 방향, 손 위치, 조명 방향이 A→B→C에서 이어지는지 검사한다.

### 피해야 할 경우
- 앞뒤 샷 자체의 인물/제품 정체성이 이미 서로 다른 경우
- 두 샷 사이에 큰 시간·장소·의상 변화가 의도된 경우
- 연결 구간에 복잡한 액션이나 구조적 변형이 필요해 reference만으로 제약하기 어려운 경우
- 모델이 해당 reference 조합을 지원하지 않는 경우: Control Conflict Gate로 라우팅

## 기존 스킬과의 차이
- Boundary Frame Transition Lock: 반드시 도달해야 할 시작/끝 상태를 고정하는 스킬
- Multi-shot Asset Lock: 여러 샷에서 자산 정체성을 유지하는 스킬
- Neighbor-Shot Context Bridge: **현재 편집 중인 실제 인접 샷을 생성 입력으로 재사용해 누락 샷을 타임라인 문맥 안에서 만드는 스킬**

## 파이프라인 변경
Before:
Shot Intent → Control Conflict Gate → Reference/Asset Lock → Timing → Generation → QA → Repair

After:
Shot Intent → Control Conflict Gate → Reference/Asset Lock → Timing → **Neighbor-Shot Context Bridge (누락/연결 샷일 때)** → Generation → Continuity QA → Repair

## 카테고리 반영
- 광고·브랜드: 연결 B-roll과 제품/브랜드 continuity
- 시네마틱: 컷 사이 공간·조명·행동 continuity
- 숏폼: 짧은 전환 구간의 빠른 보완
- 제품·푸드: 제품 형태/라벨/재질 continuity
- 인물·캐릭터: 얼굴·의상·포즈 연결
- 애니·판타지: 세계관/배경 상태 연결
- 패션·뷰티: 착장·메이크업·광원 continuity
- 아트·실험: 의도된 시각 변형이 아닌 경우에만 사용

## 근거
- Adobe Premiere, “Generate media with the Generative Media Tool”, updated 2026-09-09.
- Adobe Premiere 26.5 release notes / What's New, September 2026.

검증되지 않은 유행성 prompting tip은 이번 업데이트에서 제외했다.
