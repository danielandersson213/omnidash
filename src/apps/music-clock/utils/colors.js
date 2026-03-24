// Vivid spread colors — one per unique #1 song, cycling
export const SPREAD_COLORS = [
  '#FF6B6B', // Crimson
  '#FFD93D', // Gold
  '#6BCB77', // Jade
  '#4D96FF', // Cobalt
  '#C77DFF', // Violet
  '#FF922B', // Ember
  '#20C997', // Teal
  '#F06595', // Rose
  '#74C0FC', // Sky
  '#A9E34B', // Lime
  '#FF6B35', // Tangerine
  '#1EC9E8', // Cyan
  '#FAB005', // Sunflower
  '#51CF66', // Mint
  '#F03E3E', // Scarlet
]

export function getSpreadColor(colorIndex, index) {
  if (index == null || index < 0) return null
  return SPREAD_COLORS[index % SPREAD_COLORS.length]
}

export function getSongKey(song) {
  return `${song.name}|||${song.artistName}`
}
