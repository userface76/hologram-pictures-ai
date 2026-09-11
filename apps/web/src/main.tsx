import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./multi-image.css";
import "./result.css";

type ImageRole = "first_frame" | "reference_image" | "last_frame";
type Plan = {
  title: string;
  refinedPrompt: string;
  model: string;
  duration: number;
  aspectRatio: string;
  resolution: string;
  audio: boolean;
  style?: string;
  firstFrameImageUrl?: string;
  referenceImageUrl?: string;
  lastFrameImageUrl?: string;
  scenes: Array<{ index: number; description: string }>;
};
type Job = {
  id: string;
  status: string;
  progress: number;
  outputUrl?: string;
  providerTaskId?: string;
  error?: string;
};
type Asset = { url: string; key: string; size?: number; contentType?: string; role?: ImageRole | null };
type ImageSlot = { preview: string | null; asset: Asset | null; uploading: boolean; error: string | null };

const API = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://hologramapi-production.up.railway.app");
const nodeLabels = ["MINIMAX H3", "PROJECTS", "ASSETS", "PROMPT AI", "RENDER", "LIBRARY", "AUDIO", "SCENES"];
const dataLabels = ["VIDEO", "VOICE", "IMAGE", "PROMPT", "MODEL", "R2", "SUPABASE", "RENDER", "API", "MEMORY", "SCENE", "AUDIO"];
const imageSlots: Array<{ role: ImageRole; label: string; detail: string; short: string }> = [
  { role: "first_frame", label: "시작 프레임", detail: "영상의 첫 장면", short: "START" },
  { role: "reference_image", label: "참조 이미지", detail: "제품 · 인물 · 스타일 참고", short: "REFERENCE" },
  { role: "last_frame", label: "엔딩 프레임", detail: "영상의 마지막 장면", short: "END" },
];

function blankSlot(): ImageSlot {
  return { preview: null, asset: null, uploading: false, error: null };
}

function App() {
  const [command, setCommand] = useState("아이디어를 자유롭게 적어주세요. HOLO가 장면, 분위기, 카메라와 움직임을 영상 프롬프트로 정리합니다.");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [status, setStatus] = useState("HOLO가 아이디어를 기다리고 있습니다");
  const [listening, setListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<Record<ImageRole, ImageSlot>>({
    first_frame: blankSlot(),
    reference_image: blankSlot(),
    last_frame: blankSlot(),
  });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const firstFileRef = useRef<HTMLInputElement | null>(null);
  const referenceFileRef = useRef<HTMLInputElement | null>(null);
  const lastFileRef = useRef<HTMLInputElement | null>(null);

  const orbitNodes = useMemo(() => nodeLabels.map((label, i) => ({ label, angle: (360 / nodeLabels.length) * i })), []);
  const globePoints = useMemo(() => Array.from({ length: 84 }, (_, i) => {
    const t = (i + 0.5) / 84;
    const latitude = Math.asin(2 * t - 1) * (180 / Math.PI);
    const longitude = (i * 137.50776405) % 360;
    return { latitude, longitude, label: i % 7 === 0 ? dataLabels[(i / 7) % dataLabels.length | 0] : "" };
  }), []);

  function refFor(role: ImageRole) {
    if (role === "first_frame") return firstFileRef;
    if (role === "reference_image") return referenceFileRef;
    return lastFileRef;
  }

  const uploadingImage = imageSlots.some(({ role }) => images[role].uploading);
  const imageNotReady = imageSlots.some(({ role }) => Boolean(images[role].preview && !images[role].asset));
  const imageCount = imageSlots.filter(({ role }) => Boolean(images[role].asset?.url)).length;
  const hasFrameControl = Boolean(images.first_frame.asset?.url || images.last_frame.asset?.url);
  const hasReference = Boolean(images.reference_image.asset?.url);

  function mediaPayload() {
    return {
      firstFrameUrl: images.first_frame.asset?.url,
      referenceImageUrl: images.reference_image.asset?.url,
      lastFrameUrl: images.last_frame.asset?.url,
    };
  }

  async function analyze(autoRender = false) {
    if (uploadingImage) {
      setStatus("사진 업로드가 끝난 뒤 다시 시도해 주세요");
      return;
    }
    if (imageNotReady) {
      const firstError = imageSlots.map(({ role }) => images[role].error).find(Boolean);
      setStatus(firstError ? `사진 업로드 실패 · ${firstError}` : "사진 업로드가 아직 완료되지 않았습니다");
      return;
    }
    if (autoRender) setIsSubmitting(true);
    setStatus(autoRender ? "HOLO가 영상 생성 파이프라인을 시작하는 중…" : "HOLO가 아이디어와 이미지를 분석하는 중…");

    try {
      const r = await fetch(`${API}/api/${autoRender ? "render" : "command"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          autoRender,
          images: mediaPayload(),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "요청 실패");
      setPlan(d.plan);
      if (d.job) {
        setJob(d.job);
        setStatus(`HOLO 렌더 시작 · ${d.job.status} · ${d.job.progress}%`);
      } else {
        setStatus(`HOLO 프롬프트 설계 완료 · ${d.source === "astra" ? "GPT-5.6 Sol" : "로컬 파서"}`);
      }
    } catch (e: any) {
      setStatus(`연결 오류 · ${e.message}`);
    } finally {
      if (autoRender) setIsSubmitting(false);
    }
  }

  async function refreshJob(silent = false) {
    if (!job) return;
    if (!silent) setStatus("HOLO가 렌더 상태를 확인하는 중…");
    try {
      const r = await fetch(`${API}/api/jobs/${job.id}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "상태 조회 실패");
      setJob(d.job);
      setStatus(
        d.job.status === "completed"
          ? "HOLO 영상 생성 완료"
          : d.job.status === "failed"
            ? `영상 생성 실패 · ${d.job.error || "MiniMax가 작업을 완료하지 못했습니다"}`
            : `HOLO 렌더링 · ${d.job.status} · ${d.job.progress}%`,
      );
    } catch (e: any) {
      if (!silent) setStatus(`상태 조회 오류 · ${e.message}`);
    }
  }

  useEffect(() => {
    if (!job || job.status === "completed" || job.status === "failed") return;
    const timer = window.setInterval(() => { void refreshJob(true); }, 10000);
    return () => window.clearInterval(timer);
  }, [job?.id, job?.status]);

  function voice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setStatus("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 계열을 사용해 주세요.");
      return;
    }
    const rec = new SR();
    rec.lang = "ko-KR";
    rec.interimResults = false;
    setListening(true);
    setStatus("HOLO가 듣고 있습니다…");
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setCommand(text);
      setStatus("HOLO가 아이디어를 들었습니다. 프롬프트로 정리할 준비가 됐습니다.");
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => { setListening(false); setStatus("음성 인식 오류"); };
    rec.start();
  }

  function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("사진을 읽지 못했습니다"));
      reader.readAsDataURL(file);
    });
  }

  async function chooseImage(role: ImageRole, file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("이미지 파일만 업로드할 수 있습니다");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setStatus("사진은 30MB 이하만 업로드할 수 있습니다");
      return;
    }

    const previousPreview = images[role].preview;
    if (previousPreview) URL.revokeObjectURL(previousPreview);
    const localUrl = URL.createObjectURL(file);
    setImages((prev) => ({
      ...prev,
      [role]: { preview: localUrl, asset: null, uploading: true, error: null },
    }));
    const label = imageSlots.find((slot) => slot.role === role)?.label || "사진";
    setStatus(`HOLO가 ${label}을 Cloudflare R2에 업로드하는 중…`);

    try {
      const dataUrl = await fileToDataUrl(file);
      const r = await fetch(`${API}/api/assets/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, dataUrl, role }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "업로드 실패");
      if (!d.asset?.url) throw new Error("R2 공개 URL을 받지 못했습니다. R2_PUBLIC_BASE_URL을 확인해 주세요.");
      setImages((prev) => ({
        ...prev,
        [role]: { ...prev[role], asset: d.asset, uploading: false, error: null },
      }));
      setStatus(`${label} 준비 완료 · 다른 이미지를 추가하거나 아이디어를 입력하세요`);
    } catch (e: any) {
      const message = e?.message || "알 수 없는 업로드 오류";
      setImages((prev) => ({
        ...prev,
        [role]: { ...prev[role], asset: null, uploading: false, error: message },
      }));
      setStatus(`${label} 업로드 실패 · ${message}`);
    }
  }

  function clearImage(role: ImageRole) {
    const preview = images[role].preview;
    if (preview) URL.revokeObjectURL(preview);
    setImages((prev) => ({ ...prev, [role]: blankSlot() }));
    const ref = refFor(role);
    if (ref.current) ref.current.value = "";
    setStatus("사진이 제거되었습니다");
  }

  function selectImage(role: ImageRole) {
    const ref = refFor(role);
    if (ref.current) {
      ref.current.value = "";
      ref.current.click();
    }
  }

  function handlePointerMove(e: React.MouseEvent<HTMLElement>) {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMouse({ x, y });
  }

  const activeRendering = Boolean(job && job.status !== "completed" && job.status !== "failed");

  return (
    <main
      className="space"
      onMouseMove={handlePointerMove}
      style={{ "--mx": mouse.x, "--my": mouse.y } as React.CSSProperties}
    >
      <div className="ambient" />
      <div className="dataRain" />
      <div className="perspectiveGrid" />

      <header className="topbar">
        <div className="brand"><b>HOLOGRAM</b> PICTURES AI <span>HOLO</span></div>
        <small>FROM IDEA TO VIDEO INTELLIGENCE · CONVERSATIONAL AI VIDEO OS · V0.6</small>
      </header>

      <section className="worldStage">
        <div className="scene3d">
          <div className="dataCube cubeOuter" />
          <div className="dataCube cubeMid" />
          <div className="globeShell">
            <div className="globeSpin">
              {Array.from({ length: 10 }, (_, i) => <i key={`m-${i}`} className="meridian" style={{ transform: `rotateY(${i * 18}deg)` }} />)}
              {[-60, -35, 0, 35, 60].map((lat) => <i key={`l-${lat}`} className="latitude" style={{ transform: `translate(-50%,-50%) rotateX(70deg) translateZ(${lat * 1.15}px) scale(${Math.cos(Math.abs(lat) * Math.PI / 180)})` }} />)}
              {globePoints.map((p, i) => (
                <span
                  key={i}
                  className={`globePoint ${p.label ? "labeled" : ""}`}
                  style={{ transform: `rotateY(${p.longitude}deg) rotateX(${-p.latitude}deg) translateZ(188px)` }}
                >
                  {p.label || "•"}
                </span>
              ))}
            </div>
          </div>

          <div className="networkLayer">
            {orbitNodes.map(({ angle }, i) => <span key={i} className="connection" style={{ "--angle": `${angle}deg` } as React.CSSProperties} />)}
          </div>

          {orbitNodes.map(({ label, angle }) => (
            <button key={label} className="dataNode" style={{ "--angle": `${angle}deg` } as React.CSSProperties}>
              <span className="pulseDot" />{label}
            </button>
          ))}

          <div className="core holoCore">
            <div className="coreHalo haloA" />
            <div className="coreHalo haloB" />
            <div className="coreInner">
              <strong>HOLOGRAM</strong>
              <span>CORE</span>
              <em>HOLO</em>
              <small>GPT-5.6 SOL</small>
            </div>
          </div>
        </div>

        <div className="worldCaption">
          <strong>FROM IDEA TO VIDEO INTELLIGENCE</strong>
          <span>생각을 이해하고 · 질문하고 · 정리해 영상 생성 프롬프트로 연결합니다.</span>
        </div>
      </section>

      <section className="console">
        <div className="status"><i className={activeRendering ? "busy" : ""} /> {status}</div>

        <div className="assetAndCommand tripleStudio">
          <div className="assetDeck">
            {imageSlots.map(({ role, label, detail, short }) => {
              const slot = images[role];
              const ref = refFor(role);
              return (
                <div key={role} className={`assetDock imageSlot ${slot.preview ? "hasImage" : ""}`}>
                  <input
                    ref={ref}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    hidden
                    onChange={(e) => void chooseImage(role, e.target.files?.[0])}
                  />
                  {!slot.preview ? (
                    <button className="uploadZone" onClick={() => selectImage(role)} disabled={slot.uploading || isSubmitting}>
                      <span className="slotCode">{short}</span>
                      <span className="uploadPlus">＋</span>
                      <strong>{label}</strong>
                      <small>{detail}</small>
                    </button>
                  ) : (
                    <div className="previewCard">
                      <img src={slot.preview} alt={label} />
                      <div className="previewShade" />
                      <div className="slotCode onImage">{short}</div>
                      <div className="previewInfo">
                        <strong>{slot.uploading ? `${label} 업로드 중…` : slot.asset ? `${label} 준비 완료` : `${label} 업로드 실패`}</strong>
                        {slot.error && <small>{slot.error}</small>}
                        <div className="previewActions">
                          <button onClick={() => selectImage(role)} disabled={slot.uploading || isSubmitting}>교체</button>
                          <button onClick={() => clearImage(role)} disabled={slot.uploading || isSubmitting}>삭제</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mediaRule">
            <b>{imageCount}/3 IMAGE INPUTS</b>
            <span>
              {hasFrameControl && hasReference
                ? "시작/엔딩 프레임은 MiniMax H3 프레임 제어에 사용되고, 참조 이미지는 HOLO가 먼저 분석해 프롬프트의 제품·인물·스타일 일관성에 반영합니다."
                : hasFrameControl
                  ? "시작 또는 엔딩 프레임을 넣으면 H3가 해당 프레임을 기준으로 장면을 연결합니다."
                  : hasReference
                    ? "참조 이미지만 넣으면 MiniMax H3 Reference-to-Video 입력으로 직접 전달됩니다."
                    : "사진 없이 아이디어만으로 시작하거나, 필요한 이미지 역할만 선택해서 올릴 수 있습니다."}
            </span>
          </div>

          <div className="commandPanel">
            <div className="commandBar">
              <button className={listening ? "mic active" : "mic"} onClick={voice} disabled={isSubmitting} title="말해서 아이디어 입력">◉</button>
              <textarea value={command} onChange={(e) => setCommand(e.target.value)} placeholder="아이디어를 자유롭게 말하거나 입력하세요. HOLO가 영상 프롬프트로 정리합니다." disabled={isSubmitting} />
              <button onClick={() => void analyze(false)} disabled={isSubmitting || uploadingImage || imageNotReady}>HOLO 정리</button>
              <button className="primary" onClick={() => void analyze(true)} disabled={isSubmitting || uploadingImage || imageNotReady}>
                {uploadingImage ? "사진 업로드 중…" : imageNotReady ? "사진 확인 필요" : isSubmitting ? "준비 중…" : "영상 만들기"}
              </button>
            </div>
            <div className="quickHints">
              <span>예: “한강에서 달리다가 편의점에서 라면을 먹는 10초 세로 영상”</span>
              <span>{imageNotReady ? "모든 선택 사진의 업로드가 완료되어야 시작할 수 있습니다." : "생각은 자유롭게. 프롬프트는 HOLO가."}</span>
            </div>
          </div>
        </div>

        {plan && (
          <div className="plan">
            <div><label>PROJECT</label><strong>{plan.title}</strong></div>
            <div><label>MODEL</label><strong>{plan.model}</strong></div>
            <div><label>FORMAT</label><strong>{plan.duration}s · {plan.aspectRatio} · {plan.resolution}</strong></div>
            <div><label>AUDIO</label><strong>{plan.audio ? "ON" : "OFF"}</strong></div>
            {imageCount > 0 && (
              <div className="wide"><label>IMAGE INPUTS</label><strong>{[
                images.first_frame.asset && "START",
                images.reference_image.asset && "REFERENCE",
                images.last_frame.asset && "END",
              ].filter(Boolean).join(" · ")}</strong></div>
            )}
            <p>{plan.refinedPrompt}</p>
          </div>
        )}

        {job && (
          <div className={`renderCard ${job.status}`}>
            <div className="renderHead">
              <div><label>HOLO RENDER</label><strong>{job.status.toUpperCase()}</strong></div>
              <b>{job.progress || 0}%</b>
            </div>
            <div className="progressTrack"><span style={{ width: `${Math.max(3, job.progress || 0)}%` }} /></div>
            <div className="renderMeta">
              <span>{job.providerTaskId || job.id}</span>
              <button onClick={() => void refreshJob(false)}>상태 새로고침</button>
              {job.outputUrl && <a href={job.outputUrl} target="_blank" rel="noreferrer">원본 영상 열기</a>}
            </div>

            {job.status === "failed" && (
              <div className="renderFailure">
                <strong>영상 생성에 실패했습니다</strong>
                <p>{job.error || "MiniMax가 이 작업을 완료하지 못했습니다. 같은 이미지와 프롬프트로 다시 시도하거나 오류 로그를 확인해 주세요."}</p>
                <button onClick={() => void analyze(true)} disabled={isSubmitting || imageNotReady}>같은 설정으로 다시 만들기</button>
              </div>
            )}

            {job.status === "completed" && job.outputUrl && (
              <div className="resultStage">
                <div className="resultStageHead">
                  <div><small>HOLO RESULT</small><strong>생성된 영상을 확인하세요</strong></div>
                  <a href={job.outputUrl} target="_blank" rel="noreferrer">새 창에서 열기</a>
                </div>
                <video className="resultVideo" src={job.outputUrl} controls playsInline preload="metadata" />
              </div>
            )}
          </div>
        )}
      </section>

      {isSubmitting && (
        <div className="loadingOverlay">
          <div className="loadingCard">
            <div className="holoLoader"><span /><span /><span /></div>
            <strong>HOLO가 생각을 영상 언어로 정리하고 있습니다</strong>
            <p>{imageCount ? "이미지 역할과 아이디어를 분석해 MiniMax H3 렌더 파이프라인에 연결하는 중…" : "아이디어를 영상 생성 프롬프트로 설계하고 렌더 작업을 준비하는 중…"}</p>
            <div className="loadingSteps"><i className="on">IDEA</i><i className="on">HOLO CORE</i><i>PROMPT</i><i>MINIMAX H3</i></div>
          </div>
        </div>
      )}

      <footer>HOLOGRAM PICTURES AI — 생각은 자유롭게. 프롬프트는 HOLO가. · FROM IDEA TO VIDEO INTELLIGENCE</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
