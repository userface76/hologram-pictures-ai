import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./studio.css";

const API = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://hologramapi-production.up.railway.app");

type Project = {
  id: string;
  title?: string;
  user_request?: string;
  created_at?: string;
  status?: string;
  selected_model?: string;
  first_frame_url?: string | null;
  reference_image_url?: string | null;
  last_frame_url?: string | null;
  metadata?: Record<string, any> | null;
};

type Video = {
  id?: string;
  project_id?: string | null;
  prompt?: string | null;
  duration?: number | null;
  aspect_ratio?: string | null;
  resolution?: string | null;
  source_url?: string | null;
  storage_url?: string | null;
  created_at?: string;
};

type Asset = {
  id?: string;
  public_url?: string | null;
  original_name?: string | null;
  role?: "first_frame" | "reference_image" | "last_frame" | null;
  content_type?: string | null;
  size_bytes?: number | null;
  created_at?: string;
};

type Job = {
  id: string;
  project_id?: string | null;
  status?: string;
  progress?: number | null;
  prompt?: string | null;
  model?: string | null;
  error?: string | null;
  source_url?: string | null;
  storage_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

type Tab = "projects" | "videos" | "assets" | "history";

function go(hash: string) {
  window.location.hash = hash;
  window.location.reload();
}

function formatDate(value?: string) {
  if (!value) return "날짜 없음";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function roleLabel(role?: Asset["role"]) {
  if (role === "first_frame") return "시작 프레임";
  if (role === "reference_image") return "참조 이미지";
  if (role === "last_frame") return "엔딩 프레임";
  return "업로드 이미지";
}

function playableUrl(video?: Video | Job | null) {
  const storage = video?.storage_url || "";
  if (storage.startsWith("http://") || storage.startsWith("https://")) return storage;
  return video?.source_url || "";
}

async function readJson(path: string) {
  const response = await fetch(`${API}${path}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || `${path} 조회 실패`);
  return data;
}

function App() {
  const [tab, setTab] = useState<Tab>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    void Promise.all([
      readJson("/api/projects"),
      readJson("/api/videos"),
      readJson("/api/assets"),
      readJson("/api/jobs"),
    ]).then(([p, v, a, j]) => {
      if (!alive) return;
      setProjects(p.projects || []);
      setVideos(v.videos || []);
      setAssets(a.assets || []);
      setJobs(j.jobs || []);
    }).catch((e: any) => {
      if (alive) setError(e?.message || "내 작업실을 불러오지 못했습니다.");
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const jobByProject = useMemo(() => {
    const map = new Map<string, Job>();
    for (const job of jobs) {
      if (!job.project_id || map.has(job.project_id)) continue;
      map.set(job.project_id, job);
    }
    return map;
  }, [jobs]);

  async function copyText(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(message);
      window.setTimeout(() => setNotice(""), 1800);
    } catch {
      setNotice("클립보드 복사에 실패했습니다.");
    }
  }

  function continueIdea(project: Project) {
    const text = project.user_request || project.title || "";
    if (text) sessionStorage.setItem("holo_resume_command", text);
    go("#app");
  }

  function projectImages(project: Project) {
    const meta = project.metadata || {};
    return [
      project.first_frame_url || meta.first_frame_url,
      project.reference_image_url || meta.reference_image_url,
      project.last_frame_url || meta.last_frame_url,
    ].filter(Boolean) as string[];
  }

  return (
    <main className="studioPage">
      <div className="studioGrid" />
      <header className="studioHeader">
        <div className="studioBrand"><b>HOLOGRAM</b> PICTURES AI <span>MY STUDIO</span></div>
        <nav>
          <button onClick={() => go("")}>메인</button>
          <button onClick={() => go("#app")}>HOLO 만들기</button>
          <button onClick={() => go("#pricing")}>요금제</button>
        </nav>
      </header>

      <section className="studioHero">
        <div>
          <small>PERSONAL CREATIVE WORKSPACE</small>
          <h1>MY STUDIO <span>· 내 작업실</span></h1>
          <p>내가 만든 프로젝트, 완성 영상, 업로드 이미지와 렌더 기록을 한곳에서 다시 확인하세요.</p>
        </div>
        <button className="newWork" onClick={() => go("#app")}>＋ 새 영상 만들기</button>
      </section>

      <section className="studioSummary">
        <article><strong>{projects.length}</strong><span>프로젝트</span></article>
        <article><strong>{videos.length}</strong><span>완성 영상</span></article>
        <article><strong>{assets.length}</strong><span>업로드 이미지</span></article>
        <article><strong>{jobs.length}</strong><span>작업 기록</span></article>
      </section>

      <section className="studioTabs">
        <button className={tab === "projects" ? "active" : ""} onClick={() => setTab("projects")}>프로젝트</button>
        <button className={tab === "videos" ? "active" : ""} onClick={() => setTab("videos")}>완성 영상</button>
        <button className={tab === "assets" ? "active" : ""} onClick={() => setTab("assets")}>업로드 이미지</button>
        <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>작업 기록</button>
      </section>

      {notice && <div className="studioNotice">{notice}</div>}
      {error && <div className="studioError">{error}</div>}
      {loading && <div className="studioLoading">HOLO가 내 작업 기록을 불러오는 중…</div>}

      {!loading && tab === "projects" && (
        <section className="projectGrid">
          {projects.length === 0 && <div className="emptyState">아직 저장된 프로젝트가 없습니다. 첫 영상을 만들어 보세요.</div>}
          {projects.map((project) => {
            const images = projectImages(project);
            const latestJob = jobByProject.get(project.id);
            const meta = project.metadata || {};
            return (
              <article className="projectCard" key={project.id}>
                <div className="projectMedia">
                  {images.length ? images.slice(0, 3).map((src, i) => <img src={src} alt="프로젝트 이미지" key={`${src}-${i}`} />) : <div className="noMedia">HOLO PROJECT</div>}
                </div>
                <div className="projectBody">
                  <div className="cardTopline"><span>{formatDate(project.created_at)}</span><b>{meta.aspect_ratio || "AUTO"} · {meta.duration ? `${meta.duration}s` : ""}</b></div>
                  <h2>{project.title || "제목 없는 프로젝트"}</h2>
                  <p className="ideaText">{project.user_request || "원본 아이디어가 저장되어 있지 않습니다."}</p>
                  {latestJob?.prompt && <div className="promptBox"><small>HOLO PROMPT</small><p>{latestJob.prompt}</p></div>}
                  <div className="projectActions">
                    <button className="primary" onClick={() => continueIdea(project)}>HOLO로 이어서</button>
                    {project.user_request && <button onClick={() => void copyText(project.user_request || "", "아이디어를 복사했습니다.")}>아이디어 복사</button>}
                    {latestJob?.prompt && <button onClick={() => void copyText(latestJob.prompt || "", "HOLO 프롬프트를 복사했습니다.")}>프롬프트 복사</button>}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {!loading && tab === "videos" && (
        <section className="videoGrid">
          {videos.length === 0 && <div className="emptyState">아직 완성된 영상이 없습니다.</div>}
          {videos.map((video, index) => {
            const url = playableUrl(video);
            return (
              <article className="videoCard" key={video.id || index}>
                {url ? <video src={url} controls playsInline preload="metadata" /> : <div className="noVideo">VIDEO</div>}
                <div className="videoBody">
                  <span>{formatDate(video.created_at)}</span>
                  <strong>{video.aspect_ratio || "AUTO"} · {video.duration ? `${video.duration}s` : "길이 정보 없음"} · {video.resolution || ""}</strong>
                  {video.prompt && <p>{video.prompt}</p>}
                  {url && <a href={url} target="_blank" rel="noreferrer">원본 영상 열기</a>}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {!loading && tab === "assets" && (
        <section className="assetGrid">
          {assets.length === 0 && <div className="emptyState">아직 업로드한 이미지가 없습니다.</div>}
          {assets.map((asset, index) => (
            <article className="assetCard" key={asset.id || index}>
              {asset.public_url ? <img src={asset.public_url} alt={asset.original_name || "업로드 이미지"} /> : <div className="noMedia">IMAGE</div>}
              <div>
                <b>{roleLabel(asset.role)}</b>
                <span>{asset.original_name || "파일명 없음"}</span>
                <small>{formatDate(asset.created_at)}</small>
              </div>
            </article>
          ))}
        </section>
      )}

      {!loading && tab === "history" && (
        <section className="historyList">
          {jobs.length === 0 && <div className="emptyState">아직 렌더 작업 기록이 없습니다.</div>}
          {jobs.map((job) => {
            const url = playableUrl(job);
            return (
              <article className={`historyRow ${job.status || "unknown"}`} key={job.id}>
                <div className="historyStatus"><i /><strong>{(job.status || "unknown").toUpperCase()}</strong><span>{job.progress ?? 0}%</span></div>
                <div className="historyPrompt"><b>{job.model || "MiniMax H3"}</b><p>{job.prompt || "프롬프트 없음"}</p>{job.error && <em>{job.error}</em>}</div>
                <div className="historyMeta"><span>{formatDate(job.updated_at || job.created_at)}</span>{url && <a href={url} target="_blank" rel="noreferrer">결과 보기</a>}</div>
              </article>
            );
          })}
        </section>
      )}

      <footer className="studioFooter">HOLOGRAM PICTURES AI · MY STUDIO · PERSONAL CREATIVE WORKSPACE</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
