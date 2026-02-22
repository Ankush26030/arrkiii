
function cleanTitle(title, artist) {
  const regexPatterns = [
    /\(feat\. .*\)|\[feat\. .*\]/gi,
    /\[.*?\]|\(.*?\)|\{.*?\}/g,
    /\|.*|official|audio|music|video|lyrics|lyric|hd|4k/gi,
  ];

  let cleanedTitle = title;
  for (const pattern of regexPatterns) {
    cleanedTitle = cleanedTitle.replace(pattern, "");
  }
  if (artist) {
    const separators = ["-", "–", "—"];
    for (const sep of separators) {
      if (cleanedTitle.includes(sep)) {
        const parts = cleanedTitle.split(sep);
        if (parts.length > 1) {
          const artistRegex = new RegExp(`\\b${artist}\\b`, "gi");
          cleanedTitle = cleanedTitle.replace(artistRegex, "").trim();
          const newParts = cleanedTitle
            .split(sep)
            .filter((p) => p.trim() !== "");
          cleanedTitle = newParts.length > 0 ? newParts[0] : cleanedTitle;
        }
        break;
      }
    }
  }
  cleanedTitle = cleanedTitle.trim();
  cleanedTitle = cleanedTitle.replace(/[\-–—\s]+$/, "");
  return cleanedTitle;
}

module.exports = { cleanTitle };