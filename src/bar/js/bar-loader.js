// This lightweight content script runs on every HTTPS page so adding another
// supported store does not require requesting a new host permission. The full
// bar bundle and stylesheet are loaded only for hosts listed below.
const SUPPORTED_HOST_PATTERNS = [
  'store.steampowered.com',
  '*.wingamestore.com',
  '*.gamebillet.com',
  '*.2game.com',
  '*.xbox.com',
  '*.gamesplanet.com',
  '*.fanatical.com',
  'store.epicgames.com',
  '*.planetplay.com',
  '*.humblebundle.com',
  '*.allyouplay.com',
  '*.greenmangaming.com',
  '*.gamersgate.com',
  '*.gamers-outlet.net',
  '*.gamerall.com',
  '*.joybuggy.com',
  '*.3kropki.pl',
  '*.gamesporium.com',
  '*.gameboost.com',
  '*.driffle.com',
  '*.discover.games',
  '*.eldorado.gg',
  '*.difmark.com',
  '*.gamivo.com',
  '*.gameseal.com',
  '*.kinguin.net',
  '*.g2play.net',
  '*.keycense.com',
  '*.loaded.com',
  '*.premiumcdkeys.com',
  '*.instant-gaming.com',
  '*.k4g.com',
  '*.eneba.com',
  '*.g2a.com',
  '*.hrkgame.com',
  '*.yuplay.com',
  '*.muve.pl',
  '*.muve.games',
  '*.mtcgame.com',
  '*.newegg.com',
  'store.rockstargames.com',
  '*.cheap-gaming.com',
  '*.electronicfirst.com',
  '*.amazon.com',
  '*.amazon.co.uk',
  '*.amazon.fr',
  '*.amazon.es',
  '*.amazon.de',
  '*.amazon.it',
  '*.play-asia.com',
  '*.dlgamer.com',
  '*.dreamgame.com',
  '*.fortunadigital.net',
  '*.gamestop.com',
  '*.gog.com',
  '*.hype.games',
  '*.indiegala.com',
  '*.lootbar.com',
  '*.lootbar.gg',
  '*.ldshop.gg',
  '*.nintendo.com',
  '*.nuuvem.com',
  '*.ea.com',
  '*.player.land',
  'store.playsum.live',
  'store.playstation.com',
  '*.startselect.com',
  '*.ubisoft.com',
  '*.battle.net',
  '*.isthereanydeal.com',
  'lestrades.com',
  'barter.vg',
  'steamdb.info',
  'steamcharts.com',
  'howlongtobeat.com',
  'www.metacritic.com',
  'opencritic.com',
  'www.releases.com',
  'egdata.app',
  'www.igdb.com',
  'www.gry-online.pl',
  'www.gamepressure.com',
];

function matchesHostPattern(hostname, pattern) {
  if (!pattern.startsWith('*.')) {
    return hostname === pattern;
  }

  const domain = pattern.slice(2);
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function isSupportedHost(hostname) {
  const normalizedHostname = hostname.trim().toLowerCase();
  return SUPPORTED_HOST_PATTERNS.some((pattern) => matchesHostPattern(normalizedHostname, pattern));
}

async function loadBottomBar() {
  const response = await chrome.runtime.sendMessage({
    type: 'INJECT_BOTTOM_BAR_STYLES',
  });

  if (!response?.ok) {
    throw new Error(response?.error || 'Failed to inject bottom bar styles.');
  }

  await import('./bottom-bar.js');
}

if (isSupportedHost(window.location.hostname)) {
  void loadBottomBar().catch((error) => {
    console.error('[gg.deals-extension] Failed to load bottom bar:', error);
  });
}
