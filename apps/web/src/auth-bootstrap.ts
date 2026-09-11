import { createClient, type Session } from "@supabase/supabase-js";
import "./auth.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const API = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://hologramapi-production.up.railway.app");
const root = document.getElementById("root");
const nativeFetch = window.fetch.bind(window);

if (!root) throw new Error("root element not found");

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

if (!SUPABASE_URL || !SUPABASE_KEY) {
  renderConfigError();
} else {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  let appLoaded = false;

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
      <p class="authPolicy">계정 인증 정보는 Supabase Auth로 처리되며, HOLO의 영상 생성 API는 로그인 토큰이 있어야 사용할 수 있습니다.</p>
    `);

    document.getElementById("tab-login")?.addEventListener("click", () => renderAuth("login"));
    document.getElementById("tab-signup")?.addEventListener("click", () => renderAuth("signup"));
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

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (!url.startsWith(API)) return nativeFetch(input, init);
      const { data } = await supabase.auth.getSession();
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
      if (data.session?.access_token) headers.set("Authorization", `Bearer ${data.session.access_token}`);
      return nativeFetch(input, { ...init, headers });
    };

    root.innerHTML = "";
    const dock = document.createElement("div");
    dock.className = "memberDock";
    const email = document.createElement("span");
    email.textContent = session.user.email || "HOLO MEMBER";
    const logout = document.createElement("button");
    logout.type = "button";
    logout.textContent = "로그아웃";
    logout.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.reload();
    });
    dock.append(email, logout);
    document.body.appendChild(dock);

    await import("./main.tsx");
  }

  const { data } = await supabase.auth.getSession();
  if (data.session) await enterApp(data.session);
  else renderAuth("login");

  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT" && appLoaded) window.location.reload();
  });
}
