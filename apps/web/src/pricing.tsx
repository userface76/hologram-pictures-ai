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
  monthlyPrice: string;
  annualMonthlyPrice: string;
  annualTotal: string;
  annualDiscount?: string;
  credits: string;
  annualBaseCredits?: string;
  annualBonusCredits?: string;
  annualCredits?: string;
  videos: string;
  monthlyOriginalPrice?: string;
  featured?: boolean;
  features: string[];
};

type BillingPeriod = "monthly" | "annual";

const API = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://hologramapi-production.up.railway.app");
const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || "";
const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";

const plans: Plan[] = [
  {
    id: "free",
    name: "FREE",
    kicker: "HOLO 체험",
    monthlyPrice: "0원",
    annualMonthlyPrice: "0원",
    annualTotal: "0원",
    credits: "5 HOLO 크레딧",
    videos: "5초 영상 1회 체험",
    features: [
      "5 HOLO 크레딧",
      "HOLO 영상 생성 엔진 체험",
      "이미지 → 영상",
      "HOLO 프롬프트 분석",
      "A · CONTROL / B · IMPACT / C · USER BASED 제안",
      "개인 작업 보관함",
    ],
  },
  {
    id: "starter",
    name: "STARTER",
    kicker: "개인 · 입문용",
    monthlyPrice: "29,000원",
    annualMonthlyPrice: "23,000원",
    annualTotal: "276,000원",
    annualDiscount: "21%",
    credits: "150 HOLO 크레딧 / 월",
    annualBaseCredits: "1,800",
    annualBonusCredits: "200",
    annualCredits: "2,000",
    videos: "기본 엔진 10초 영상 기준 약 15편 상당",
    features: [
      "매월 150 HOLO 크레딧",
      "이미지 · 텍스트 → 영상",
      "HOLO AI 프롬프트 설계",
      "3가지 제작안 A / B / C",
      "시작 · 참조 · 엔딩 이미지 활용",
      "MY STUDIO 프로젝트 저장",
      "영상 재편집 · 스타일 변경",
      "상업적 사용",
    ],
  },
  {
    id: "creator50",
    name: "CREATOR 50",
    kicker: "가장 인기",
    monthlyPrice: "79,000원",
    annualMonthlyPrice: "59,000원",
    annualTotal: "708,000원",
    annualDiscount: "25%",
    monthlyOriginalPrice: "99,000원",
    credits: "500 HOLO 크레딧 / 월",
    annualBaseCredits: "6,000",
    annualBonusCredits: "1,000",
    annualCredits: "7,000",
    videos: "기본 엔진 10초 영상 기준 약 50편 상당",
    featured: true,
    features: [
      "매월 500 HOLO 크레딧",
      "HOLO 멀티엔진 영상 생성",
      "이미지 · 텍스트 → 영상",
      "HOLO AI Creative Director",
      "A · CONTROL / B · IMPACT / C · USER BASED",
      "광고 · 브랜드 · 숏폼 프롬프트 최적화",
      "시작 · 참조 · 엔딩 이미지 활용",
      "회원 전용 MY STUDIO",
      "상업적 사용",
      "우선 렌더링",
    ],
  },
  {
    id: "pro",
    name: "PRO",
    kicker: "크리에이터 · 마케팅",
    monthlyPrice: "169,000원",
    annualMonthlyPrice: "119,000원",
    annualTotal: "1,428,000원",
    annualDiscount: "30%",
    credits: "900 HOLO 크레딧 / 월",
    annualBaseCredits: "10,800",
    annualBonusCredits: "2,200",
    annualCredits: "13,000",
    videos: "기본 엔진 10초 영상 기준 약 90편 상당",
    features: [
      "매월 900 HOLO 크레딧",
      "HOLO 멀티엔진 고용량 생성",
      "HOLO AI Creative Director",
      "광고 · 제품 · 브랜드 영상 제작 최적화",
      "프로젝트 · 영상 라이브러리",
      "시작 · 참조 · 엔딩 이미지 활용",
      "버전 재편집 · 스타일 변경",
      "상업적 사용",
      "우선 렌더링",
      "2K 생성 지원",
      "대량 콘텐츠 제작에 적합",
    ],
  },
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
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual");

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
      localStorage.setItem("holo_pending_billing_period", billingPeriod);
      const tossPayments = window.TossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey });
      const base = `${window.location.origin}${window.location.pathname}`;
      const successUrl = `${base}?billing=success&planId=${encodeURIComponent(plan.id)}&billingPeriod=${billingPeriod}#pricing`;
      const failUrl = `${base}?billing=fail&planId=${encodeURIComponent(plan.id)}&billingPeriod=${billingPeriod}#pricing`;

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
        <h1>생각하는 대로 영상이 된다.</h1>
        <p>아이디어만 떠올리세요. HOLO가 프롬프트를 설계하고 영상 제작까지 연결합니다.</p>
        {isAdmin ? (
          <div className="adminBanner"><strong>OWNER / ADMIN</strong><span>요금제 적용 제외 · MiniMax H3 Direct</span></div>
        ) : loggedIn ? (
          <div className="walletBanner"><strong>현재 보유 HOLO 크레딧</strong><span>{walletSeconds.toLocaleString()} 크레딧</span></div>
        ) : (
          <div className="walletBanner"><strong>회원 전용 요금제</strong><span>가입 후 이용 가능</span></div>
        )}
        {billingRegistered && <div className="walletBanner"><strong>자동결제 카드</strong><span>등록 완료</span></div>}
        <p className="heroCreditNote">HOLO 크레딧은 영상 길이, 해상도, 생성 엔진과 선택 옵션에 따라 사용됩니다.</p>
        <div className="billingToggle" role="group" aria-label="결제 주기 선택">
          <button className={billingPeriod === "monthly" ? "active" : ""} onClick={() => setBillingPeriod("monthly")} type="button">월간</button>
          <button className={billingPeriod === "annual" ? "active" : ""} onClick={() => setBillingPeriod("annual")} type="button">연간 <span>최대 30% 할인</span></button>
        </div>
        <p className="annualGuide">{billingPeriod === "annual" ? "연간 결제 시 월 환산 금액을 크게 표시하며, 실제 결제는 1년 총액으로 진행됩니다." : "월 단위로 결제하며 언제든 연간 요금과 비교할 수 있습니다."}</p>
      </section>

      <section className="planGrid">
        {plans.map((plan) => (
          <article key={plan.id} className={`planCard ${plan.featured ? "featured" : ""}`}>
            {plan.featured && <div className="popularBadge">{billingPeriod === "annual" ? "BEST VALUE · 연간 25% 할인" : "BEST VALUE · 런칭 특가"}</div>}
            <div className="planTop">
              <span>{plan.kicker}</span>
              <h2>{plan.name}</h2>
              {billingPeriod === "annual" && plan.annualDiscount && <em className="discountBadge">연간 {plan.annualDiscount} 절약</em>}
            </div>
            <div className="planPrice">
              {billingPeriod === "monthly" && plan.monthlyOriginalPrice && <del>{plan.monthlyOriginalPrice}</del>}
              <strong>{billingPeriod === "annual" ? plan.annualMonthlyPrice : plan.monthlyPrice}</strong>
              <small>/ 월</small>
            </div>
            {billingPeriod === "annual" && plan.id !== "free" && <div className="annualTotal"><span>연간 총 결제</span><b>{plan.annualTotal}</b></div>}
            {billingPeriod === "monthly" && plan.id === "creator50" && <div className="monthlyPromo">런칭가 · 정가 99,000원에서 약 20% 할인</div>}
            <div className="planCredit">
              {billingPeriod === "annual" && plan.annualCredits ? (
                <>
                  <div className="annualCreditHeadline">
                    <span>연간 총 제공</span>
                    <b>{plan.annualCredits} HOLO 크레딧</b>
                  </div>
                  <div className="annualCreditMath">
                    <span>기본 {plan.annualBaseCredits}</span>
                    <i>+</i>
                    <span className="bonus">연간 보너스 {plan.annualBonusCredits}</span>
                  </div>
                  <small className="monthlyCreditNote">기본 월 {plan.credits.replace(" / 월","")} × 12개월 기준</small>
                </>
              ) : (
                <>
                  <b>{plan.credits}</b>
                  <span>{plan.videos}</span>
                </>
              )}
            </div>
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
                        ? `${plan.name} · ${billingPeriod === "annual" ? "연간" : "월간"} 구독 준비`
                        : `${plan.name} · ${billingPeriod === "annual" ? "연간" : "월간"} 시작`}
            </button>
          </article>
        ))}
      </section>

      {notice && <div className="pricingNotice" role="status">{notice}</div>}

      <section className="productionSuite">
        <div className="suiteHeading">
          <span>HOLO CREATIVE SYSTEM</span>
          <h2>영상 몇 초가 아니라, 제작 시스템 전체를 제공합니다.</h2>
          <p>아이디어부터 프롬프트 설계, 장면 연속성, 작품 보관까지 HOLO의 제작 흐름을 함께 이용하세요.</p>
        </div>
        <div className="suiteGrid">
          <article><b>PROMPT INTELLIGENCE</b><strong>프롬프트 설계</strong><p>막연한 아이디어를 장면 · 분위기 · 카메라 · 움직임이 포함된 영상 언어로 구조화합니다.</p></article>
          <article><b>3 DIRECTOR OPTIONS</b><strong>3가지 제작 방향</strong><p>CONTROL · IMPACT · USER BASED 중 목적에 맞는 제작안을 비교하고 선택할 수 있습니다.</p></article>
          <article><b>VISUAL CONTINUITY</b><strong>장면 연속성</strong><p>인물 · 제품 · 무드와 시작 · 참조 · 엔딩 이미지의 역할을 연결해 일관된 제작을 돕습니다.</p></article>
          <article><b>MY STUDIO</b><strong>나만의 영상 자산</strong><p>작품 저장 · 아이디어 복사 · 스타일 변경 · 버전 재편집으로 제작 결과를 계속 활용합니다.</p></article>
        </div>
      </section>

      <section className="creditGuideWrap">
        <div className="creditGuideTitle"><span>HOLO CREDIT GUIDE</span><h2>크레딧은 필요한 제작량에 맞춰 사용합니다.</h2></div>
        <div className="creditGuide">
          <div><span>10초 기본 영상</span><strong>약 10 HOLO 크레딧</strong></div>
          <div><span>15초 기본 영상</span><strong>약 15 HOLO 크레딧</strong></div>
          <div><span>고해상도 · 프리미엄 옵션</span><strong>선택 옵션에 따라 추가 크레딧</strong></div>
        </div>
      </section>
      <p className="pricingFineprint">영상 생성에 필요한 크레딧은 영상 길이, 해상도, 생성 엔진 및 선택한 제작 옵션에 따라 달라질 수 있습니다. 연간 요금은 표시된 월 환산가를 기준으로 1년 총액을 결제하며, 연간 플랜에는 12개월 기본 크레딧에 별도의 연간 보너스 크레딧이 추가됩니다. 실제 크레딧 지급 시점과 방식은 운영 정책에 따라 월별 또는 분기별로 나누어 적용될 수 있습니다. 자동결제는 카드 등록 후 별도의 구독 승인 단계에서 활성화됩니다.</p>
      <footer className="pricingFooter">HOLOGRAM PICTURES AI · AI ASSISTANT HOLO</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<PricingPage />);
