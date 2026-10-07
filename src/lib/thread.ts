/**
 * Den röda trådens geometri.
 *
 * Varje block på startsidan har en egen SVG med viewBox utan bevarat bildförhållande (preserveAspectRatio="none").
 * I standardrutan 0 0 1000 1000 är x tusendelar av ramens bredd och y tusendelar av blockets höjd.
 * Mellan blocken går tråden i en fil på x = 25 (2,5 % av ramens bredd) eller x = 975 på höger sida,
 * och alltid lodrätt, så att avsnitten möts utan skarv. Figurblock har fast bildförhållande och egen viewBox.
 */
export const LANE = 25;
export const LANE_R = 975;

/** Mjuk båge i filen. bow är utslaget i tusendelar, negativt åt vänster. */
export function lane(bow = 14, x = LANE, fromTop = false): string {
  const y0 = fromTop ? 0 : -6;
  const m = x + bow;
  return `M${x} ${y0} C${x} 250 ${m} 250 ${m} 500 C${m} 750 ${x} 750 ${x} 1006`;
}

/** Kretsloppet. Stående ögla under 700 px, liggande från 700 px. */
export const cycle = {
  narrowVb: '0 0 1000 1300',
  narrow: 'M25 -6 C25 300 160 400 160 650 A400 560 0 0 0 960 650 A400 560 0 0 0 160 650 C160 900 25 1000 25 1306',
  wideVb: '0 0 2000 900',
  wide: 'M50 -6 C50 250 150 250 150 450 A900 330 0 0 0 1950 450 A900 330 0 0 0 150 450 C150 650 50 650 50 906',
  /** Ordens mittpunkter i procent av blocket, i läsordning. */
  narrowPos: [[56, 25.4], [56, 50], [56, 74.6]],
  widePos: [[26, 50], [52.5, 50], [79, 50]],
} as const;

/**
 * Karriärstegen. Under 700 px kliver tråden åt höger nedåt i läsordning.
 * Från 700 px går den uppför en trappa från vänster till höger och fortsätter ned längs höger fil.
 */
export const career = {
  narrowVb: '0 0 1000 1400',
  narrow:
    'M25 -6 L25 330 Q25 370 65 370 L70 370 Q110 370 110 410 L110 630 Q110 670 150 670 L155 670 Q195 670 195 710 L195 930 Q195 970 235 970 L240 970 Q280 970 280 1010 L280 1180 C280 1300 25 1300 25 1406',
  /** Punkternas läge i procent (x, y). */
  narrowPos: [[2.5, 16.4], [11, 37.9], [19.5, 59.3], [28, 80.7]],
  wideVb: '0 0 2000 800',
  wide:
    'M50 -6 L50 600 Q50 700 150 700 L520 700 Q560 700 560 660 L560 560 Q560 520 600 520 L970 520 Q1010 520 1010 480 L1010 380 Q1010 340 1050 340 L1420 340 Q1460 340 1460 300 L1460 200 Q1460 160 1500 160 L1870 160 Q1950 160 1950 240 L1950 806',
  widePos: [[16.75, 87.5], [39.25, 65], [61.75, 42.5], [84.25, 20]],
} as const;

/**
 * Affärsnytta × samhällsnytta. Tråden delar sig i två trådar som korsas i mitten och går ihop igen.
 * Varje ord ligger i en egen ögla. Under 700 px står figuren upprätt, från 700 px ligger den ned.
 * Banorna ritas i ordning: in, de två trådarna samtidigt, ut. Värdena från och till anger var i blocket varje bana ritas.
 */
export const weave = {
  narrowVb: '0 0 1000 1500',
  narrow: [
    { d: 'M25 -6 C25 100 500 60 500 150', from: 0, to: 0.12 },
    { d: 'M500 150 C1000 260 1000 640 500 750 C0 860 0 1240 500 1350', from: 0.12, to: 0.88 },
    { d: 'M500 150 C0 260 0 640 500 750 C1000 860 1000 1240 500 1350', from: 0.12, to: 0.88 },
    { d: 'M500 1350 C500 1440 25 1400 25 1506', from: 0.88, to: 1 },
  ],
  narrowPos: [[50, 30], [50, 70]],
  wideVb: '0 0 2000 700',
  wide: [
    { d: 'M1950 -6 C1950 250 1960 350 1900 350', from: 0, to: 0.3 },
    { d: 'M1900 350 C1750 40 1250 40 1000 350 C750 660 250 660 100 350', from: 0.3, to: 0.8 },
    { d: 'M1900 350 C1750 660 1250 660 1000 350 C750 40 250 40 100 350', from: 0.3, to: 0.8 },
    { d: 'M100 350 C40 350 50 450 50 550 L50 706', from: 0.8, to: 1 },
  ],
  widePos: [[27.5, 50], [72.5, 50]],
} as const;

/**
 * Horisonten. Tråden lägger sig längs blockets underkant, där himlen möter marken,
 * och löper ut ur sidan åt höger. to: 2 gör att den ritas klart först en bit efter att blocket passerat pennan.
 */
export const horizon = { d: 'M25 -6 C25 620 80 1000 300 1000 L1700 1000', from: 0, to: 2 };
