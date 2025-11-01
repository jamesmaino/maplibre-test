
import { UserContext } from "@/app/components/map/config/layerRegistry";

export function checkAuth(
  required: "admin" | "user" | "public" | undefined,
  ctx: UserContext
): boolean {
  if (!required || required === "public") return true;
  if (required === "user") return !!ctx.session.user;
  if (required === "admin") return ctx.user?.group === "admin";
  return false;
}
