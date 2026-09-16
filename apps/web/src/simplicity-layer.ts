import "./simplicity-layer.css";

const ONBOARDING_KEY = "holo_simple_onboarding_v1";

function createOnboarding() {
  if (document.getElementById("holo-simple-onboarding")) return;
  if (localStorage.getItem(ONBOARDING_KEY) === "done") return;

  const modal = document.createElement("div");
  modal.id = "holo-simple-onboarding";
  modal.className = "holoSimpleOnboarding";
  modal.innerHTML = `
    <section class="holoSimpleOnboardingCard" role="dialog" aria-modal="true" aria-labelledby="holo-simple-title">
      <button class="holoSimpleClose" type="button" aria-label="안내 닫기">×</button>
      <span class="holoSimpleKicker">WELCOME TO HOLO</span>
      <h2 id="holo-simple-title">어렵게 시작하지 않아도 됩니다</h2>
      <p>아이디어만 적어주세요. HOLO가 영상 제작에 필요한 내용을 정리하고, 필요한 경우에만 추가 선택을 안내합니다.</p>
      <div class="holoSimpleSteps">
        <div><b>1</b><strong>아이디어 입력</strong><span>하고 싶은 장면을 자유롭게 적습니다.</span></div>
        <div><b>2</b><strong>HOLO 제작안 추천</strong><span>안정형 · 임팩트형 · 내 문장 유지형으로 정리합니다.</span></div>
        <div><b>3</b><strong>완성작 관리</strong><span>결과는 MY STUDIO에서 이어서 관리합니다.</span></div>
      </div>
      <button class="holoSimpleStart" type="button">바로 시작하기</button>
    </section>`;

  const close = () => {
    localStorage.setItem(ONBOARDING_KEY, "done");
    modal.remove();
    document.querySelector<HTMLTextAreaElement>(".commandBar textarea")?.focus();
  };

  modal.querySelector(".holoSimpleClose")?.addEventListener("click", close);
  modal.querySelector(".holoSimpleStart")?.addEventListener("click", close);
  modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
  document.body.appendChild(modal);
}

function mountSimpleGuide() {
  const consoleEl = document.querySelector<HTMLElement>(".space .console");
  if (!consoleEl || document.getElementById("holo-simple-guide")) return;

  const guide = document.createElement("section");
  guide.id = "holo-simple-guide";
  guide.className = "holoSimpleGuide";
  guide.innerHTML = `
    <div class="holoSimpleGuideCopy">
      <span>HOLO QUICK START</span>
      <h2>무엇을 만들고 싶으세요?</h2>
      <p>아이디어를 자유롭게 적어주세요. 이미지와 세부 옵션은 필요할 때만 추가하면 됩니다.</p>
    </div>
    <div class="holoSimpleGuideBadges" aria-label="기본 제작 안내">
      <b>16:9 기본</b>
      <b>이미지 선택사항</b>
      <b>HOLO 제작안 추천</b>
    </div>`;

  const status = consoleEl.querySelector(".status");
  if (status) consoleEl.insertBefore(guide, status);
  else consoleEl.prepend(guide);

  const assetDeck = consoleEl.querySelector(".assetDeck");
  if (assetDeck && !document.getElementById("holo-optional-image-note")) {
    const note = document.createElement("div");
    note.id = "holo-optional-image-note";
    note.className = "holoOptionalImageNote";
    note.innerHTML = `<strong>이미지는 선택사항입니다</strong><span>사진 없이 아이디어만으로 바로 시작하거나, 필요한 역할만 추가하세요.</span>`;
    assetDeck.parentElement?.insertBefore(note, assetDeck);
  }

  const commandPanel = consoleEl.querySelector(".commandPanel");
  if (commandPanel && !document.getElementById("holo-command-label")) {
    const label = document.createElement("div");
    label.id = "holo-command-label";
    label.className = "holoCommandLabel";
    label.innerHTML = `<strong>아이디어 입력</strong><span>전문 용어 없이 평소 말하듯 적어도 됩니다.</span>`;
    commandPanel.prepend(label);
  }

  window.setTimeout(createOnboarding, 250);
}

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const modal = document.getElementById("holo-simple-onboarding");
  if (!modal) return;
  localStorage.setItem(ONBOARDING_KEY, "done");
  modal.remove();
});

mountSimpleGuide();
new MutationObserver(mountSimpleGuide).observe(document.documentElement, { childList: true, subtree: true });
