/**
 * Derives display labels from track names (e.g. separates "4K/8K" when present in config naming).
 */
export function splitTrackTitle(name: string): { channel: string; texture?: string } {
  const textureMatch = name.match(/\b(4K|8K)\b/i);
  const texture = textureMatch ? textureMatch[1].toUpperCase() : undefined;
  const channel = name
    .replace(/\s*[-–—]\s*(4K|8K)\s*$/i, '')
    .replace(/\s*\((4K|8K)\)\s*$/i, '')
    .trim();

  return {
    channel: channel.length > 0 ? channel : name,
    texture,
  };
}

/** A32NX track names still encode 4K/8K; the mainline cards omit the redundant Texture row. */
export function showAddonTrackTextureRow(addonKey: string): boolean {
  return !addonKey.startsWith('a32nx-');
}
