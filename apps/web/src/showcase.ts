import "./showcase.css";

const API = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://hologramapi-production.up.railway.app");

type ShowcaseItem = {
  id: string;
  title: string;
  category: string;
  url: string;
  aspectRatio?: string | null;
  fileName?: string | null;
  createdAt?: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  brand: "광고 · 브랜드",
  cinematic: "시네마틱",
  shortform: "숏폼",
  food: "제품 · 푸드",
  character: "인물 · 캐릭터",
  fantasy: "애니 · 판타지",
  fashion: "패션 · 뷰티",
  art: "아트 · 실험",
};

const PREFIX_CATEGORY: Record<string, string> = {
  "01": "brand",
  "02": "cinematic",
  "03": "shortform",
  "04": "food",
  "05": "character",
  "06": "fantasy",
  "07": "fashion",
  "08": "art",
};

let activeModal: HTMLElement | null = null;
let currentItems: ShowcaseItem[] = [];
let mountedLanding: HTMLElement | null = null;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function categoryLabel(category: string) {
  return CATEGORY_LABELS[category] || category || "HOLO VIDEO";
}

function isPortrait(item: ShowcaseItem) {
  if (String(item.aspectRatio || "").startsWith("9:16")) return true;
  return item.category === "shortform" || item.category === "fashion";
}

function cardHtml(item: ShowcaseItem) {
  const portrait = isPortrait(item);
  return `
    <article class="holoShowcaseCard ${portrait ? "isPortrait" : ""}" tabindex="0" role="button"
      data-showcase-id="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.title)} 영상 보기">
      <div class="holoShowcaseMedia" data-ratio="${portrait ? "9:16" : "16:9"}">
        <video muted loop playsinline preload="metadata" src="${escapeHtml(item.url)}"></video>
        <div class="holoShowcaseShade"></div>
        <div class="holoShowcasePlay">▶</div>
      </div>
      <div class="holoShowcaseMeta">
        <div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(categoryLabel(item.category))}</span></div>
        <em>${escapeHtml(item.aspectRatio || (portrait ? "9:16" : "16:9"))}</em>
      </div>
    </article>`;
}

function closeModal() {
  const video = activeModal?.querySelector("video") as HTMLVideoElement | null;
  video?.pause();
  activeModal?.remove();
  activeModal = null;
}

function openViewer(item: ShowcaseItem) {
  closeModal();
  const modal = document.createElement("div");
  modal.className = "holoShowcaseModal";
  modal.innerHTML = `
    <div class="holoShowcaseViewer" role="dialog" aria-modal="true" aria-label="${escapeHtml(item.title)}">
      <button class="holoShowcaseClose" type="button" aria-label="닫기">×</button>
      <video src="${escapeHtml(item.url)}" controls playsinline autoplay></video>
      <div class="holoShowcaseViewerInfo">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(categoryLabel(item.category))} · ${escapeHtml(item.aspectRatio || "VIDEO")}</span>
      </div>
    </div>`;
  modal.querySelector(".holoShowcaseClose")?.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
  document.body.appendChild(modal);
  activeModal = modal;
}

function wireCards(section: HTMLElement) {
  section.querySelectorAll<HTMLElement>(".holoShowcaseCard").forEach((card) => {
    const open = () => {
      const item = currentItems.find((entry) => entry.id === card.dataset.showcaseId);
      if (item) openViewer(item);
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: [0, .2, .5], rootMargin: "100px" });

  section.querySelectorAll<HTMLVideoElement>(".holoShowcaseCard video").forEach((video) => observer.observe(video));
}

function renderItems(section: HTMLElement, items: ShowcaseItem[]) {
  const viewport = section.querySelector<HTMLElement>(".holoShowcaseViewport");
  if (!viewport) return;
  currentItems = items.slice(0, 60);
  if (!currentItems.length) {
    viewport.innerHTML = '<div class="holoShowcaseEmpty">아직 공개된 샘플 영상이 없습니다. 관리자 계정에서 샘플 영상을 올리면 이곳에 자동으로 표시됩니다.</div>';
    return;
  }
  viewport.innerHTML = `<div class="holoShowcaseGrid">${currentItems.map(cardHtml).join("")}</div>`;
  wireCards(section);
}

async function loadItems(section: HTMLElement) {
  try {
    const response = await fetch(`${API}/showcase`, { headers: { Accept: "application/json" } });
    const data = await response.json() as { items?: ShowcaseItem[] };
    if (!response.ok) throw new Error("showcase_load_failed");
    renderItems(section, Array.isArray(data.items) ? data.items : []);
  } catch (error) {
    console.warn("HOLO showcase unavailable:", error);
    const viewport = section.querySelector<HTMLElement>(".holoShowcaseViewport");
    if (viewport) viewport.innerHTML = '<div class="holoShowcaseEmpty">쇼케이스를 불러오는 중입니다.</div>';
  }
}

function categoryFromFileName(name: string) {
  const match = /^(\d{2})[._-]/.exec(name.trim());
  return match ? (PREFIX_CATEGORY[match[1]] || "brand") : "brand";
}

function titleFromFileName(name: string) {
  const base = name.replace(/\.[^.]+$/, "").replace(/^\d{2}[._-]?/, "").replace(/[_-]+/g, " ").trim();
  if (!base || /^(brand|cinematic|shortform|food|character|charcter|fantasy|fashion|art)\d*$/i.test(base)) {
    return `${categoryLabel(categoryFromFileName(name))} 샘플`;
  }
  return base;
}

function fileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("file_read_failed"));
    reader.readAsDataURL(file);
  });
}

function readAspectRatio(file: File) {
  return new Promise<string>((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const portrait = video.videoHeight > video.videoWidth;
      URL.revokeObjectURL(url);
      resolve(portrait ? "9:16" : "16:9");
    };
    video.onerror = () => { URL.revokeObjectURL(url); resolve("16:9"); };
    video.src = url;
  });
}

async function uploadFiles(files: File[], status: HTMLElement) {
  let completed = 0;
  for (const file of files) {
    if (!/video\/(mp4|webm|quicktime)/i.test(file.type) && !/\.(mp4|webm|mov)$/i.test(file.name)) {
      throw new Error(`${file.name}: MP4, WEBM, MOV 파일만 가능합니다.`);
    }
    if (file.size > 30 * 1024 * 1024) throw new Error(`${file.name}: 30MB 이하 파일만 가능합니다.`);
    status.textContent = `${files.length}개 중 ${completed + 1}번째 업로드 중 · ${file.name}`;
    const [dataUrl, aspectRatio] = await Promise.all([fileAsDataUrl(file), readAspectRatio(file)]);
    const response = await fetch(`${API}/api/showcase/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: file.name,
        title: titleFromFileName(file.name),
        category: categoryFromFileName(file.name),
        aspectRatio,
        dataUrl,
      }),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) {
      if (response.status === 403) throw new Error("관리자 계정에서만 쇼케이스 영상을 올릴 수 있습니다.");
      throw new Error(data.error || `${file.name} 업로드 실패`);
    }
    completed += 1;
  }
  status.textContent = `${completed}개 영상 업로드 완료 · 쇼케이스를 새로고침합니다.`;
}

function openUploader(section: HTMLElement) {
  closeModal();
  const modal = document.createElement("div");
  modal.className = "holoShowcaseModal";
  modal.innerHTML = `
    <section class="holoShowcaseUploadPanel" role="dialog" aria-modal="true" aria-label="쇼케이스 영상 업로드">
      <button class="holoShowcaseClose" type="button" aria-label="닫기">×</button>
      <h3>HOLO SHOWCASE 업로드</h3>
      <p>MP4 파일을 여러 개 선택할 수 있습니다. 01~08로 시작하는 파일명은 광고·브랜드, 시네마틱, 숏폼, 제품·푸드, 인물·캐릭터, 애니·판타지, 패션·뷰티, 아트·실험 카테고리로 자동 분류됩니다.</p>
      <input id="holo-showcase-files" type="file" accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" multiple />
      <div class="holoShowcaseUploadStatus" id="holo-showcase-upload-status"></div>
      <div class="holoShowcaseUploadActions">
        <button class="cancel" type="button">취소</button>
        <button class="primary" type="button">선택한 영상 올리기</button>
      </div>
    </section>`;
  modal.querySelector(".holoShowcaseClose")?.addEventListener("click", closeModal);
  modal.querySelector(".cancel")?.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
  modal.querySelector(".primary")?.addEventListener("click", async () => {
    const input = modal.querySelector<HTMLInputElement>("#holo-showcase-files");
    const status = modal.querySelector<HTMLElement>("#holo-showcase-upload-status");
    const button = modal.querySelector<HTMLButtonElement>(".primary");
    const files = Array.from(input?.files || []);
    if (!status || !button) return;
    status.classList.remove("error");
    if (!files.length) {
      status.textContent = "업로드할 영상을 선택해 주세요.";
      return;
    }
    button.disabled = true;
    try {
      await uploadFiles(files, status);
      await loadItems(section);
      window.setTimeout(closeModal, 650);
    } catch (error: any) {
      status.classList.add("error");
      status.textContent = error?.message || "업로드 중 오류가 발생했습니다.";
    } finally {
      button.disabled = false;
    }
  });
  document.body.appendChild(modal);
  activeModal = modal;
}

async function revealAdminButton(section: HTMLElement) {
  if (!document.getElementById("landing-studio")) return;
  try {
    const response = await fetch(`${API}/api/account`);
    if (!response.ok) return;
    const data = await response.json();
    if (data?.account?.profile?.role !== "admin") return;
    const button = section.querySelector<HTMLButtonElement>(".holoShowcaseAdmin");
    if (!button) return;
    button.hidden = false;
    button.addEventListener("click", () => openUploader(section));
  } catch (error) {
    console.warn("HOLO showcase admin control unavailable:", error);
  }
}

function mountShowcase() {
  const landing = document.querySelector<HTMLElement>(".landingPage");
  if (!landing || landing === mountedLanding || document.getElementById("holo-showcase")) return;
  mountedLanding = landing;
  const footer = landing.querySelector(".landingFooter");
  const section = document.createElement("section");
  section.id = "holo-showcase";
  section.className = "holoShowcase";
  section.innerHTML = `
    <div class="holoShowcaseHead">
      <div>
        <span class="holoShowcaseEyebrow">HOLO SHOWCASE · MADE WITH HOLO</span>
        <h2>샘플 영상 둘러보기</h2>
        <p>HOLO로 만든 대표 영상 예시를 바로 확인하세요. PC에서는 4개씩, 모바일에서는 한 작품씩 크게 볼 수 있습니다.</p>
      </div>
      <button class="holoShowcaseAdmin" type="button" hidden>＋ 샘플 영상 올리기</button>
    </div>
    <div class="holoShowcaseViewport"><div class="holoShowcaseEmpty">쇼케이스를 불러오는 중입니다.</div></div>`;
  if (footer) landing.insertBefore(section, footer);
  else landing.appendChild(section);
  void loadItems(section);
  void revealAdminButton(section);
}

window.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
mountShowcase();
new MutationObserver(mountShowcase).observe(document.documentElement, { childList: true, subtree: true });
