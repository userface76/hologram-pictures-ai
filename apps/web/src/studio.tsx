import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./studio.css";

const API = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://hologramapi-production.up.railway.app");

const CATEGORIES = ["전체", "광고·브랜드", "시네마틱", "숏폼", "제품·푸드", "인물·캐릭터", "애니·판타지", "패션·뷰티", "아트·실험"] as const;
type Category = typeof CATEGORIES[number];

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

type Tab = "projects" | "videos" | "assets";
type CreditState = "checking" | "restored" | "not_charged" | "unknown";

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

function classify(text?: string | null): Exclude<Category, "전체"> {
  const value = String(text || "").toLowerCase();
  const has = (...words: string[]) => words.some((word) => value.includes(word));
  if (has("쇼츠", "릴스", "틱톡", "shortform", "short form", "9:16")) return "숏폼";
  if (has("버거", "음식", "푸드", "커피", "라면", "피자", "food", "burger", "drink", "요리")) return "제품·푸드";
  if (has("패션", "뷰티", "화장품", "메이크업", "의상", "fashion", "beauty")) return "패션·뷰티";
  if (has("애니", "판타지", "마법", "드래곤", "용 ", "anime", "fantasy", "wizard", "mage")) return "애니·판타지";
  if (has("인물", "캐릭터", "얼굴", "초상", "portrait", "character", "person")) return "인물·캐릭터";
  if (has("아트", "실험", "초현실", "추상", "surreal", "abstract", "experimental")) return "아트·실험";
  if (has("광고", "브랜드", "제품", "캠페인", "commercial", "brand", "promotion", "promo")) return "광고·브랜드";
  return "시네마틱";
}

async function readJson(path: string) {
  const response = await fetch(`${API}${path}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || `${path} 조회 실패`);
  return data;
}

async function deleteJson(path: string) {
  const response = await fetch(`${API}${path}`, { method: "DELETE" });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "삭제 실패");
  return data;
}

function App() {
  const [tab, setTab] = useState<Tab>("projects");
  const [category, setCategory] = useState<Category>("전체");
  const [projects, setProjects] = useState<Project[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [creditStates, setCreditStates] = useState<Record<string, CreditState>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    void Promise.all([
      readJson("/api/projects"),
      readJson("/api/videos"),
      readJson("/api/assets"),
      readJson("/api/jobs"),
    ]).then(async ([p, v, a, j]) => {
      if (!alive) return;
      const loadedJobs: Job[] = j.jobs || [];
      setProjects(p.projects || []);
      setVideos(v.videos || []);
      setAssets(a.assets || []);
      setJobs(loadedJobs);

      const failed = loadedJobs.filter((job) => job.status === "failed").slice(0, 5);
      if (failed.length) {
        setCreditStates(Object.fromEntries(failed.map((job) => [job.id, "checking"])));
        await Promise.all(failed.map(async (job) => {
          try {
            const detail = await readJson(`/api/jobs/${job.id}`);
            if (!alive) return;
            setCreditStates((prev) => ({ ...prev, [job.id]: detail.credit ? "restored" : "not_charged" }));
          } catch {
            if (alive) setCreditStates((prev) => ({ ...prev, [job.id]: "unknown" }));
          }
        }));
      }
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

  const recentJobs = useMemo(() => jobs.slice(0, 4), [jobs]);

  const filteredProjects = useMemo(() => projects.filter((project) => {
    if (category === "전체") return true;
    return classify(`${project.title || ""} ${project.user_request || ""}`) === category;
  }), [projects, category]);

  const filteredVideos = useMemo(() => videos.filter((video) => {
    if (category === "전체") return true;
    return classify(video.prompt) === category;
  }), [videos, category]);

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

  async function removeProject(project: Project) {
    if (!window.confirm(`“${project.title || "제목 없는 프로젝트"}” 프로젝트를 삭제할까요?\n완성 영상은 별도로 유지됩니다.`)) return;
    setBusyId(project.id);
    try {
      await deleteJson(`/api/studio/projects/${project.id}`);
      setProjects((prev) => prev.filter((item) => item.id !== project.id));
      setNotice("프로젝트를 삭제했습니다.");
    } catch (e: any) { setError(e?.message || "프로젝트 삭제 실패"); }
    finally { setBusyId(""); }
  }

  async function removeVideo(video: Video) {
    if (!video.id) return;
    if (!window.confirm("이 완성 영상을 삭제할까요?\nMY STUDIO 기록과 연결된 R2 파일도 함께 삭제를 시도합니다.")) return;
    setBusyId(video.id);
    try {
      const result = await deleteJson(`/api/studio/videos/${video.id}`);
      setVideos((prev) => prev.filter((item) => item.id !== video.id));
      setNotice(result.storageCleanup?.removed ? "영상과 저장 파일을 삭제했습니다." : "영상 기록을 삭제했습니다. 저장 파일 정리는 별도로 확인해 주세요.");
    } catch (e: any) { setError(e?.message || "영상 삭제 실패"); }
    finally { setBusyId(""); }
  }

  async function removeAsset(asset: Asset) {
    if (!asset.id) return;
    if (!window.confirm(`“${asset.original_name || "업로드 이미지"}”를 삭제할까요?\n연결된 R2 파일도 함께 삭제를 시도합니다.`)) return;
    setBusyId(asset.id);
    try {
      const result = await deleteJson(`/api/studio/assets/${asset.id}`);
      setAssets((prev) => prev.filter((item) => item.id !== asset.id));
      setNotice(result.storageCleanup?.removed ? "이미지와 저장 파일을 삭제했습니다." : "이미지 기록을 삭제했습니다. 저장 파일 정리는 별도로 확인해 주세요.");
    } catch (e: any) { setError(e?.message || "이미지 삭제 실패"); }
    finally { setBusyId(""); }
  }

  function jobMessage(job: Job) {
    if (job.status === "completed") return "영상 생성 완료";
    if (job.status === "failed") {
      const credit = creditStates[job.id];
      if (credit === "checking") return "생성 실패 · 크레딧 확인 중";
      if (credit === "restored") return "생성 실패 · 크레딧 자동 복구 완료";
      if (credit === "not_charged") return "생성 실패 · 크레딧 차감 없음";
      return "생성 실패 · 크레딧 상태 확인 필요";
    }
    return `영상 생성 중 · ${job.progress ?? 0}%`;
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
          <p>프로젝트, 완성 영상, 업로드 이미지만 간단하게 관리하세요. 작업 로그는 화면에서 숨기고 필요한 상태만 알려드립니다.</p>
        </div>
        <button className="newWork" onClick={() => go("#app")}>＋ 새 영상 만들기</button>
      </section>

      <section className="studioSummary three">
        <article><strong>{projects.length}</strong><span>프로젝트</span></article>
        <article><strong>{videos.length}</strong><span>완성 영상</span></article>
        <article><strong>{assets.length}</strong><span>업로드 이미지</span></article>
      </section>

      {recentJobs.length > 0 && (
        <section className="studioActivity">
          <div className="activityHead"><b>최근 상태</b><span>작업 기록 대신 필요한 상태만 표시합니다.</span></div>
          <div className="activityList">
            {recentJobs.map((job) => <div className={`activityItem ${job.status || "processing"}`} key={job.id}><i /><span>{jobMessage(job)}</span><small>{formatDate(job.updated_at || job.created_at)}</small></div>)}
          </div>
        </section>
      )}

      <section className="studioTabs">
        <button className={tab === "projects" ? "active" : ""} onClick={() => setTab("projects")}>프로젝트</button>
        <button className={tab === "videos" ? "active" : ""} onClick={() => setTab("videos")}>완성 영상</button>
        <button className={tab === "assets" ? "active" : ""} onClick={() => setTab("assets")}>업로드 이미지</button>
      </section>

      {(tab === "projects" || tab === "videos") && (
        <section className="categoryBar">
          {CATEGORIES.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
        </section>
      )}

      {tab === "videos" && <div className="privacyNote">공유는 현재 <b>링크 보유자 방식</b>입니다. R2 공개 URL 구조에서는 진짜 비공개를 보장할 수 없어, 비공개 토글은 저장소를 Private + Signed URL 방식으로 전환한 뒤 제공하는 것이 안전합니다.</div>}
      {notice && <div className="studioNotice">{notice}</div>}
      {error && <div className="studioError">{error}</div>}
      {loading && <div className="studioLoading">HOLO가 내 작업실을 불러오는 중…</div>}

      {!loading && tab === "projects" && (
        <section className="projectGrid">
          {filteredProjects.length === 0 && <div className="emptyState">이 카테고리에 저장된 프로젝트가 없습니다.</div>}
          {filteredProjects.map((project) => {
            const images = projectImages(project);
            const latestJob = jobByProject.get(project.id);
            const meta = project.metadata || {};
            const autoCategory = classify(`${project.title || ""} ${project.user_request || ""}`);
            return (
              <article className="projectCard" key={project.id}>
                <div className="projectMedia">
                  {images.length ? images.slice(0, 3).map((src, i) => <img src={src} alt="프로젝트 이미지" key={`${src}-${i}`} />) : <div className="noMedia">HOLO PROJECT</div>}
                </div>
                <div className="projectBody">
                  <div className="cardTopline"><span>{formatDate(project.created_at)}</span><b>{meta.aspect_ratio || "AUTO"} · {meta.duration ? `${meta.duration}s` : ""}</b></div>
                  <div className="categoryBadge">HOLO 자동분류 · {autoCategory}</div>
                  <h2>{project.title || "제목 없는 프로젝트"}</h2>
                  <p className="ideaText">{project.user_request || "원본 아이디어가 저장되어 있지 않습니다."}</p>
                  {latestJob?.prompt && <div className="promptBox"><small>HOLO PROMPT</small><p>{latestJob.prompt}</p></div>}
                  <div className="projectActions">
                    <button className="primary" onClick={() => continueIdea(project)}>HOLO로 이어서</button>
                    {project.user_request && <button onClick={() => void copyText(project.user_request || "", "아이디어를 복사했습니다.")}>아이디어 복사</button>}
                    <button className="danger" onClick={() => void removeProject(project)} disabled={busyId === project.id}>{busyId === project.id ? "삭제 중…" : "삭제"}</button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {!loading && tab === "videos" && (
        <section className="videoGrid">
          {filteredVideos.length === 0 && <div className="emptyState">이 카테고리에 완성된 영상이 없습니다.</div>}
          {filteredVideos.map((video, index) => {
            const url = playableUrl(video);
            const autoCategory = classify(video.prompt);
            return (
              <article className="videoCard" key={video.id || index}>
                {url ? <video src={url} controls playsInline preload="metadata" /> : <div className="noVideo">VIDEO</div>}
                <div className="videoBody">
                  <span>{formatDate(video.created_at)}</span>
                  <div className="categoryBadge">HOLO 자동분류 · {autoCategory}</div>
                  <strong>{video.aspect_ratio || "AUTO"} · {video.duration ? `${video.duration}s` : "길이 정보 없음"} · {video.resolution || ""}</strong>
                  {video.prompt && <p>{video.prompt}</p>}
                  <div className="videoActions">
                    {url && <button onClick={() => void copyText(url, "공유 링크를 복사했습니다.")}>공유 링크 복사</button>}
                    {url && <a href={url} target="_blank" rel="noreferrer">원본 열기</a>}
                    {video.id && <button className="danger" onClick={() => void removeVideo(video)} disabled={busyId === video.id}>{busyId === video.id ? "삭제 중…" : "삭제"}</button>}
                  </div>
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
                {asset.id && <button className="assetDelete" onClick={() => void removeAsset(asset)} disabled={busyId === asset.id}>{busyId === asset.id ? "삭제 중…" : "삭제"}</button>}
              </div>
            </article>
          ))}
        </section>
      )}

      <footer className="studioFooter">HOLOGRAM PICTURES AI · MY STUDIO · PERSONAL CREATIVE WORKSPACE</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
