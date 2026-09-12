import "./director-mode.css";

type CandidateId = "stable" | "cinematic" | "user_based";

type Candidate = {
  id: CandidateId;
  label: string;
  summary: string;
  reason: string;
  recommended: boolean;
  score: number;
  preservationScore?: number;
  skills: string[];
  prompt: string;
};

type DirectorResponse = {
  source: "astra" | "fallback";
  analysis?: {
    intent?: string;
    subject?: string;
    format?: string;
    duration?: number;
    risks?: string[];
    selectedSkills?: string[];
  };
  candidates: Candidate[];
  plan: Record<string, any>;
};

type CommandPayload = {
  command: string;
  autoRender?: boolean;
  images?: {
    firstFrameUrl?: string;
    referenceImageUrl?: string;
    lastFrameUrl?: string;
  };
};

declare global {
  interface Window {
    __HOLO_DIRECTOR_FETCH_PATCHED__?: boolean;
  }
}

let selectedCandidate: Candidate | null = null;
let lastCandidates: Candidate[] = [];
let lastPayload: CommandPayload | null = null;
let activeOverlay: HTMLElement | null = null;

function setReactTextareaValue(value: string) {
  const textarea = document.querySelector<HTMLTextAreaElement>(".commandBar textarea");
  if (!textarea) return;
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
  if (setter) setter.call(textarea, value);
  else textarea.value = value;
  textarea.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
  textarea.dispatchEvent(new Event("change", { bubbles: true }));
}

function syncVisiblePlan(prompt: string) {
  window.setTimeout(() => {
    const promptEl = document.querySelector<HTMLElement>(".plan > p");
    if (promptEl) promptEl.textContent = prompt;
  }, 40);
}

function removeSelectedChip() {
  document.getElementById("holo-director-selected")?.remove();
}

function optionCode(id: CandidateId) {
  if (id === "stable") return "OPTION A · CONTROL";
  if (id === "cinematic") return "OPTION B · IMPACT";
  return "OPTION C · USER BASED";
}

function optionShort(id: CandidateId) {
  if (id === "stable") return "A · CONTROL";
  if (id === "cinematic") return "B · IMPACT";
  return "C · USER BASED";
}

function showSelectedChip(candidate: Candidate) {
  removeSelectedChip();
  const chip = document.createElement("div");
  chip.id = "holo-director-selected";
  chip.className = `holoDirectorSelected ${candidate.id === "user_based" ? "userBased" : ""}`;
  chip.innerHTML = `
    <div>
      <small>HOLO DIRECTOR SELECTED · ${optionShort(candidate.id)}</small>
      <strong>${escapeHtml(candidate.label)}</strong>
      <span>${escapeHtml(candidate.summary)}</span>
    </div>
    <button type="button">다른 안 보기</button>
  `;
  chip.querySelector("button")?.addEventListener("click", () => {
    if (lastCandidates.length) showDirectorOverlay({ candidates: lastCandidates, plan: {} } as DirectorResponse, lastPayload);
  });
  document.body.appendChild(chip);
}

function chooseCandidate(candidate: Candidate, close = true) {
  selectedCandidate = candidate;
  setReactTextareaValue(candidate.prompt);
  syncVisiblePlan(candidate.prompt);
  showSelectedChip(candidate);
  document.querySelectorAll<HTMLElement>(".holoDirectorCard").forEach((card) => {
    card.classList.toggle("selected", card.dataset.id === candidate.id);
  });
  if (close && activeOverlay) {
    activeOverlay.classList.add("closing");
    window.setTimeout(() => {
      activeOverlay?.remove();
      activeOverlay = null;
    }, 180);
  }
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cardHtml(candidate: Candidate) {
  const skills = (candidate.skills || []).slice(0, 6).map((skill) => `<span>${escapeHtml(skill)}</span>`).join("");
  const preservation = candidate.id === "user_based" && typeof candidate.preservationScore === "number"
    ? `<div class="holoDirectorPreserve"><b>${Math.round(candidate.preservationScore)}%</b><span>원문 유지도</span></div>`
    : "";
  return `
    <article class="holoDirectorCard ${candidate.id === "user_based" ? "userBased" : ""} ${candidate.recommended ? "recommended" : ""} ${selectedCandidate?.id === candidate.id ? "selected" : ""}" data-id="${candidate.id}">
      <div class="holoDirectorCardTop">
        <div>
          <small>${optionCode(candidate.id)}</small>
          <h3>${escapeHtml(candidate.label)}</h3>
        </div>
        <div class="holoDirectorScore"><b>${Math.round(candidate.score)}</b><span>/100</span></div>
      </div>
      ${candidate.recommended ? '<div class="holoDirectorRecommend">★ HOLO 추천</div>' : ""}
      ${preservation}
      <p class="holoDirectorSummary">${escapeHtml(candidate.summary)}</p>
      <p class="holoDirectorReason">${escapeHtml(candidate.reason)}</p>
      <div class="holoDirectorSkills">${skills}</div>
      <details>
        <summary>전체 프롬프트 보기</summary>
        <pre>${escapeHtml(candidate.prompt)}</pre>
      </details>
      <button class="holoDirectorChoose" type="button">${selectedCandidate?.id === candidate.id ? "선택됨" : "이 프롬프트 선택"}</button>
    </article>
  `;
}

function showDirectorOverlay(data: DirectorResponse, payload: CommandPayload | null) {
  lastCandidates = data.candidates || lastCandidates;
  if (payload) lastPayload = payload;
  activeOverlay?.remove();

  const overlay = document.createElement("div");
  overlay.className = "holoDirectorOverlay";
  overlay.innerHTML = `
    <section class="holoDirectorModal" role="dialog" aria-modal="true" aria-label="HOLO Director 추천 프롬프트">
      <div class="holoDirectorHead">
        <div>
          <small>HOLO DIRECTOR MODE · SKILL ROUTER v1.6</small>
          <h2>세 가지 연출 방향을 준비했습니다</h2>
          <p>A는 안정성과 일관성, B는 시네마틱 임팩트, C는 내가 쓴 내용을 유지하면서 카메라·구도·조명만 보강합니다.</p>
        </div>
        <button class="holoDirectorClose" type="button" aria-label="닫기">×</button>
      </div>
      ${data.analysis ? `
        <div class="holoDirectorAnalysis">
          <span><b>INTENT</b>${escapeHtml(data.analysis.intent || "VIDEO")}</span>
          <span><b>FORMAT</b>${escapeHtml(data.analysis.format || "AUTO")}</span>
          <span><b>DURATION</b>${escapeHtml(data.analysis.duration || "AUTO")}s</span>
          <span><b>SKILLS</b>${escapeHtml((data.analysis.selectedSkills || []).slice(0, 4).join(" · ") || "AUTO ROUTING")}</span>
        </div>
      ` : ""}
      <div class="holoDirectorLegend">
        <span><b>A</b> 일관성·안정성</span>
        <span><b>B</b> 영화적 임팩트</span>
        <span><b>C</b> 내 원문 유지 + 연출 보강</span>
      </div>
      <div class="holoDirectorGrid">
        ${(data.candidates || []).map(cardHtml).join("")}
      </div>
      <div class="holoDirectorFooter">
        <span>세 안 중 하나를 선택하면 입력창에 적용됩니다. 그 다음 <b>영상 만들기</b>를 누르면 선택한 프롬프트로 생성됩니다.</span>
        <button class="holoDirectorRetry" type="button">↻ A/B/C 다시 추천받기</button>
      </div>
    </section>
  `;

  overlay.querySelector(".holoDirectorClose")?.addEventListener("click", () => {
    overlay.remove();
    if (activeOverlay === overlay) activeOverlay = null;
  });
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      overlay.remove();
      if (activeOverlay === overlay) activeOverlay = null;
    }
  });
  overlay.querySelectorAll<HTMLElement>(".holoDirectorCard").forEach((card) => {
    const candidate = data.candidates.find((item) => item.id === card.dataset.id);
    card.querySelector(".holoDirectorChoose")?.addEventListener("click", () => {
      if (candidate) chooseCandidate(candidate, true);
    });
  });
  overlay.querySelector(".holoDirectorRetry")?.addEventListener("click", () => {
    if (lastPayload) void requestDirector(lastPayload, true);
  });

  activeOverlay = overlay;
  document.body.appendChild(overlay);
}

function apiBaseFromCommandUrl(commandUrl: string) {
  return commandUrl.replace(/\/api\/command(?:\?.*)?$/, "");
}

let authenticatedFetch: typeof window.fetch | null = null;
let lastCommandUrl = "";

async function requestDirector(payload: CommandPayload, reopen = false) {
  if (!authenticatedFetch || !lastCommandUrl) return null;
  const apiBase = apiBaseFromCommandUrl(lastCommandUrl);
  const overlay = activeOverlay;
  overlay?.classList.add("loading");
  try {
    const response = await authenticatedFetch(`${apiBase}/api/director`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: payload.command, images: payload.images }),
    });
    const data = await response.json() as DirectorResponse & { error?: string };
    if (!response.ok) throw new Error(data.error || "HOLO Director 요청 실패");
    selectedCandidate = null;
    removeSelectedChip();
    showDirectorOverlay(data, payload);
    return data;
  } catch (error) {
    console.error("HOLO Director mode failed:", error);
    if (reopen) window.alert("HOLO Director 추천을 다시 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    return null;
  } finally {
    overlay?.classList.remove("loading");
  }
}

function parsePayload(init?: RequestInit): CommandPayload | null {
  if (!init?.body || typeof init.body !== "string") return null;
  try {
    const parsed = JSON.parse(init.body);
    if (!parsed?.command) return null;
    return parsed as CommandPayload;
  } catch {
    return null;
  }
}

function installFetchPatch() {
  if (window.__HOLO_DIRECTOR_FETCH_PATCHED__) return;
  if (!document.querySelector(".commandPanel")) return;

  window.__HOLO_DIRECTOR_FETCH_PATCHED__ = true;
  authenticatedFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const payload = parsePayload(init);

    if (url.includes("/api/command") && payload && !payload.autoRender) {
      lastCommandUrl = url;
      lastPayload = payload;
      const director = await requestDirector(payload);
      if (director) {
        const synthetic = {
          plan: {
            ...director.plan,
            refinedPrompt: "HOLO가 A/B/C 세 가지 연출안을 준비했습니다. 원하는 안을 선택해 주세요.",
          },
          source: director.source,
          directorMode: true,
          candidates: director.candidates,
        };
        return new Response(JSON.stringify(synthetic), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return authenticatedFetch!(input, init);
  };
}

function watchForApp() {
  if (document.querySelector(".commandPanel")) installFetchPatch();
  const observer = new MutationObserver(() => {
    if (document.querySelector(".commandPanel")) installFetchPatch();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

watchForApp();
