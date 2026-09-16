import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./pricing.css";

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => any;
  }
}

type Account = {
  profile?: { email?: string | null; display_name?: string | null; role?: string; status?: string } | null;
  wallet?: { balance_usd?: number | string | null; balance_seconds?: number | string | null; reserved_seconds?: number | string | null } | null;
};

type Plan = {
  id: string;
  name: string;
  kicker: string;
  price: string;
  credits: string;
  videos: string;
  originalPrice?: string;
  featured?: boolean;
  features: string[];
};

const API = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://hologramapi-production.up.railway.app");
const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || "";
const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";

const plans: Plan[] = [
  { id: "free", name: "FREE", kicker: "HOLO 체험", price: "0원", credits: "5초 체험 크레딧", videos: "5초 영상 1회", features: ["MiniMax H3 체험", "이미지 → 영상", "HOLO 프롬프트 분석", "개인 보관함"] },
  { id: "starter", name: "STARTER", kicker: "개인 · 입문용", price: "29,000원", credits: "150초 / 월", videos: "10초 기준 최대 15편", features: ["MiniMax H3", "이미지 · 텍스트 → 영상", "HOLO 프롬프트", "개인 프로젝트 · 영상 보관함", "상업적 사용"] },
  { id: "creator50", name: "CREATOR 50", kicker: "가장 인기", price: "79,000원", originalPrice: "99,000원", credits: "500초 / 월", videos: "10초 기준 최대 50편", featured: true, features: ["MiniMax H3", "이미지 · 텍스트 → 영상", "HOLO 프롬프트", "회원 전용 보관함", "상업적 사용", "우선 렌더링", "런칭 특별가"] },
  { id: "pro", name: "PRO", kicker: "크리에이터 · 마케팅", price: "169,000원", credits: "900초 / 월", videos: "10초 기준 최대 90편", features: ["MiniMax H3", "고용량 영상 생성", "HOLO 프롬프트", "프로젝트 · 영상 보관함", "상업적 사용", "우선 렌더링", "2K 생성 지원"] },
];

function goMain() {
  history.replaceState(null, "", window.location.pathname + window.location.search);
  window.location.reload();
}

function loadTossSdk() {
  if (window.TossPayments) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TOSS_SDK_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("토스 결제 SDK를 불러오지 못했습니다.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = TOSS_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("토스 결제 SDK를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });
}

function clearBillingReturnUrl() {
  history.replaceState(null, "", `${window.location.pathname}#pricing`);
}

function PricingPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [accountChecked, setAccountChecked] = useState(false);
  const [notice, setNotice] = useState("");
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [billingRegistered, setBillingRegistered] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${API}/api/account`)
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("account unavailable")))
      .then((d) => { if (active) setAccount(d.account || null); })
      .catch(() => { if (active) setAccount(null); })
      .finally(() => { if (active) setAccountChecked(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billingResult = params.get("billing");
    if (!billingResult) return;

    if (billingResult === "fail") {
      const code = params.get("code") || "BILLING_AUTH_FAILED";
      const message = params.get("message") || "카드 등록이 취소되었거나 실패했습니다.";
      setNotice(`카드 등록 실패 · ${code} · ${message}`);
      clearBillingReturnUrl();
      return;
    }

    if (billingResult !== "success") return;
    const authKey = params.get("authKey") || "";
    const customerKey = params.get("customerKey") || "";
    if (!authKey || !customerKey) {
      setNotice("토스 카드 인증 결과에 필요한 값이 없습니다. 다시 카드 등록을 시도해 주세요.");
      clearBillingReturnUrl();
      return;
    }

    setNotice("토스 카드 인증을 확인하고 빌링키를 안전하게 등록하고 있습니다…");
    fetch(`${API}/api/billing/issue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authKey, customerKey }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error(data?.error || data?.message || "billing_issue_failed");
          (error as any).code = data?.code;
          throw error;
        }
        return data;
      })
      .then((data) => {
        setBillingRegistered(true);
        const charging = Boolean(data?.billing?.recurringChargeEnabled);
        setNotice(charging
          ? "카드 등록이 완료되었습니다. 자동결제 사용 준비가 완료되었습니다."
          : "카드 등록이 완료되었습니다. 현재는 안전을 위해 자동 청구가 꺼져 있습니다.");
      })
      .catch((error: any) => {
        const text = String(error?.message || "빌링키 발급에 실패했습니다.");
        if (text.includes("NOT_SUPPORTED_METHOD")) {
          setNotice("토스 자동결제(빌링) 계약이 아직 활성화되지 않았습니다. 테스트 상점의 자동결제 사용 가능 여부를 확인해 주세요.");
        } else {
          setNotice(`빌링키 등록 실패 · ${text}`);
        }
      })
      .finally(() => clearBillingReturnUrl());
  }, []);

  const role = account?.profile?.role || "user";
  const isAdmin = role === "admin";
  const loggedIn = Boolean(account?.profile?.email);
  const walletSeconds = useMemo(() => {
    const value = Number(account?.wallet?.balance_seconds ?? 0);
    return Number.isFinite(value) ? value : 0;
  }, [account]);

  async function choosePlan(plan: Plan) {
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
    if (plan.id === "free") {
      setNotice("FREE 체험은 결제수단 등록 없이 사용할 수 있도록 운영할 예정입니다.");
      return;
    }
    if (!TOSS_CLIENT_KEY) {
      setNotice("Railway WEB 서비스의 VITE_TOSS_CLIENT_KEY 설정을 확인해 주세요.");
      return;
    }

    setBusyPlan(plan.id);
    setNotice(`${plan.name} 구독용 카드 등록을 준비하고 있습니다…`);
    try {
      const customerResponse = await fetch(`${API}/api/billing/customer`);
      const customerData = await customerResponse.json().catch(() => ({}));
      if (!customerResponse.ok) throw new Error(customerData?.error || "billing_customer_failed");

      const customerKey = String(customerData?.billing?.customerKey || "");
      if (!customerKey) throw new Error("billing_customer_key_missing");
      if (customerData?.billing?.registered || billingRegistered) {
        setBillingRegistered(true);
        setNotice("이미 자동결제 카드가 등록되어 있습니다. 다음 단계에서 선택한 요금제의 구독 결제를 연결합니다.");
        return;
      }

      await loadTossSdk();
      if (!window.TossPayments) throw new Error("TossPayments SDK is unavailable");

      localStorage.setItem("holo_pending_plan_id", plan.id);
      const tossPayments = window.TossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey });
      const base = `${window.location.origin}${window.location.pathname}`;
      const successUrl = `${base}?billing=success&planId=${encodeURIComponent(plan.id)}#pricing`;
      const failUrl = `${base}?billing=fail&planId=${encodeURIComponent(plan.id)}#pricing`;

      await payment.requestBillingAuth({
        method: "CARD",
        successUrl,
        failUrl,
        ...(account?.profile?.email ? { customerEmail: account.profile.email } : {}),
        ...(account?.profile?.display_name ? { customerName: account.profile.display_name } : {}),
      });
    } catch (error: any) {
      const text = String(error?.message || error || "카드 등록 준비 중 오류가 발생했습니다.");
      setNotice(`카드 등록 준비 실패 · ${text}`);
    } finally {
      setBusyPlan(null);
    }
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
          <div className="walletBanner"><strong>현재 HOLO 크레딧</strong><span>{walletSeconds.toLocaleString()} sec</span></div>
        ) : (
          <div className="walletBanner"><strong>회원 전용 요금제</strong><span>가입 후 이용 가능</span></div>
        )}
        {billingRegistered && <div className="walletBanner"><strong>자동결제 카드</strong><span>등록 완료</span></div>}
      </section>

      <section className="planGrid">
        {plans.map((plan) => (
          <article key={plan.id} className={`planCard ${plan.featured ? "featured" : ""}`}>
            {plan.featured && <div className="popularBadge">BEST VALUE · 런칭 특가</div>}
            <div className="planTop"><span>{plan.kicker}</span><h2>{plan.name}</h2></div>
            <div className="planPrice">{plan.originalPrice && <del>{plan.originalPrice}</del>}<strong>{plan.price}</strong><small>/ 월</small></div>
            <div className="planCredit"><b>{plan.credits}</b><span>{plan.videos}</span></div>
            <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <button disabled={busyPlan === plan.id} onClick={() => choosePlan(plan)}>
              {busyPlan === plan.id
                ? "카드 등록 준비 중…"
                : isAdmin
                  ? "ADMIN · 제한 없음"
                  : !loggedIn
                    ? "회원가입 후 시작"
                    : plan.id === "free"
                      ? "FREE 시작"
                      : billingRegistered
                        ? `${plan.name} 구독 준비`
                        : `${plan.name} 카드 등록`}
            </button>
          </article>
        ))}
      </section>

      {notice && <div className="pricingNotice" role="status">{notice}</div>}
      <section className="creditGuide">
        <div><span>768P</span><strong>1초 = 1 HOLO sec</strong></div>
        <div><span>10초 영상</span><strong>10 sec 사용</strong></div>
        <div><span>15초 영상</span><strong>15 sec 사용</strong></div>
        <div><span>2K</span><strong>약 1.7× 사용</strong></div>
      </section>
      <p className="pricingFineprint">영상 수량은 10초 · 768P 기준입니다. 실제 사용량은 영상 길이, 해상도, 생성 모델 및 재생성 여부에 따라 달라질 수 있습니다. 자동결제는 카드 등록 후 별도의 구독 승인 단계에서 활성화됩니다.</p>
      <footer className="pricingFooter">HOLOGRAM PICTURES AI · AI ASSISTANT HOLO</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<PricingPage />);
