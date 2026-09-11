import { createClient, type Session } from "@supabase/supabase-js";
import "./auth.css";
import "./landing.css";
import "./landing-copy.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const API = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://hologramapi-production.up.railway.app");
const root = document.getElementById("root")!;
const nativeFetch = window.fetch.bind(window);

if (!root) throw new Error("root element not found");

function go(hash = "") {
  if (hash) window.location.hash = hash;
  else history.replaceState(null, "", window.location.pathname + window.location.search);
  window.location.reload();
}

function authShell(content: string) {
  root.innerHTML = `
    <main class="authPage">
      <div class="authGrid"></div>
      <div class="authGlow"></div>
      <section class="authCard">
        <div class="authBrand"><b>HOLOGRAM</b> PICTURES AI <span>HOLO</span></div>
        <div class="authCore"><i></i><i></i><strong>HOLO</strong><small>SECURE ACCESS</small></div>
        ${content}
      </section>
      <footer class="authFooter">HOLOGRAM PICTURES AI · MEMBERS ONLY</footer>
    </main>`;
}

function renderConfigError() {
  authShell(`
    <div class="authCopy">
      <h1>로그인 설정이 필요합니다</h1>
      <p>Railway WEB 서비스에 Supabase 공개 인증 정보를 연결하면 로그인 화면이 활성화됩니다.</p>
    </div>
    <div class="authMessage error">VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY를 확인해 주세요.</div>
  `);
}

function renderLanding(session?: Session | null) {
  const loggedIn = Boolean(session);
  const email = session?.user?.email || "";
  document.querySelector(".memberDock")?.remove();
  root.innerHTML = `
    <main class="landingPage">
      <div class="landingBackdrop"></div>
      <div class="landingGrid"></div>
      <header class="landingHeader">
        <div class="landingBrand"><b>HOLOGRAM</b> PICTURES AI <span>HOLO</span></div>
        <nav class="landingNav">
          <button id="landing-pricing" type="button">요금제</button>
          ${loggedIn
            ? `<span class="memberName">${email}</span><button id="landing-app" class="primaryNav" type="button">HOLO 시작</button><button id="landing-logout" type="button">로그아웃</button>`
            : `<button id="landing-login" type="button">로그인</button><button id="landing-signup" class="primaryNav" type="button">회원가입</button>`}
        </nav>
      </header>

      <section class="landingHero">
        <div class="landingCopy">
          <span class="landingEyebrow">FROM IDEA TO VIDEO INTELLIGENCE</span>
          <h1>생각은 자유롭게.<span>프롬프트는 HOLO가.</span></h1>
          <p>막연한 아이디어도 괜찮습니다. HOLO가 장면, 분위기, 카메라, 움직임과 이미지의 역할을 함께 정리해 영상 생성에 최적화된 프롬프트로 완성합니다.</p>
          <div class="landingActions">
            <button id="hero-start" class="heroPrimary" type="button">${loggedIn ? "HOLO와 시작하기" : "아이디어 시작하기"}</button>
            <button id="hero-pricing" type="button">요금제 보기</button>
          </div>
          <div class="landingMeta">
            <div><strong>MiniMax H3</strong>VIDEO ENGINE</div>
            <div><strong>HOLO</strong>PROMPT INTELLIGENCE</div>
            <div><strong>R2 + Supabase</strong>SECURE WORKSPACE</div>
          </div>
        </div>

        <div class="worldStage" aria-hidden="true">
          <div class="worldPlane"></div>
          <div class="mobileGlobe"></div>
          <div class="networkLine line1"></div><div class="networkLine line2"></div><div class="networkLine line3"></div><div class="networkLine line4"></div>
          <i class="networkNode node1" data-label="THINK"></i>
          <i class="networkNode node2" data-label="REFINE"></i>
          <i class="networkNode node3" data-label="PROMPT"></i>
          <i class="networkNode node4" data-label="CREATE"></i>
          <i class="networkNode node5" data-label="HOLO CORE"></i>
          <div class="worldCore"><strong>HOLO</strong><span>HOLOGRAM CORE</span></div>
        </div>
      </section>

      <section class="landingStrip">
        <article><b>THINK · 아이디어만 이야기하세요</b><p>완성된 프롬프트가 없어도 됩니다. 떠오른 장면, 제품, 분위기나 이야기를 자유롭게 말하거나 입력하세요.</p></article>
        <article><b>REFINE · HOLO가 생각을 구체화합니다</b><p>장면 · 분위기 · 카메라 · 움직임 · 시작/참조/엔딩 이미지를 이해하고 영상 생성에 필요한 구조로 정리합니다.</p></article>
        <article><b>CREATE · 영상 언어로 연결합니다</b><p>완성된 프롬프트를 MiniMax H3 렌더 파이프라인에 연결하고 프로젝트와 결과 영상을 회원별로 관리합니다.</p></article>
      </section>
      <footer class="landingFooter">HOLOGRAM PICTURES AI · 생각은 자유롭게. 프롬프트는 HOLO가. · FROM IDEA TO VIDEO INTELLIGENCE</footer>
    </main>`;

  document.getElementById("landing-pricing")?.addEventListener("click", () => go("#pricing"));
  document.getElementById("hero-pricing")?.addEventListener("click", () => go("#pricing"));
  document.getElementById("hero-start")?.addEventListener("click", () => go(loggedIn ? "#app" : "#signup"));
  document.getElementById("landing-login")?.addEventListener("click", () => go("#login"));
  document.getElementById("landing-signup")?.addEventListener("click", () => go("#signup"));
  document.getElementById("landing-app")?.addEventListener("click", () => go("#app"));
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  renderConfigError();
} else {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  let appLoaded = false;

  function installAuthenticatedFetch(session?: Session | null) {
    if (!session) {
      window.fetch = nativeFetch;
      return;
    }
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (!url.startsWith(API)) return nativeFetch(input, init);
      const { data } = await supabase.auth.getSession();
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
      if (data.session?.access_token) headers.set("Authorization", `Bearer ${data.session.access_token}`);
      return nativeFetch(input, { ...init, headers });
    };
  }

  function setMessage(message: string, error = false) {
    const el = document.getElementById("auth-message");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("error", error);
    el.classList.toggle("success", !error && Boolean(message));
  }

  function setBusy(busy: boolean) {
    document.querySelectorAll<HTMLButtonElement>(".authCard button").forEach((button) => { button.disabled = busy; });
    const submit = document.getElementById("auth-submit");
    if (submit) submit.textContent = busy ? "HOLO 연결 중…" : (submit.getAttribute("data-mode") === "signup" ? "회원가입" : "로그인");
  }

  function renderAuth(mode: "login" | "signup" = "login") {
    const signup = mode === "signup";
    document.querySelector(".memberDock")?.remove();
    authShell(`
      <div class="authCopy">
        <h1>${signup ? "HOLO 회원가입" : "HOLO 로그인"}</h1>
        <p>${signup ? "가입 후 HOLOGRAM PICTURES AI를 사용할 수 있습니다." : "가입된 사용자만 영상 생성 시스템에 접속할 수 있습니다."}</p>
      </div>
      <div class="authTabs">
        <button id="tab-login" class="${!signup ? "active" : ""}" type="button">로그인</button>
        <button id="tab-signup" class="${signup ? "active" : ""}" type="button">회원가입</button>
      </div>
      <form id="auth-form" class="authForm">
        <label>이메일<input id="auth-email" type="email" autocomplete="email" placeholder="name@example.com" required /></label>
        <label>비밀번호<input id="auth-password" type="password" autocomplete="${signup ? "new-password" : "current-password"}" minlength="6" placeholder="6자 이상" required /></label>
        ${signup ? '<label>비밀번호 확인<input id="auth-confirm" type="password" autocomplete="new-password" minlength="6" placeholder="비밀번호 다시 입력" required /></label>' : ""}
        <button id="auth-submit" class="authPrimary" data-mode="${mode}" type="submit">${signup ? "회원가입" : "로그인"}</button>
      </form>
      <div id="auth-message" class="authMessage"></div>
      <p class="authPolicy">안전한 계정 인증을 통해 HOLO 서비스를 이용합니다. 영상 생성과 개인 보관함은 로그인한 회원에게만 제공됩니다.</p>
      <button id="auth-home" class="authHome" type="button">메인으로 돌아가기</button>
    `);

    document.getElementById("tab-login")?.addEventListener("click", () => renderAuth("login"));
    document.getElementById("tab-signup")?.addEventListener("click", () => renderAuth("signup"));
    document.getElementById("auth-home")?.addEventListener("click", () => go());
    document.getElementById("auth-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = (document.getElementById("auth-email") as HTMLInputElement).value.trim();
      const password = (document.getElementById("auth-password") as HTMLInputElement).value;
      if (signup) {
        const confirm = (document.getElementById("auth-confirm") as HTMLInputElement).value;
        if (password !== confirm) {
          setMessage("비밀번호가 서로 다릅니다.", true);
          return;
        }
      }

      setMessage("");
      setBusy(true);
      try {
        if (signup) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          });
          if (error) throw error;
          if (data.session) {
            await enterApp(data.session);
          } else {
            setMessage("가입 신청이 완료되었습니다. 이메일 인증 메일을 확인한 뒤 로그인해 주세요.");
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          await enterApp(data.session);
        }
      } catch (error: any) {
        setMessage(error?.message || "로그인 처리 중 오류가 발생했습니다.", true);
      } finally {
        setBusy(false);
      }
    });
  }

  async function enterApp(session: Session) {
    if (appLoaded) return;
    appLoaded = true;
    installAuthenticatedFetch(session);
    root.innerHTML = "";
    document.querySelector(".memberDock")?.remove();

    let role = "user";
    try {
      const accountResponse = await window.fetch(`${API}/api/account`);
      if (accountResponse.ok) {
        const accountData = await accountResponse.json();
        role = accountData?.account?.profile?.role || "user";
      }
    } catch (error) {
      console.warn("HOLO account badge unavailable:", error);
    }

    const dock = document.createElement("div");
    dock.className = "memberDock";
    const home = document.createElement("button");
    home.type = "button";
    home.textContent = "메인";
    home.addEventListener("click", () => go());
    const pricing = document.createElement("button");
    pricing.type = "button";
    pricing.textContent = "요금제";
    pricing.addEventListener("click", () => go("#pricing"));
    const badge = document.createElement("strong");
    badge.className = `memberRole ${role === "admin" ? "admin" : ""}`;
    badge.textContent = role === "admin" ? "OWNER · ADMIN" : "MEMBER";
    const email = document.createElement("span");
    email.textContent = session.user.email || "HOLO MEMBER";
    const logout = document.createElement("button");
    logout.type = "button";
    logout.textContent = "로그아웃";
    logout.addEventListener("click", async () => {
      await supabase.auth.signOut();
      go();
    });
    dock.append(home, pricing, badge, email, logout);
    document.body.appendChild(dock);
    await import("./main");
  }

  async function renderPricing(session?: Session | null) {
    installAuthenticatedFetch(session);
    root.innerHTML = "";
    document.querySelector(".memberDock")?.remove();
    await import("./pricing");
  }

  async function bootstrapAuth() {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    installAuthenticatedFetch(session);
    const hash = window.location.hash;
    if (hash === "#app") {
      if (session) await enterApp(session);
      else renderAuth("login");
    } else if (hash === "#login") {
      renderAuth("login");
    } else if (hash === "#signup") {
      renderAuth("signup");
    } else if (hash === "#pricing") {
      await renderPricing(session);
    } else {
      renderLanding(session);
      document.getElementById("landing-logout")?.addEventListener("click", async () => {
        await supabase.auth.signOut();
        go();
      });
    }
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && window.location.hash === "#app") go();
    });
  }

  void bootstrapAuth().catch((error) => {
    console.error("HOLO auth bootstrap failed:", error);
    renderLanding(null);
  });
}
