import type { NextFunction, Request, Response } from "express";
import { getSupabaseAdmin } from "../lib/supabase.js";

declare global {
  namespace Express {
    interface Request {
      authUser?: { id: string; email?: string | null };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS") return next();

  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }

  const token = header.slice(7).trim();
  if (!token) return res.status(401).json({ error: "로그인 토큰이 없습니다." });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: "Supabase 인증 서버가 설정되지 않았습니다." });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "로그인 세션이 만료되었거나 유효하지 않습니다." });
    }

    req.authUser = { id: data.user.id, email: data.user.email ?? null };
    next();
  } catch (error) {
    console.error("Supabase auth verification failed:", error);
    return res.status(401).json({ error: "사용자 인증에 실패했습니다." });
  }
}
