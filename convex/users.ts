import { query } from "./_generated/server";
import { getCurrentUser } from "./lib/currentUser";

/** The signed-in user, for analytics identify + admin gating. Null if signed out. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return { _id: user._id, email: user.email ?? null, name: user.name ?? null };
  },
});
