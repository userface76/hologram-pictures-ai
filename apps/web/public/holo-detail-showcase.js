(() => {
  const API = window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://hologramapi-production.up.railway.app";

  const labels = {
    brand: "BRAND · 광고/브랜드",
    cinematic: "CINEMATIC · 시네마틱",
    character: "PORTRAIT · 인물/캐릭터",
    art: "ART · 아트/실험",
    food: "FOOD · 제품/푸드",
    fantasy: "FANTASY · 애니/판타지",
    shortform: "SHORTFORM · 숏폼",
    fashion: "FASHION · 패션/뷰티",
  };

  const categoryOrder = ["brand", "cinematic", "character", "art", "food", "fantasy"];
  let modal = null;

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function closeModal() {
    if (!modal) return;
    const video = modal.querySelector("video");
    if (video) video.pause();
    modal.remove();
    modal = null;
  }

  function openVideo(item) {
    closeModal();
    modal = document.createElement("div");
    modal.className = "detailVideoModal";
    modal.innerHTML = `
      <div class="detailVideoDialog" role="dialog" aria-modal="true">
        <button class="detailVideoClose" type="button" aria-label="닫기">×</button>
        <video src="${esc(item.url)}" controls autoplay playsinline></video>
        <div class="detailVideoInfo"><strong>${esc(item.title)}</strong><span>${esc(labels[item.category] || item.category)}</span></div>
      </div>`;
    modal.querySelector(".detailVideoClose")?.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
    document.body.appendChild(modal);
  }

  function observeVideos(root) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const video = entry.target;
        if (!(video instanceof HTMLVideoElement)) continue;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    }, { threshold: [0, .3, .65], rootMargin: "80px" });
    root.querySelectorAll("video[data-auto]").forEach((video) => observer.observe(video));
  }

  function featureCard(item, category) {
    if (!item) {
      return `<div class="detailFeatureCard empty"><div class="detailFeatureFallback"></div><div class="detailFeatureLabel">${esc(labels[category] || category)}</div></div>`;
    }
    return `
      <button class="detailFeatureCard" type="button" data-video-id="${esc(item.id)}">
        <video data-auto muted loop playsinline preload="metadata" src="${esc(item.url)}"></video>
        <span class="detailFeatureShade"></span>
        <span class="detailFeatureLabel">${esc(labels[category] || category)}</span>
      </button>`;
  }

  function sampleCard(item) {
    return `
      <button class="detailSampleCard" type="button" data-video-id="${esc(item.id)}">
        <div class="detailSampleMedia">
          <video data-auto muted loop playsinline preload="metadata" src="${esc(item.url)}"></video>
          <span class="detailSampleShade"></span>
          <span class="detailSamplePlay">▶</span>
        </div>
        <div class="detailSampleCopy"><span>${esc(labels[item.category] || item.category)}</span><strong>${esc(item.title)}</strong><small>${esc(item.aspectRatio || "VIDEO")}</small></div>
      </button>`;
  }

  async function mount() {
    const chapter = document.getElementById("chapter-09");
    if (!chapter || chapter.dataset.enhanced === "1") return;
    chapter.dataset.enhanced = "1";

    let items = [];
    try {
      const response = await fetch(`${API}/showcase`, { headers: { Accept: "application/json" } });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.items)) items = data.items;
      }
    } catch (error) {
      console.warn("HOLO detail showcase unavailable", error);
    }

    const byId = new Map(items.map((item) => [String(item.id), item]));
    const picks = categoryOrder.map((category) => items.find((item) => item.category === category));
    const features = categoryOrder.map((category, index) => featureCard(picks[index], category)).join("");
    const samples = items.slice(0, 16).map(sampleCard).join("");

    const oldBoard = chapter.querySelector(".studio-board");
    if (oldBoard) {
      oldBoard.outerHTML = `
        <section class="detailFeatureGallery" aria-label="HOLO 분야별 작품 예시">${features}</section>
        <div class="detailGalleryNote">분야별 대표 작업을 한눈에 보고, 마음에 드는 영상은 클릭해서 크게 확인할 수 있습니다.</div>`;
    }

    const sampleSection = document.createElement("section");
    sampleSection.className = "detailVideoShowcase";
    sampleSection.innerHTML = `
      <div class="detailShowcaseHead"><span>VIDEO SHOWCASE</span><h3>샘플 영상 둘러보기</h3><p>HOLO로 만든 대표 영상 예시를 바로 확인하세요.</p></div>
      <div class="detailSampleGrid">${samples || '<div class="detailSampleEmpty">샘플 영상이 등록되면 이곳에 자동으로 표시됩니다.</div>'}</div>`;
    chapter.appendChild(sampleSection);

    chapter.querySelectorAll("[data-video-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = byId.get(button.getAttribute("data-video-id") || "");
        if (item) openVideo(item);
      });
    });

    observeVideos(chapter);
  }

  window.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
