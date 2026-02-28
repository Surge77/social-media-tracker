import { fetchRecentHacks } from '@/lib/api/defillama-hacks'

export const revalidate = 21600 // 6 hours

export async function GET() {
  try {
    const hacks = await fetchRecentHacks(25)
    return Response.json({ data: hacks })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/blockchain/hacks]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
