import "./mobile-upload-fix.css";

const ACCEPT = "image/*,.jpg,.jpeg,.png,.webp,.heic,.heif";
const INPUT_CLASS = "mobileNativeImageInput";

function inferMime(file: File) {
  const raw = (file.type || "").toLowerCase();
  if (raw === "image/jpeg" || raw === "image/jpg" || raw === "image/pjpeg") return "image/jpeg";
  if (raw === "image/png" || raw === "image/x-png") return "image/png";
  if (raw === "image/webp") return "image/webp";
  if (raw === "image/heic" || raw === "image/heic-sequence") return "image/heic";
  if (raw === "image/heif" || raw === "image/heif-sequence") return "image/heif";

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic") return "image/heic";
  if (ext === "heif") return "image/heif";
  return null;
}

function prepareInput(input: HTMLInputElement) {
  if (!input.closest(".imageSlot")) return;
  input.classList.add(INPUT_CLASS);
  input.removeAttribute("hidden");
  input.accept = ACCEPT;
}

function prepareAll() {
  document.querySelectorAll<HTMLInputElement>(".imageSlot input[type=file]").forEach(prepareInput);
}

function normalizeSelectedFile(event: Event) {
  const input = event.target instanceof HTMLInputElement ? event.target : null;
  if (!input || !input.matches(".imageSlot input[type=file]")) return;
  const file = input.files?.[0];
  if (!file) return;
  const mime = inferMime(file);
  if (!mime || file.type === mime) return;

  try {
    const normalized = new File([file], file.name, {
      type: mime,
      lastModified: file.lastModified,
    });
    const transfer = new DataTransfer();
    transfer.items.add(normalized);
    input.files = transfer.files;
  } catch (error) {
    console.warn("HOLO mobile image MIME normalization skipped:", error);
  }
}

function openNativePicker(input: HTMLInputElement) {
  input.value = "";
  const picker = (input as HTMLInputElement & { showPicker?: () => void }).showPicker;
  try {
    if (typeof picker === "function") picker.call(input);
    else input.click();
  } catch {
    input.click();
  }
}

function handleReplaceClick(event: MouseEvent) {
  const target = event.target instanceof Element ? event.target : null;
  const button = target?.closest<HTMLButtonElement>(".previewActions button:first-child");
  if (!button || button.disabled) return;
  const slot = button.closest(".imageSlot");
  const input = slot?.querySelector<HTMLInputElement>("input[type=file]");
  if (!input) return;

  // Use the browser's native picker inside the original user gesture.
  // This is more reliable than a delayed/programmatic click on mobile Safari/Android browsers.
  event.preventDefault();
  event.stopPropagation();
  openNativePicker(input);
}

function start() {
  prepareAll();
  document.addEventListener("change", normalizeSelectedFile, true);
  document.addEventListener("click", handleReplaceClick, true);

  const observer = new MutationObserver(() => prepareAll());
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
