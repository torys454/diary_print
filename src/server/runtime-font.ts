import { GlobalFonts } from '@napi-rs/canvas'
import { createWriteStream, existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'

const NOTO_SANS_JP_URL =
  'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/SubsetOTF/JP/NotoSansJP-Regular.otf'
const FONT_FAMILY = 'Noto Sans JP'
const FONT_DIR = '/tmp/diary-print-fonts'
const FONT_PATH = `${FONT_DIR}/NotoSansJP-Regular.otf`

let isRegistered = false
let registerPromise: Promise<void> | null = null

async function downloadFontIfNeeded(): Promise<void> {
  if (existsSync(FONT_PATH)) return

  await mkdir(FONT_DIR, { recursive: true })

  const response = await fetch(NOTO_SANS_JP_URL)
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download font: ${response.status} ${response.statusText}`)
  }

  await pipeline(response.body as unknown as NodeJS.ReadableStream, createWriteStream(FONT_PATH))
}

/**
 * Registers Noto Sans JP at runtime.
 *
 * - Downloads the font only once to /tmp.
 * - Reuses the registered font in subsequent calls.
 */
export async function ensureNotoSansJPFont(): Promise<void> {
  if (isRegistered) return

  if (!registerPromise) {
    registerPromise = (async () => {
      await downloadFontIfNeeded()

      const ok = GlobalFonts.registerFromPath(FONT_PATH, FONT_FAMILY)
      if (!ok) {
        throw new Error(`Failed to register font: ${FONT_PATH}`)
      }

      isRegistered = true
    })()
  }

  await registerPromise
}

export { FONT_FAMILY }
