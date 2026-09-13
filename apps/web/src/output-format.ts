import "./output-format.css";

type OutputFormat = "landscape_16_9" | "shorts_9_16";

declare global {
  interface Window {
    __HOLO_OUTPUT_FORMAT_PATCHED__?: boolean;
    __HOLO_OUTPUT_FORMAT__?: OutputFormat;
  }
}

const STORAGE_KEY = "holo_output_format";
const FORMAT_MARKER = "[HOLO_OUTPUT_FORMAT]";

function readFormat(): OutputFormat {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  return saved === "shorts_9_16" ? "shorts_9_16" : "landscape_16_9";
}

function formatMeta(format: OutputFormat) {
  if (format === "shorts_9_16") {
    return {
      ratio: "9:16",
      title: "숏폼 · 9:16",
      description: "쇼츠 · 릴스 · 틱톡용 세로 영상",
      directive: `${FORMAT_MARKER}\nOUTPUT FORMAT HARD CONSTRAINT: 9:16 vertical short-form. Compose for Shorts, Reels and TikTok. Keep the main subject readable on mobile, favor centered or safely framed composition, preserve vertical headroom, and do not switch to 16:9.`,
    };
  }
  return {
    ratio: "16:9",
    title: "가로형 · 16:9",
    description: "광고 · 유튜브 · 브랜드 영상용",
    directive: `${FORMAT_MARKER}\nOUTPUT FORMAT HARD CONSTRAINT: 16:9 landscape. Compose for horizontal advertising, YouTube and general cinematic video. Use the wider frame intentionally for environment, spatial relationships and cinematic composition, and do not switch to 9:16.`,
  };
}

function stripOldDirective(command: string) {
  const markerIndex = command.indexOf(FORMAT_MARKER);
  if (markerIndex !== 0) return command;
  const separator = command.indexOf("\n\n");
  return separator >= 0 ? command.slice(separator + 2) : command;
}

function applyDirective(command: string) {
  const current = window.__HOLO_OUTPUT_FORMAT__ || readFormat();
  const base = stripOldDirective(command).trim();
  return `${formatMeta(current).directive}\n\n${base}`;
}

function updateButtons(root: HTMLElement, format: OutputFormat) {
  root.querySelectorAll<HTMLButtonElement>("[data-holo-format]").forEach((button) => {
    const active = button.dataset.holoFormat === format;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const selected = root.querySelector<HTMLElement>(".holoFormatSelected");
  if (selected) selected.textContent = `${formatMeta(format).ratio} 선택됨`;
}

function setFormat(format: OutputFormat, root?: HTMLElement) {
  window.__HOLO_OUTPUT_FORMAT__ = format;
  sessionStorage.setItem(STORAGE_KEY, format);
  if (root) updateButtons(root, format);
}

function buildPicker() {
  if (document.querySelector(".holoFormatPicker")) return;
  const anchor = document.querySelector<HTMLElement>(".mediaRule") || document.querySelector<HTMLElement>(".commandPanel");
  if (!anchor?.parentElement) return;

  const current = readFormat();
  window.__HOLO_OUTPUT_FORMAT__ = current;

  const picker = document.createElement("section");
  picker.className = "holoFormatPicker";
  picker.innerHTML = `
    <div class="holoFormatHead">
      <div>
        <small>OUTPUT FORMAT</small>
        <strong>어떤 화면으로 만들까요?</strong>
        <span>기본은 16:9입니다. 작품 성격에 맞게 선택하세요.</span>
      </div>
      <b class="holoFormatSelected">${formatMeta(current).ratio} 선택됨</b>
    </div>
    <div class="holoFormatOptions">
      <button type="button" data-holo-format="landscape_16_9" aria-pressed="false">
        <span class="holoFormatIcon landscape"><i></i></span>
        <span class="holoFormatText">
          <em>기본</em>
          <strong>가로형 · 16:9</strong>
          <small>광고 · 유튜브 · 브랜드 영상</small>
        </span>
      </button>
      <button type="button" data-holo-format="shorts_9_16" aria-pressed="false">
        <span class="holoFormatIcon vertical"><i></i></span>
        <span class="holoFormatText">
          <em>SHORT-FORM</em>
          <strong>숏폼 · 9:16</strong>
          <small>쇼츠 · 릴스 · 틱톡</small>
        </span>
      </button>
    </div>
  `;

  picker.querySelectorAll<HTMLButtonElement>("[data-holo-format]").forEach((button) => {
    button.addEventListener("click", () => {
      const format = button.dataset.holoFormat === "shorts_9_16" ? "shorts_9_16" : "landscape_16_9";
      setFormat(format, picker);
    });
  });

  updateButtons(picker, current);
  anchor.parentElement.insertBefore(picker, anchor);
}

function patchFetch() {
  if (window.__HOLO_OUTPUT_FORMAT_PATCHED__) return;
  if (!document.querySelector(".commandPanel")) return;

  window.__HOLO_OUTPUT_FORMAT_PATCHED__ = true;
  const previousFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const isVideoRequest = url.includes("/api/command") || url.includes("/api/render") || url.includes("/api/director");

    if (isVideoRequest && init?.body && typeof init.body === "string") {
      try {
        const payload = JSON.parse(init.body);
        if (typeof payload?.command === "string" && payload.command.trim()) {
          payload.command = applyDirective(payload.command);
          init = { ...init, body: JSON.stringify(payload) };
        }
      } catch {
        // Keep the original request if the body is not JSON.
      }
    }

    return previousFetch(input, init);
  };
}

function install() {
  buildPicker();
  patchFetch();
}

if (document.querySelector(".commandPanel")) install();
const observer = new MutationObserver(() => {
  if (document.querySelector(".commandPanel")) install();
});
observer.observe(document.documentElement, { childList: true, subtree: true });
