import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { NprData, NprEntry } from './types'

const OUTPUT_PATH = fileURLToPath(new URL('../../public/npr_data.json', import.meta.url))

/** Indexes a flat list of entries by album id, artist id, and (song) track id. */
export function buildDataset(entries: NprEntry[]): NprData {
  const albums: NprData['albums'] = {}
  const artists: NprData['artists'] = {}
  const tracks: NonNullable<NprData['tracks']> = {}
  for (const entry of entries) {
    const artistBucket = (artists[entry.artist_id] ??= [])
    artistBucket.push(entry)
    if (entry.track_id) {
      const trackBucket = (tracks[entry.track_id] ??= [])
      trackBucket.push(entry)
    } else {
      const albumBucket = (albums[entry.album_id] ??= [])
      albumBucket.push(entry)
    }
  }
  return { albums, artists, tracks }
}

/** Flattens a dataset back to a de-duplicated list of entries. */
export function flattenDataset(data: NprData): NprEntry[] {
  const all = [
    ...Object.values(data.albums).flat(),
    ...Object.values(data.artists).flat(),
    ...Object.values(data.tracks ?? {}).flat(),
  ]
  const seen = new Set<string>()
  const unique: NprEntry[] = []
  for (const entry of all) {
    const key = `${entry.list}|${entry.album_id}|${entry.track_id ?? ''}|${entry.artist_id}|${entry.rank}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(entry)
  }
  return unique
}

/** Reads the current dataset, or returns an empty one if none exists. */
export async function loadDataset(path = OUTPUT_PATH): Promise<NprData> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as NprData
  } catch {
    return { albums: {}, artists: {}, tracks: {} }
  }
}

/** Writes the dataset to public/npr_data.json (or a custom path). */
export async function writeDataset(data: NprData, path = OUTPUT_PATH): Promise<string> {
  await writeFile(path, JSON.stringify(data) + '\n')
  return path
}
