import "./director-mode.css";

type Candidate = {
  id: "stable" | "cinematic";
  label: string;
  summary: string;
  reason: string;
  recommended: boolean;
  score: number;
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
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
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

function showSelectedChip(candidate: Candidate) {
  removeSelectedChip();
  const chip = document.createElement("div");
  chip.id = "holo-director-selected";
  chip.className = "holoDirectorSelected";
  chip.innerHTML = `
    <div>
      <small>HOLO DIRECTOR SELECTED</small>
      <strong>${escapeHtml(candidate.label)}</strong>
      <span>${escapeHtml(candidate.summary)}</span>
    </div>
    <button type="button">다른 안 보기</button>
  `;
  chip.querySelector("button")?.addEventListener("click", () => {
    if (lastCandidates.length) showDirectorOverlay({ candidates: lastCandidates } as DirectorResponse, lastPayload);
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
  return `
    <article class="holoDirectorCard ${candidate.recommended ? "recommended" : ""} ${selectedCandidate?.id === candidate.id ? "selected" : ""}" data-id="${candidate.id}">
      <div class="holoDirectorCardTop">
        <div>
          <small>${candidate.id === "stable" ? "OPTION A · CONTROL" : "OPTION B · IMPACT"}</small>
          <h3>${escapeHtml(candidate.label)}</h3>
        </div>
        <div class="holoDirectorScore"><b>${Math.round(candidate.score)}</b><span>/100</span></div>
      </div>
      ${candidate.recommended ? '<div class="holoDirectorRecommend">★ HOLO 추천</div>' : ""}
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
          <small>HOLO DIRECTOR MODE · SKILL ROUTER v1.5</small>
          <h2>두 가지 연출 방향을 준비했습니다</h2>
          <p>지금까지 축적한 HOLO 영상 스킬에서 필요한 규칙만 골라 서로 다른 두 안으로 설계했습니다.</p>
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
      <div class="holoDirectorGrid">
        ${(data.candidates || []).map(cardHtml).join("")}
      </div>
      <div class="holoDirectorFooter">
        <span>선택한 프롬프트가 입력창에 적용되고, <b>영상 만들기</b>를 누르면 그 안으로 생성됩니다.</span>
        <button class="holoDirectorRetry" type="button">↻ 다시 추천받기</button>
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
    const recommended = data.candidates?.find((candidate) => candidate.recommended) || data.candidates?.[0];
    if (recommended) chooseCandidate(recommended, false);
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
          plan: director.plan,
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
