import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./pricing.css";

type Account = {
  profile?: { email?: string | null; display_name?: string | null; role?: string; status?: string } | null;
  wallet?: { balance_usd?: number | string | null } | null;
};

const API = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://hologramapi-production.up.railway.app");

const plans = [
  { id: "free", name: "FREE", kicker: "HOLO 체험", price: "0원", credits: "5초 체험 크레딧", videos: "5초 영상 1회", features: ["MiniMax H3 체험", "이미지 → 영상", "HOLO 프롬프트 분석", "개인 보관함"] },
  { id: "starter", name: "STARTER", kicker: "개인 · 입문용", price: "29,000원", credits: "150초 / 월", videos: "10초 기준 최대 15편", features: ["MiniMax H3", "이미지 · 텍스트 → 영상", "HOLO 프롬프트", "개인 프로젝트 · 영상 보관함", "상업적 사용"] },
  { id: "creator50", name: "CREATOR 50", kicker: "가장 인기", price: "79,000원", originalPrice: "99,000원", credits: "500초 / 월", videos: "10초 기준 최대 50편", featured: true, features: ["MiniMax H3", "이미지 · 텍스트 → 영상", "HOLO 프롬프트", "회원 전용 보관함", "상업적 사용", "우선 렌더링", "런칭 특별가"] },
  { id: "pro", name: "PRO", kicker: "크리에이터 · 마케팅", price: "169,000원", credits: "900초 / 월", videos: "10초 기준 최대 90편", features: ["MiniMax H3", "고용량 영상 생성", "HOLO 프롬프트", "프로젝트 · 영상 보관함", "상업적 사용", "우선 렌더링", "2K 생성 지원"] },
];

function goMain() {
  history.replaceState(null, "", window.location.pathname + window.location.search);
  window.location.reload();
}

function PricingPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [accountChecked, setAccountChecked] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${API}/api/account`)
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("account unavailable")))
      .then((d) => { if (active) setAccount(d.account || null); })
      .catch(() => { if (active) setAccount(null); })
      .finally(() => { if (active) setAccountChecked(true); });
    return () => { active = false; };
  }, []);

  const role = account?.profile?.role || "user";
  const isAdmin = role === "admin";
  const loggedIn = Boolean(account?.profile?.email);
  const wallet = useMemo(() => {
    const value = Number(account?.wallet?.balance_usd ?? 0);
    return Number.isFinite(value) ? value : 0;
  }, [account]);

  function choosePlan(planName: string) {
    if (!accountChecked) {
      setNotice("회원 정보를 확인하고 있습니다. 잠시만 기다려 주세요.");
      return;
    }
    if (!loggedIn) {
      window.location.hash = "#signup";
      window.location.reload();
      return;
    }
    if (isAdmin) {
      setNotice("OWNER / ADMIN 계정은 HOLO 내부 요금제가 적용되지 않고 Railway의 MiniMax API 계정을 직접 사용합니다.");
      return;
    }
    setNotice(`${planName} 선택을 확인했습니다. Toss Payments 연결이 완료되면 이 버튼에서 바로 결제하고 구독을 시작할 수 있습니다.`);
  }

  return (
    <main className="pricingPage">
      <div className="pricingGridBg" />
      <div className="pricingGlow" />
      <header className="pricingHeader">
        <div className="pricingBrand"><b>HOLOGRAM</b> PICTURES AI <span>HOLO</span></div>
        <button className="backToHolo" onClick={goMain}>메인으로</button>
      </header>

      <section className="pricingHero">
        <span className="eyebrow">HOLO PLANS</span>
        <h1>말하면, 영상이 된다.</h1>
        <p>필요한 만큼 만들고, 사용한 생성 시간만큼 크레딧을 사용하세요.</p>
        {isAdmin ? (
          <div className="adminBanner"><strong>OWNER / ADMIN</strong><span>요금제 적용 제외 · MiniMax H3 Direct</span></div>
        ) : loggedIn ? (
          <div className="walletBanner"><strong>현재 HOLO 크레딧</strong><span>${wallet.toFixed(2)}</span></div>
        ) : (
          <div className="walletBanner"><strong>회원 전용 요금제</strong><span>가입 후 이용 가능</span></div>
        )}
      </section>

      <section className="planGrid">
        {plans.map((plan) => (
          <article key={plan.id} className={`planCard ${plan.featured ? "featured" : ""}`}>
            {plan.featured && <div className="popularBadge">BEST VALUE · 런칭 특가</div>}
            <div className="planTop"><span>{plan.kicker}</span><h2>{plan.name}</h2></div>
            <div className="planPrice">{plan.originalPrice && <del>{plan.originalPrice}</del>}<strong>{plan.price}</strong><small>/ 월</small></div>
            <div className="planCredit"><b>{plan.credits}</b><span>{plan.videos}</span></div>
            <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <button onClick={() => choosePlan(plan.name)}>
              {isAdmin ? "ADMIN · 제한 없음" : !loggedIn ? "회원가입 후 시작" : plan.id === "creator50" ? "CREATOR 50 선택" : `${plan.name} 선택`}
            </button>
          </article>
        ))}
      </section>

      {notice && <div className="pricingNotice" role="status">{notice}</div>}
      <section className="creditGuide">
        <div><span>768P</span><strong>1초 = 1 HOLO sec</strong></div>
        <div><span>10초 영상</span><strong>10 sec 사용</strong></div>
        <div><span>15초 영상</span><strong>15 sec 사용</strong></div>
        <div><span>2K</span><strong>약 1.625× 사용</strong></div>
      </section>
      <p className="pricingFineprint">영상 수량은 10초 · 768P 기준입니다. 실제 사용량은 영상 길이, 해상도, 생성 모델 및 재생성 여부에 따라 달라질 수 있습니다. 결제 기능은 Toss Payments 연동 후 활성화됩니다.</p>
      <footer className="pricingFooter">HOLOGRAM PICTURES AI · AI ASSISTANT HOLO</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<PricingPage />);
