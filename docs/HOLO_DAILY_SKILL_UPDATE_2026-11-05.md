# HOLO AI Daily Skill Update — 2026-11-05

## 검토
8개 카테고리 전체 검토: 광고·브랜드, 시네마틱, 숏폼, 제품·푸드, 인물·캐릭터, 애니·판타지, 패션·뷰티, 아트·실험. 공식 Runway MiniMax H3 및 Luma Video Generation 문서를 2026-11-05 확인. 저장소의 11-03, 11-04 문서 및 기존 Last-Frame Bridge, Reference Budget Router, Approved Hero Frame, Model Capability Gate와 중복 비교.

## 스킬 1: Exclusive Reference Mode Resolver — 배타적 레퍼런스 모드 결정
- 원리: Runway의 MiniMax H3 안내에서는 keyframes와 reference inputs를 함께 사용할 수 없다. 요청을 시작/종료 화면 고정형 KEYFRAME_PATH 또는 이미지·비디오·오디오 참조형 REFERENCE_PATH로 분기한다.
- 적용: Runway를 통한 MiniMax H3 사용 시. HOLO MiniMax 직접 API 지원 여부와 제한은 별도 확인.
- 좋은 예: 세럼 패키지의 시작·엔딩 구도가 중요하면 승인된 키프레임 경로. 모델 외모와 카메라 움직임이 중요하면 이미지/비디오 참조 경로.
- 피할 것: 키프레임과 참조 입력을 한 요청에 무조건 동시 전달. 다른 공급자에도 동일 제한 적용.
- 검수: 공급자·모델 버전·입력 모드·참조 개수·화면비·충돌 오류·거절 사유 기록.
- 기존과 차이: Reference Budget Router는 참조 수/우선순위, Capability Gate는 지원·비용, 이 규칙은 상호 배타적인 입력 모드 충돌 차단.
- 공식 출처: https://help.runwayml.com/hc/en-us/articles/54046029551379-Creating-with-Minimax-H3

## 스킬 2: Reverse-Extend Prequel Builder — 확정된 엔딩 앞장면 역확장
- 원리: Luma 공식 Video Generation API는 완료된 생성 영상의 generation ID를 frame1으로 넣어 그 영상보다 앞서는 장면을 생성하는 reverse extend를 설명한다. 해당 서비스에서 생성된 완료 영상이 전제다.
- 적용: 브랜드 엔딩, 시네마틱 반전, 인물 최종 포즈, 패션 엔딩 컷이 먼저 확정된 경우.
- 좋은 예: 정확한 세럼 엔딩 영상이 완성되면 Luma generation ID를 frame1에 지정해 제품을 들어 올려 최종 포즈로 이어지는 앞장면 생성. 이어 붙인 뒤 색상·제품·얼굴·오디오 연결 검수.
- 피할 것: 외부 MP4도 같은 API로 확장된다고 단정, 완료 전 ID 사용, 실제 과거 장면을 복원한다고 주장, 로고 재생성을 신뢰.
- 검수: source_generation_id/status/provider, seam continuity, 제품·인물 일관성, 중복 프레임, 오디오 연결, 추가 비용.
- 기존과 차이: Last-Frame Bridge는 뒤에 이어지는 새 클립 연결, 이번 스킬은 기존 결과 앞에 프리퀄 구간 생성.
- 공식 출처: https://docs.lumalabs.ai/docs/video-generation

## 카테고리 매핑
| 카테고리 | 모드 결정 | 역확장 |
|---|---|---|
| 광고·브랜드 | 제품 키프레임 vs 참조 | 브랜드 엔딩 앞 전개 |
| 시네마틱 | 구도 vs 동작 참조 | 반전 이전 연결 |
| 숏폼 | 훅 프레임 vs 리듬 참조 | 엔딩 이전 전개 |
| 제품·푸드 | 포장·플레이팅 고정 | 완성 제품 직전 |
| 인물·캐릭터 | 얼굴 참조 vs 키프레임 | 최종 포즈 직전 |
| 애니·판타지 | 캐릭터 참조 vs 장면 | 마법 발동 직전 |
| 패션·뷰티 | 의상·얼굴 vs 뷰티 컷 | 등장→최종 포즈 |
| 아트·실험 | 의도별 선택 | 역방향 서사 실험 |

## 변경 전후
- 이전: 레퍼런스·키프레임 계획 → 호환성 검사 → 생성 → 클립 연결/색상/음성 검수.
- 이후: 입력 모드 충돌 검사 → 호환성 검사 → 생성 → 필요시 엔딩 앞 장면 역확장 → 기존 연결·품질 검수.

## 확인 범위
공식 기능 설명은 Runway MiniMax H3 UI와 Luma API에 한정한다. HOLO 엔진에서 동등한 기능이 구현됐다는 뜻이 아니다. 공식 문서 확인일 2026-11-05, 문서 최초 게시일 미확인. GitHub 문서 추가만 수행. 엔진 코드 변경·영상 A/B 테스트·Railway 배포 없음.
