import "./showcase-admin-delete.css";

const API = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://hologramapi-production.up.railway.app");

type ShowcaseItem = {
  id: string;
  title: string;
  category: string;
  url: string;
  aspectRatio?: string | null;
  fileName?: string | null;
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

let mounted = false;
let activeModal: HTMLElement | null = null;

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function closeModal() {
  activeModal?.querySelectorAll("video").forEach((video) => video.pause());
  activeModal?.remove();
  activeModal = null;
}

async function loadShowcaseItems() {
  const response = await fetch(`${API}/showcase`, { headers: { Accept: "application/json" } });
  const data = await response.json() as { items?: ShowcaseItem[] };
  if (!response.ok) throw new Error("쇼케이스 목록을 불러오지 못했습니다.");
  return Array.isArray(data.items) ? data.items : [];
}

function itemHtml(item: ShowcaseItem) {
  return `
    <label class="holoShowcaseManageItem" data-id="${escapeHtml(item.id)}">
      <input type="checkbox" value="${escapeHtml(item.id)}" />
      <span class="holoShowcaseManageCheck">✓</span>
      <div class="holoShowcaseManagePreview">
        <video src="${escapeHtml(item.url)}" muted playsinline preload="metadata"></video>
      </div>
      <div class="holoShowcaseManageMeta">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(CATEGORY_LABELS[item.category] || item.category)} · ${escapeHtml(item.aspectRatio || "VIDEO")}</span>
        <small>${escapeHtml(item.fileName || "")}</small>
      </div>
    </label>`;
}

async function deleteSelected(ids: string[]) {
  const response = await fetch(`${API}/api/showcase`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ids }),
  });
  const data = await response.json() as { deleted?: number; error?: string };
  if (!response.ok) {
    if (response.status === 403) throw new Error("관리자 계정에서만 샘플 영상을 삭제할 수 있습니다.");
    throw new Error(data.error || "샘플 영상 삭제에 실패했습니다.");
  }
  return Number(data.deleted || 0);
}

async function openManager() {
  closeModal();
  const modal = document.createElement("div");
  modal.className = "holoShowcaseManageModal";
  modal.innerHTML = `
    <section class="holoShowcaseManagePanel" role="dialog" aria-modal="true" aria-label="샘플 영상 관리">
      <button class="holoShowcaseManageClose" type="button" aria-label="닫기">×</button>
      <div class="holoShowcaseManageHead">
        <div>
          <span>HOLO SHOWCASE · ADMIN</span>
          <h3>샘플 영상 관리</h3>
          <p>잘못 올린 영상을 선택해서 한 번에 삭제할 수 있습니다.</p>
        </div>
        <button class="holoShowcaseSelectAll" type="button">전체 선택</button>
      </div>
      <div class="holoShowcaseManageStatus">영상 목록을 불러오는 중입니다.</div>
      <div class="holoShowcaseManageGrid"></div>
      <div class="holoShowcaseManageFooter">
        <span class="holoShowcaseSelectedCount">0개 선택</span>
        <div>
          <button class="holoShowcaseManageCancel" type="button">취소</button>
          <button class="holoShowcaseDeleteSelected" type="button" disabled>선택 영상 삭제</button>
        </div>
      </div>
    </section>`;

  const grid = modal.querySelector<HTMLElement>(".holoShowcaseManageGrid")!;
  const status = modal.querySelector<HTMLElement>(".holoShowcaseManageStatus")!;
  const count = modal.querySelector<HTMLElement>(".holoShowcaseSelectedCount")!;
  const deleteButton = modal.querySelector<HTMLButtonElement>(".holoShowcaseDeleteSelected")!;
  const selectAllButton = modal.querySelector<HTMLButtonElement>(".holoShowcaseSelectAll")!;

  const updateSelection = () => {
    const boxes = Array.from(grid.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
    const selected = boxes.filter((box) => box.checked);
    count.textContent = `${selected.length}개 선택`;
    deleteButton.disabled = selected.length === 0;
    selectAllButton.textContent = boxes.length > 0 && selected.length === boxes.length ? "전체 해제" : "전체 선택";
  };

  modal.querySelector(".holoShowcaseManageClose")?.addEventListener("click", closeModal);
  modal.querySelector(".holoShowcaseManageCancel")?.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });

  selectAllButton.addEventListener("click", () => {
    const boxes = Array.from(grid.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
    const shouldSelect = !boxes.length ? false : boxes.some((box) => !box.checked);
    boxes.forEach((box) => { box.checked = shouldSelect; });
    updateSelection();
  });

  deleteButton.addEventListener("click", async () => {
    const ids = Array.from(grid.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')).map((box) => box.value);
    if (!ids.length) return;
    if (!window.confirm(`선택한 ${ids.length}개의 샘플 영상을 삭제할까요?\n삭제한 영상은 쇼케이스에서 즉시 제거됩니다.`)) return;
    deleteButton.disabled = true;
    deleteButton.textContent = "삭제 중…";
    status.classList.remove("error");
    try {
      const deleted = await deleteSelected(ids);
      status.textContent = `${deleted}개 영상을 삭제했습니다. 쇼케이스를 새로고침합니다.`;
      window.setTimeout(() => window.location.reload(), 500);
    } catch (error: any) {
      status.classList.add("error");
      status.textContent = error?.message || "삭제 중 오류가 발생했습니다.";
      deleteButton.disabled = false;
      deleteButton.textContent = "선택 영상 삭제";
    }
  });

  document.body.appendChild(modal);
  activeModal = modal;

  try {
    const items = await loadShowcaseItems();
    if (!items.length) {
      status.textContent = "현재 등록된 샘플 영상이 없습니다.";
      grid.innerHTML = "";
      return;
    }
    status.textContent = `등록된 샘플 ${items.length}개 · 삭제할 영상을 선택하세요.`;
    grid.innerHTML = items.map(itemHtml).join("");
    grid.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((box) => box.addEventListener("change", updateSelection));
  } catch (error: any) {
    status.classList.add("error");
    status.textContent = error?.message || "영상 목록을 불러오지 못했습니다.";
  }
}

async function mountAdminDelete() {
  if (mounted) return;
  const section = document.getElementById("holo-showcase");
  if (!section || !document.getElementById("landing-studio")) return;
  try {
    const response = await fetch(`${API}/api/account`, { headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const data = await response.json();
    if (data?.account?.profile?.role !== "admin") return;
    const head = section.querySelector<HTMLElement>(".holoShowcaseHead");
    if (!head || head.querySelector(".holoShowcaseManageButton")) return;
    const button = document.createElement("button");
    button.className = "holoShowcaseManageButton";
    button.type = "button";
    button.textContent = "✓ 샘플 영상 관리";
    button.addEventListener("click", () => void openManager());
    const uploadButton = head.querySelector(".holoShowcaseAdmin");
    if (uploadButton) uploadButton.insertAdjacentElement("afterend", button);
    else head.appendChild(button);
    mounted = true;
  } catch (error) {
    console.warn("HOLO showcase delete manager unavailable:", error);
  }
}

window.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
void mountAdminDelete();
new MutationObserver(() => void mountAdminDelete()).observe(document.documentElement, { childList: true, subtree: true });
