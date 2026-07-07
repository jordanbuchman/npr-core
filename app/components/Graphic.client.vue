<template>
  <div class="flex flex-col items-center">
    <UButton
      color="primary"
      size="lg"
      icon="i-lucide-download"
      :href="downloadUrl ?? undefined"
      :disabled="!downloadUrl"
      download="NPRcore.png"
      @click="onDownload"
    >
      Download results graphic
    </UButton>
    <canvas ref="canvasEl" width="800" height="450" class="hidden" />
  </div>
</template>

<script setup lang="ts">
import { FabricImage, FabricText, Group, Rect, StaticCanvas, Textbox } from 'fabric'
import type { FabricObject } from 'fabric'
import type { ArtistMatch, GraphicResults, TrackMatch } from '~/types/npr'

const props = defineProps<{ results: GraphicResults }>()

const FONT = 'Trebuchet MS'
const ALBUM_IMAGE_SIZE = 110
const RED = '#C63229'

const canvasEl = ref<HTMLCanvasElement | null>(null)
const downloadUrl = ref<string | null>(null)
let canvas: StaticCanvas | null = null

function loadImage(url: string): Promise<FabricImage> {
  return FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
}

function bottomOf(obj: FabricObject): number {
  return obj.top + obj.getScaledHeight()
}

/** Lay objects out left-to-right and wrap them in a group. */
function rowGroup(objects: FabricObject[], gap = 0): Group {
  let left = 0
  for (const obj of objects) {
    obj.set({ left, top: 0 })
    left += obj.getScaledWidth() + gap
  }
  return new Group(objects)
}

// Pick up to three songs, preferring distinct albums (mirrors the original).
function pickTopSongs(songs: TrackMatch[]): TrackMatch[] {
  if (songs.length < 4) return songs
  const remaining = songs.slice()
  const albumIds = new Set<string>()
  const top: TrackMatch[] = []
  const first = remaining.shift()!
  top.push(first)
  albumIds.add(first.user.album.id)
  while (top.length < 3 && remaining.length) {
    const idx = remaining.findIndex((s) => !albumIds.has(s.user.album.id))
    const next = idx === -1 ? remaining.shift()! : remaining.splice(idx, 1)[0]!
    top.push(next)
    albumIds.add(next.user.album.id)
  }
  return top
}

function songCaption(match: TrackMatch): string {
  const { npr, user } = match
  const ranked = npr.ranked ? `ranked ${npr.rank} ` : ''
  const listeners = npr.list.endsWith('listeners') ? "Listeners' " : ''
  return `${user.artists[0]?.name} / ${user.name} / "${npr.title}" is ${ranked}on NPR Music's ${listeners}Top Albums of ${npr.list.substring(0, 4)}`
}

function artistCaption(match: ArtistMatch): string {
  const { npr, user } = match
  const ranked = npr.ranked ? `ranked ${npr.rank} ` : ''
  const listeners = npr.list.endsWith('listeners') ? "Listeners' " : ''
  return `${user.name}'s "${npr.title}" is ${ranked}on NPR Music's ${listeners}Top Albums of ${npr.list.substring(0, 4)}`
}

async function buildCard(cover: string, caption: string): Promise<Group> {
  const image = await loadImage(cover)
  image.scaleToWidth(ALBUM_IMAGE_SIZE)
  image.set({ left: 0, top: 0 })
  const text = new Textbox(caption, {
    left: 0,
    top: ALBUM_IMAGE_SIZE + 10,
    width: ALBUM_IMAGE_SIZE,
    fontSize: 12,
    fontFamily: FONT,
  })
  return new Group([image, text])
}

function buildList(cards: Group[]): Group {
  cards.forEach((card, i) => card.set({ left: i * (ALBUM_IMAGE_SIZE + 10), top: 0 }))
  return new Group(cards)
}

function buildSection(title: string, list: Group): Group {
  const titleText = new FabricText(title, { fontSize: 20, fontFamily: FONT, left: 0, top: 0 })
  list.set({ left: 0, top: titleText.getScaledHeight() + 5 })
  return new Group([titleText, list])
}

async function buildScore(scorePct: number): Promise<Group> {
  const size = 60
  const begin = new FabricText('You are ', { fontSize: size, fontFamily: FONT })
  const pct = new FabricText(` ${Math.round(scorePct)}% `, {
    fontSize: size,
    fontFamily: FONT,
    fill: '#ffffff',
    backgroundColor: RED,
  })
  const logo = await loadImage('/images/nprlogo.png')
  logo.scaleToHeight(size)
  const end = new FabricText(' core', { fontSize: size, fontFamily: FONT })
  return rowGroup([begin, pct, logo, end], 4)
}

async function draw() {
  if (!canvas) return
  canvas.clear()
  canvas.backgroundColor = '#ffffff'

  const width = canvas.getWidth()
  const height = canvas.getHeight()

  canvas.add(
    new Rect({
      left: 0,
      top: 0,
      width: width - 5,
      height: height - 5,
      fill: 'transparent',
      stroke: RED,
      strokeWidth: 5,
      strokeLineJoin: 'round',
    }),
  )

  const score = await buildScore(props.results.score)
  score.set({ top: 20 })
  canvas.add(score)
  canvas.centerObjectH(score)

  const verdict = new FabricText(`Verdict: ${props.results.verdict}`, {
    fontSize: 25,
    fontFamily: FONT,
    top: bottomOf(score) + 20,
  })
  canvas.add(verdict)
  canvas.centerObjectH(verdict)

  const songs = pickTopSongs(props.results.songs)
  const songCards = await Promise.all(songs.map((s) => buildCard(s.npr.cover, songCaption(s))))
  const songSection = buildSection(`Your top ${songs.length} NPRcore songs:`, buildList(songCards))
  songSection.set({ left: 20, top: bottomOf(verdict) + 20 })
  canvas.add(songSection)

  const artists = props.results.artists.slice(0, 3)
  const artistCards = await Promise.all(
    artists.map((a) => buildCard(a.user.images[0]?.url ?? a.npr.cover, artistCaption(a))),
  )
  const artistSection = buildSection(
    `Your top ${artists.length} NPRcore artists:`,
    buildList(artistCards),
  )
  artistSection.set({ top: bottomOf(verdict) + 20 })
  artistSection.set({ left: width - artistSection.getScaledWidth() - 20 })
  canvas.add(artistSection)

  const footer = new FabricText('nprcore.me', { fontSize: 25, fontFamily: FONT })
  canvas.add(footer)
  footer.set({
    left: width - footer.getScaledWidth() - 10,
    top: height - footer.getScaledHeight() - 10,
  })

  canvas.renderAll()

  const blob = await canvas.toBlob()
  if (blob) {
    if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
    downloadUrl.value = URL.createObjectURL(blob)
  }
}

function onDownload() {
  if (downloadUrl.value) useTrackEvent('download_graphic', { label: 'Results Graphic' })
}

onMounted(async () => {
  if (!canvasEl.value) return
  canvas = new StaticCanvas(canvasEl.value)
  await draw()
})

watch(
  () => props.results,
  () => draw(),
  { deep: true },
)

onBeforeUnmount(() => {
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value)
  canvas?.dispose()
})
</script>
