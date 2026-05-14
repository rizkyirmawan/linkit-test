import type { Elysia } from 'elysia';

export async function verifyAuth(ctx: any): Promise<{ id: number; username: string } | null> {
  const auth = ctx.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;

  const token = auth.slice(7);
  const payload = await ctx.jwt.verify(token);
  if (!payload) return null;

  return { id: payload.id as number, username: payload.username as string };
}

export const authGuard = {
  beforeHandle: async ({ jwt, headers, set }: any) => {
    const auth = headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      set.status = 401;
      return { error: 'Unauthorized', message: 'Missing or invalid token' };
    }
    const token = auth.slice(7);
    const payload = await jwt.verify(token);
    if (!payload) {
      set.status = 401;
      return { error: 'Unauthorized', message: 'Invalid or expired token' };
    }
  },
};
