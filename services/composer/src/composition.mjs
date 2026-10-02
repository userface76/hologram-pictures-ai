function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isImage(url) {
  return /\.(png|jpe?g|webp|gif|avif)(?:\?|$)/i.test(url);
}

function dims(aspectRatio) {
  if (aspectRatio === "9:16") return [1080, 1920];
  if (aspectRatio === "1:1") return [1080, 1080];
  return [1920, 1080];
}

function clipWindows(spec) {
  const total = Number(spec.duration || 0);
  const fallback = total > 0 ? total / spec.clips.length : 5;
  let cursor = 0;
  return spec.clips.map((clip, index) => {
    const start = Number.isFinite(Number(clip.start)) ? Number(clip.start) : cursor;
    const explicitEnd = Number(clip.end);
    const duration = Number.isFinite(explicitEnd) && explicitEnd > start ? explicitEnd - start : fallback;
    cursor = start + duration;
    return { ...clip, index, start, duration };
  });
}

export function renderCompositionHtml(spec) {
  const [width, height] = dims(spec.aspectRatio);
  const clips = clipWindows(spec);
  const duration = Number(spec.duration || Math.max(...clips.map((c) => c.start + c.duration), 5));
  const fps = Number(spec.fps || 30);

  const clipHtml = clips.map((clip) => {
    const common = `id="clip-${clip.index}" class="clip" data-start="${clip.start}" data-duration="${clip.duration}" data-track-index="${clip.index % 2}"`;
    const src = esc(clip.url);
    const style = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;";
    if (isImage(clip.url)) return `<img ${common} src="${src}" style="${style}" />`;
    const mediaStart = Number(clip.trimStart || 0);
    const audio = Number(clip.volume || 0) > 0
      ? `data-has-audio="true" data-volume="${Math.min(Math.max(Number(clip.volume), 0), 2)}"`
      : "muted";
    return `<video ${common} src="${src}" data-media-start="${mediaStart}" ${audio} playsinline style="${style}"></video>`;
  }).join("\n");

  const overlayHtml = (spec.overlays || []).map((overlay, index) => {
    const start = Number(overlay.start || 0);
    const end = Number(overlay.end || start + 3);
    const d = Math.max(end - start, 0.1);
    const x = Number(overlay.x ?? 50);
    const y = Number(overlay.y ?? 50);
    const w = overlay.width ? `width:${Number(overlay.width)}px;` : "";
    const h = overlay.height ? `height:${Number(overlay.height)}px;` : "";
    const common = `id="overlay-${index}" class="clip overlay" data-start="${start}" data-duration="${d}" data-track-index="${10 + index}"`;
    if (overlay.type === "text") {
      return `<div ${common} style="left:${x}%;top:${y}%;transform:translate(-50%,-50%);">${esc(overlay.text || "")}</div>`;
    }
    return `<img ${common} src="${esc(overlay.url || "")}" style="left:${x}%;top:${y}%;transform:translate(-50%,-50%);${w}${h}" />`;
  }).join("\n");

  const narration = spec.narration?.url
    ? `<audio id="narration" src="${esc(spec.narration.url)}" data-start="${Number(spec.narration.start || 0)}" data-duration="${Math.max(Number((spec.narration.end || duration) - (spec.narration.start || 0)), 0.1)}" data-track-index="50" data-volume="${Math.min(Math.max(Number(spec.narration.volume ?? 1), 0), 2)}" data-fade-in="0.05" data-fade-out="0.12"></audio>`
    : "";

  const music = spec.musicUrl
    ? `<audio id="music" src="${esc(spec.musicUrl)}" data-start="0" data-duration="${duration}" data-track-index="51" data-volume="${Math.min(Math.max(Number(spec.musicVolume ?? 0.22), 0), 2)}" data-fade-in="0.4" data-fade-out="0.8"></audio>`
    : "";

  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8" />
<style>
html,body{margin:0;background:#000;overflow:hidden}
#root{position:relative;overflow:hidden;background:#000}
.overlay{position:absolute;z-index:20;color:white;font-family:Arial,"Noto Sans KR",sans-serif;font-size:64px;font-weight:800;line-height:1.15;text-align:center;text-shadow:0 4px 18px rgba(0,0,0,.65);max-width:82%}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${duration}" data-width="${width}" data-height="${height}" data-fps="${fps}" data-no-timeline style="width:${width}px;height:${height}px;">
${clipHtml}
${overlayHtml}
${narration}
${music}
</div>
</body></html>`;
}
