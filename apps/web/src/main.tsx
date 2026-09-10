import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type ImageRole = "first_frame" | "last_frame" | "reference_image";
type Plan = {
  title: string;
  refinedPrompt: string;
  model: string;
  duration: number;
  aspectRatio: string;
  resolution: string;
  audio: boolean;
  style?: string;
  sourceImageUrl?: string;
  sourceImageRole?: ImageRole;
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
type Asset = { url: string; key: string; size?: number; contentType?: string };

const API = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://hologramapi-production.up.railway.app");
const nodeLabels = ["MINIMAX H3", "PROJECTS", "ASSETS", "PROMPT AI", "RENDER", "LIBRARY", "AUDIO", "SCENES"];
const dataLabels = ["VIDEO", "VOICE", "IMAGE", "PROMPT", "MODEL", "R2", "SUPABASE", "RENDER", "API", "MEMORY", "SCENE", "AUDIO"];

function App() {
  const [command, setCommand] = useState("이 제품 사진을 시작 장면으로 사용해서 영화 같은 10초 세로 광고를 만들어줘.");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [status, setStatus] = useState("HOLO가 명령을 기다리고 있습니다");
  const [listening, setListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageRole, setImageRole] = useState<ImageRole>("first_frame");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const fileRef = useRef<HTMLInputElement | null>(null);

  const orbitNodes = useMemo(() => nodeLabels.map((label, i) => ({ label, angle: (360 / nodeLabels.length) * i })), []);
  const globePoints = useMemo(() => Array.from({ length: 84 }, (_, i) => {
    const t = (i + 0.5) / 84;
    const latitude = Math.asin(2 * t - 1) * (180 / Math.PI);
    const longitude = (i * 137.50776405) % 360;
    return { latitude, longitude, label: i % 7 === 0 ? dataLabels[(i / 7) % dataLabels.length | 0] : "" };
  }), []);

  async function analyze(autoRender = false) {
    if (uploadingImage) {
      setStatus("사진 업로드가 끝난 뒤 다시 시도해 주세요");
      return;
    }
    if (autoRender) setIsSubmitting(true);
    setStatus(autoRender ? "HOLO가 영상 생성 파이프라인을 시작하는 중…" : "HOLO가 명령을 분석하는 중…");

    try {
      const r = await fetch(`${API}/api/${autoRender ? "render" : "command"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          autoRender,
          imageUrl: asset?.url,
          imageRole,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "요청 실패");
      setPlan(d.plan);
      if (d.job) {
        setJob(d.job);
        setStatus(`HOLO 렌더 시작 · ${d.job.status} · ${d.job.progress}%`);
      } else {
        setStatus(`HOLO 분석 완료 · ${d.source === "astra" ? "GPT-5.6 Sol" : "로컬 파서"}`);
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
            ? `영상 생성 실패 · ${d.job.error || "unknown"}`
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
      setStatus("HOLO가 음성 명령을 받았습니다");
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

  async function chooseImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("이미지 파일만 업로드할 수 있습니다");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setStatus("사진은 30MB 이하만 업로드할 수 있습니다");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setAsset(null);
    setUploadingImage(true);
    setStatus("HOLO가 사진을 Cloudflare R2에 업로드하는 중…");

    try {
      const dataUrl = await fileToDataUrl(file);
      const r = await fetch(`${API}/api/assets/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, dataUrl }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "업로드 실패");
      setAsset(d.asset);
      setStatus("사진 준비 완료 · HOLO에게 움직임을 말해 주세요");
    } catch (e: any) {
      setStatus(`사진 업로드 오류 · ${e.message}`);
    } finally {
      setUploadingImage(false);
    }
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setAsset(null);
    if (fileRef.current) fileRef.current.value = "";
    setStatus("사진이 제거되었습니다");
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
        <small>CONVERSATIONAL AI VIDEO OS · CONNECTED DATA WORLD · V0.4</small>
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
          <strong>CONNECTED INTELLIGENCE</strong>
          <span>데이터 · 모델 · 이미지 · 음성 · 렌더가 하나의 초연결 영상 시스템으로 움직입니다.</span>
        </div>
      </section>

      <section className="console">
        <div className="status"><i className={activeRendering ? "busy" : ""} /> {status}</div>

        <div className="assetAndCommand">
          <div className={`assetDock ${imagePreview ? "hasImage" : ""}`}>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden onChange={(e) => void chooseImage(e.target.files?.[0])} />
            {!imagePreview ? (
              <button className="uploadZone" onClick={() => fileRef.current?.click()} disabled={uploadingImage || isSubmitting}>
                <span className="uploadPlus">＋</span>
                <strong>사진 업로드</strong>
                <small>JPG · PNG · WEBP · 최대 30MB</small>
              </button>
            ) : (
              <div className="previewCard">
                <img src={imagePreview} alt="업로드한 참조 이미지" />
                <div className="previewShade" />
                <div className="previewInfo">
                  <strong>{uploadingImage ? "업로드 중…" : asset ? "사진 준비 완료" : "업로드 오류"}</strong>
                  <select value={imageRole} onChange={(e) => setImageRole(e.target.value as ImageRole)} disabled={uploadingImage || isSubmitting}>
                    <option value="first_frame">첫 프레임</option>
                    <option value="reference_image">참조 이미지</option>
                    <option value="last_frame">마지막 프레임</option>
                  </select>
                  <div className="previewActions">
                    <button onClick={() => fileRef.current?.click()} disabled={uploadingImage || isSubmitting}>교체</button>
                    <button onClick={clearImage} disabled={uploadingImage || isSubmitting}>삭제</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="commandPanel">
            <div className="commandBar">
              <button className={listening ? "mic active" : "mic"} onClick={voice} disabled={isSubmitting}>◉</button>
              <textarea value={command} onChange={(e) => setCommand(e.target.value)} placeholder="HOLO에게 만들 영상을 말하거나 입력하세요." disabled={isSubmitting} />
              <button onClick={() => void analyze(false)} disabled={isSubmitting || uploadingImage}>분석</button>
              <button className="primary" onClick={() => void analyze(true)} disabled={isSubmitting || uploadingImage}>
                {isSubmitting ? "준비 중…" : "영상 만들기"}
              </button>
            </div>
            <div className="quickHints">
              <span>예: “이 사진을 시작 장면으로 6초 광고 영상 만들어줘”</span>
              <span>HOLO가 프롬프트 · 모델 · 비율 · 렌더를 자동 연결합니다.</span>
            </div>
          </div>
        </div>

        {plan && (
          <div className="plan">
            <div><label>PROJECT</label><strong>{plan.title}</strong></div>
            <div><label>MODEL</label><strong>{plan.model}</strong></div>
            <div><label>FORMAT</label><strong>{plan.duration}s · {plan.aspectRatio} · {plan.resolution}</strong></div>
            <div><label>AUDIO</label><strong>{plan.audio ? "ON" : "OFF"}</strong></div>
            {asset?.url && <div className="wide"><label>IMAGE INPUT</label><strong>{imageRole.replace("_", " ")}</strong></div>}
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
              {job.outputUrl && <a href={job.outputUrl} target="_blank" rel="noreferrer">생성된 영상 열기</a>}
            </div>
          </div>
        )}
      </section>

      {isSubmitting && (
        <div className="loadingOverlay">
          <div className="loadingCard">
            <div className="holoLoader"><span /><span /><span /></div>
            <strong>HOLO가 영상을 준비하고 있습니다</strong>
            <p>{asset ? "사진과 프롬프트를 MiniMax H3 렌더 파이프라인에 연결하는 중…" : "프롬프트를 분석하고 영상 렌더 작업을 생성하는 중…"}</p>
            <div className="loadingSteps"><i className="on">COMMAND</i><i className="on">HOLO CORE</i><i>MINIMAX H3</i><i>RENDER</i></div>
          </div>
        </div>
      )}

      <footer>HOLOGRAM PICTURES AI — 말하면, 영상이 된다. · AI ASSISTANT: HOLO</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
