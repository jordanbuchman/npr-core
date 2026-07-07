import { createHmac } from 'node:crypto'
import { percentileRank } from '../utils/percentile'

interface ScoreBody {
  userId?: unknown
  raw?: unknown
}

/**
 * Records a user's raw NPRcore score and returns their live percentile.
 *
 * The store is a `HMAC(pepper, spotifyUserId) → raw` map — one row per user
 * (upsert = dedup). The pepper is a server-only secret, so a leaked store is
 * just opaque token → number. An empty pepper disables the backend.
 */
export default defineEventHandler(async (event) => {
  const pepper = useRuntimeConfig(event).scorePepper
  if (!pepper) return { final: null, sampled: 0 }

  const body = await readBody<ScoreBody>(event)
  const userId = typeof body?.userId === 'string' ? body.userId.trim() : ''
  const raw = typeof body?.raw === 'number' ? body.raw : Number.NaN
  if (!userId || !Number.isFinite(raw) || raw < 0 || raw > 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid score submission' })
  }

  const key = createHmac('sha256', pepper).update(userId).digest('hex')
  const storage = useStorage('scores')
  await storage.setItem(key, raw)

  // Live empirical CDF over everyone who scored above 0.
  const keys = await storage.getKeys()
  const values = (await Promise.all(keys.map((k) => storage.getItem<number>(k)))).filter(
    (value): value is number => typeof value === 'number' && value > 0,
  )

  const final = raw <= 0 ? 0 : Math.max(1, Math.round(100 * percentileRank(raw, values)))
  return { final, sampled: values.length }
})
