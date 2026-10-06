import { NextRequest, NextResponse } from "next/server";
import { AuthStore } from "@/lib/auth/store";
import { verifySessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";
import { mapStoredProfileToUserProfile } from "@/lib/types/user";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(PREPSTREAK_SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
        profile: null,
      });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      // Clear invalid cookie
      const res = NextResponse.json({
        isAuthenticated: false,
        user: null,
        profile: null,
      });
      res.cookies.delete(PREPSTREAK_SESSION_COOKIE);
      return res;
    }

    const dbSession = AuthStore.getSession(token);
    if (!dbSession) {
      const res = NextResponse.json({
        isAuthenticated: false,
        user: null,
        profile: null,
      });
      res.cookies.delete(PREPSTREAK_SESSION_COOKIE);
      return res;
    }

    const user = AuthStore.findUserById(dbSession.userId);
    if (!user) {
      const res = NextResponse.json({
        isAuthenticated: false,
        user: null,
        profile: null,
      });
      res.cookies.delete(PREPSTREAK_SESSION_COOKIE);
      return res;
    }

    let profile = AuthStore.getProfileByUserId(user.id);
    if (!profile) {
      profile = AuthStore.updateUserProfile(user.id, {})!;
    }

    const userProfile = mapStoredProfileToUserProfile(profile);

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        targetExamId: user.targetExamId,
        createdAt: new Date(user.createdAt),
        user_metadata: {
          full_name: user.fullName,
          selected_exam: user.targetExamId,
          avatar_url: profile.avatarUrl,
        },
      },
      profile: userProfile,
    });
  } catch (err) {
    console.error("Session API error:", err);
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
      profile: null,
    });
  }
}
