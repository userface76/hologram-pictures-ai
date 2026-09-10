import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Plan = { title:string; refinedPrompt:string; model:string; duration:number; aspectRatio:string; resolution:string; audio:boolean; style?:string; scenes:Array<{index:number;description:string}> };
type Job = { id:string; status:string; progress:number; outputUrl?:string; providerTaskId?:string; error?:string };

const API = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://hologramapi-production.up.railway.app");
const nodes = ["MINIMAX H3","PROJECTS","ASSETS","PROMPT AI","RENDER","LIBRARY","AUDIO","SCENES"];

function App(){
  const [command,setCommand]=useState("이 제품 사진으로 영화 같은 10초 세로 광고를 만들어줘.");
  const [plan,setPlan]=useState<Plan|null>(null);
  const [job,setJob]=useState<Job|null>(null);
  const [status,setStatus]=useState("명령을 기다리고 있습니다");
  const [listening,setListening]=useState(false);
  const positions=useMemo(()=>nodes.map((n,i)=>({n,a:(360/nodes.length)*i})),[]);

  async function analyze(autoRender=false){
    setStatus(autoRender?"영상 생성 작업을 준비하는 중…":"HOLOGRAM CORE가 명령을 분석하는 중…");
    try{
      const r=await fetch(`${API}/api/${autoRender?"render":"command"}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({command,autoRender})});
      const d=await r.json(); if(!r.ok) throw new Error(d.error||"요청 실패");
      setPlan(d.plan);
      if(d.job){ setJob(d.job); setStatus(`렌더 작업 생성됨 · ${d.job.status}`); }
      else setStatus(`분석 완료 · ${d.source==='astra'?'GPT-5.6 Sol':'로컬 파서'}`);
    }catch(e:any){setStatus(`연결 오류 · ${e.message}`)}
  }

  async function refreshJob(silent=false){
    if(!job) return;
    if(!silent) setStatus("렌더 상태 확인 중…");
    try{
      const r=await fetch(`${API}/api/jobs/${job.id}`);
      const d=await r.json(); if(!r.ok) throw new Error(d.error||"상태 조회 실패");
      setJob(d.job);
      setStatus(d.job.status === "completed" ? "영상 생성 완료" : d.job.status === "failed" ? `영상 생성 실패 · ${d.job.error || "unknown"}` : `렌더링 · ${d.job.status} · ${d.job.progress}%`);
    }catch(e:any){ if(!silent) setStatus(`상태 조회 오류 · ${e.message}`); }
  }

  useEffect(()=>{
    if(!job || job.status === "completed" || job.status === "failed") return;
    const timer = window.setInterval(()=>{ void refreshJob(true); }, 10000);
    return ()=>window.clearInterval(timer);
  }, [job?.id, job?.status]);

  function voice(){
    const SR=(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if(!SR){setStatus("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 계열을 사용해 주세요.");return;}
    const rec=new SR(); rec.lang="ko-KR"; rec.interimResults=false; setListening(true); setStatus("듣고 있습니다…");
    rec.onresult=(e:any)=>{const t=e.results[0][0].transcript;setCommand(t);setStatus("음성 명령을 받았습니다");};
    rec.onend=()=>setListening(false); rec.onerror=()=>{setListening(false);setStatus("음성 인식 오류")}; rec.start();
  }

  return <main className="space">
    <div className="grid"/><div className="stars"/>
    <header><div><b>HOLOGRAM</b> PICTURES AI</div><small>CONVERSATIONAL AI VIDEO OS · V0.3</small></header>
    <section className="universe">
      <div className="orbit orbit1"/><div className="orbit orbit2"/><div className="orbit orbit3"/>
      {positions.map(({n,a})=> <button key={n} className="node" style={{"--angle":`${a}deg`} as React.CSSProperties}><span>●</span>{n}</button>)}
      <div className="core"><div className="coreRing"/><div className="coreInner"><strong>HOLOGRAM</strong><span>CORE</span><small>GPT-5.6 SOL</small></div></div>
    </section>
    <section className="console">
      <div className="status"><i/> {status}</div>
      <div className="commandBar"><button className={listening?"mic active":"mic"} onClick={voice}>◉</button><textarea value={command} onChange={e=>setCommand(e.target.value)} placeholder="무엇을 만들까요? 말하거나 입력하세요."/><button onClick={()=>analyze(false)}>분석</button><button className="primary" onClick={()=>analyze(true)}>영상 만들기</button></div>
      {plan && <div className="plan"><div><label>PROJECT</label><strong>{plan.title}</strong></div><div><label>MODEL</label><strong>{plan.model}</strong></div><div><label>FORMAT</label><strong>{plan.duration}s · {plan.aspectRatio} · {plan.resolution}</strong></div><div><label>AUDIO</label><strong>{plan.audio?"ON":"OFF"}</strong></div><p>{plan.refinedPrompt}</p></div>}
      {job && <div className="plan"><div><label>RENDER</label><strong>{job.status} · {job.progress}%</strong></div><div><label>TASK</label><strong>{job.providerTaskId || job.id}</strong></div><div><button onClick={()=>refreshJob(false)}>상태 새로고침</button></div>{job.outputUrl && <p><a href={job.outputUrl} target="_blank" rel="noreferrer">생성된 영상 열기</a></p>}</div>}
    </section>
    <footer>HOLOGRAM PICTURES AI — 말하면, 영상이 된다.</footer>
  </main>
}
createRoot(document.getElementById("root")!).render(<App/>);
