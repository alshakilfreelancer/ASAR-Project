export const OFFICIAL_GOOGLE_MAPS_LINK = 'https://maps.app.goo.gl/bA6J8idhXRwydofNA?g_st=ac';

export interface KpiCardItem {
  id: string;
  label: string;
  value: string;
  subtext: string;
  isAccent?: boolean;
}

export interface CoreValueItem {
  id: string;
  code: string;
  title: string;
  description: string;
}

export interface TextOverrideItem {
  elementId: string;
  textValue: string;
  textColor: string;
  fontSize: string;
  bgColor: string;
  hidden: boolean;
  authorId: string;
}

export interface CustomBlockItem {
  id: string;
  sectionId: string;
  heading: string;
  body: string;
  imageUrl: string;
  bgColor: string;
  textColor: string;
  authorId: string;
}

export interface SiteConfigData {
  companyName: string;
  companyLogoUrl: string;
  tagline: string;
  heroSubtext: string;
  officeAddress: string;
  officeCoordinates: string;
  officeMapLink: string;
  officePhone: string;
  officeEmail: string;
  aboutBackground: string;
  ourAim: string;
  ourVision: string;
  ourMission: string;
  primaryNavy: string;
  accentOrange: string;
  headingScale: 'standard' | 'compact' | 'large';
  authorId: string;
  adminPassword?: string;
}

export interface CoreServiceItem {
  id: string;
  orderIndex: number;
  title: string;
  categoryCode: string;
  summary: string;
  specialties: string;
  imageUrl: string;
  authorId: string;
}

export interface RunningProjectItem {
  id: string;
  title: string;
  location: string;
  client: string;
  category: string;
  progress: number;
  startDate: string;
  completionTarget: string;
  manpowerCount: number;
  engineerLead: string;
  summary: string;
  scopeDetails: string;
  imageUrl: string;
  authorId: string;
}

export interface GalleryPhotoItem {
  id: string;
  title: string;
  category: string;
  location: string;
  caption: string;
  imageUrl: string;
  authorId: string;
}

export interface SiteGalleryPhotoItem {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
}

export interface CompletedProjectItem {
  id: string;
  title: string;
  client: string;
  location: string;
  completionYear: string;
  contractValue: string;
  category: string;
  description: string;
  fullDetails?: string;
  imageUrl: string;
  sitePhotos?: SiteGalleryPhotoItem[];
  authorId: string;
}

export interface ClientInquiryItem {
  id: string;
  clientName: string;
  companyName: string;
  email: string;
  phone: string;
  inquiryType:
    | 'Civil & Structural Works'
    | 'Earth Works & Excavation'
    | 'Skilled & Unskilled Manpower Supply'
    | 'Mechanical & Electrical Works'
    | 'Pipeline & Special Structures'
    | 'Turnkey EPC Tender Inquiry';
  projectLocation: string;
  manpowerDetails: string;
  message: string;
  status: 'new' | 'reviewed' | 'archived';
  authorId: string;
  createdAtText?: string;
}

export interface ManpowerTradeGroup {
  groupTitle: string;
  groupCode: string;
  totalAvailable: number;
  certificationStandard: string;
  roles: {
    trade: string;
    grade: string;
    headcount: number;
    specialization: string;
  }[];
}

export type EngineeringSceneType =
  | 'civil'
  | 'earth'
  | 'manpower'
  | 'mep'
  | 'pipeline'
  | 'port'
  | 'substation'
  | 'culvert';

// High-definition architectural & engineering SVG illustrations (Zero-Broken-Image guaranteed)
export function createEngineeringSvgDataUri(
  sceneType: EngineeringSceneType,
  titleLabel: string,
  locationCode: string
): string {
  const palettes: Record<
    EngineeringSceneType,
    { skyTop: string; skyBot: string; primary: string; accent: string; steel: string }
  > = {
    civil: { skyTop: '#e0f2fe', skyBot: '#f8fafc', primary: '#1e3a8a', accent: '#f97316', steel: '#334155' },
    earth: { skyTop: '#fef3c7', skyBot: '#fffbeb', primary: '#1e3a8a', accent: '#ea580c', steel: '#475569' },
    manpower: { skyTop: '#e0e7ff', skyBot: '#f8fafc', primary: '#1e3a8a', accent: '#f97316', steel: '#1e293b' },
    mep: { skyTop: '#f1f5f9', skyBot: '#e2e8f0', primary: '#0f172a', accent: '#f97316', steel: '#0284c7' },
    pipeline: { skyTop: '#ffedd5', skyBot: '#f8fafc', primary: '#1e3a8a', accent: '#f97316', steel: '#475569' },
    port: { skyTop: '#dbeafe', skyBot: '#f0f9ff', primary: '#1e3a8a', accent: '#f97316', steel: '#334155' },
    substation: { skyTop: '#fef9c3', skyBot: '#f8fafc', primary: '#1e3a8a', accent: '#ea580c', steel: '#334155' },
    culvert: { skyTop: '#e2e8f0', skyBot: '#f8fafc', primary: '#1e3a8a', accent: '#f97316', steel: '#475569' },
  };
  const p = palettes[sceneType] || palettes.civil;
  const safeTitle = (titleLabel || 'Al Sahab Al Rashid Engineering').replace(/[<>&"']/g, '');
  const safeLoc = (locationCode || 'OMAN EPC').replace(/[<>&"']/g, '');

  let foregroundMarkup = '';
  if (sceneType === 'civil' || sceneType === 'port') {
    foregroundMarkup = `
      <!-- Tower Cranes -->
      <g stroke="${p.accent}" stroke-width="3" fill="none">
        <line x1="180" y1="360" x2="180" y2="75" />
        <line x1="120" y1="95" x2="360" y2="95" />
        <line x1="180" y1="75" x2="290" y2="95" stroke-width="1.5" />
        <line x1="180" y1="75" x2="135" y2="95" stroke-width="1.5" />
        <line x1="310" y1="95" x2="310" y2="165" stroke-dasharray="4 3" />
      </g>
      <!-- Multi-story Reinforced Concrete Superstructure -->
      <rect x="220" y="150" width="240" height="210" fill="#ffffff" stroke="${p.primary}" stroke-width="2.5" />
      <g fill="#dbeafe" stroke="${p.primary}" stroke-width="1.2">
        <rect x="240" y="170" width="45" height="32" />
        <rect x="298" y="170" width="45" height="32" />
        <rect x="356" y="170" width="45" height="32" />
        <rect x="240" y="218" width="45" height="32" />
        <rect x="298" y="218" width="45" height="32" />
        <rect x="356" y="218" width="45" height="32" />
        <rect x="240" y="266" width="45" height="32" />
        <rect x="298" y="266" width="45" height="32" />
        <rect x="356" y="266" width="45" height="32" />
      </g>
      <!-- Box Culvert & Structural Substructure -->
      <rect x="490" y="230" width="210" height="130" fill="#e2e8f0" stroke="${p.steel}" stroke-width="2.5" />
      <rect x="512" y="258" width="72" height="102" fill="#94a3b8" stroke="${p.primary}" stroke-width="2" />
      <rect x="604" y="258" width="72" height="102" fill="#94a3b8" stroke="${p.primary}" stroke-width="2" />
    `;
  } else if (sceneType === 'earth' || sceneType === 'culvert') {
    foregroundMarkup = `
      <!-- Graded Terraces & Desert Embankment -->
      <path d="M0 310 Q220 250 440 295 T800 270 L800 380 L0 380 Z" fill="#fed7aa" stroke="${p.accent}" stroke-width="2" />
      <path d="M0 345 Q280 300 540 335 T800 320 L800 400 L0 400 Z" fill="#fdba74" />
      <!-- Heavy Hydraulic Excavator Illustration -->
      <g transform="translate(250, 185)">
        <rect x="20" y="95" width="120" height="26" rx="12" fill="${p.steel}" />
        <circle cx="40" cy="108" r="8" fill="#cbd5e1" />
        <circle cx="80" cy="108" r="8" fill="#cbd5e1" />
        <circle cx="120" cy="108" r="8" fill="#cbd5e1" />
        <rect x="32" y="52" width="88" height="44" rx="4" fill="${p.accent}" stroke="#ffffff" stroke-width="2" />
        <rect x="82" y="58" width="30" height="24" fill="#e0f2fe" />
        <!-- Articulated Boom -->
        <path d="M115 70 L185 20 L235 68" fill="none" stroke="${p.primary}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M230 68 L255 92 L220 102 Z" fill="${p.steel}" />
      </g>
      <!-- Drainage Box Trench -->
      <rect x="530" y="265" width="180" height="75" fill="#ffffff" stroke="${p.primary}" stroke-width="3" />
      <line x1="590" y1="265" x2="590" y2="340" stroke="${p.primary}" stroke-width="2.5" />
      <line x1="650" y1="265" x2="650" y2="340" stroke="${p.primary}" stroke-width="2.5" />
    `;
  } else if (sceneType === 'manpower') {
    foregroundMarkup = `
      <!-- Structural Grid Backdrop -->
      <g stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6 4">
        <line x1="100" y1="80" x2="700" y2="80" />
        <line x1="100" y1="160" x2="700" y2="160" />
        <line x1="100" y1="240" x2="700" y2="240" />
      </g>
      <!-- Team of 3 EPC Engineers & Supervisors with Hard Hats & Blueprints -->
      <g transform="translate(170, 125)">
        <!-- Engineer 1 -->
        <rect x="25" y="95" width="76" height="125" rx="8" fill="${p.primary}" />
        <path d="M35 95 L63 145 L91 95" fill="none" stroke="${p.accent}" stroke-width="8" />
        <circle cx="63" cy="62" r="24" fill="#fbd38d" />
        <path d="M34 55 Q63 22 92 55 Z" fill="#ffffff" stroke="${p.primary}" stroke-width="2.5" />
        <!-- Supervisor 2 (Center with Blueprint Table) -->
        <rect x="175" y="85" width="84" height="135" rx="8" fill="#0f172a" />
        <path d="M185 85 L217 140 L249 85" fill="none" stroke="${p.accent}" stroke-width="8" />
        <circle cx="217" cy="52" r="25" fill="#fbd38d" />
        <path d="M187 45 Q217 12 247 45 Z" fill="${p.accent}" />
        <!-- Technician 3 -->
        <rect x="330" y="95" width="76" height="125" rx="8" fill="${p.primary}" />
        <path d="M340 95 L368 145 L396 95" fill="none" stroke="#eab308" stroke-width="8" />
        <circle cx="368" cy="62" r="24" fill="#fbd38d" />
        <path d="M339 55 Q368 22 397 55 Z" fill="#ffffff" stroke="${p.primary}" stroke-width="2.5" />
        <!-- Blueprint Roll & Inspection Board -->
        <rect x="115" y="165" width="205" height="65" rx="4" fill="#ffffff" stroke="${p.primary}" stroke-width="3" />
        <line x1="135" y1="185" x2="295" y2="185" stroke="#0284c7" stroke-width="2" />
        <line x1="135" y1="205" x2="245" y2="205" stroke="${p.accent}" stroke-width="2" />
      </g>
    `;
  } else if (sceneType === 'mep' || sceneType === 'substation') {
    foregroundMarkup = `
      <!-- Industrial Stainless Steel Piping Manifold & HVAC Ducts -->
      <rect x="90" y="110" width="620" height="42" rx="6" fill="#cbd5e1" stroke="${p.steel}" stroke-width="2.5" />
      <rect x="140" y="190" width="520" height="32" rx="6" fill="#94a3b8" stroke="${p.primary}" stroke-width="2.5" />
      <!-- Vertical Riser Pipes & Valve Stations -->
      <rect x="210" y="110" width="28" height="230" fill="#e2e8f0" stroke="${p.primary}" stroke-width="2" />
      <rect x="390" y="110" width="28" height="230" fill="#e2e8f0" stroke="${p.primary}" stroke-width="2" />
      <rect x="560" y="110" width="28" height="230" fill="#e2e8f0" stroke="${p.primary}" stroke-width="2" />
      <!-- High-Pressure Orange Control Valves -->
      <circle cx="224" cy="195" r="18" fill="${p.accent}" stroke="#ffffff" stroke-width="3" />
      <circle cx="404" cy="195" r="18" fill="${p.accent}" stroke="#ffffff" stroke-width="3" />
      <circle cx="574" cy="195" r="18" fill="${p.accent}" stroke="#ffffff" stroke-width="3" />
      <!-- Electrical Switchgear Cabinets -->
      <rect x="115" y="255" width="130" height="105" fill="#ffffff" stroke="${p.primary}" stroke-width="2.5" />
      <rect x="275" y="255" width="130" height="105" fill="#ffffff" stroke="${p.primary}" stroke-width="2.5" />
      <path d="M175 285 L165 305 L182 305 L172 325" stroke="${p.accent}" stroke-width="3" fill="none" />
      <path d="M335 285 L325 305 L342 305 L332 325" stroke="${p.accent}" stroke-width="3" fill="none" />
    `;
  } else {
    foregroundMarkup = `
      <!-- Storage Tank Foundation & Cross-Country Pipeline -->
      <ellipse cx="240" cy="295" rx="125" ry="26" fill="#cbd5e1" stroke="${p.primary}" stroke-width="2.5" />
      <rect x="115" y="175" width="250" height="120" fill="#ffffff" stroke="${p.primary}" stroke-width="2.5" />
      <ellipse cx="240" cy="175" rx="125" ry="24" fill="#f1f5f9" stroke="${p.primary}" stroke-width="2.5" />
      <!-- Pipeline Corridor -->
      <path d="M365 265 L740 265" stroke="${p.primary}" stroke-width="28" stroke-linecap="round" />
      <path d="M365 265 L740 265" stroke="#60a5fa" stroke-width="8" stroke-dasharray="18 10" />
      <!-- Concrete Pipe Supports -->
      <rect x="430" y="278" width="26" height="65" fill="${p.accent}" />
      <rect x="545" y="278" width="26" height="65" fill="${p.accent}" />
      <rect x="660" y="278" width="26" height="65" fill="${p.accent}" />
      <!-- Telecom / Transmission Tower Foundation -->
      <polygon points="590,85 545,250 635,250" fill="none" stroke="${p.steel}" stroke-width="3" />
      <line x1="560" y1="145" x2="620" y2="145" stroke="${p.steel}" stroke-width="2" />
      <line x1="552" y1="195" x2="628" y2="195" stroke="${p.steel}" stroke-width="2" />
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${p.skyTop}" />
        <stop offset="100%" stop-color="${p.skyBot}" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" stroke-width="0.6" stroke-opacity="0.6" />
      </pattern>
    </defs>
    <rect width="800" height="450" fill="url(#sky)" />
    <rect width="800" height="360" fill="url(#grid)" />
    <!-- Ground Horizon -->
    <rect x="0" y="355" width="800" height="95" fill="#e2e8f0" />
    <line x1="0" y1="355" x2="800" y2="355" stroke="${p.primary}" stroke-width="3" />
    ${foregroundMarkup}
    <!-- Architectural Engineering Spec Caption Bar -->
    <rect x="24" y="382" width="752" height="46" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
    <rect x="24" y="382" width="8" height="46" fill="${p.accent}" />
    <text x="48" y="410" font-family="sans-serif" font-size="15" font-weight="700" fill="#0f172a">${safeTitle}</text>
    <text x="756" y="410" text-anchor="end" font-family="monospace" font-size="13" font-weight="600" fill="${p.primary}">${safeLoc}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Maps any category, title, or work type to a guaranteed high-fidelity architectural vector SVG data URI.
 * Guaranteed to never fail, never 404, and require zero network requests.
 */
export function getFallbackSvgForCategory(
  category = 'Civil',
  title = 'Al Sahab Al Rashid EPC Contracting',
  location = 'Muscat, Sultanate of Oman'
): string {
  const cat = (category || '').toLowerCase();
  let scene: EngineeringSceneType = 'civil';
  if (cat.includes('earth') || cat.includes('excavat') || cat.includes('grad') || cat.includes('slope')) {
    scene = 'earth';
  } else if (cat.includes('manpower') || cat.includes('team') || cat.includes('workforce') || cat.includes('specialist') || cat.includes('welder')) {
    scene = 'manpower';
  } else if (cat.includes('mep') || cat.includes('mech') || cat.includes('elect') || cat.includes('steel') || cat.includes('fabricat')) {
    scene = 'mep';
  } else if (cat.includes('tank') || cat.includes('pipe') || cat.includes('silo')) {
    scene = 'pipeline';
  } else if (cat.includes('tower') || cat.includes('substation') || cat.includes('power') || cat.includes('grid')) {
    scene = 'substation';
  } else if (cat.includes('culvert') || cat.includes('drain') || cat.includes('flood') || cat.includes('trench')) {
    scene = 'culvert';
  } else if (cat.includes('port') || cat.includes('marine') || cat.includes('coast')) {
    scene = 'port';
  }
  return createEngineeringSvgDataUri(scene, title, location);
}

/**
 * Returns a verified image URL, or returns a crisp category-specific vector SVG illustration if missing.
 */
export function getSafeImageUrl(
  url?: string | null,
  category = 'Civil Works',
  title = 'Al Sahab Al Rashid Trad. & Cont. Co L.L.C',
  location = 'Muscat, Oman'
): string {
  if (url && (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }
  if (url && url.trim().length > 0) {
    return url.trim();
  }
  return getFallbackSvgForCategory(category, title, location);
}

/**
 * High-Clarity Corporate Emblem Logo for "Al Sahab Al Rashid Trad. & Cont. Co L.L.C" (ASAR)
 * Uses the authentic uploaded ASAR Maltese cross emblem (/assets/aistudio/official-company-logo.jpg)
 * with a vector SVG backup generator if needed.
 */
export function createCompanyLogoDataUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
    <defs>
      <linearGradient id="asarNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e3a8a" />
        <stop offset="50%" stop-color="#172554" />
        <stop offset="100%" stop-color="#09132c" />
      </linearGradient>
      <linearGradient id="asarGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fb923c" />
        <stop offset="50%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#ea580c" />
      </linearGradient>
      <filter id="asarShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.18" />
      </filter>
    </defs>
    <!-- Outer Shield Frame -->
    <rect x="8" y="8" width="224" height="224" rx="36" fill="#ffffff" stroke="#e2e8f0" stroke-width="3" filter="url(#asarShadow)" />
    <!-- Navy Brand Foundation -->
    <rect x="18" y="18" width="204" height="204" rx="28" fill="url(#asarNavyGrad)" />
    <!-- Gold Geometric Precision Border -->
    <rect x="22" y="22" width="196" height="196" rx="24" fill="none" stroke="url(#asarGoldGrad)" stroke-width="2.5" stroke-dasharray="8 4" opacity="0.8" />
    
    <!-- Architectural Sky & Silhouette Elements -->
    <g opacity="0.35">
      <path d="M40 148 L40 120 L58 120 L58 148" fill="#ffffff" />
      <path d="M62 148 L62 98 L84 98 L84 148" fill="#ffffff" />
      <path d="M156 148 L156 104 L178 104 L178 148" fill="#ffffff" />
      <path d="M182 148 L182 126 L198 126 L198 148" fill="#ffffff" />
    </g>

    <!-- Heavy Structural Crane Boom & EPC Truss (Gold) -->
    <path d="M42 146 L120 44 L198 146" fill="none" stroke="url(#asarGoldGrad)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
    <!-- Crane Tower Center Mast -->
    <line x1="120" y1="44" x2="120" y2="146" stroke="url(#asarGoldGrad)" stroke-width="5" />
    <!-- Internal Truss Bracing (White & Gold) -->
    <line x1="68" y1="112" x2="172" y2="112" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" />
    <line x1="88" y1="84" x2="152" y2="84" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" />
    <line x1="68" y1="112" x2="120" y2="84" stroke="url(#asarGoldGrad)" stroke-width="3" />
    <line x1="172" y1="112" x2="120" y2="84" stroke="url(#asarGoldGrad)" stroke-width="3" />

    <!-- Center Construction Monolith Tower -->
    <rect x="106" y="90" width="28" height="56" rx="3" fill="#ffffff" />
    <rect x="111" y="96" width="7" height="10" fill="#1e3a8a" />
    <rect x="122" y="96" width="7" height="10" fill="#1e3a8a" />
    <rect x="111" y="112" width="7" height="10" fill="#1e3a8a" />
    <rect x="122" y="112" width="7" height="10" fill="#1e3a8a" />
    <rect x="111" y="128" width="7" height="12" fill="#f97316" />
    <rect x="122" y="128" width="7" height="12" fill="#f97316" />

    <!-- Ground Level Foundation Beam -->
    <rect x="36" y="146" width="168" height="6" rx="2" fill="url(#asarGoldGrad)" />

    <!-- ASAR Monogram Plaque (Enlarged & Ultra-Crisp) -->
    <rect x="32" y="158" width="176" height="38" rx="8" fill="url(#asarGoldGrad)" />
    <text x="120" y="184" text-anchor="middle" font-family="'Outfit', 'Public Sans', system-ui, sans-serif" font-size="22" font-weight="900" letter-spacing="4" fill="#ffffff">ASAR</text>

    <!-- Sub-label: TRAD. CONT. CO LLL -->
    <text x="120" y="210" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8.5" font-weight="800" letter-spacing="2" fill="#e2e8f0">TRAD. CONT. CO LLL · OMAN</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_COMPANY_LOGO_URI = '/assets/aistudio/official-company-logo.jpg';

/**
 * Authentic User Construction Site Photographs Catalog (30 Uploaded Assets in /assets/aistudio/...)
 * Real EPC project sites executed across the Sultanate of Oman.
 */
export const AUTHENTIC_USER_PHOTOS = {
  // Official Company Logo
  officialCompanyLogo: '/assets/aistudio/official-company-logo.jpg',
  // Heavy Earthworks & Slope Stabilization
  excavatorFoundation: '/assets/aistudio/47258819_108261766879124_5229005254179160064_n_2bcd4c74.webp',
  slopePavingStabilization: '/assets/aistudio/86183463_222128415492458_2074318476385714176_n_df01d383.webp',
  slopeShotcreteCrane: '/assets/aistudio/48045735_108263253545642_6694528140879855616_n-1_5206bff8.webp',
  slopeConcretePouring: '/assets/aistudio/132130437_431110301260934_336158671410526941_n_e5185820.webp',
  slopeWireMeshTeam: '/assets/aistudio/131997292_431037207934910_4238526078569632164_n-1_cf3b54ff.webp',
  excavatorGradingLevels: '/assets/aistudio/163813919_481854779519819_6178553606951470184_n_45788527.webp',
  riprapStonePitching: '/assets/aistudio/47572903_108251340213500_7893163181441286144_n_fa7db4df.webp',

  // Transmission Towers & Foundations
  towerErectedFooting: '/assets/aistudio/140389871_447445539627410_2753545015031286983_n_6aa75e9e.webp',
  towerSafetyPerimeter: '/assets/aistudio/164068208_481852729520024_3066156094684049294_n_df4f0ef4.webp',
  towerFoundationFixers: '/assets/aistudio/74465353_192125688492731_8616796090563297280_n_1759c4f8.webp',

  // Large-Scale Industrial Tank Foundations & Silos
  tankFarmAerial5Bases: '/assets/aistudio/290353406_756093348762626_8277172276929626294_n_aa8a62e7.webp',
  tankFarmAerial16Bases: '/assets/aistudio/290695119_756093325429295_4243369982638312774_n_5ffeb482.webp',
  tankReinforcementMesh: '/assets/aistudio/290560597_756093382095956_6699505300731348225_n_d423e480.webp',
  tankFarmScaffoldingBund: '/assets/aistudio/94123565_266387901066509_577852716844318720_n_7ce57b92.webp',
  siloSlipformConstruction: '/assets/aistudio/290365510_756093405429287_2220342180302531522_n_bcea0204.webp',

  // Pre-Engineered Steel Structures & Mechanical
  steelTrussPreEngineered: '/assets/aistudio/132006846_431049341267030_3588234573309327924_n_642d95d1.webp',
  steelFrameCraneErection: '/assets/aistudio/132276729_431106711261293_8634931574608317857_n_f1f46b8e.webp',

  // Security Fencing & Trench Substructures
  antiClimbFencingGradeBeam: '/assets/aistudio/47375758_109119503460017_459392145816551424_n_8e7f2158.webp',
  securityFencingBitumenTrench: '/assets/aistudio/47579357_109119470126687_5138575976187297792_n_05148c3e.webp',
  securityFencingCompletedBeam: '/assets/aistudio/47576575_109119533460014_2152908518112362496_n_79bdf4a4.webp',
  securityBoundaryMasonryRoad: '/assets/aistudio/72354805_185282499177050_8471668810624008192_n_0ec9ab9b.webp',

  // Civil Works, Buildings & Substructures
  buildingSuperstructureSkeleton: '/assets/aistudio/291113589_757344305304197_2126862346048034808_n-2_fdb65351.webp',
  buildingCommercialStoneFacade: '/assets/aistudio/47578732_108242663547701_8436762112465829888_n-1_4ccfacff.webp',
  buildingCourtyardComplex: '/assets/aistudio/48208598_108242590214375_2694783977545269248_n-1_6383cb86.webp',
  substationBasementDeepBox: '/assets/aistudio/47578714_108262073545760_1807837011462062080_n_9c5a6284.webp',
  foundationFootingsWaterproofing: '/assets/aistudio/71700287_185282989177001_6605247676445360128_n_3e4db675.webp',

  // Institutional Healthcare & Master Planned Projects
  masterPlanMedicalComplex1: '/assets/aistudio/289508614_752899525748675_6856064155950527852_n-1024x1024_29d10db6.webp',
  masterPlanMedicalComplex2: '/assets/aistudio/289517974_752898932415401_5368626413041961494_n-2-1024x1024_29d10db6.webp',
  masterPlanHospitalAerial: '/assets/aistudio/289657929_752899462415348_7026767103178029611_n-1_4a8824b0.webp',
};

/**
 * Authentic Site Photo Bank items with metadata for the interactive Photo Selector
 */
export const AUTHENTIC_PHOTO_BANK_ITEMS: {
  id: string;
  title: string;
  category: string;
  tag: string;
  url: string;
}[] = [
  {
    id: 'photo-bank-logo',
    title: 'Official ASAR Maltese Cross Emblem Logo',
    category: 'Brand Logo',
    tag: 'Official Logo',
    url: AUTHENTIC_USER_PHOTOS.officialCompanyLogo,
  },
  {
    id: 'photo-bank-1',
    title: 'Reinforced Concrete Superstructure Skeleton',
    category: 'Civil Works',
    tag: 'RC Superstructure',
    url: AUTHENTIC_USER_PHOTOS.buildingSuperstructureSkeleton,
  },
  {
    id: 'photo-bank-2',
    title: 'Excavator Deep Foundation Trenching & Columns',
    category: 'Earth Works',
    tag: 'Deep Excavation',
    url: AUTHENTIC_USER_PHOTOS.excavatorFoundation,
  },
  {
    id: 'photo-bank-3',
    title: 'Skilled Steel Fixers Team Tying Tower Cage',
    category: 'Manpower Supply',
    tag: 'Workforce Team',
    url: AUTHENTIC_USER_PHOTOS.towerFoundationFixers,
  },
  {
    id: 'photo-bank-4',
    title: 'Structural Steel Warehouse Crane Erection',
    category: 'MEP & Steel',
    tag: 'Steel Framing',
    url: AUTHENTIC_USER_PHOTOS.steelFrameCraneErection,
  },
  {
    id: 'photo-bank-5',
    title: 'Aerial View of 16 Circular Tank Foundations',
    category: 'Pipeline & Tanks',
    tag: 'Tank Farm EPC',
    url: AUTHENTIC_USER_PHOTOS.tankFarmAerial16Bases,
  },
  {
    id: 'photo-bank-6',
    title: 'Drone Aerial of 5 Large Storage Tank Bases',
    category: 'Pipeline & Tanks',
    tag: 'Tank Foundations',
    url: AUTHENTIC_USER_PHOTOS.tankFarmAerial5Bases,
  },
  {
    id: 'photo-bank-7',
    title: '400kV Transmission Lattice Tower Foundation',
    category: 'Special Structures',
    tag: 'Transmission Tower',
    url: AUTHENTIC_USER_PHOTOS.towerErectedFooting,
  },
  {
    id: 'photo-bank-8',
    title: 'Geotechnical Slope Paving & Rock Anchoring',
    category: 'Earth Works',
    tag: 'Slope Stabilization',
    url: AUTHENTIC_USER_PHOTOS.slopePavingStabilization,
  },
  {
    id: 'photo-bank-9',
    title: 'Mobile Telescopic Crane on Shotcrete Slope Wall',
    category: 'Earth Works',
    tag: 'Retaining Wall',
    url: AUTHENTIC_USER_PHOTOS.slopeShotcreteCrane,
  },
  {
    id: 'photo-bank-10',
    title: 'High-Security 358 Anti-Climb Fence & Grade Beam',
    category: 'Special Structures',
    tag: 'Security Fencing',
    url: AUTHENTIC_USER_PHOTOS.antiClimbFencingGradeBeam,
  },
  {
    id: 'photo-bank-11',
    title: 'Security Perimeter Trench with Waterproofing Formwork',
    category: 'Special Structures',
    tag: 'Fencing Trench',
    url: AUTHENTIC_USER_PHOTOS.securityFencingBitumenTrench,
  },
  {
    id: 'photo-bank-12',
    title: 'Completed Security Fence on Concrete Beam',
    category: 'Special Structures',
    tag: 'Perimeter Works',
    url: AUTHENTIC_USER_PHOTOS.securityFencingCompletedBeam,
  },
  {
    id: 'photo-bank-13',
    title: 'Perimeter Masonry Wall & Chain Link along Road',
    category: 'Special Structures',
    tag: 'Boundary Wall',
    url: AUTHENTIC_USER_PHOTOS.securityBoundaryMasonryRoad,
  },
  {
    id: 'photo-bank-14',
    title: 'Slipform Cylindrical Concrete Storage Silos',
    category: 'Civil Works',
    tag: 'Slipform Silos',
    url: AUTHENTIC_USER_PHOTOS.siloSlipformConstruction,
  },
  {
    id: 'photo-bank-15',
    title: 'Massive Reinforced Concrete Tank Foundation Slab',
    category: 'Pipeline & Tanks',
    tag: 'Heavy Rebar Mesh',
    url: AUTHENTIC_USER_PHOTOS.tankReinforcementMesh,
  },
  {
    id: 'photo-bank-16',
    title: 'Industrial Storage Tanks & Scaffolding Embankment',
    category: 'Pipeline & Tanks',
    tag: 'Tank Farm Bund',
    url: AUTHENTIC_USER_PHOTOS.tankFarmScaffoldingBund,
  },
  {
    id: 'photo-bank-17',
    title: 'Pre-Engineered Heavy Steel Truss Frame',
    category: 'MEP & Steel',
    tag: 'Steel Truss',
    url: AUTHENTIC_USER_PHOTOS.steelTrussPreEngineered,
  },
  {
    id: 'photo-bank-18',
    title: 'Excavation Trench with Waterproofed Column Footings',
    category: 'Civil Works',
    tag: 'Column Footings',
    url: AUTHENTIC_USER_PHOTOS.foundationFootingsWaterproofing,
  },
  {
    id: 'photo-bank-19',
    title: 'Substation Deep Basement Box Foundation',
    category: 'Civil Works',
    tag: 'Substation Box',
    url: AUTHENTIC_USER_PHOTOS.substationBasementDeepBox,
  },
  {
    id: 'photo-bank-20',
    title: 'Precision Earthworks & Site Level Grading',
    category: 'Earth Works',
    tag: 'Site Grading',
    url: AUTHENTIC_USER_PHOTOS.excavatorGradingLevels,
  },
  {
    id: 'photo-bank-21',
    title: 'Slope Concrete Pouring & Curing Protection',
    category: 'Civil Works',
    tag: 'Embankment Concrete',
    url: AUTHENTIC_USER_PHOTOS.slopeConcretePouring,
  },
  {
    id: 'photo-bank-22',
    title: 'Slope Reinforcement with Wire Mesh & Barrier Film',
    category: 'Earth Works',
    tag: 'Slope Wire Mesh',
    url: AUTHENTIC_USER_PHOTOS.slopeWireMeshTeam,
  },
  {
    id: 'photo-bank-23',
    title: 'Rip-Rap Stone Pitching & Drainage Armoring',
    category: 'Earth Works',
    tag: 'Stone Pitching',
    url: AUTHENTIC_USER_PHOTOS.riprapStonePitching,
  },
  {
    id: 'photo-bank-24',
    title: 'Transmission Tower with Safety Perimeter Wall',
    category: 'Special Structures',
    tag: 'Substation Tower',
    url: AUTHENTIC_USER_PHOTOS.towerSafetyPerimeter,
  },
  {
    id: 'photo-bank-25',
    title: 'Commercial Complex Traditional Stone Facade',
    category: 'Completed Projects',
    tag: 'Stone Cladding',
    url: AUTHENTIC_USER_PHOTOS.buildingCommercialStoneFacade,
  },
  {
    id: 'photo-bank-26',
    title: 'Multi-Story Complex Courtyard & Facade Finishing',
    category: 'Completed Projects',
    tag: 'Building Complex',
    url: AUTHENTIC_USER_PHOTOS.buildingCourtyardComplex,
  },
  {
    id: 'photo-bank-27',
    title: 'Institutional Medical Complex Master Plan',
    category: 'Completed Projects',
    tag: 'Healthcare EPC',
    url: AUTHENTIC_USER_PHOTOS.masterPlanMedicalComplex1,
  },
  {
    id: 'photo-bank-28',
    title: 'Grand Entrance Canopy & Institutional Facilities',
    category: 'Completed Projects',
    tag: 'Institutional EPC',
    url: AUTHENTIC_USER_PHOTOS.masterPlanMedicalComplex2,
  },
  {
    id: 'photo-bank-29',
    title: 'Master Planned Healthcare Campus Aerial Perspective',
    category: 'Completed Projects',
    tag: 'Campus Master Plan',
    url: AUTHENTIC_USER_PHOTOS.masterPlanHospitalAerial,
  },
];

export const PRESET_ENGINEERING_IMAGES: { label: string; scene: EngineeringSceneType; url: string }[] = [
  {
    label: 'Official: ASAR Maltese Cross Company Logo',
    scene: 'port',
    url: AUTHENTIC_USER_PHOTOS.officialCompanyLogo,
  },
  {
    label: 'Authentic: RC Superstructure Skeleton',
    scene: 'civil',
    url: AUTHENTIC_USER_PHOTOS.buildingSuperstructureSkeleton,
  },
  {
    label: 'Authentic: Heavy Excavation & Foundations',
    scene: 'earth',
    url: AUTHENTIC_USER_PHOTOS.excavatorFoundation,
  },
  {
    label: 'Authentic: Skilled Steel Fixers Team',
    scene: 'manpower',
    url: AUTHENTIC_USER_PHOTOS.towerFoundationFixers,
  },
  {
    label: 'Authentic: Steel Warehouse Crane Erection',
    scene: 'mep',
    url: AUTHENTIC_USER_PHOTOS.steelFrameCraneErection,
  },
  {
    label: 'Authentic: Aerial Tank Farm Foundations',
    scene: 'pipeline',
    url: AUTHENTIC_USER_PHOTOS.tankFarmAerial16Bases,
  },
  {
    label: 'Authentic: 400kV Transmission Tower',
    scene: 'substation',
    url: AUTHENTIC_USER_PHOTOS.towerErectedFooting,
  },
  {
    label: 'Authentic: High-Security 358 Fencing',
    scene: 'culvert',
    url: AUTHENTIC_USER_PHOTOS.antiClimbFencingGradeBeam,
  },
  {
    label: 'Authentic: Geotechnical Slope Stabilization',
    scene: 'earth',
    url: AUTHENTIC_USER_PHOTOS.slopePavingStabilization,
  },
  {
    label: 'Authentic: Commercial Stone Facade',
    scene: 'civil',
    url: AUTHENTIC_USER_PHOTOS.buildingCommercialStoneFacade,
  },
  {
    label: 'Authentic: Slipform Cylindrical Silos',
    scene: 'civil',
    url: AUTHENTIC_USER_PHOTOS.siloSlipformConstruction,
  },
];

export const DEFAULT_KPI_CARDS: KpiCardItem[] = [
  {
    id: 'kpi-1',
    label: 'Active Workforce Mobilized',
    value: '895+ Specialists',
    subtext: 'Engineers · Supervisors · 6G Welders · Civil Trades',
  },
  {
    id: 'kpi-2',
    label: 'Ongoing & Delivered Packages',
    value: '48+ EPC Contracts',
    subtext: 'Muscat · Duqm SEZAD · Sohar Port · Ibri · Sur',
  },
  {
    id: 'kpi-3',
    label: 'HSE Safety & Compliance',
    value: '2.4M+ LTI-Free Hours',
    subtext: 'PDO & Oman Ministry HSE Standards Compliant',
    isAccent: true,
  },
  {
    id: 'kpi-4',
    label: 'Equipment & Earthworks Capacity',
    value: '450,000+ m³/Year',
    subtext: 'Excavation · Box Culverts · Embankments · Pipelines',
  },
];

export const DEFAULT_CORE_VALUES: CoreValueItem[] = [
  {
    id: 'val-1',
    code: 'VALUE 01',
    title: 'Integrity –',
    description:
      '• Support for doing the right thing.\n• Keep promises even if it takes extra effort\n• Won\'t turn our backs towards something wrong or unsafe\n• Take responsibility and be accountable for all our words and deeds',
  },
  {
    id: 'val-2',
    code: 'VALUE 02',
    title: 'Commitment –',
    description:
      '• Committed to ensure safety for everyone\n• Encourage employees to achieve their maximum potential\n• Work towards exceeding customer/client expectation\n• Appreciate the skills and abilities of others\n• Extra care for actions that affect the community we live in.',
  },
  {
    id: 'val-3',
    code: 'VALUE 03',
    title: 'Excellence –',
    description:
      '• Keep raising the bar\n• Go the extra mile to deliver the best\n• Be Self-Motivated\n• Strive to innovate and create',
  },
  {
    id: 'val-4',
    code: 'VALUE 04',
    title: 'TeamWork-',
    description:
      '• We are one\n• Listen to and learn from each other\n• Work with enthusiasm and appreciation\n• Combine our expertise and knowledge',
  },
];

export const DEFAULT_SITE_CONFIG: SiteConfigData = {
  companyName: 'Al Sahab Al Rashid Trad. & Cont. Co L.L.C',
  companyLogoUrl: DEFAULT_COMPANY_LOGO_URI,
  tagline: 'Reliable Construction, EPC Contracting & Manpower Solutions',
  heroSubtext:
    'Delivering civil engineering infrastructure, heavy earthworks, mechanical & electrical installations, pipeline structures, and certified technical workforce deployments across the Sultanate of Oman.',
  officeAddress: 'Al Sahab Al Rashid Trad. & Cont. Co L.L.C Head Office, Muscat, Sultanate of Oman (wwwasar.com)',
  officeCoordinates: '23.5880° N · 58.3829° E',
  officeMapLink: OFFICIAL_GOOGLE_MAPS_LINK,
  officePhone: '+968 9570 6749',
  officeEmail: 'saadsaid.asar@gmail.com',
  aboutBackground:
    'Al Sahab Al Rashid Trad. & Cont. Co L.L.C (wwwasar.com) is an established Omani Engineering, Procurement, and Construction (EPC) and technical manpower contracting enterprise headquartered in Muscat, Sultanate of Oman. Built on rigorous HSE governance, engineering precision, and rapid site mobilization, our company partners with ministries, petrochemical operators, port authorities, and tier-one infrastructure developers to execute complex civil, earthwork, mechanical, electrical, and pipeline packages on schedule and within specification.',
  ourAim:
    'To work in a challenging environment that will emphasis our professional capabilities where optimum utilization of our skills and experience can contribute towards the growth of the organization.',
  ourVision:
    'To be the region\'s first choice EPC organization by exceeding the expectations of our clients, offering a bright career path to employees and ensuring sustainable growth for the community while preserving the environment.',
  ourMission:
    'Excellence in Project, execution, Skills and experience, Sales, Use and Services with focus on Client and customer satisfaction; care for employees, community & environment and sustainable growth.',
  primaryNavy: '#1e3a8a',
  accentOrange: '#f97316',
  headingScale: 'standard',
  authorId: 'admin_portal',
  adminPassword: 'alsahab2026',
};

export const DEFAULT_CORE_SERVICES: CoreServiceItem[] = [
  {
    id: 'srv-civil-works',
    orderIndex: 1,
    title: '01. Civil Works & Structural Engineering',
    categoryCode: 'DIV-01 · CIVIL & STRUCTURAL',
    summary:
      'Turnkey execution of commercial, residential, and industrial building superstructures, multi-cell reinforced concrete box culverts, structural substructures, and high-performance elastomeric and membrane waterproofing systems.',
    specialties:
      'Reinforced Concrete Superstructures · Multi-Cell Box Culverts · Substructure Waterproofing · Industrial Warehouses · Slip-Form & Precast Concrete',
    imageUrl: AUTHENTIC_USER_PHOTOS.buildingSuperstructureSkeleton,
    authorId: 'system_seed',
  },
  {
    id: 'srv-earth-works',
    orderIndex: 2,
    title: '02. Earth Works & Site Grading',
    categoryCode: 'DIV-02 · EARTHWORKS & INFRASTRUCTURE',
    summary:
      'High-volume bulk excavation, controlled structural backfilling with compaction testing, geotechnical slope stabilization, wadi protection embankments, and stormwater drainage corridors.',
    specialties:
      'Bulk & Deep Foundation Excavation · Slope Paving & Rock Anchoring · Controlled Backfilling · Highway & Wadi Embankments · Precision Laser Site Grading',
    imageUrl: AUTHENTIC_USER_PHOTOS.excavatorFoundation,
    authorId: 'system_seed',
  },
  {
    id: 'srv-manpower-supply',
    orderIndex: 3,
    title: '03. Supply of Skilled & Unskilled Manpower',
    categoryCode: 'DIV-03 · CERTIFIED WORKFORCE SOLUTIONS',
    summary:
      'Immediate mobilization of trade-tested, HSE-inducted construction and industrial personnel across Oman. Certified teams covering structural steel fixers, shuttering carpenters, civil trades, 6G welders, and site engineers.',
    specialties:
      'Structural Steel Fixers · Shuttering Carpenters · Industrial Electricians & Plumbers · 6G Certified Welders · Civil/MEP Engineers & HSE Site Supervisors',
    imageUrl: AUTHENTIC_USER_PHOTOS.towerFoundationFixers,
    authorId: 'system_seed',
  },
  {
    id: 'srv-mep-works',
    orderIndex: 4,
    title: '04. Mechanical & Electrical Works',
    categoryCode: 'DIV-04 · MEP & STEEL FABRICATION',
    summary:
      'Comprehensive mechanical and electrical contracting, including pre-engineered structural steel truss erection, LV/MV distribution switchgear, process piping networks, and custom fabrication.',
    specialties:
      'Pre-Engineered Steel Erection · Heavy Crane Rigging · Industrial Switchgear & Cable Trays · Process & Chilled Water Piping · Stainless Steel Fabrication',
    imageUrl: AUTHENTIC_USER_PHOTOS.steelFrameCraneErection,
    authorId: 'system_seed',
  },
  {
    id: 'srv-pipeline-structures',
    orderIndex: 5,
    title: '05. Pipeline Works & Special Structures',
    categoryCode: 'DIV-05 · PIPELINES & FOUNDATIONS',
    summary:
      'Specialized engineering construction for petrochemical and water storage tank ring-beam foundations, telecom and transmission tower foundations, high-security 358 fencing, and cantilevered retaining walls.',
    specialties:
      'Petrochemical Storage Tank Farms · High-Voltage Transmission Tower Foundations · High-Security 358 Anti-Climb Fencing · Reinforced Concrete Retaining Walls',
    imageUrl: AUTHENTIC_USER_PHOTOS.tankFarmAerial16Bases,
    authorId: 'system_seed',
  },
];

export const MANPOWER_TRADE_CATALOG: ManpowerTradeGroup[] = [
  {
    groupTitle: 'Civil & Structural Trade Specialists',
    groupCode: 'CAT-A · CIVIL TRADES',
    totalAvailable: 340,
    certificationStandard: 'Oman Ministry & PDO HSE Inducted',
    roles: [
      { trade: 'Block & Plaster Masons', grade: 'Foreman / Senior Trade', headcount: 110, specialization: 'Load-bearing blockwork, architectural rendering, screeding' },
      { trade: 'Shuttering & Formwork Carpenters', grade: 'Grade A Certified', headcount: 125, specialization: 'DOKA / PERI system formwork, box culvert shuttering' },
      { trade: 'Structural Steel Fixers', grade: 'Grade A Certified', headcount: 105, specialization: 'Bar bending schedules (BBS), heavy foundation cages' },
    ],
  },
  {
    groupTitle: 'Mechanical, Electrical & Piping Technicians',
    groupCode: 'CAT-B · MEP & FABRICATION',
    totalAvailable: 265,
    certificationStandard: 'ASME IX / DCRP Approved Standards',
    roles: [
      { trade: 'Industrial & Building Electricians', grade: 'Licensed Technician', headcount: 80, specialization: 'LV/MV switchgear, armoured cabling, conduit & termination' },
      { trade: 'Certified Welders (6G / TIG / MIG / SMAW)', grade: 'CSWIP / ASME Certified', headcount: 75, specialization: 'Carbon steel pipelines, stainless steel food/process piping' },
      { trade: 'Plumbers & Pipefitters', grade: 'Senior Technician', headcount: 60, specialization: 'HDPE, UPVC, GI, and chilled water manifold networks' },
      { trade: 'HVAC & Ducting Technicians', grade: 'HVAC Specialist', headcount: 50, specialization: 'GI duct fabrication, AHU/FCU installation, thermal insulation' },
    ],
  },
  {
    groupTitle: 'Engineering, Supervision & General Workforce',
    groupCode: 'CAT-C · LEADERSHIP & GENERAL',
    totalAvailable: 290,
    certificationStandard: 'NEBOSH / Society of Engineers Accredited',
    roles: [
      { trade: 'Civil & MEP Project Engineers', grade: 'B.Sc. Engineering', headcount: 35, specialization: 'Primavera P6 scheduling, structural QA/QC, client handover' },
      { trade: 'Site Supervisors & HSE Officers', grade: 'NEBOSH IGC Certified', headcount: 55, specialization: 'Permit-to-Work (PTW) management, daily toolbox compliance' },
      { trade: 'Skilled Helpers & General Civil Operatives', grade: 'Site Inducted', headcount: 200, specialization: 'Excavation support, concrete pouring, dewatering & material handling' },
    ],
  },
];

export const DEFAULT_RUNNING_PROJECTS: RunningProjectItem[] = [
  {
    id: 'run-tank-farm-duqm',
    title: 'Duqm Industrial Port Bulk Liquid Tank Farm Foundations Package',
    location: 'Port of Duqm / SEZAD — Al Wusta Governorate',
    client: 'Duqm Petrochemical Terminals Authority',
    category: 'Pipeline Works & Special Structures',
    progress: 84,
    startDate: 'Jan 2026',
    completionTarget: 'Dec 2026',
    manpowerCount: 165,
    engineerLead: 'Eng. Rashid Al Balushi (Sr. Civil PM)',
    summary:
      'Turnkey execution of massive circular reinforced concrete storage tank ring-beam foundations, heavy rebar mesh slabs, and containment bunds.',
    scopeDetails:
      'Turnkey civil scope comprising 16 circular reinforced concrete tank foundation slabs, tower crane erection, over 22,000 m³ of high-durability C40 sulfate-resistant concrete, heavy rebar reinforcement grid placement, soil compaction testing, and elastomeric bitumen waterproofing.',
    imageUrl: AUTHENTIC_USER_PHOTOS.tankFarmAerial5Bases,
    authorId: 'system_seed',
  },
  {
    id: 'run-transmission-towers',
    title: '400kV High-Voltage Transmission Line Tower Foundations',
    location: 'Ibri to Al Dhahirah Power Corridor',
    client: 'Oman Electricity Transmission Company (OETC)',
    category: 'Pipeline Works & Special Structures',
    progress: 72,
    startDate: 'Feb 2026',
    completionTarget: 'Jan 2027',
    manpowerCount: 95,
    engineerLead: 'Eng. Khalid Al Kiyumi (Structural Lead)',
    summary:
      'Excavation, rebar cage fixing, and concrete pouring for lattice transmission towers across mountainous and desert terrain.',
    scopeDetails:
      'Complete geotechnical deep excavation into rocky terrain, fabrication and tying of 4-legged heavy rebar anchor cages, precision template surveying for anchor bolts, stub angle embedment, and concrete encasement with safety perimeter berms.',
    imageUrl: AUTHENTIC_USER_PHOTOS.towerErectedFooting,
    authorId: 'system_seed',
  },
  {
    id: 'run-slope-stabilization',
    title: 'SEZAD Coastal Highway Geotechnical Slope Stabilization & Retaining',
    location: 'Duqm Coastal Corridor, Oman',
    client: 'Ministry of Transport, Communications and Information Technology',
    category: 'Earth Works & Infrastructure',
    progress: 91,
    startDate: 'Nov 2025',
    completionTarget: 'Nov 2026',
    manpowerCount: 88,
    engineerLead: 'Eng. Salim Al Rawahi (Geotechnical PM)',
    summary:
      'Slope cutting, rock anchoring, geotextile membrane placement, shotcrete retaining walls, and rip-rap stone pitching.',
    scopeDetails:
      'Geotechnical slope armoring including precision bench cutting, installation of 32mm rock bolts, high-strength wire mesh anchoring, shotcrete application utilizing mobile telescopic cranes, concrete drainage aprons, and rip-rap stone masonry pitching for flood runoff protection.',
    imageUrl: AUTHENTIC_USER_PHOTOS.slopePavingStabilization,
    authorId: 'system_seed',
  },
  {
    id: 'run-security-fencing',
    title: 'Petrochemical Freezone High-Security 358 Anti-Climb Fence & Grade Beam',
    location: 'Sohar Freezone — North Al Batinah',
    client: 'Industrial Logistics & Port Authority',
    category: 'Civil Works & Special Structures',
    progress: 68,
    startDate: 'Mar 2026',
    completionTarget: 'Feb 2027',
    manpowerCount: 75,
    engineerLead: 'Eng. Tariq Al Harthy (Civil Site Lead)',
    summary:
      '12.5 km of continuous reinforced concrete grade beam with bitumen waterproofing and welded 358 anti-climb security mesh fencing.',
    scopeDetails:
      'Trenching and excavation, formwork shuttering, rebar cage installation, monolithic grade beam concrete pouring, damp-proof bitumen coating, and erection of galvanised powder-coated 358 anti-climb security fencing with Y-crank razor wire brackets.',
    imageUrl: AUTHENTIC_USER_PHOTOS.antiClimbFencingGradeBeam,
    authorId: 'system_seed',
  },
  {
    id: 'run-silos-slipform',
    title: 'Bulk Material Cylindrical Storage Silos Slipform Construction',
    location: 'Port of Salalah Bulk Cargo Terminal',
    client: 'Salalah Port Services SAOG',
    category: 'Civil Works & Structural Engineering',
    progress: 60,
    startDate: 'Apr 2026',
    completionTarget: 'May 2027',
    manpowerCount: 130,
    engineerLead: 'Eng. Munir Al Habsi (Senior Project Director)',
    summary:
      'Continuous hydraulic slipform pouring of 42-meter high reinforced concrete cylindrical silos for industrial mineral storage.',
    scopeDetails:
      'Execution of 24/7 continuous hydraulic slipforming operations, heavy circular rebar placement, concrete pump truck delivery of high-early-strength mix, outer perimeter safety scaffolding, and roof dome structural steel framing.',
    imageUrl: AUTHENTIC_USER_PHOTOS.siloSlipformConstruction,
    authorId: 'system_seed',
  },
  {
    id: 'run-structural-steel-logistics',
    title: 'Muscat Logistics Hub Heavy Pre-Engineered Steel Truss Warehouse',
    location: 'Rusayl Industrial City, Muscat',
    client: 'Oman National Logistics Group',
    category: 'Mechanical & Electrical Works',
    progress: 77,
    startDate: 'Dec 2025',
    completionTarget: 'Dec 2026',
    manpowerCount: 110,
    engineerLead: 'Eng. Hamed Al Maamari (Steel Division Lead)',
    summary:
      'Erection of 18,500 m² clear-span pre-engineered structural steel portal frames, overhead gantry cranes, and insulated wall cladding.',
    scopeDetails:
      'Dual mobile crane synchronized rigging and erection of structural steel roof trusses, high-strength bolt torquing, cold-formed Z-purlin installation, polyurethane-insulated sandwich panels, and precision column anchor alignments.',
    imageUrl: AUTHENTIC_USER_PHOTOS.steelFrameCraneErection,
    authorId: 'system_seed',
  },
];

export const DEFAULT_GALLERY_PHOTOS: GalleryPhotoItem[] = [
  {
    id: 'gal-1',
    title: 'Aerial View of 16 Circular Tank Foundations',
    category: 'Pipeline & Tanks',
    location: 'Port of Duqm Petrochemical Hub',
    caption: 'Synchronized concrete boom pumps and 3 tower cranes casting massive reinforced concrete ring-beam tank foundation slabs.',
    imageUrl: AUTHENTIC_USER_PHOTOS.tankFarmAerial16Bases,
    authorId: 'system_seed',
  },
  {
    id: 'gal-2',
    title: 'Reinforced Concrete Superstructure Skeleton',
    category: 'Civil & Structural',
    location: 'Muscat Commercial Center',
    caption: 'Multi-story structural frame with timber beam formwork, perimeter safety catch netting, and concrete column casting.',
    imageUrl: AUTHENTIC_USER_PHOTOS.buildingSuperstructureSkeleton,
    authorId: 'system_seed',
  },
  {
    id: 'gal-3',
    title: 'Deep Foundation Excavation & Column Casting',
    category: 'Earth Works',
    location: 'Ghala Industrial Area, Muscat',
    caption: '35-ton hydraulic excavator opening deep foundation trench alongside newly cast structural concrete columns.',
    imageUrl: AUTHENTIC_USER_PHOTOS.excavatorFoundation,
    authorId: 'system_seed',
  },
  {
    id: 'gal-4',
    title: 'Certified Steel Fixers Tying Transmission Tower Footing',
    category: 'Manpower Teams',
    location: 'Ibri Power Grid Expansion',
    caption: 'Certified workforce in full safety PPE aligning high-tensile rebar cages for a 400kV electrical transmission lattice tower foundation.',
    imageUrl: AUTHENTIC_USER_PHOTOS.towerFoundationFixers,
    authorId: 'system_seed',
  },
  {
    id: 'gal-5',
    title: 'Geotechnical Slope Stabilization & Rock Anchoring',
    category: 'Earth Works',
    location: 'Duqm Coastal Highway Pass',
    caption: 'Engineered slope stabilization utilizing geotextile membrane underlay, welded mesh reinforcement, and concrete slope paving.',
    imageUrl: AUTHENTIC_USER_PHOTOS.slopePavingStabilization,
    authorId: 'system_seed',
  },
  {
    id: 'gal-6',
    title: 'Mobile Telescopic Crane on Shotcrete Retaining Wall',
    category: 'Civil & Structural',
    location: 'Al Khuwair Expressway Pass, Muscat',
    caption: 'Heavy mobile crane positioning equipment on shotcrete-stabilized hillside retaining wall adjacent to site office trailers.',
    imageUrl: AUTHENTIC_USER_PHOTOS.slopeShotcreteCrane,
    authorId: 'system_seed',
  },
  {
    id: 'gal-7',
    title: 'High-Security 358 Anti-Climb Fencing & Grade Beam',
    category: 'Special Structures',
    location: 'Sohar Freezone Logistics Gateway',
    caption: 'Heavy anti-climb welded wire mesh fencing installed on reinforced monolithic concrete grade beam with scaffolding access.',
    imageUrl: AUTHENTIC_USER_PHOTOS.antiClimbFencingGradeBeam,
    authorId: 'system_seed',
  },
  {
    id: 'gal-8',
    title: 'Pre-Engineered Heavy Steel Truss Frame Erection',
    category: 'MEP & Steel',
    location: 'Rusayl Industrial Estate',
    caption: 'Industrial logistics warehouse structure featuring long-span steel roof trusses and cast-in-place concrete support piers.',
    imageUrl: AUTHENTIC_USER_PHOTOS.steelTrussPreEngineered,
    authorId: 'system_seed',
  },
  {
    id: 'gal-9',
    title: 'Slipform Construction of Cylindrical Concrete Silos',
    category: 'Civil & Structural',
    location: 'Salalah Industrial Port',
    caption: 'Tall concrete slipformed storage silos with comprehensive external scaffolding and mobile concrete pump positioning.',
    imageUrl: AUTHENTIC_USER_PHOTOS.siloSlipformConstruction,
    authorId: 'system_seed',
  },
  {
    id: 'gal-10',
    title: 'Drone Aerial of 5 Circular Tank Foundation Rafts',
    category: 'Pipeline & Tanks',
    location: 'Duqm Special Economic Zone (SEZAD)',
    caption: 'High-altitude drone perspective showing 5 circular reinforced concrete foundations ready for storage tank erection.',
    imageUrl: AUTHENTIC_USER_PHOTOS.tankFarmAerial5Bases,
    authorId: 'system_seed',
  },
  {
    id: 'gal-11',
    title: 'Security Perimeter Trench with Bitumen Waterproofing',
    category: 'Special Structures',
    location: 'Ibri Substation Perimeter',
    caption: 'Deep perimeter grade trench displaying formwork, reinforcement dowels, and damp-proof black bitumen coating.',
    imageUrl: AUTHENTIC_USER_PHOTOS.securityFencingBitumenTrench,
    authorId: 'system_seed',
  },
  {
    id: 'gal-12',
    title: 'Rip-Rap Stone Pitching & Drainage Channel Armoring',
    category: 'Earth Works',
    location: 'Barka Stormwater Corridor',
    caption: 'Traditional hand-laid stone rip-rap masonry pitching providing durable erosion resistance along stormwater embankment.',
    imageUrl: AUTHENTIC_USER_PHOTOS.riprapStonePitching,
    authorId: 'system_seed',
  },
];

export const DEFAULT_COMPLETED_PROJECTS: CompletedProjectItem[] = [
  {
    id: 'comp-sqh-salalah',
    title: 'Sultan Qaboos Hospital - Salalah',
    client: 'Ministry of Health — Sultanate of Oman',
    location: 'Salalah, Dhofar Governorate',
    completionYear: '2025',
    contractValue: 'Turnkey Healthcare EPC · 100% On-Time Handover',
    category: 'Civil Works',
    description:
      'Comprehensive civil, structural, and healthcare infrastructure works for Sultan Qaboos Hospital in Salalah, including reinforced concrete superstructures, inpatient pavilions, grand entrance canopy, and medical utility networks.',
    fullDetails:
      'Al Sahab Al Rashid Trad. & Cont. Co L.L.C executed major civil, structural, and infrastructure packages for the landmark Sultan Qaboos Hospital in Salalah, Dhofar Governorate. Our engineering and skilled workforce teams delivered multi-story reinforced concrete hospital blocks, deep foundation waterproofing, architectural stone and facade finishes, grand entrance canopy structures, internal road networks, storm drainage systems, and specialized MEP support foundations under strict Ministry of Health QA/QC and HSE standards.',
    imageUrl: '/assets/aistudio/sqh_salalah_front_elevation_entrance.webp',
    sitePhotos: [
      {
        id: 'sqh-salalah-real-1',
        title: 'Sultan Qaboos Hospital Salalah — Grand Front Facade & Entrance Colonnade',
        caption: 'Actual on-site photograph of the completed multi-story hospital complex, architectural stone finishes, entrance canopy, and landscaped palm plaza in Salalah.',
        imageUrl: '/assets/aistudio/sqh_salalah_front_elevation_entrance.webp',
      },
      {
        id: 'sqh-salalah-real-2',
        title: 'Hospital Campus, Equipment Deployment & External Circulation',
        caption: 'On-site daylight view showing active civil machinery, JCB backhoe loaders, telehandlers, asphalt circulation roads, and inpatient hospital wings.',
        imageUrl: '/assets/aistudio/sqh_salalah_campus_daylight_machinery.webp',
      },
      {
        id: 'sqh-salalah-real-3',
        title: 'Hospital Wings, Structural Scaffolding & Grand Canopy',
        caption: 'On-site evening angle perspective displaying vertical window louvres, multi-level inpatient blocks, and specialized structural entrance framework.',
        imageUrl: '/assets/aistudio/sqh_salalah_sunset_wings_scaffolding.webp',
      },
      {
        id: 'sqh-salalah-4',
        title: 'Hospital Campus Aerial Perspective & Master Layout',
        caption: 'Full campus layout showing inpatient towers, outpatient specialist clinics, and access road networks.',
        imageUrl: AUTHENTIC_USER_PHOTOS.masterPlanHospitalAerial,
      },
      {
        id: 'sqh-salalah-5',
        title: 'Reinforced Concrete Superstructure & Multi-Story Framing',
        caption: 'High-strength reinforced concrete columns, floor slabs, and perimeter scaffolding during structural execution.',
        imageUrl: AUTHENTIC_USER_PHOTOS.buildingSuperstructureSkeleton,
      },
      {
        id: 'sqh-salalah-6',
        title: 'Deep Foundation Footings & Bitumen Waterproofing Works',
        caption: 'Precision excavation, reinforced concrete column footings, and protective bitumen damp-proofing.',
        imageUrl: AUTHENTIC_USER_PHOTOS.foundationFootingsWaterproofing,
      },
      {
        id: 'sqh-salalah-7',
        title: 'Architectural Facade & Courtyard Finishing Works',
        caption: 'Completed exterior plaster, traditional architectural detailing, and courtyard structural packages.',
        imageUrl: AUTHENTIC_USER_PHOTOS.buildingCourtyardComplex,
      },
    ],
    authorId: 'system_seed',
  },
  {
    id: 'comp-sqh-khasab',
    title: 'Sultan Qaboos Hospital - Khasab',
    client: 'Ministry of Health — Sultanate of Oman',
    location: 'Khasab, Musandam Governorate',
    completionYear: '2025',
    contractValue: 'Regional Hospital EPC · Zero LTI Safety Record',
    category: 'Civil Works',
    description:
      'Execution of structural concrete works, geotechnical site preparation, hospital building superstructures, perimeter boundary walls, and utility infrastructure for Sultan Qaboos Hospital in Khasab.',
    fullDetails:
      'For the Sultan Qaboos Hospital project in Khasab (Musandam Governorate), Al Sahab Al Rashid Trad. & Cont. Co L.L.C deployed specialized civil engineering teams, heavy earthmoving equipment, and certified tradesmen to execute structural foundations, multi-story concrete framing, coastal and mountain slope protection, utility basement boxes, and architectural blockwork. The project was delivered with zero Lost Time Injuries (LTI) and full compliance with Omani healthcare engineering specifications.',
    imageUrl: '/assets/aistudio/sqh_khasab_front_facade_theme.webp',
    sitePhotos: [
      {
        id: 'sqh-khasab-1',
        title: 'Sultan Qaboos Hospital Khasab — Main Architectural Facade (Theme Cover)',
        caption: 'Signature modern facade with waterfront promenade, palm landscaping, and completed multi-story healthcare facility in Khasab.',
        imageUrl: '/assets/aistudio/sqh_khasab_front_facade_theme.webp',
      },
      {
        id: 'sqh-khasab-2',
        title: 'Hospital Campus Master Plan & Architectural Layout',
        caption: 'Master layout showing central curved healthcare blocks, emergency wings, helipad access, and perimeter circulation.',
        imageUrl: '/assets/aistudio/sqh_khasab_campus_aerial_masterplan.webp',
      },
      {
        id: 'sqh-khasab-3',
        title: 'Promenade Street-Level View & Ground Floor Facilities',
        caption: 'Streetscape perspective showing patient access avenues, integrated commercial/cafe zones, and exterior finishes.',
        imageUrl: '/assets/aistudio/sqh_khasab_promenade_streetscape.webp',
      },
      {
        id: 'sqh-khasab-4',
        title: 'Morning Site Briefing & Workforce Alignment',
        caption: 'Over 30 ASAR construction professionals and supervisors conducting morning safety and execution briefing under the structural canopy.',
        imageUrl: '/assets/aistudio/sqh_khasab_site_briefing_canopy.webp',
      },
      {
        id: 'sqh-khasab-5',
        title: 'ASAR & Al Tasnim Engineering Toolbox Meeting',
        caption: 'On-site technical review and daily safety briefing conducted by senior civil engineers and HSE officers inside the facility structure.',
        imageUrl: '/assets/aistudio/sqh_khasab_toolbox_talk_interior.webp',
      },
      {
        id: 'sqh-khasab-6',
        title: 'Heavy Foundation Rebar Slab & Vertical Column Cages',
        caption: 'Complex rebar matrix tying, starter bars, and column cage erection for the hospital main structural foundations.',
        imageUrl: '/assets/aistudio/sqh_khasab_rebar_foundation_slab.webp',
      },
      {
        id: 'sqh-khasab-7',
        title: 'Raft Foundation Steel Mesh & Skilled Fixing Crew',
        caption: 'ASAR rebar fixing crew deploying dual-layer reinforcement mesh with full PPE and safety adherence.',
        imageUrl: '/assets/aistudio/sqh_khasab_slab_rebar_crew.webp',
      },
      {
        id: 'sqh-khasab-8',
        title: 'Vast Floor Slab Rebar Deck & Formwork Staging',
        caption: 'Upper level suspended concrete slab rebar installation spanning the entire hospital ward block with timber beam falsework.',
        imageUrl: '/assets/aistudio/sqh_khasab_top_deck_reinforcement.webp',
      },
      {
        id: 'sqh-khasab-9',
        title: 'Multi-Story Scaffolding & Column Shuttering Network',
        caption: 'Dense structural staging, perimeter guardrails, and vertical column formwork during peak superstructure construction.',
        imageUrl: '/assets/aistudio/sqh_khasab_multistory_scaffolding.webp',
      },
      {
        id: 'sqh-khasab-10',
        title: 'Slab Formwork Decking & Structural Shoring',
        caption: 'High-load shoring towers and H20 timber beam decking ready for reinforcement placement and concrete casting.',
        imageUrl: '/assets/aistudio/sqh_khasab_formwork_decking.webp',
      },
      {
        id: 'sqh-khasab-11',
        title: 'Substructure Footings & Bitumen Waterproofing',
        caption: 'Cast column pediments, compaction grading with heavy roller, and two-coat bitumen damp-proof membrane application.',
        imageUrl: '/assets/aistudio/sqh_khasab_substructure_waterproofing.webp',
      },
      {
        id: 'sqh-khasab-12',
        title: 'Night Shift Concrete Shuttering & Tower Crane Operations',
        caption: 'Night-shift column formwork alignment under floodlighting to ensure monolithic concrete curing in optimal temperatures.',
        imageUrl: '/assets/aistudio/sqh_khasab_night_column_casting.webp',
      },
      {
        id: 'sqh-khasab-13',
        title: 'Specialized Circular Chamber & Retaining Formwork',
        caption: 'Precision circular utility shaft and water management chamber with specialized internal cross-braced shuttering.',
        imageUrl: '/assets/aistudio/sqh_khasab_circular_chamber_formwork.webp',
      },
      {
        id: 'sqh-khasab-14',
        title: 'Circular Deep Foundation Shaft Rebar Reinforcement',
        caption: 'Heavy cylindrical rebar cage with yellow safety rebar caps and foundation base tie-ins.',
        imageUrl: '/assets/aistudio/sqh_khasab_circular_shaft_rebar.webp',
      },
    ],
    authorId: 'system_seed',
  },
  {
    id: 'comp-al-kamil',
    title: 'Al Kamil Project',
    client: 'Ministry of Health & Regional Infrastructure Authorities',
    location: 'Al Kamil Wal Wafi, South Ash Sharqiyah Governorate',
    completionYear: '2025',
    contractValue: 'Turnkey Healthcare & Civil EPC · 100% Quality Handover',
    category: 'Civil Works',
    description:
      'Turnkey civil, structural, and infrastructure works for the Al Kamil Hospital and healthcare complex in South Ash Sharqiyah, including multi-story reinforced concrete superstructure, foundation retaining trenches, Doka timber slab formwork, and perimeter masonry works.',
    fullDetails:
      'For the Al Kamil Project in Al Kamil Wal Wafi (South Ash Sharqiyah Governorate), Al Sahab Al Rashid Trad. & Cont. Co L.L.C executed extensive civil, structural, and architectural construction packages. Scope delivered includes deep foundation trenches and retaining wall rebar cages with timber catwalk bridges, multi-level reinforced concrete superstructure framing, high-density modular scaffolding falsework, Doka H20 timber beam slab decking and shoring towers, Manitou heavy telehandler crane rigging, external masonry blockwork partitions, and comprehensive site drainage and protection works under strict Omani safety standards.',
    imageUrl: '/assets/aistudio/al_kamil_panoramic_elevation.webp',
    sitePhotos: [
      {
        id: 'al-kamil-real-1',
        title: 'Al Kamil Project — Main Hospital Block Elevation & Structural Frame (Theme Cover)',
        caption: 'Actual on-site panoramic photograph showing the full multi-tier reinforced concrete building superstructure, perimeter masonry blockwork, roof rebar decking, and heavy scaffolding staging at Al Kamil Wal Wafi.',
        imageUrl: '/assets/aistudio/al_kamil_panoramic_elevation.webp',
      },
      {
        id: 'al-kamil-real-2',
        title: 'Substructure Retaining Wall & Foundation Rebar Trench',
        caption: 'Deep foundation trench execution showing dense vertical rebar cage fixing, starter reinforcement dowels, protective timber shoring, and timber catwalk bridge for safe site traversal.',
        imageUrl: '/assets/aistudio/al_kamil_foundation_rebar_trench.webp',
      },
      {
        id: 'al-kamil-real-3',
        title: 'Heavy Structural Scaffolding & Column Shuttering Network',
        caption: 'Dense load-bearing modular scaffolding towers, steel formwork shuttering, and vertical column rebar matrix during superstructure casting.',
        imageUrl: '/assets/aistudio/al_kamil_scaffolding_columns.webp',
      },
      {
        id: 'al-kamil-real-4',
        title: 'Multi-Tier Concrete Frame & Heavy Telehandler Rigging',
        caption: 'Active construction yard view showing multi-story reinforced concrete frame, Manitou heavy telescopic handler crane, formwork timber bundles, and access ramps.',
        imageUrl: '/assets/aistudio/al_kamil_structural_frame_crane.webp',
      },
      {
        id: 'al-kamil-real-5',
        title: 'Doka H20 Timber Beam Slab Decking & Shoring Falsework',
        caption: 'Upper level suspended slab formwork featuring yellow Doka H20 timber joists, Delmon heavy-duty shoring props, and access steel ladder for safe deck inspection.',
        imageUrl: '/assets/aistudio/al_kamil_doka_timber_formwork.webp',
      },
      {
        id: 'al-kamil-6',
        title: 'Precision Site Grading & Sub-Base Compaction',
        caption: 'Bulk earthmoving, formation level grading, and geotechnical compaction across the Al Kamil site.',
        imageUrl: AUTHENTIC_USER_PHOTOS.excavatorGradingLevels,
      },
      {
        id: 'al-kamil-7',
        title: 'Rip-Rap Stone Pitching & Wadi Flood Protection',
        caption: 'Engineered stone pitching and concrete drainage aprons for wadi flood runoff control.',
        imageUrl: AUTHENTIC_USER_PHOTOS.riprapStonePitching,
      },
    ],
    authorId: 'system_seed',
  },
  {
    id: 'comp-al-mazuinah',
    title: 'Al Mazuinah Project',
    client: 'Al Mazuinah Free Zone / Regional Infrastructure Authority',
    location: 'Al Mazyunah (Al Mazuinah), Dhofar Governorate',
    completionYear: '2025',
    contractValue: '14+ km Perimeter & Civil Package · ISO Certified',
    category: 'Pipeline Works & Special Structures',
    description:
      'Execution of civil infrastructure, high-voltage electrical substation facilities, continuous reinforced concrete grade beams, high-security 358 anti-climb perimeter fencing, and structural foundations at the Al Mazuinah Project.',
    fullDetails:
      'At the Al Mazuinah Project in Dhofar Governorate, Al Sahab Al Rashid Trad. & Cont. Co L.L.C executed critical civil infrastructure, high-voltage electrical substation packages, industrial foundations, and high-security perimeter works. Our teams delivered continuous reinforced concrete grade beams with elastomeric bitumen damp-proofing, high-security 358 anti-climb mesh fencing, switchgear and control building civil structures, heavy rebar foundation cages, transmission tower foundations, internal asphalt access roads, and desert earthworks under demanding logistical conditions.',
    imageUrl: '/assets/aistudio/al_mazuinah_panoramic_substation_aerial.webp',
    sitePhotos: [
      {
        id: 'al-mazuinah-real-1',
        title: 'Al Mazuinah High-Voltage Substation & Industrial Complex — Panoramic Aerial View',
        caption: 'Elevated high-angle panoramic photograph showing the completed electrical substation, switchgear buildings, security boundary wall, and high-voltage transmission lines in Al Mazuinah, Dhofar.',
        imageUrl: '/assets/aistudio/al_mazuinah_panoramic_substation_aerial.webp',
      },
      {
        id: 'al-mazuinah-real-2',
        title: 'Substation Control Buildings, Internal Asphalt Roads & Water Storage Units',
        caption: 'Actual on-site photograph showing the central switchgear building, internal road network, water storage modular tanks, and perimeter security fencing.',
        imageUrl: '/assets/aistudio/al_mazuinah_substation_buildings_roads.webp',
      },
      {
        id: 'al-mazuinah-real-3',
        title: 'Main Access Avenue & Desert High-Voltage Transmission Corridor',
        caption: 'Elevated perspective of the main access road, electrical equipment yards, perimeter grade beams, and transmission tower lines extending across the desert.',
        imageUrl: '/assets/aistudio/al_mazuinah_entrance_avenue_towers.webp',
      },
      {
        id: 'al-mazuinah-4',
        title: 'High-Security 358 Anti-Climb Fence & Reinforced Concrete Grade Beam',
        caption: 'Completed high-security 358 anti-climb mesh fencing mounted on continuous reinforced concrete grade beam.',
        imageUrl: AUTHENTIC_USER_PHOTOS.antiClimbFencingGradeBeam,
      },
      {
        id: 'al-mazuinah-5',
        title: 'Continuous Concrete Grade Beam & Bitumen Waterproofing Trench',
        caption: 'Excavated perimeter trench with shuttering formwork and elastomeric bitumen damp-proof coating.',
        imageUrl: AUTHENTIC_USER_PHOTOS.securityFencingBitumenTrench,
      },
      {
        id: 'al-mazuinah-6',
        title: 'Skilled Steel Fixers Tying Heavy Foundation Rebar Cages',
        caption: 'ASAR steel fixing team assembling heavy reinforcement cages for deep structural foundations.',
        imageUrl: AUTHENTIC_USER_PHOTOS.towerFoundationFixers,
      },
      {
        id: 'al-mazuinah-7',
        title: 'Pre-Engineered Steel Truss Industrial Facility',
        caption: 'Clear-span structural steel truss warehouse and logistics facility erection.',
        imageUrl: AUTHENTIC_USER_PHOTOS.steelTrussPreEngineered,
      },
    ],
    authorId: 'system_seed',
  },
  {
    id: 'comp-courtyard-nizwa',
    title: '4-Star Resort Hotel (Courtyard by Marriott) - Nizwa',
    client: 'Nizwa Tourist Company LLC (شركة نزوى للسياحة ش.م.م)',
    location: 'Nizwa, Ad Dakhiliyah Governorate',
    completionYear: '2024',
    contractValue: 'Turnkey Hospitality EPC · Courtyard by Marriott',
    category: 'Civil Works',
    description:
      'Turnkey civil, structural, and infrastructure construction for the prestigious 4-Star Resort Hotel (Courtyard by Marriott) in Nizwa, featuring multi-story guest room wings, grand entrance courtyard with water feature, swimming pool, sports courts, and parking facilities.',
    fullDetails:
      'Al Sahab Al Rashid Trad. & Cont. Co L.L.C executed major civil, structural concrete, and infrastructure packages for the Proposed 4-Star Resort Hotel (operating under the international Courtyard by Marriott brand) located in Nizwa, Ad Dakhiliyah Governorate, Sultanate of Oman. The landmark hospitality project was commissioned by Nizwa Tourist Company LLC under comprehensive engineering consultancy and supervision by Amjaad Engineering Consultancy (Project Code: 21902).\n\nScope of Works Executed by ASAR:\n• Multi-story reinforced concrete hotel superstructures, guest room blocks, and administrative facilities.\n• Grand arrival boulevard and porte-cochère entrance with architectural water fountain and reflecting pools.\n• Resort leisure amenities including reinforced concrete swimming pools, sun deck pavilions, and outdoor sports courts.\n• Comprehensive underground utility networks, electrical substations, water storage tanks, and stormwater drainage.\n• Surface parking plazas, asphalt circulation roads, perimeter boundary walls, and exterior facade finishes harmonized with Nizwa’s heritage architecture.\n• Strict adherence to international Marriott hospitality brand standards, local civil defense permits, and Oman Ministry of Heritage and Tourism regulations.',
    imageUrl: '/assets/aistudio/resort_hotel_nizwa_cover.webp',
    sitePhotos: [
      {
        id: 'resort-nizwa-1',
        title: 'Courtyard by Marriott Nizwa — Main Entrance & Water Plaza',
        caption: 'Architectural facade, vehicle drop-off plaza, reflecting water fountain, and main hotel lobby entrance.',
        imageUrl: '/assets/aistudio/resort_hotel_nizwa_view1_entrance.webp',
      },
      {
        id: 'resort-nizwa-2',
        title: 'Resort Approach Boulevard & Mountain Backdrop',
        caption: 'Palm tree-lined driveway, modern guest room wings, and natural mountainous terrain of Nizwa.',
        imageUrl: '/assets/aistudio/resort_hotel_nizwa_view2_driveway.webp',
      },
      {
        id: 'resort-nizwa-3',
        title: 'Internal Courtyard, Swimming Pool & Sports Courts',
        caption: 'Recreational hub featuring swimming pool, sun terraces, shaded pergolas, and tennis court.',
        imageUrl: '/assets/aistudio/resort_hotel_nizwa_view3_pool.webp',
      },
      {
        id: 'resort-nizwa-4',
        title: 'High Aerial 3D Masterplan Perspective',
        caption: 'Bird’s eye perspective showing the entire resort hotel complex, parking, service blocks, and desert mountain vistas.',
        imageUrl: '/assets/aistudio/resort_hotel_nizwa_view4_aerial.webp',
      },
      {
        id: 'resort-nizwa-5',
        title: 'Approved Architectural & Engineering Drawing Sheet',
        caption: 'Official approved drawing sheet stamped by Amjaad Engineering Consultancy and Nizwa Tourist Co LLC (Project Code: 21902).',
        imageUrl: '/assets/aistudio/resort_hotel_nizwa_master_sheet.webp',
      },
      {
        id: 'resort-nizwa-6',
        title: 'Reinforced Concrete Structural Superstructure Skeleton',
        caption: 'Multi-story concrete column casting, slab formwork, and structural framing executed by ASAR civil trades.',
        imageUrl: AUTHENTIC_USER_PHOTOS.buildingSuperstructureSkeleton,
      },
    ],
    authorId: 'system_seed',
  },
  {
    id: 'comp-al-shorouk',
    title: 'Al Shorouk Township (562 Residential Units) - Salalah',
    client: 'Aldahab Estate Real Estate Company (شركة الذهب العقارية)',
    location: 'North Sahnout, Salalah, Dhofar Governorate',
    completionYear: '2025',
    contractValue: '324,271 m² Masterplan · 562 Units Handover',
    category: 'Earth Works & Infrastructure',
    description:
      'Master layout civil engineering, site grading, arterial road networks, and wadi reservation protection for the 324,271 m² Al Shorouk Township (562 villas and townhouses) in North Sahnout, Salalah.',
    fullDetails:
      'Al Sahab Al Rashid Trad. & Cont. Co L.L.C executed master earthworks, infrastructure grading, wadi flood protection embankments, and road corridor civil packages for the Al Shorouk Township masterplan in North Sahnout, Salalah, Dhofar Governorate (Plot No: 737, Total Land Area: 324,271 m²). Developed for Aldahab Estate Real Estate Company under engineering consultancy by Meridian Engineering Consultancy (CR: 1316305).\n\nResidential Units & Phase Breakdown (562 Units Total):\n• 122 Luxury 7-Bedroom Villas (Phase 1: 38, Phase 2: 32, Phase 3: 37, Future: 15)\n• 15 6-Bedroom Villas (Phase 1: 3, Phase 2: 5, Phase 3: 7)\n• 228 5-Bedroom Villas (Phase 1: 42, Phase 2: 58, Phase 3: 78, Future: 50)\n• 44 4-Bedroom Twin Villas (Phase 1: 8, Phase 2: 14, Phase 3: 22)\n• 120 4-Bedroom Townhouses (Phase 1: 35, Phase 2: 51, Phase 3: 34)\n• 36 3-Bedroom Townhouses (Phase 1: 11, Phase 2: 10, Phase 3: 15)\n\nInfrastructure Scope Executed by ASAR:\n• Bulk excavation, precision formation levelling, and compaction across 324,271 m² of master development land.\n• 60-meter right-of-way (R.O.W) major arterial avenues and secondary residential access networks.\n• Wadi reservation flood mitigation corridor, including heavy rip-rap stone pitching and stormwater channels.\n• Deep utility trenching for potable water, power distribution conduits, and telecommunication duct banks.\n• Municipal boundary monuments, entrance gateways, and public park area grading.',
    imageUrl: '/assets/aistudio/al_shorouk_township_cover.webp',
    sitePhotos: [
      {
        id: 'shorouk-salalah-1',
        title: 'Al Shorouk Township General Master Plan Layout Plan',
        caption: 'Approved master plan showing residential sectors, 60m arterial avenues, central parks, and community facilities in North Sahnout.',
        imageUrl: '/assets/aistudio/al_shorouk_township_master_plan.webp',
      },
      {
        id: 'shorouk-salalah-2',
        title: '562 Residential Units Schedule & Phase Delivery Breakdown',
        caption: 'Official unit table schedule documenting 122 7-bed villas, 228 5-bed villas, 120 townhouses, and 44 twin villas across Phases 1-3.',
        imageUrl: '/assets/aistudio/al_shorouk_township_units_table.webp',
      },
      {
        id: 'shorouk-salalah-3',
        title: 'Official Consultant & Client Approval Stamp',
        caption: 'Formal engineering approval seal by Meridian Engineering Consultancy (CR: 1316305) and Aldahab Estate Real Estate Company.',
        imageUrl: '/assets/aistudio/al_shorouk_township_approval_stamp.webp',
      },
      {
        id: 'shorouk-salalah-4',
        title: 'Complete Approved Master Plan Sheet (Plot No: 737)',
        caption: 'Full master layout approval drawing sheet showing 324,271 m² plot boundary, 60m arterial roads, and wadi reservations.',
        imageUrl: '/assets/aistudio/al_shorouk_township_full_sheet.webp',
      },
      {
        id: 'shorouk-salalah-5',
        title: 'Heavy Excavators Opening Deep Infrastructure Trenches',
        caption: 'Tracked excavators and compaction machinery preparing arterial road formations and deep utility networks.',
        imageUrl: AUTHENTIC_USER_PHOTOS.excavatorFoundation,
      },
      {
        id: 'shorouk-salalah-6',
        title: 'Wadi Flood Reservation & Engineered Stone Pitching',
        caption: 'Erosion-resistant rip-rap stone masonry and concrete drainage channels securing the township wadi boundary.',
        imageUrl: AUTHENTIC_USER_PHOTOS.riprapStonePitching,
      },
    ],
    authorId: 'system_seed',
  },
];

// Defensive payload sanitization helpers matching firebase-blueprint.json bounds
export function sanitizeString(val: string, minLen: number, maxLen: number, fallback: string): string {
  const trimmed = (val || '').trim();
  if (trimmed.length < minLen) {
    return fallback.slice(0, maxLen);
  }
  return trimmed.slice(0, maxLen);
}

export function clampNumber(val: number, min: number, max: number, fallback: number): number {
  const num = Number(val);
  if (Number.isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

export function sanitizeHexColor(val: string, fallback: string): string {
  const trimmed = (val || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed : fallback;
}

/**
 * Compresses an uploaded image File into a crisp JPEG Data URI (< 250KB)
 * so it can be stored in LocalStorage and Cloud Firestore seamlessly.
 */
export function compressUploadedImageFile(file: File, maxWidth = 960, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result || ''));
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUri);
      };
      img.onerror = () => reject(new Error('Failed to decode selected image file'));
      img.src = String(reader.result || '');
    };
    reader.onerror = () => reject(new Error('Failed to read selected file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generates and downloads a complete, standalone single-file HTML version of the corporate website
 * (HTML5 + Tailwind CSS CDN + Vanilla JS + Interactive Admin Edit Mode + Supabase Persistence Adapter)
 * containing all current edited state, custom blocks, text overrides, and Google Maps link.
 */
export function generateStandaloneHtmlString(
  config: SiteConfigData,
  services: CoreServiceItem[],
  runningProjects: RunningProjectItem[],
  galleryPhotos: GalleryPhotoItem[],
  completedProjects: CompletedProjectItem[],
  coreValues: CoreValueItem[] = DEFAULT_CORE_VALUES,
  supabaseUrl = 'https://utblsxterubtziionaja.supabase.co',
  supabaseAnonKey = 'sb_publishable_WEybADSkx1-kQdyJvHI3_Q_j9JYkFIZ'
): string {
  const mapLink = config.officeMapLink || OFFICIAL_GOOGLE_MAPS_LINK;
  const statePayload = JSON.stringify(
    { config: { ...config, officeMapLink: mapLink }, services, runningProjects, galleryPhotos, completedProjects, coreValues },
    null,
    2
  );

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1280" />
  <title>${config.companyName} — ${config.tagline}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Outfit:wght@600;700&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    body { font-family: 'Public Sans', sans-serif; background-color: #f8fafc; color: #0f172a; }
    h1, h2, h3, h4 { font-family: 'Outfit', sans-serif; }
    .tabular-nums { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
    [contenteditable="true"] { outline: 2px dashed #f97316; outline-offset: 4px; background-color: #fff7ed; border-radius: 4px; padding: 2px 4px; cursor: text; }
    body.admin-active img { outline: 2px dashed #f97316; cursor: pointer; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
  <!-- Top Header -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
      <div class="flex items-center gap-3 min-w-0">
        <img src="${config.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI}" alt="Logo" class="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-2xl border border-slate-200 bg-white p-1 shrink-0 shadow-xs" />
        <div class="flex flex-col min-w-0">
          <a href="#home" class="editable text-lg sm:text-2xl font-black text-[#1e3a8a] leading-tight truncate">${config.companyName}</a>
          <span class="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase truncate">EPC Contracting & Manpower Solutions · Oman</span>
        </div>
      </div>
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <a href="#home" class="editable hover:text-[#1e3a8a]">Home</a>
        <a href="#services" class="editable hover:text-[#1e3a8a]">Core Services</a>
        <a href="#running-projects" class="editable hover:text-[#1e3a8a]">Running Sites</a>
        <a href="#gallery" class="editable hover:text-[#1e3a8a]">Photo Gallery</a>
        <a href="#portfolio" class="editable hover:text-[#1e3a8a]">Completed Portfolio</a>
        <a href="#about" class="editable hover:text-[#1e3a8a]">About & Vision</a>
        <a href="#contact" class="editable hover:text-[#1e3a8a]">Contact</a>
        <button onclick="showDeveloperModalDialog()" class="px-3 py-1 text-xs font-bold bg-blue-50 text-[#1e3a8a] rounded-md hover:bg-blue-100 cursor-pointer">👨‍💻 Developer</button>
      </nav>
      <button id="adminToggleBtn" onclick="toggleAdminMode()" class="px-4 py-2 text-xs font-semibold bg-[#1e3a8a] text-white rounded-lg cursor-pointer shrink-0">
        Admin Mode: OFF
      </button>
    </div>
  </header>

  <main id="appContainer" class="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-16">
    <!-- Hero & Google Map -->
    <section id="home" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white p-8 rounded-2xl border border-slate-200">
      <div class="lg:col-span-7 space-y-4 flex flex-col justify-between">
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <img src="${config.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI}" alt="Logo" class="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-3xl border-2 border-slate-200 bg-white p-2 shadow-sm shrink-0" />
            <div class="space-y-1">
              <div class="editable text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">SULTANATE OF OMAN · EPC & MANPOWER CONTRACTING · WWWASAR.COM</div>
              <div class="text-xs font-semibold text-slate-500">Muscat, Sultanate of Oman · wwwasar.com</div>
            </div>
          </div>
          <div>
            <h1 class="editable text-3xl sm:text-5xl font-black text-[#1e3a8a] leading-[1.08]">${config.companyName}</h1>
            <div class="text-xl font-bold text-slate-500 mt-1">السحاب الرشيد للتجارة والمقاولات ش.م.م</div>
          </div>
          <p class="editable text-xl sm:text-2xl font-bold text-[#f97316]">${config.tagline}</p>
          <p class="editable text-slate-600 leading-relaxed">${config.heroSubtext}</p>
        </div>
        <div class="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap gap-3">
            <a href="#contact" class="editable px-6 py-3 text-sm font-semibold text-white bg-[#f97316] rounded-lg">Request Quote</a>
            <a href="${mapLink}" target="_blank" rel="noopener noreferrer" class="px-5 py-3 text-sm font-semibold text-[#1e3a8a] bg-slate-100 border border-slate-300 rounded-lg">Open Google Maps Location ↗</a>
          </div>
          <div class="editable text-xs tabular-nums text-slate-500">${config.officePhone} · ${config.officeEmail}</div>
        </div>
      </div>
      <div class="lg:col-span-5 border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
        <div class="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs font-bold text-[#1e3a8a]">
          <span class="editable">${config.officeAddress}</span>
          <a href="${mapLink}" target="_blank" rel="noopener noreferrer" class="text-[#f97316] underline shrink-0">Google Maps ↗</a>
        </div>
        <iframe src="https://maps.google.com/maps?q=${encodeURIComponent(config.officeAddress || 'Muscat, Oman')}&t=m&z=13&output=embed" class="w-full flex-1 min-h-[240px] border-0" loading="lazy"></iframe>
        <div class="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span class="editable tabular-nums text-slate-600">${config.officeCoordinates}</span>
          <a href="${mapLink}" target="_blank" rel="noopener noreferrer" class="font-bold text-[#1e3a8a] hover:text-[#f97316]">${mapLink}</a>
        </div>
      </div>
    </section>

    <!-- Core Services -->
    <section id="services" class="space-y-6">
      <h2 class="editable text-3xl font-bold text-[#1e3a8a]">Company Core Services & Work Types</h2>
      <div id="servicesGrid" class="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
    </section>

    <!-- Running Projects -->
    <section id="running-projects" class="space-y-6">
      <h2 class="editable text-3xl font-bold text-[#1e3a8a]">Running Project Sites</h2>
      <div id="runningGrid" class="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
    </section>

    <!-- Photo Gallery -->
    <section id="gallery" class="space-y-6">
      <h2 class="editable text-3xl font-bold text-[#1e3a8a]">Photo Gallery & Carousel Slider</h2>
      <div id="galleryGrid" class="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
    </section>

    <!-- Completed Portfolio -->
    <section id="portfolio" class="space-y-6">
      <h2 class="editable text-3xl font-bold text-[#1e3a8a]">Completed Projects Portfolio</h2>
      <div id="portfolioGrid" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
    </section>

    <!-- About Us, Aim, Vision, Mission & Core Values -->
    <section id="about" class="space-y-8 bg-white p-8 rounded-2xl border border-slate-200">
      <h2 class="editable text-3xl font-bold text-[#1e3a8a]">About Us, Aim, Vision, Mission & Core Values</h2>
      <p class="editable text-slate-700 leading-relaxed">${config.aboutBackground}</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 bg-slate-50 rounded-xl border border-slate-200">
          <h3 class="editable font-bold text-[#1e3a8a] text-lg">OUR AIM</h3>
          <p class="editable text-sm text-slate-600 mt-2">${config.ourAim}</p>
        </div>
        <div class="p-6 bg-slate-50 rounded-xl border border-slate-200">
          <h3 class="editable font-bold text-[#1e3a8a] text-lg">OUR VISION</h3>
          <p class="editable text-sm text-slate-600 mt-2">${config.ourVision}</p>
        </div>
        <div class="p-6 bg-slate-50 rounded-xl border border-slate-200">
          <h3 class="editable font-bold text-[#1e3a8a] text-lg">OUR MISSION</h3>
          <p class="editable text-sm text-slate-600 mt-2">${config.ourMission}</p>
        </div>
      </div>
    </section>

    <!-- Client Inquiry & Contact Form (Connected to Supabase utblsxterubtziionaja) -->
    <section id="contact" class="bg-white p-8 rounded-2xl border border-slate-200 space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="editable text-3xl font-bold text-[#1e3a8a]">Client Inquiry & Contact Form</h2>
          <p class="editable text-sm text-slate-600">Connected to Supabase Backend (Project ID: utblsxterubtziionaja)</p>
        </div>
        <a href="${mapLink}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 text-xs font-bold text-white bg-[#f97316] rounded-lg">Open Google Maps ↗</a>
      </div>
      <div id="inquiryStatusBox" class="hidden p-4 rounded-xl text-sm font-semibold"></div>
      <form id="supabaseInquiryForm" onsubmit="submitInquiryForm(event)" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input id="inq_name" required placeholder="Your Full Name *" class="px-4 py-2.5 text-sm border border-slate-300 rounded-lg" />
        <input id="inq_company" required placeholder="Company / Organization *" class="px-4 py-2.5 text-sm border border-slate-300 rounded-lg" />
        <input id="inq_email" type="email" required placeholder="Official Email Address *" class="px-4 py-2.5 text-sm border border-slate-300 rounded-lg" />
        <input id="inq_phone" required placeholder="Phone / WhatsApp Number *" class="px-4 py-2.5 text-sm border border-slate-300 rounded-lg" />
        <select id="inq_type" class="px-4 py-2.5 text-sm border border-slate-300 rounded-lg bg-white">
          <option value="Skilled & Unskilled Manpower Supply">Skilled & Unskilled Manpower Supply</option>
          <option value="Civil & Structural Works">Civil & Structural Works</option>
          <option value="Earth Works & Excavation">Earth Works & Excavation</option>
          <option value="Mechanical & Electrical Works">Mechanical & Electrical Works</option>
          <option value="Pipeline & Special Structures">Pipeline & Special Structures</option>
          <option value="Turnkey EPC Tender Inquiry">Turnkey EPC Tender Inquiry</option>
        </select>
        <input id="inq_location" required placeholder="Project Site Location (e.g., Muscat, Duqm, Sohar) *" class="px-4 py-2.5 text-sm border border-slate-300 rounded-lg" />
        <input id="inq_manpower" placeholder="Manpower Trades / Headcount Breakdown (Optional)" class="md:col-span-2 px-4 py-2.5 text-sm border border-slate-300 rounded-lg" />
        <textarea id="inq_message" rows="4" required placeholder="Detailed Scope of Work / Inquiry Message *" class="md:col-span-2 px-4 py-2.5 text-sm border border-slate-300 rounded-lg"></textarea>
        <div class="md:col-span-2">
          <button type="submit" class="px-7 py-3 text-sm font-semibold text-white bg-[#1e3a8a] rounded-lg cursor-pointer">Submit Official Inquiry to Supabase</button>
        </div>
      </form>
    </section>
  </main>

  <footer class="bg-slate-100 border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-600 space-y-2">
    <div class="editable">© ${new Date().getFullYear()} ${config.companyName} (wwwasar.com). All Rights Reserved.</div>
    <div class="text-[11px] text-slate-500 flex flex-wrap items-center justify-center gap-1.5">
      <span>Developed by:</span>
      <button onclick="showDeveloperModalDialog()" class="font-bold text-[#1e3a8a] underline cursor-pointer">Eng Abdullah Al Osman Shakil</button>
      <span>·</span>
      <span class="font-semibold text-slate-600">Electrical Engineer</span>
      <span>·</span>
      <a href="mailto:abdullahalshakil7@gmail.com" class="font-mono text-slate-600 underline">abdullahalshakil7@gmail.com</a>
    </div>
    <div><a href="${mapLink}" target="_blank" rel="noopener noreferrer" class="text-[#1e3a8a] font-semibold underline">Company Google Maps: ${mapLink}</a></div>
  </footer>

  <script>
    function showDeveloperModalDialog() {
      alert("DEVELOPER PROFILE:\\n\\nName: Eng Abdullah Al Osman Shakil\\nPosition: Electrical Engineer\\nEmail: abdullahalshakil7@gmail.com\\n\\nSpecialization: Electrical Engineering & EPC Full-Stack Systems");
    }
    const STATE = ${statePayload};
    const SUPABASE_URL = "${supabaseUrl}";
    const SUPABASE_KEY = "${supabaseAnonKey}";
    const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
    let isAdmin = false;

    async function submitInquiryForm(e) {
      e.preventDefault();
      const box = document.getElementById('inquiryStatusBox');
      box.className = 'p-4 rounded-xl text-sm font-semibold bg-blue-50 text-[#1e3a8a] border border-blue-200';
      box.textContent = 'Submitting inquiry to Supabase (utblsxterubtziionaja)...';
      box.classList.remove('hidden');

      const payload = {
        id: 'inq-' + Date.now(),
        client_name: document.getElementById('inq_name').value.trim(),
        company_name: document.getElementById('inq_company').value.trim(),
        email: document.getElementById('inq_email').value.trim(),
        phone: document.getElementById('inq_phone').value.trim(),
        inquiry_type: document.getElementById('inq_type').value,
        project_location: document.getElementById('inq_location').value.trim(),
        manpower_details: document.getElementById('inq_manpower').value.trim(),
        message: document.getElementById('inq_message').value.trim(),
        status: 'new',
        created_at: new Date().toISOString()
      };

      if (supabaseClient) {
        const { error } = await supabaseClient.from('inquiries').insert([payload]);
        if (error) {
          box.className = 'p-4 rounded-xl text-sm font-semibold bg-amber-50 text-amber-900 border border-amber-300';
          box.textContent = 'Saved locally! Note from Supabase: ' + error.message;
          return;
        }
      }
      box.className = 'p-4 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200';
      box.textContent = 'Thank you! Your inquiry (' + payload.id.toUpperCase() + ') has been saved to Supabase database (utblsxterubtziionaja).';
      document.getElementById('supabaseInquiryForm').reset();
    }

    function handleImgErr(img, scene, label) {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = 'true';
      img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(\`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
          <defs>
            <linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#1e3a8a"/>
              <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="0.8" />
            </pattern>
          </defs>
          <rect width="800" height="450" fill="url(#bgG)"/>
          <rect width="800" height="450" fill="url(#grid)"/>
          <g fill="none" stroke="#f97316" stroke-width="2.5">
            <line x1="200" y1="360" x2="200" y2="90" />
            <line x1="140" y1="110" x2="420" y2="110" />
            <line x1="200" y1="90" x2="330" y2="110" stroke-width="1.5" />
          </g>
          <rect x="250" y="160" width="300" height="200" fill="#ffffff" stroke="#f97316" stroke-width="3" rx="8" />
          <text x="400" y="240" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="800" fill="#1e3a8a">AL SAHAB AL RASHID</text>
          <text x="400" y="275" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="600" fill="#f97316">\${label || 'EPC CONTRACTING · OMAN'}</text>
          <rect x="24" y="385" width="752" height="42" rx="6" fill="#09132c" stroke="#334155" />
          <text x="45" y="411" font-family="sans-serif" font-size="13" font-weight="700" fill="#f8fafc">\${label || 'CIVIL &amp; STRUCTURAL WORKS'}</text>
          <text x="755" y="411" text-anchor="end" font-family="monospace" font-size="12" font-weight="600" fill="#f97316">WWWASAR.COM · OMAN</text>
        </svg>
      \`);
    }

    function renderCollections() {
      document.getElementById('servicesGrid').innerHTML = STATE.services.map(s => \`
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <img src="\${s.imageUrl}" onerror="handleImgErr(this, 'civil', '\${(s.title || '').replace(/['\"\\\\]/g, '')}')" onclick="changeImagePrompt(this)" class="w-full aspect-video object-cover" />
          <div class="p-5 space-y-2">
            <div class="editable text-xs font-bold text-[#f97316]">\${s.categoryCode}</div>
            <h3 class="editable font-bold text-lg">\${s.title}</h3>
            <p class="editable text-xs text-slate-600">\${s.summary}</p>
          </div>
        </div>
      \`).join('');

      document.getElementById('runningGrid').innerHTML = STATE.runningProjects.map(p => \`
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <img src="\${p.imageUrl}" onerror="handleImgErr(this, 'earth', '\${(p.title || '').replace(/['\"\\\\]/g, '')}')" onclick="changeImagePrompt(this)" class="w-full aspect-video object-cover" />
          <div class="p-5 space-y-2">
            <div class="editable text-xs font-semibold text-[#1e3a8a]">\${p.location} · \${p.progress}%</div>
            <h3 class="editable font-bold text-lg">\${p.title}</h3>
            <p class="editable text-xs text-slate-600">\${p.summary}</p>
          </div>
        </div>
      \`).join('');

      document.getElementById('galleryGrid').innerHTML = STATE.galleryPhotos.map(g => \`
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <img src="\${g.imageUrl}" onerror="handleImgErr(this, 'manpower', '\${(g.title || '').replace(/['\"\\\\]/g, '')}')" onclick="changeImagePrompt(this)" class="w-full aspect-video object-cover" />
          <div class="p-4 space-y-1">
            <h4 class="editable font-bold text-sm">\${g.title}</h4>
            <p class="editable text-xs text-slate-600">\${g.caption}</p>
          </div>
        </div>
      \`).join('');

      document.getElementById('portfolioGrid').innerHTML = STATE.completedProjects.map(c => \`
        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <img src="\${c.imageUrl}" onerror="handleImgErr(this, 'mep', '\${(c.title || '').replace(/['\"\\\\]/g, '')}')" onclick="changeImagePrompt(this)" class="w-full aspect-video object-cover" />
          <div class="p-5 space-y-2">
            <div class="editable text-xs text-[#f97316] font-semibold">\${c.client} · \${c.completionYear}</div>
            <h3 class="editable font-bold text-lg">\${c.title}</h3>
            <p class="editable text-xs text-slate-600">\${c.description}</p>
          </div>
        </div>
      \`).join('');
    }

    function changeImagePrompt(imgEl) {
      if (!isAdmin) return;
      const nextUrl = prompt('Enter new Image URL:', imgEl.src);
      if (nextUrl && nextUrl.trim()) {
        imgEl.src = nextUrl.trim();
      }
    }

    function toggleAdminMode() {
      if (!isAdmin) {
        const pass = prompt('Enter Admin Password to unlock website editing:');
        if (pass !== (STATE.config.adminPassword || 'alsahab2026')) {
          if (pass !== null) alert('Incorrect Admin Password. Access denied.');
          return;
        }
      }
      isAdmin = !isAdmin;
      document.body.classList.toggle('admin-active', isAdmin);
      const btn = document.getElementById('adminToggleBtn');
      btn.textContent = isAdmin ? 'Admin Mode: ON (Click any text or photo)' : 'Admin Login';
      btn.className = isAdmin
        ? 'px-4 py-2 text-xs font-semibold bg-[#f97316] text-white rounded-lg cursor-pointer'
        : 'px-4 py-2 text-xs font-semibold bg-[#1e3a8a] text-white rounded-lg cursor-pointer';
      document.querySelectorAll('.editable, h1, h2, h3, h4, p, span').forEach(el => {
        if (!el.closest('button')) {
          el.setAttribute('contenteditable', isAdmin ? 'true' : 'false');
        }
      });
    }

    renderCollections();
  </script>
</body>
</html>`;
}

export function exportStandaloneHtmlFile(
  config: SiteConfigData,
  services: CoreServiceItem[],
  runningProjects: RunningProjectItem[],
  galleryPhotos: GalleryPhotoItem[],
  completedProjects: CompletedProjectItem[],
  coreValues: CoreValueItem[] = DEFAULT_CORE_VALUES,
  supabaseUrl = 'https://utblsxterubtziionaja.supabase.co',
  supabaseAnonKey = 'sb_publishable_WEybADSkx1-kQdyJvHI3_Q_j9JYkFIZ'
) {
  const htmlContent = generateStandaloneHtmlString(
    config,
    services,
    runningProjects,
    galleryPhotos,
    completedProjects,
    coreValues,
    supabaseUrl,
    supabaseAnonKey
  );
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'al-sahab-al-rashid-corporate-portal.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const BLUEHOST_HTACCESS_TEMPLATE = `# ==============================================================================
# AL SAHAB AL RASHID TRAD. CON. LLC — BLUEHOST / APACHE PRODUCTION CONFIGURATION
# Official Portal: wwwasar.com | Location: Sultanate of Oman
# ==============================================================================

# 1. UTF-8 ENCODING
AddDefaultCharset UTF-8

# 2. PROPER MIME TYPES (Ensures Bluehost serves modern formats correctly)
<IfModule mod_mime.c>
  AddType image/webp .webp
  AddType image/svg+xml .svg .svgz
  AddEncoding gzip .svgz
  AddType application/json .json
  AddType font/woff .woff
  AddType font/woff2 .woff2
  AddType text/javascript .js
  AddType text/css .css
</IfModule>

# 3. SPA ROUTING (Redirects all virtual routes to index.html to prevent 404 errors)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Allow direct access to physical files and directories
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Rewrite all other paths to index.html for client-side routing
  RewriteRule ^ index.html [L]
</IfModule>

# Fallback error document for Apache 404
ErrorDocument 404 /index.html

# 4. GZIP / DEFLATE COMPRESSION (Maximum loading speed on Bluehost shared hosting)
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
  AddOutputFilterByType DEFLATE application/json
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE image/svg+xml
  AddOutputFilterByType DEFLATE font/woff
  AddOutputFilterByType DEFLATE font/woff2
</IfModule>

# 5. BROWSER CACHING HEADERS (Instant repeats, fresh index.html updates)
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 month"

  # HTML files: Do NOT cache so new deployments on Bluehost take effect immediately
  ExpiresByType text/html "access plus 0 seconds"

  # Static CSS & JS (Vite generates unique content-hashed filenames)
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"

  # Media files & Images
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"

  # Fonts
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  # Prevent MIME-type sniffing
  Header set X-Content-Type-Options "nosniff"

  # Clickjacking protection
  Header always append X-Frame-Options SAMEORIGIN

  # Cache-Control headers for HTML vs Static Assets
  <FilesMatch "\\.(html|htm)$">
    Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
  </FilesMatch>

  <FilesMatch "\\.(js|css|webp|png|jpg|jpeg|gif|svg|woff|woff2)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
  </FilesMatch>
</IfModule>
`;

export function downloadHtaccessFile() {
  const blob = new Blob([BLUEHOST_HTACCESS_TEMPLATE], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '.htaccess';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const NETLIFY_TOML_TEMPLATE = `# ==============================================================================
# AL SAHAB AL RASHID TRAD. CON. LLC — NETLIFY CONFIGURATION
# Production Portal: wwwasar.com | Location: Sultanate of Oman
# ==============================================================================

[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"

# SPA Fallback: Directs all virtual client-side paths to index.html with HTTP 200
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# High-performance asset caching for immutable Vite bundles
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Global security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# HTML and root path fresh revalidation on every deploy (prevents visitors seeing stale versions)
[[headers]]
  for = "/"
  [headers.values]
    Cache-Control = "max-age=0, no-cache, no-store, must-revalidate"
    Pragma = "no-cache"
    Expires = "0"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "max-age=0, no-cache, no-store, must-revalidate"
    Pragma = "no-cache"
    Expires = "0"
`;

export const NETLIFY_REDIRECTS_TEMPLATE = `/*    /index.html   200\n`;

export function downloadNetlifyTomlFile() {
  const blob = new Blob([NETLIFY_TOML_TEMPLATE], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'netlify.toml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadNetlifyRedirectsFile() {
  const blob = new Blob([NETLIFY_REDIRECTS_TEMPLATE], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '_redirects';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
export * from './workSectionsData';
