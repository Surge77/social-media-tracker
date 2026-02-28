import { fetchLanguageWarsData, fetchFrameworkAdoption } from '@/lib/api/sc-languages'
import { fetchWalletLibraryDownloads } from '@/lib/api/npm-downloads'

export const revalidate = 86400 // 24 hours — GitHub search is rate-limited

export async function GET() {
  try {
    const [languages, frameworks, walletLibs] = await Promise.all([
      fetchLanguageWarsData(),
      fetchFrameworkAdoption(),
      fetchWalletLibraryDownloads(),
    ])

    return Response.json({ data: { languages, frameworks, walletLibs } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/blockchain/sc-languages]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
