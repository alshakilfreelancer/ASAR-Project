import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Compass,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  X,
  Lock,
  Unlock,
  ExternalLink,
  Download,
  Database,
  Send,
  Award,
  Sliders,
  RefreshCw,
  LogIn,
  LogOut,
  Eye,
  EyeOff,
  Key,
  RotateCcw,
  Upload,
  Camera,
  Edit3,
  Type,
  Zap,
  Copy,
  Server,
  Globe,
  Cloud,
  Code2,
  FileSpreadsheet,
  Move,
  Minimize2,
  Maximize2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Layers,
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  limit,
} from 'firebase/firestore';
import {
  auth,
  db,
  OperationType,
  handleFirestoreError,
  testFirestoreConnection,
  signInAdminWithGoogle,
  signOutAdmin,
} from './lib/firebase';
import {
  OFFICIAL_GOOGLE_MAPS_LINK,
  SiteConfigData,
  CoreServiceItem,
  RunningProjectItem,
  GalleryPhotoItem,
  CompletedProjectItem,
  ClientInquiryItem,
  KpiCardItem,
  CoreValueItem,
  ManpowerTradeGroup,
  TextOverrideItem,
  CustomBlockItem,
  DEFAULT_SITE_CONFIG,
  DEFAULT_COMPANY_LOGO_URI,
  DEFAULT_CORE_SERVICES,
  DEFAULT_RUNNING_PROJECTS,
  DEFAULT_GALLERY_PHOTOS,
  DEFAULT_COMPLETED_PROJECTS,
  DEFAULT_KPI_CARDS,
  DEFAULT_CORE_VALUES,
  MANPOWER_TRADE_CATALOG,
  PRESET_ENGINEERING_IMAGES,
  AUTHENTIC_USER_PHOTOS,
  AUTHENTIC_PHOTO_BANK_ITEMS,
  createEngineeringSvgDataUri,
  sanitizeString,
  clampNumber,
  sanitizeHexColor,
  compressUploadedImageFile,
  exportStandaloneHtmlFile,
  generateStandaloneHtmlString,
  getFallbackSvgForCategory,
  getSafeImageUrl,
  BLUEHOST_HTACCESS_TEMPLATE,
  downloadHtaccessFile,
  NETLIFY_TOML_TEMPLATE,
  NETLIFY_REDIRECTS_TEMPLATE,
  downloadNetlifyTomlFile,
  downloadNetlifyRedirectsFile,
} from './data/defaultData';
import JSZip from 'jszip';
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SQL_SETUP_SCRIPT,
  submitInquiryToSupabase,
  fetchInquiriesFromSupabase,
  updateInquiryStatusInSupabase,
  deleteInquiryFromSupabase,
  syncSiteCmsToSupabase,
} from './lib/supabase';

const ADMIN_EMAIL = 'alshakilfreelancer@gmail.com';
// Deployment & Content Version Sync: Ensures EVERY visitor on mobile & desktop sees the newest updates immediately
const CURRENT_BUILD_VERSION = 'asar_deploy_sync_v10_20261023';

function enforceLatestBuildVersion(): void {
  if (typeof window === 'undefined') return;
  try {
    // Ensure viewport meta is set to 1280px so mobile browsers render the complete Desktop Mode layout
    const vp = document.getElementById('asar-viewport') || document.querySelector('meta[name="viewport"]');
    if (vp) {
      vp.setAttribute('content', 'width=1280');
    }
    const recordedVersion = window.localStorage.getItem('asar_app_build_version');
    if (recordedVersion !== CURRENT_BUILD_VERSION) {
      // Version mismatch: wipe any outdated cached content from previous deploys
      const prefixList = [
        'asar_cms_site_config',
        'asar_cms_core_services',
        'asar_cms_services',
        'asar_cms_running_projects',
        'asar_cms_gallery_photos',
        'asar_cms_completed_projects',
        'asar_cms_kpi_cards',
        'asar_cms_core_values',
        'asar_cms_manpower_groups',
        'asar_cms_text_overrides',
        'asar_cms_custom_blocks',
      ];
      for (let i = window.localStorage.length - 1; i >= 0; i--) {
        const k = window.localStorage.key(i);
        if (k && prefixList.some((p) => k.startsWith(p))) {
          window.localStorage.removeItem(k);
        }
      }
      window.localStorage.setItem('asar_app_build_version', CURRENT_BUILD_VERSION);
    }
  } catch {
    // Ignore storage errors
  }
}

enforceLatestBuildVersion();

const STORAGE_KEYS = {
  SITE_CONFIG: 'asar_cms_site_config_v10',
  SERVICES: 'asar_cms_core_services_v10',
  RUNNING: 'asar_cms_running_projects_v10',
  GALLERY: 'asar_cms_gallery_photos_v10',
  COMPLETED: 'asar_cms_completed_projects_v10',
  KPIS: 'asar_cms_kpi_cards_v10',
  VALUES: 'asar_cms_core_values_v10',
  MANPOWER: 'asar_cms_manpower_groups_v10',
  TEXT_OVERRIDES: 'asar_cms_text_overrides_v10',
  CUSTOM_BLOCKS: 'asar_cms_custom_blocks_v10',
  LOCAL_INQUIRIES: 'asar_cms_local_inquiries_v10',
  GITHUB_CONFIG: 'asar_cms_github_sync_config_v1',
};

function normalizeCorporateSiteConfig(raw: Partial<SiteConfigData>): SiteConfigData {
  const merged = {
    ...DEFAULT_SITE_CONFIG,
    ...raw,
  };
  // Automatically upgrade legacy default company name or legacy phone number if present
  if (
    !merged.companyName ||
    merged.companyName.trim() === 'Al Sahab Al Rashid Trad. Con. LLC' ||
    merged.companyName.trim() === 'Al Sahab Al Rashid Trad. Cont. Co LLL'
  ) {
    merged.companyName = 'Al Sahab Al Rashid Trad. & Cont. Co L.L.C';
  }
  if (
    !merged.officePhone ||
    merged.officePhone.includes('2459 0800') ||
    merged.officePhone.includes('9932 4510')
  ) {
    merged.officePhone = '+968 9570 6749';
  }
  if (
    !merged.officeEmail ||
    merged.officeEmail === 'info@wwwasar.com' ||
    merged.officeEmail === 'info@alsahabalrashid.com'
  ) {
    merged.officeEmail = 'saadsaid.asar@gmail.com';
  }
  if (
    !merged.officeAddress ||
    merged.officeAddress.includes('Al Sahab Al Rashid Trad. Con. LLC') ||
    merged.officeAddress.includes('Al Sahab Al Rashid Trad. Cont. Co LLL')
  ) {
    merged.officeAddress =
      'Al Sahab Al Rashid Trad. & Cont. Co L.L.C Head Office, Muscat, Sultanate of Oman (wwwasar.com)';
  }
  if (
    merged.aboutBackground &&
    (merged.aboutBackground.includes('Al Sahab Al Rashid Trad. Con. LLC') ||
      merged.aboutBackground.includes('Al Sahab Al Rashid Trad. Cont. Co LLL'))
  ) {
    merged.aboutBackground = merged.aboutBackground
      .replace(/Al Sahab Al Rashid Trad\. Con\. LLC/g, 'Al Sahab Al Rashid Trad. & Cont. Co L.L.C')
      .replace(/Al Sahab Al Rashid Trad\. Cont\. Co LLL/g, 'Al Sahab Al Rashid Trad. & Cont. Co L.L.C');
  }
  // Automatically upgrade legacy default Aim, Vision, and Mission to official screenshot text
  if (
    !merged.ourAim ||
    merged.ourAim.includes('To serve as the Sultanate of Oman')
  ) {
    merged.ourAim = DEFAULT_SITE_CONFIG.ourAim;
  }
  if (
    !merged.ourVision ||
    merged.ourVision.includes('To set the regional benchmark in civil infrastructure')
  ) {
    merged.ourVision = DEFAULT_SITE_CONFIG.ourVision;
  }
  if (
    !merged.ourMission ||
    merged.ourMission.includes('To deliver cost-effective, structurally resilient')
  ) {
    merged.ourMission = DEFAULT_SITE_CONFIG.ourMission;
  }
  merged.companyLogoUrl = merged.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI;
  merged.officeMapLink = merged.officeMapLink || OFFICIAL_GOOGLE_MAPS_LINK;
  merged.adminPassword = merged.adminPassword || DEFAULT_SITE_CONFIG.adminPassword || 'alsahab2026';
  return merged;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function sanitizeLoadedList<T extends { imageUrl: string }>(
  items: T[],
  defaults: T[]
): T[] {
  if (!Array.isArray(items) || items.length === 0) return defaults;
  return items.map((item, idx) => {
    const fallbackItem = defaults[idx % defaults.length];
    const img = (item.imageUrl || '').trim();
    if (!img || img === 'undefined' || img === 'null') {
      return { ...item, imageUrl: fallbackItem.imageUrl };
    }
    return item;
  });
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

const TABBAR_ITEMS = [
  { id: 'home', label: 'Home', summary: 'Executive overview, official Google Maps location & EPC metrics' },
  { id: 'services', label: 'Core Services & Work Types', summary: 'Civil, Earthworks, Manpower, MEP & Pipeline divisions' },
  { id: 'running-projects', label: 'Running Project Sites', summary: 'Live ongoing construction sites & interactive scope modal' },
  { id: 'gallery', label: 'Photo Gallery & Slider', summary: 'Interactive site photo carousel & categorized work gallery' },
  { id: 'portfolio', label: 'Completed Portfolio', summary: 'Delivered infrastructure & industrial contracts across Oman' },
  { id: 'about', label: 'About Us & Vision', summary: 'Corporate background, Aim, Vision, Mission & Core Values' },
  { id: 'contact', label: 'Contact & Inquiry', summary: 'Request skilled manpower deployment or turnkey project quote' },
  { id: 'developer', label: '👨‍💻 Developer', summary: 'Site Engineer & Developer: Eng. Abdullah Al Osman Shakil · Electrical Engineer' },
] as const;

interface PhotoEditorTarget {
  label: string;
  currentUrl: string;
  onApply: (newUrl: string) => void;
}

export default function App() {
  // Environment Detection: Google AI Studio preview, dev server, or localhost vs Public Production (Netlify / wwwasar.com)
  const isAiStudioEnv = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const h = window.location.hostname;
    return (
      h.includes('ais-') ||
      h.includes('run.app') ||
      h.includes('localhost') ||
      h === '127.0.0.1' ||
      window.location.protocol === 'file:'
    );
  }, []);

  // Authentication & Strict Admin Edit Mode state:
  // Editing is STRICTLY disabled everywhere until the user logs in via Admin Login (Password or verified Admin Google account).
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.removeItem('asar_admin_authenticated');
    } catch {
      // ignore
    }
    try {
      return window.sessionStorage.getItem('asar_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [rawAdminMode, setRawAdminMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem('asar_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  // Guaranteed lock: isAdminMode is NEVER true unless isAdminAuthenticated is true!
  const isAdminMode = Boolean(isAdminAuthenticated && rawAdminMode);
  const setIsAdminMode = (nextVal: boolean | ((prev: boolean) => boolean)) => {
    if (!isAdminAuthenticated) {
      setShowAdminLoginModal(true);
      return;
    }
    setRawAdminMode((prev) => (typeof nextVal === 'function' ? nextVal(prev) : nextVal));
  };

  // Draggable Compact Admin Edit Tab Bar State
  const [activeAdminEditTab, setActiveAdminEditTab] = useState<'text' | 'photo' | 'add' | 'brand' | 'backend'>('text');
  const [isAdminBarMinimized, setIsAdminBarMinimized] = useState(false);
  const [adminBarPos, setAdminBarPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingAdminBar, setIsDraggingAdminBar] = useState(false);
  const [targetCustomBlockSection, setTargetCustomBlockSection] = useState<string>('home');
  const adminBarRef = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [adminInputPassword, setAdminInputPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [showPasswordPlaintext, setShowPasswordPlaintext] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [confirmedBadgeId, setConfirmedBadgeId] = useState<string | null>(null);

  // Dual-Persisted Corporate Data State (LocalStorage + Firestore Cloud)
  const [siteConfig, setSiteConfig] = useState<SiteConfigData>(() =>
    normalizeCorporateSiteConfig(loadFromStorage(STORAGE_KEYS.SITE_CONFIG, DEFAULT_SITE_CONFIG))
  );
  const [coreServices, setCoreServices] = useState<CoreServiceItem[]>(() =>
    sanitizeLoadedList(loadFromStorage(STORAGE_KEYS.SERVICES, DEFAULT_CORE_SERVICES), DEFAULT_CORE_SERVICES)
  );
  const [runningProjects, setRunningProjects] = useState<RunningProjectItem[]>(() =>
    sanitizeLoadedList(loadFromStorage(STORAGE_KEYS.RUNNING, DEFAULT_RUNNING_PROJECTS), DEFAULT_RUNNING_PROJECTS)
  );
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>(() =>
    sanitizeLoadedList(loadFromStorage(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY_PHOTOS), DEFAULT_GALLERY_PHOTOS)
  );
  const [completedProjects, setCompletedProjects] = useState<CompletedProjectItem[]>(() =>
    sanitizeLoadedList(loadFromStorage(STORAGE_KEYS.COMPLETED, DEFAULT_COMPLETED_PROJECTS), DEFAULT_COMPLETED_PROJECTS)
  );
  const [kpiCards, setKpiCards] = useState<KpiCardItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.KPIS, DEFAULT_KPI_CARDS)
  );
  const [coreValues, setCoreValues] = useState<CoreValueItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.VALUES, DEFAULT_CORE_VALUES)
  );
  const [manpowerGroups, setManpowerGroups] = useState<ManpowerTradeGroup[]>(() =>
    loadFromStorage(STORAGE_KEYS.MANPOWER, MANPOWER_TRADE_CATALOG)
  );
  const [textOverrides, setTextOverrides] = useState<Record<string, TextOverrideItem>>(() =>
    loadFromStorage(STORAGE_KEYS.TEXT_OVERRIDES, {})
  );
  const [customBlocks, setCustomBlocks] = useState<CustomBlockItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.CUSTOM_BLOCKS, [])
  );
  const [cloudInquiries, setCloudInquiries] = useState<ClientInquiryItem[]>([]);
  const [localInquiries, setLocalInquiries] = useState<ClientInquiryItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.LOCAL_INQUIRIES, [])
  );

  // Selected Element for the Universal Inline Text/Block Inspector
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementDefaultText, setSelectedElementDefaultText] = useState<string>('');

  // Universal Photo Replacer / Uploader Modal State
  const [photoEditorTarget, setPhotoEditorTarget] = useState<PhotoEditorTarget | null>(null);
  const [photoDraftUrl, setPhotoDraftUrl] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);

  // LocalStorage persistence: Only saved when Admin Mode or AI Studio is actively editing
  useEffect(() => {
    if (isAdminMode || isAiStudioEnv) saveToStorage(STORAGE_KEYS.SITE_CONFIG, siteConfig);
  }, [siteConfig, isAdminMode, isAiStudioEnv]);

  useEffect(() => {
    if (isAdminMode || isAiStudioEnv) saveToStorage(STORAGE_KEYS.SERVICES, coreServices);
  }, [coreServices, isAdminMode, isAiStudioEnv]);

  useEffect(() => {
    if (isAdminMode || isAiStudioEnv) saveToStorage(STORAGE_KEYS.RUNNING, runningProjects);
  }, [runningProjects, isAdminMode, isAiStudioEnv]);

  useEffect(() => {
    if (isAdminMode || isAiStudioEnv) saveToStorage(STORAGE_KEYS.GALLERY, galleryPhotos);
  }, [galleryPhotos, isAdminMode, isAiStudioEnv]);

  useEffect(() => {
    if (isAdminMode || isAiStudioEnv) saveToStorage(STORAGE_KEYS.COMPLETED, completedProjects);
  }, [completedProjects, isAdminMode, isAiStudioEnv]);

  useEffect(() => {
    if (isAdminMode || isAiStudioEnv) saveToStorage(STORAGE_KEYS.KPIS, kpiCards);
  }, [kpiCards, isAdminMode, isAiStudioEnv]);

  useEffect(() => {
    if (isAdminMode || isAiStudioEnv) saveToStorage(STORAGE_KEYS.VALUES, coreValues);
  }, [coreValues, isAdminMode, isAiStudioEnv]);

  useEffect(() => {
    if (isAdminMode || isAiStudioEnv) saveToStorage(STORAGE_KEYS.MANPOWER, manpowerGroups);
  }, [manpowerGroups, isAdminMode, isAiStudioEnv]);

  useEffect(() => {
    if (isAdminMode || isAiStudioEnv) saveToStorage(STORAGE_KEYS.TEXT_OVERRIDES, textOverrides);
  }, [textOverrides, isAdminMode, isAiStudioEnv]);

  useEffect(() => {
    if (isAdminMode || isAiStudioEnv) saveToStorage(STORAGE_KEYS.CUSTOM_BLOCKS, customBlocks);
  }, [customBlocks, isAdminMode, isAiStudioEnv]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.LOCAL_INQUIRIES, localInquiries);
  }, [localInquiries]);

  // Interactive UI State
  const [activeTabId, setActiveTabId] = useState<string>('home');
  const [hoveredTabSummary, setHoveredTabSummary] = useState<string | null>(null);
  const [mapViewMode, setMapViewMode] = useState<'roadmap' | 'satellite' | 'schematic'>('roadmap');
  const [selectedManpowerGroup, setSelectedManpowerGroup] = useState<string>('ALL');
  const [selectedRunningProject, setSelectedRunningProject] = useState<RunningProjectItem | null>(null);

  // Carousel & Gallery State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('All');
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhotoItem | null>(null);

  // Completed Portfolio Filter
  const [portfolioFilter, setPortfolioFilter] = useState<string>('All');

  // Admin Modals & Inline Forms
  const [showAddRunningForm, setShowAddRunningForm] = useState(false);
  const [showAddGalleryForm, setShowAddGalleryForm] = useState(false);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [showAddCompletedForm, setShowAddCompletedForm] = useState(false);
  const [showBackendConfigModal, setShowBackendConfigModal] = useState(false);
  const [showDeveloperModal, setShowDeveloperModal] = useState(false);
  const [copiedDeveloperEmail, setCopiedDeveloperEmail] = useState(false);
  const [showBluehostModal, setShowBluehostModal] = useState(false);
  const [activeDeployTab, setActiveDeployTab] = useState<'netlify' | 'domain' | 'bluehost'>('netlify');
  const [copiedHtaccess, setCopiedHtaccess] = useState(false);
  const [copiedToml, setCopiedToml] = useState(false);
  const [copiedRedirects, setCopiedRedirects] = useState(false);
  const [copiedDnsIp, setCopiedDnsIp] = useState(false);

  const handleCopyHtaccess = () => {
    navigator.clipboard.writeText(BLUEHOST_HTACCESS_TEMPLATE);
    setCopiedHtaccess(true);
    showNotification('success', 'Copied Apache .htaccess configuration to clipboard!');
    setTimeout(() => setCopiedHtaccess(false), 3000);
  };

  const handleCopyToml = () => {
    navigator.clipboard.writeText(NETLIFY_TOML_TEMPLATE);
    setCopiedToml(true);
    showNotification('success', 'Copied netlify.toml configuration to clipboard!');
    setTimeout(() => setCopiedToml(false), 3000);
  };

  const handleCopyRedirects = () => {
    navigator.clipboard.writeText(NETLIFY_REDIRECTS_TEMPLATE);
    setCopiedRedirects(true);
    showNotification('success', 'Copied Netlify _redirects SPA rule to clipboard!');
    setTimeout(() => setCopiedRedirects(false), 3000);
  };

  const handleCopyDnsIp = () => {
    navigator.clipboard.writeText('75.2.60.5');
    setCopiedDnsIp(true);
    showNotification('success', 'Copied Netlify Load Balancer IP (75.2.60.5) to clipboard!');
    setTimeout(() => setCopiedDnsIp(false), 3000);
  };

  const [isGeneratingZip, setIsGeneratingZip] = useState(false);

  // Generates and downloads a complete Netlify Deployment ZIP bundle containing index.html, _redirects, netlify.toml and all 29 photographs
  const handleDownloadNetlifyZip = async () => {
    setIsGeneratingZip(true);
    showNotification('info', 'Packaging all 29 site photos, Netlify config & index.html into ZIP...');
    try {
      const zip = new JSZip();

      // 1. Root Netlify configuration files
      zip.file('_redirects', NETLIFY_REDIRECTS_TEMPLATE);
      zip.file('netlify.toml', NETLIFY_TOML_TEMPLATE);

      // 2. Standalone HTML file
      const htmlString = generateStandaloneHtmlString(
        siteConfig,
        coreServices,
        runningProjects,
        galleryPhotos,
        completedProjects,
        coreValues,
        supabaseUrl,
        supabaseKey
      );
      zip.file('index.html', htmlString);

      // 3. Package all 29 authentic user construction photographs into assets/aistudio/
      const photoFolder = zip.folder('assets/aistudio');
      const photoUrls = Object.values(AUTHENTIC_USER_PHOTOS);

      await Promise.all(
        photoUrls.map(async (url) => {
          try {
            const filename = url.split('/').pop() || 'photo.webp';
            const res = await fetch(url);
            if (res.ok) {
              const blob = await res.blob();
              photoFolder?.file(filename, blob);
            }
          } catch (err) {
            console.warn('Could not bundle photo in ZIP:', url, err);
          }
        })
      );

      // 4. Generate the ZIP blob and trigger browser download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'asar-netlify-production-package.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      showNotification(
        'success',
        'Downloaded complete Netlify package (asar-netlify-production-package.zip)! Drag directly onto app.netlify.com/drop.'
      );
    } catch (err) {
      showNotification('error', 'Error packaging ZIP bundle: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsGeneratingZip(false);
    }
  };

  // Universal Image Error Fallback: Prevents infinite error loops and guarantees zero broken images on Netlify, wwwasar.com, Bluehost, or any host
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    category = 'Civil Works',
    title = 'Al Sahab Al Rashid EPC',
    location = 'Muscat, Oman'
  ) => {
    const target = e.currentTarget;
    if (target.dataset.fallbackApplied === 'svg') return;

    // First attempt: If URL had a leading slash (/assets/...) and domain routing requires relative (./assets/...), try once
    const currentSrc = target.getAttribute('src') || '';
    if (!target.dataset.attemptedRelative && currentSrc.startsWith('/assets/')) {
      target.dataset.attemptedRelative = 'true';
      target.src = currentSrc.replace(/^\/assets\//, './assets/');
      return;
    }

    // Final guaranteed fallback: High-fidelity inline SVG vector data URI (zero network needed)
    target.dataset.fallbackApplied = 'svg';
    target.src = getFallbackSvgForCategory(category, title, location);
  };

  // Instant Reset / Sync button to clear stale browser localStorage on custom domains (wwwasar.com)
  const handleForceSyncOfficialPhotos = () => {
    setCoreServices(DEFAULT_CORE_SERVICES);
    setRunningProjects(DEFAULT_RUNNING_PROJECTS);
    setGalleryPhotos(DEFAULT_GALLERY_PHOTOS);
    setCompletedProjects(DEFAULT_COMPLETED_PROJECTS);
    setSiteConfig((prev) => ({
      ...prev,
      companyLogoUrl: DEFAULT_COMPANY_LOGO_URI,
    }));
    try {
      window.localStorage.removeItem(STORAGE_KEYS.SERVICES);
      window.localStorage.removeItem(STORAGE_KEYS.RUNNING);
      window.localStorage.removeItem(STORAGE_KEYS.GALLERY);
      window.localStorage.removeItem(STORAGE_KEYS.COMPLETED);
    } catch {
      // Ignore
    }
    showNotification('success', 'Reset & synchronized all 29 authentic Oman project photos!');
  };

  // Supabase Backend State (Project ID: utblsxterubtziionaja)
  const [supabaseUrl, setSupabaseUrl] = useState(SUPABASE_URL);
  const [supabaseKey, setSupabaseKey] = useState(SUPABASE_PUBLISHABLE_KEY);
  const [supabaseInquiries, setSupabaseInquiries] = useState<ClientInquiryItem[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    ok: boolean;
    needsTableSetup?: boolean;
    message: string;
  }>({
    ok: true,
    message: `Supabase configured (${SUPABASE_PROJECT_ID})`,
  });
  const [copiedSql, setCopiedSql] = useState(false);

  // New Running Project Form State
  const [newProject, setNewProject] = useState({
    title: '',
    location: '',
    client: '',
    category: 'Civil Works & Earth Works',
    progress: 35,
    startDate: 'Oct 2026',
    completionTarget: 'Aug 2027',
    manpowerCount: 65,
    engineerLead: '',
    summary: '',
    scopeDetails: '',
    imageUrl: DEFAULT_RUNNING_PROJECTS[0].imageUrl,
  });

  // New Gallery Photo Form State
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    category: 'Civil & Structural',
    location: 'Muscat, Oman',
    caption: '',
    imageUrl: DEFAULT_GALLERY_PHOTOS[0].imageUrl,
  });

  // New Core Service Form State
  const [newService, setNewService] = useState({
    title: '',
    categoryCode: 'DIV-06 · SPECIALIZED EPC',
    summary: '',
    specialties: '',
    imageUrl: DEFAULT_CORE_SERVICES[0].imageUrl,
  });

  // New Completed Project Form State
  const [newCompleted, setNewCompleted] = useState({
    title: '',
    client: '',
    location: '',
    completionYear: '2026',
    contractValue: '',
    category: 'Civil Works',
    description: '',
    imageUrl: DEFAULT_COMPLETED_PROJECTS[0].imageUrl,
  });

  // Client Inquiry Form State
  const [inquiryForm, setInquiryForm] = useState({
    clientName: '',
    companyName: '',
    email: '',
    phone: '',
    inquiryType: 'Skilled & Unskilled Manpower Supply' as ClientInquiryItem['inquiryType'],
    projectLocation: '',
    manpowerDetails: '',
    message: '',
  });
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySubmittedSuccess, setInquirySubmittedSuccess] = useState<string | null>(null);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  const isVerifiedAdminUser = Boolean(
    currentUser && currentUser.emailVerified && currentUser.email === ADMIN_EMAIL
  );
  const canWriteCloud = Boolean(isAdminAuthenticated || isVerifiedAdminUser);
  const cloudAuthorId = isVerifiedAdminUser && currentUser ? currentUser.uid : 'admin_portal';

  // Notification Banner & Confirmed Badges State
  const showNotification = (type: 'success' | 'info' | 'error', text: string, badgeKey?: string) => {
    setStatusBanner({ type, text });
    if (badgeKey) {
      setConfirmedBadgeId(badgeKey);
      window.setTimeout(() => {
        setConfirmedBadgeId((prev) => (prev === badgeKey ? null : prev));
      }, 2800);
    }
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // GitHub Auto-Commit State (Allows Admin Mode edits on website to auto-update GitHub repository & code)
  const [githubRepo, setGithubRepo] = useState<string>(() => {
    try {
      return window.localStorage.getItem('asar_github_repo') || '';
    } catch {
      return '';
    }
  });
  const [githubToken, setGithubToken] = useState<string>(() => {
    try {
      return window.localStorage.getItem('asar_github_token') || '';
    } catch {
      return '';
    }
  });
  const [githubBranch, setGithubBranch] = useState<string>(() => {
    try {
      return window.localStorage.getItem('asar_github_branch') || 'main';
    } catch {
      return 'main';
    }
  });
  const [githubSyncStatus, setGithubSyncStatus] = useState<string | null>(null);
  const [isSyncingToGithub, setIsSyncingToGithub] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [showGithubSettingsInBar, setShowGithubSettingsInBar] = useState(false);

  // Save GitHub credentials to LocalStorage + Cloud Firestore (Synchronized across all Admin devices)
  const handleSaveGitHubCredentials = async (repo: string, token: string, branch: string) => {
    const cleanRepo = repo
      .trim()
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/\.git$/i, '')
      .replace(/\/+$/, '');
    const cleanToken = token.trim();
    const cleanBranch = branch.trim() || 'main';

    setGithubRepo(cleanRepo);
    setGithubToken(cleanToken);
    setGithubBranch(cleanBranch);

    try {
      window.localStorage.setItem('asar_github_repo', cleanRepo);
      window.localStorage.setItem('asar_github_token', cleanToken);
      window.localStorage.setItem('asar_github_branch', cleanBranch);
    } catch {
      // ignore
    }

    if (canWriteCloud) {
      try {
        await setDoc(doc(db, 'textOverrides', 'github-repo'), {
          elementId: 'github-repo',
          textValue: cleanRepo,
          textColor: '',
          fontSize: '',
          bgColor: '',
          hidden: false,
          authorId: cloudAuthorId,
          updatedAt: serverTimestamp(),
        });
        await setDoc(doc(db, 'textOverrides', 'github-token'), {
          elementId: 'github-token',
          textValue: cleanToken,
          textColor: '',
          fontSize: '',
          bgColor: '',
          hidden: false,
          authorId: cloudAuthorId,
          updatedAt: serverTimestamp(),
        });
        await setDoc(doc(db, 'textOverrides', 'github-branch'), {
          elementId: 'github-branch',
          textValue: cleanBranch,
          textColor: '',
          fontSize: '',
          bgColor: '',
          hidden: false,
          authorId: cloudAuthorId,
          updatedAt: serverTimestamp(),
        });
      } catch {
        // ignore credentials cloud save error
      }
    }

    showNotification('success', '✓ GitHub configuration saved! Now testing connection...');
    await pushCmsUpdateToGitHub('Connect GitHub repository to ASAR Admin Portal', true, cleanRepo, cleanToken, cleanBranch);
  };

  // Push CMS snapshot directly to GitHub repository via GitHub REST API (Auto-updates codebase)
  const pushCmsUpdateToGitHub = async (
    commitMessage = 'Admin Portal Live Update (wwwasar.com)',
    isExplicitAction = false,
    overrideRepo?: string,
    overrideToken?: string,
    overrideBranch?: string
  ) => {
    const effectiveRepo = (
      overrideRepo ??
      githubRepo ??
      textOverrides['github-repo']?.textValue ??
      ''
    )
      .trim()
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/\.git$/i, '')
      .replace(/\/+$/, '');
    const effectiveToken = (
      overrideToken ??
      githubToken ??
      textOverrides['github-token']?.textValue ??
      ''
    ).trim();
    const effectiveBranch = (
      overrideBranch ??
      githubBranch ??
      textOverrides['github-branch']?.textValue ??
      'main'
    ).trim() || 'main';

    if (!effectiveRepo || !effectiveToken) {
      const hintMsg = 'GitHub auto-update ready: Enter your GitHub Repo & Token in Tab 5 to auto-commit website edits.';
      setGithubSyncStatus(hintMsg);
      if (isExplicitAction) {
        showNotification(
          'info',
          'Please configure your GitHub Repo (owner/repo) and Token in Tab 5 (Data) to push commits directly to GitHub.'
        );
      }
      return false;
    }

    try {
      setIsSyncingToGithub(true);
      setGithubSyncStatus(`Syncing changes to GitHub (${effectiveRepo}@${effectiveBranch})...`);
      const filePath = 'public/cms-live-data.json';
      const apiUrl = `https://api.github.com/repos/${effectiveRepo}/contents/${filePath}`;
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${effectiveToken}`,
      };

      let existingSha: string | undefined;
      const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(effectiveBranch)}`, { headers });
      if (getRes.ok) {
        const fileMeta = await getRes.json();
        existingSha = fileMeta.sha;
      } else if (getRes.status === 401 || getRes.status === 403) {
        const errMsg = 'GitHub Token is invalid or lacks "repo" write permissions. Please verify your token.';
        setGithubSyncStatus(`✗ ${errMsg}`);
        showNotification('error', errMsg);
        return false;
      } else if (getRes.status === 404) {
        // Test if repository itself exists
        const repoCheck = await fetch(`https://api.github.com/repos/${effectiveRepo}`, { headers });
        if (!repoCheck.ok) {
          const repoErrMsg = `GitHub repository "${effectiveRepo}" not found. Verify repository name.`;
          setGithubSyncStatus(`✗ ${repoErrMsg}`);
          showNotification('error', repoErrMsg);
          return false;
        }
      }

      const payloadJson = JSON.stringify(
        {
          updatedAt: new Date().toISOString(),
          siteConfig: normalizeCorporateSiteConfig(siteConfig),
          coreServices,
          runningProjects,
          galleryPhotos,
          completedProjects,
          kpiCards,
          coreValues,
          manpowerGroups,
          textOverrides,
          customBlocks,
        },
        null,
        2
      );

      const base64Content = window.btoa(unescape(encodeURIComponent(payloadJson)));
      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: base64Content,
          branch: effectiveBranch,
          ...(existingSha ? { sha: existingSha } : {}),
        }),
      });

      if (putRes.ok) {
        const resData = await putRes.json().catch(() => ({}));
        const commitSha = resData.commit?.sha?.slice(0, 7) || 'latest';
        const msg = `✓ Committed to GitHub (${effectiveRepo}@${effectiveBranch} #${commitSha})`;
        setGithubSyncStatus(msg);
        showNotification('success', `✓ Live edits automatically committed to GitHub (${commitSha})!`);
        return true;
      } else {
        const errData = await putRes.json().catch(() => ({}));
        const errDetail = errData.message || putRes.statusText;
        setGithubSyncStatus(`GitHub commit error: ${errDetail}`);
        showNotification('error', `GitHub update failed: ${errDetail}`);
        return false;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setGithubSyncStatus(`GitHub error: ${errMsg}`);
      showNotification('error', `GitHub error: ${errMsg}`);
      return false;
    } finally {
      setIsSyncingToGithub(false);
    }
  };

  // 1-Click Send Test Inquiry Email to User's Gmail (saadsaid.asar@gmail.com & alshakilfreelancer@gmail.com)
  const handleSendTestInquiryEmail = async () => {
    setIsSendingTestEmail(true);
    const testRefId = `TEST-${Date.now().toString().slice(-4)}`;
    const recipients = ['saadsaid.asar@gmail.com', 'alshakilfreelancer@gmail.com'];
    const customInquiryEmail = (
      textOverrides['inquiry-target-email']?.textValue ||
      window.localStorage.getItem('asar_inquiry_target_email') ||
      ''
    ).trim();
    if (customInquiryEmail && customInquiryEmail.includes('@') && !recipients.includes(customInquiryEmail)) {
      recipients.push(customInquiryEmail);
    }

    try {
      const sendPromises = recipients.map(async (rcpt) => {
        try {
          const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(rcpt)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              _subject: `TEST INQUIRY (${testRefId}) - Al Sahab Al Rashid Trad. & Cont. Co L.L.C`,
              _template: 'table',
              _captcha: 'false',
              _cc: recipients.join(','),
              Reference_ID: testRefId,
              Test_Status: 'CONFIRMED LIVE INQUIRY DISPATCH',
              Company_Name: 'Al Sahab Al Rashid Trad. & Cont. Co L.L.C (ASAR)',
              Client_Name: 'ASAR Admin Verification Test',
              Email: rcpt,
              Phone: '+968 9321 0000',
              Inquiry_Type: 'Skilled & Unskilled Manpower Supply / Civil Construction',
              Project_Location: 'Muscat, Sultanate of Oman',
              Manpower_Trades_Count: 'Civil Foremen, Masons, Steel Fixers, Electricians',
              Project_Scope_Message:
                'This is a live test inquiry confirming that client submissions from wwwasar.com arrive directly in your Gmail inbox.',
              Sent_At: new Date().toLocaleString(),
            }),
          });
          return { email: rcpt, ok: res.ok };
        } catch {
          return { email: rcpt, ok: false };
        }
      });

      const results = await Promise.all(sendPromises);
      const succeeded = results.filter((r) => r.ok).map((r) => r.email);

      if (succeeded.length > 0) {
        showNotification(
          'success',
          `✓ Test inquiry sent to ${succeeded.join(' & ')}! Check your Gmail Inbox (and Spam on first delivery).`
        );
      } else {
        showNotification(
          'info',
          `Test inquiry triggered to ${recipients.join(' & ')}. Check your Gmail inbox for FormSubmit confirmation.`
        );
      }
    } catch {
      showNotification('error', 'Error sending test inquiry email.');
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const downloadUpdatedCodeFile = () => {
    const codeSnapshot = `// Auto-Generated Permanent Code Snapshot from Admin Portal (${new Date().toISOString()})
// Replace /public/cms-live-data.json or import into your repository
export const PERMANENT_ADMIN_CMS_DATA = ${JSON.stringify(
      {
        siteConfig: normalizeCorporateSiteConfig(siteConfig),
        coreServices,
        runningProjects,
        galleryPhotos,
        completedProjects,
        textOverrides,
        customBlocks,
      },
      null,
      2
    )};
`;
    const blob = new Blob([codeSnapshot], { type: 'application/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'permanent-cms-code-update.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('success', 'Downloaded permanent TypeScript code file (permanent-cms-code-update.ts)!');
  };

  // Open the Universal Photo Editor for ANY image on the website (Strictly requires Admin Login)
  const openPhotoEditor = (label: string, currentUrl: string, onApply: (newUrl: string) => void) => {
    if (!isAdminAuthenticated || !isAdminMode) {
      setShowAdminLoginModal(true);
      return;
    }
    setPhotoEditorTarget({ label, currentUrl, onApply });
    setPhotoDraftUrl(currentUrl);
  };

  // Handle device image file upload inside Universal Photo Editor
  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const compressedDataUri = await compressUploadedImageFile(file);
      setPhotoDraftUrl(compressedDataUri);
      showNotification('info', `Loaded "${file.name}" — click "Apply & Save Photo" to confirm.`);
    } catch {
      showNotification('error', 'Could not read that image file. Please try another JPG, PNG, or WebP photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // 1. Validate Firestore connection, listen to Auth state, and load Supabase inquiries
  const refreshSupabaseInquiries = async (url = supabaseUrl, key = supabaseKey) => {
    const res = await fetchInquiriesFromSupabase(url, key);
    if (res.status.ok) {
      setSupabaseInquiries(res.items);
    }
    setSupabaseStatus(res.status);
  };

  useEffect(() => {
    testFirestoreConnection();
    refreshSupabaseInquiries(supabaseUrl, supabaseKey);
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsubAuth();
  }, []);

  // Synchronize Google Auth with Admin Authentication
  useEffect(() => {
    if (currentUser && currentUser.email === ADMIN_EMAIL) {
      setIsAdminAuthenticated(true);
      try {
        window.sessionStorage.setItem('asar_admin_authenticated', 'true');
      } catch {
        // ignore
      }
    }
  }, [currentUser]);

  // Keyboard shortcut (Ctrl + Shift + A / Cmd + Shift + A) and Hash listener (#admin)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (!isAdminAuthenticated) {
          setAdminAuthError(null);
          setAdminInputPassword('');
          setShowAdminLoginModal(true);
        } else {
          const next = !isAdminMode;
          setIsAdminMode(next);
          if (!next) setSelectedElementId(null);
          showNotification(
            'info',
            next
              ? 'Admin Edit Mode activated!'
              : 'Admin Edit Mode closed.'
          );
        }
      }
    };

    const handleHashCheck = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#admin') {
        if (!isAdminAuthenticated) {
          setAdminAuthError(null);
          setAdminInputPassword('');
          setShowAdminLoginModal(true);
        } else {
          setIsAdminMode(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHashCheck);
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      handleHashCheck();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashCheck);
    };
  }, [isAdminAuthenticated, isAdminMode]);

  // Mouse & Touch Drag Listeners for the Compact Floating Admin Edit Tab Bar
  useEffect(() => {
    if (!isDraggingAdminBar) return;

    const handleMouseMove = (e: MouseEvent) => {
      const barWidth = adminBarRef.current?.offsetWidth || 380;
      const barHeight = adminBarRef.current?.offsetHeight || 120;
      const nextX = Math.max(8, Math.min(window.innerWidth - Math.min(barWidth, 240), e.clientX - dragOffsetRef.current.offsetX));
      const nextY = Math.max(8, Math.min(window.innerHeight - Math.min(barHeight, 64), e.clientY - dragOffsetRef.current.offsetY));
      setAdminBarPos({ x: nextX, y: nextY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const t = e.touches[0];
      const barWidth = adminBarRef.current?.offsetWidth || 380;
      const barHeight = adminBarRef.current?.offsetHeight || 120;
      const nextX = Math.max(8, Math.min(window.innerWidth - Math.min(barWidth, 240), t.clientX - dragOffsetRef.current.offsetX));
      const nextY = Math.max(8, Math.min(window.innerHeight - Math.min(barHeight, 64), t.clientY - dragOffsetRef.current.offsetY));
      setAdminBarPos({ x: nextX, y: nextY });
    };

    const handleStopDrag = () => {
      setIsDraggingAdminBar(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleStopDrag);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleStopDrag);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleStopDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleStopDrag);
    };
  }, [isDraggingAdminBar]);

  const startAdminBarDrag = (clientX: number, clientY: number) => {
    if (!adminBarRef.current) return;
    const rect = adminBarRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
    setAdminBarPos({ x: rect.left, y: rect.top });
    setIsDraggingAdminBar(true);
  };

  const handleUnlockAdminWithPassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentExpected = siteConfig.adminPassword || 'alsahab2026';
    if (adminInputPassword.trim() === currentExpected.trim()) {
      setIsAdminAuthenticated(true);
      setRawAdminMode(true);
      setAdminAuthError(null);
      setAdminInputPassword('');
      setShowAdminLoginModal(false);
      try {
        window.sessionStorage.setItem('asar_admin_authenticated', 'true');
        window.localStorage.removeItem('asar_admin_authenticated');
      } catch {
        // ignore
      }
      showNotification('success', 'Admin Mode Unlocked! Use the movable Admin Studio bar to edit anything.');
    } else {
      setAdminAuthError('Invalid Admin Password. Please try again or sign in with Google.');
    }
  };

  const handleAdminLogout = () => {
    setRawAdminMode(false);
    setIsAdminAuthenticated(false);
    setSelectedElementId(null);
    try {
      window.sessionStorage.removeItem('asar_admin_authenticated');
      window.localStorage.removeItem('asar_admin_authenticated');
    } catch {
      // ignore
    }
    showNotification('info', 'Admin Mode locked & logged out. Editing is now disabled.');
  };

  const handleChangeAdminPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newAdminPassword || newAdminPassword.trim().length < 4) {
      showNotification('error', 'New password must be at least 4 characters long.');
      return;
    }
    const updatedConfig: SiteConfigData = {
      ...siteConfig,
      adminPassword: newAdminPassword.trim(),
    };
    await saveSiteConfigToCloud(updatedConfig, 'password-change');
    setNewAdminPassword('');
    setShowPasswordChangeModal(false);
    showNotification('success', 'Admin Password successfully updated & saved to Cloud Database!');
  };

  // 2. Real-time listeners for Public Corporate Content collections (Synchronized across ALL Mobile & Desktop devices)
  useEffect(() => {
    const unsubConfig = onSnapshot(
      doc(db, 'siteConfig', 'main'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<SiteConfigData>;
          setSiteConfig((prev) => {
            const merged = normalizeCorporateSiteConfig({
              ...prev,
              ...data,
              companyLogoUrl: data.companyLogoUrl || prev.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI,
              officeMapLink: data.officeMapLink || prev.officeMapLink || OFFICIAL_GOOGLE_MAPS_LINK,
              adminPassword: data.adminPassword || prev.adminPassword || 'alsahab2026',
            });
            saveToStorage(STORAGE_KEYS.SITE_CONFIG, merged);
            return merged;
          });
        }
      },
      (err) => {
        console.warn('SiteConfig listener info:', err.message);
      }
    );

    const unsubServices = onSnapshot(
      query(collection(db, 'coreServices'), limit(100)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs
            .map((d) => ({ ...(d.data() as Omit<CoreServiceItem, 'id'>), id: d.id }))
            .sort((a, b) => a.orderIndex - b.orderIndex);
          setCoreServices(items);
          saveToStorage(STORAGE_KEYS.SERVICES, items);
        }
      },
      (err) => {
        console.warn('CoreServices listener info:', err.message);
      }
    );

    const unsubRunning = onSnapshot(
      query(collection(db, 'runningProjects'), limit(100)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({
            ...(d.data() as Omit<RunningProjectItem, 'id'>),
            id: d.id,
          }));
          setRunningProjects(items);
          saveToStorage(STORAGE_KEYS.RUNNING, items);
        }
      },
      (err) => {
        console.warn('RunningProjects listener info:', err.message);
      }
    );

    const unsubGallery = onSnapshot(
      query(collection(db, 'galleryPhotos'), limit(100)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({
            ...(d.data() as Omit<GalleryPhotoItem, 'id'>),
            id: d.id,
          }));
          setGalleryPhotos(items);
          saveToStorage(STORAGE_KEYS.GALLERY, items);
        }
      },
      (err) => {
        console.warn('GalleryPhotos listener info:', err.message);
      }
    );

    const unsubCompleted = onSnapshot(
      query(collection(db, 'completedProjects'), limit(100)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({
            ...(d.data() as Omit<CompletedProjectItem, 'id'>),
            id: d.id,
          }));
          setCompletedProjects(items);
          saveToStorage(STORAGE_KEYS.COMPLETED, items);
        }
      },
      (err) => {
        console.warn('CompletedProjects listener info:', err.message);
      }
    );

    const unsubTextOverrides = onSnapshot(
      query(collection(db, 'textOverrides'), limit(100)),
      (snap) => {
        if (!snap.empty) {
          const map: Record<string, TextOverrideItem> = {};
          snap.docs.forEach((d) => {
            const data = d.data() as TextOverrideItem;
            map[data.elementId || d.id] = data;
          });
          if (map['github-repo']?.textValue) {
            setGithubRepo((prev) => prev || map['github-repo'].textValue);
          }
          if (map['github-token']?.textValue) {
            setGithubToken((prev) => prev || map['github-token'].textValue);
          }
          if (map['github-branch']?.textValue) {
            setGithubBranch((prev) => prev || map['github-branch'].textValue);
          }
          setTextOverrides((prev) => {
            const merged = { ...prev, ...map };
            saveToStorage(STORAGE_KEYS.TEXT_OVERRIDES, merged);
            return merged;
          });
        }
      },
      (err) => {
        console.warn('TextOverrides listener info:', err.message);
      }
    );

    const unsubCustomBlocks = onSnapshot(
      query(collection(db, 'customBlocks'), limit(100)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({
            ...(d.data() as Omit<CustomBlockItem, 'id'>),
            id: d.id,
          }));
          setCustomBlocks(items);
          saveToStorage(STORAGE_KEYS.CUSTOM_BLOCKS, items);
        }
      },
      (err) => {
        console.warn('CustomBlocks listener info:', err.message);
      }
    );

    return () => {
      unsubConfig();
      unsubServices();
      unsubRunning();
      unsubGallery();
      unsubCompleted();
      unsubTextOverrides();
      unsubCustomBlocks();
    };
  }, []);

  // 3. Authenticated listener for Client Inquiries (PII isolated per Security Rules Pillar 6 & 8)
  useEffect(() => {
    if (!authReady || !currentUser) {
      setCloudInquiries([]);
      return;
    }

    const inquiriesQuery = isVerifiedAdminUser
      ? collection(db, 'inquiries')
      : query(collection(db, 'inquiries'), where('authorId', '==', currentUser.uid));

    const unsubInquiries = onSnapshot(
      inquiriesQuery,
      (snap) => {
        const items: ClientInquiryItem[] = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            clientName: raw.clientName,
            companyName: raw.companyName,
            email: raw.email,
            phone: raw.phone,
            inquiryType: raw.inquiryType,
            projectLocation: raw.projectLocation,
            manpowerDetails: raw.manpowerDetails,
            message: raw.message,
            status: raw.status,
            authorId: raw.authorId,
          };
        });
        setCloudInquiries(items);
      },
      (err) => {
        console.warn('Inquiries listener info:', err.message);
      }
    );

    return () => unsubInquiries();
  }, [authReady, currentUser, isVerifiedAdminUser]);

  // Carousel auto-rotation (paused automatically when Admin Mode is ON so editing is uninterrupted)
  useEffect(() => {
    if (!isAutoPlay || isAdminMode || galleryPhotos.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % galleryPhotos.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [isAutoPlay, isAdminMode, galleryPhotos.length]);

  // Parse & Build compact font style specification (stored inside fontSize up to 30 chars for Firestore compatibility)
  const parseFontStyleSpec = (rawSpec?: string) => {
    const tokens = (rawSpec || '').split('|').filter(Boolean);
    let size = '';
    let bold = false;
    let italic = false;
    let underline = false;
    let uppercase = false;
    let align: '' | 'left' | 'center' | 'right' = '';
    for (const t of tokens) {
      if (t.endsWith('px') || t.endsWith('rem') || t.endsWith('em')) size = t;
      else if (t === 'B') bold = true;
      else if (t === 'I') italic = true;
      else if (t === 'U') underline = true;
      else if (t === 'UC') uppercase = true;
      else if (t === 'left' || t === 'center' || t === 'right') align = t;
    }
    return { size, bold, italic, underline, uppercase, align };
  };

  const buildFontStyleSpec = (spec: {
    size?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    uppercase?: boolean;
    align?: '' | 'left' | 'center' | 'right';
  }) => {
    const parts: string[] = [];
    if (spec.size) parts.push(spec.size);
    if (spec.bold) parts.push('B');
    if (spec.italic) parts.push('I');
    if (spec.underline) parts.push('U');
    if (spec.uppercase) parts.push('UC');
    if (spec.align) parts.push(spec.align);
    return parts.join('|').slice(0, 30);
  };

  // Save a single inline Text/Heading/Block Override to LocalStorage + Cloud Firestore + GitHub
  const saveTextOverride = async (override: TextOverrideItem) => {
    const cleanId = override.elementId.replace(/[^a-zA-Z0-9_-]/g, '-');
    const isBackendSetting =
      cleanId === 'inquiry-target-email' ||
      cleanId === 'inquiry-sheet-webhook' ||
      cleanId === 'github-repo' ||
      cleanId === 'github-token' ||
      cleanId === 'github-branch';
    if (!isAdminAuthenticated && !isBackendSetting) {
      setShowAdminLoginModal(true);
      return;
    }
    const updatedItem: TextOverrideItem = {
      ...override,
      elementId: cleanId,
      authorId: cloudAuthorId,
    };

    setTextOverrides((prev) => {
      const next = { ...prev, [cleanId]: updatedItem };
      saveToStorage(STORAGE_KEYS.TEXT_OVERRIDES, next);
      return next;
    });

    if (canWriteCloud) {
      try {
        await setDoc(doc(db, 'textOverrides', cleanId), {
          elementId: sanitizeString(cleanId, 1, 120, 'el-1'),
          textValue: (updatedItem.textValue || '').slice(0, 5000),
          textColor: (updatedItem.textColor || '').slice(0, 30),
          fontSize: (updatedItem.fontSize || '').slice(0, 30),
          bgColor: (updatedItem.bgColor || '').slice(0, 30),
          hidden: Boolean(updatedItem.hidden),
          authorId: cloudAuthorId,
          updatedAt: serverTimestamp(),
        });
        void pushCmsUpdateToGitHub(`Update text element ${cleanId}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `textOverrides/${cleanId}`);
      }
    }
  };

  // Universal helper to render ANY heading, text, label, or block as inline-editable ONLY when Admin Login & Admin Mode are active
  const renderEditableElement = (
    elementId: string,
    defaultText: string,
    Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' = 'span',
    className = '',
    baseStyle?: React.CSSProperties
  ) => {
    const cleanId = elementId.replace(/[^a-zA-Z0-9_-]/g, '-');
    const ov = textOverrides[cleanId];
    if (ov?.hidden && !isAdminMode) {
      return null;
    }

    const currentText = ov !== undefined ? ov.textValue : defaultText;
    const isSelected = isAdminMode && selectedElementId === cleanId;
    const parsedFont = parseFontStyleSpec(ov?.fontSize);

    const mergedStyle: React.CSSProperties = {
      ...baseStyle,
      ...(ov?.textColor ? { color: ov.textColor } : {}),
      ...(ov?.bgColor ? { backgroundColor: ov.bgColor, padding: '2px 6px', borderRadius: '6px' } : {}),
      ...(parsedFont.size ? { fontSize: parsedFont.size } : {}),
      ...(parsedFont.bold ? { fontWeight: 800 } : {}),
      ...(parsedFont.italic ? { fontStyle: 'italic' } : {}),
      ...(parsedFont.underline ? { textDecoration: 'underline' } : {}),
      ...(parsedFont.uppercase ? { textTransform: 'uppercase' } : {}),
      ...(parsedFont.align
        ? {
            textAlign: parsedFont.align,
            display: Tag === 'span' ? 'inline-block' : undefined,
            width: Tag === 'span' ? '100%' : undefined,
          }
        : {}),
      ...(ov?.hidden && isAdminMode ? { opacity: 0.4, textDecoration: 'line-through' } : {}),
    };

    const adminClasses = isAdminMode
      ? `outline-1 outline-dashed ${
          isSelected
            ? 'outline-2 outline-[#f97316] bg-orange-50/90 ring-2 ring-[#f97316]/30'
            : 'outline-[#f97316]/55 hover:outline-2 hover:outline-[#f97316] hover:bg-orange-50/50'
        } rounded px-1 -mx-1 transition-all cursor-text`
      : '';

    return (
      <Tag
        key={cleanId}
        contentEditable={isAdminMode}
        suppressContentEditableWarning
        onClick={(e) => {
          if (!isAdminMode || !isAdminAuthenticated) return;
          e.stopPropagation();
          setSelectedElementId(cleanId);
          setSelectedElementDefaultText(defaultText);
          setActiveAdminEditTab('text');
          setIsAdminBarMinimized(false);
        }}
        onBlur={(e) => {
          if (!isAdminMode || !isAdminAuthenticated) return;
          const newText = e.currentTarget.innerText;
          if (newText !== currentText) {
            saveTextOverride({
              elementId: cleanId,
              textValue: newText,
              textColor: ov?.textColor || '',
              fontSize: ov?.fontSize || '',
              bgColor: ov?.bgColor || '',
              hidden: Boolean(ov?.hidden),
              authorId: currentUser?.uid || 'local_admin',
            });
            showNotification('success', `Updated text: "${newText.slice(0, 36)}..."`, cleanId);
          }
        }}
        title={isAdminMode ? 'Click to edit text directly or style in Admin Studio bar' : undefined}
        className={`${className} ${adminClasses}`}
        style={mergedStyle}
      >
        {currentText}
      </Tag>
    );
  };

  // Add, update, or delete a Custom Block inside any section (Strictly requires Admin Login)
  const handleAddCustomBlock = async (sectionId: string, withPhoto = false) => {
    if (!isAdminAuthenticated || !isAdminMode) {
      setShowAdminLoginModal(true);
      return;
    }
    const newId = `blk-${Date.now()}`;
    const newBlock: CustomBlockItem = {
      id: newId,
      sectionId,
      heading: 'Custom Corporate Heading or Notice (Click to Edit)',
      body: 'Click directly on this paragraph or heading in Admin Mode to customize text, colors, or attach a site photograph.',
      imageUrl: withPhoto ? PRESET_ENGINEERING_IMAGES[0].url : '',
      bgColor: '#ffffff',
      textColor: siteConfig.primaryNavy,
      authorId: cloudAuthorId,
    };
    setCustomBlocks((prev) => {
      const next = [...prev, newBlock];
      saveToStorage(STORAGE_KEYS.CUSTOM_BLOCKS, next);
      return next;
    });

    if (canWriteCloud) {
      try {
        await setDoc(doc(db, 'customBlocks', newId), {
          sectionId: newBlock.sectionId,
          heading: newBlock.heading,
          body: newBlock.body,
          imageUrl: newBlock.imageUrl,
          bgColor: newBlock.bgColor,
          textColor: newBlock.textColor,
          authorId: cloudAuthorId,
          updatedAt: serverTimestamp(),
        });
        void pushCmsUpdateToGitHub(`Add custom block ${newId}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `customBlocks/${newId}`);
      }
    }
    showNotification('success', 'Added new editable custom block & synced to Cloud!', newId);
  };

  const handleSaveCustomBlock = async (block: CustomBlockItem) => {
    setCustomBlocks((prev) => {
      const next = prev.map((b) => (b.id === block.id ? block : b));
      saveToStorage(STORAGE_KEYS.CUSTOM_BLOCKS, next);
      return next;
    });
    if (canWriteCloud) {
      try {
        await setDoc(doc(db, 'customBlocks', block.id), {
          sectionId: sanitizeString(block.sectionId, 2, 60, 'home'),
          heading: sanitizeString(block.heading, 1, 300, 'Custom Heading'),
          body: (block.body || '').slice(0, 3000),
          imageUrl: (block.imageUrl || '').slice(0, 350000),
          bgColor: (block.bgColor || '#ffffff').slice(0, 30),
          textColor: (block.textColor || '#1e3a8a').slice(0, 30),
          authorId: cloudAuthorId,
          updatedAt: serverTimestamp(),
        });
        void pushCmsUpdateToGitHub(`Save custom block ${block.id}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `customBlocks/${block.id}`);
      }
    }
    showNotification('success', 'Custom block permanently saved to Cloud!', block.id);
  };

  const handleDeleteCustomBlock = async (blockId: string) => {
    setCustomBlocks((prev) => {
      const next = prev.filter((b) => b.id !== blockId);
      saveToStorage(STORAGE_KEYS.CUSTOM_BLOCKS, next);
      return next;
    });
    if (canWriteCloud) {
      try {
        await deleteDoc(doc(db, 'customBlocks', blockId));
        void pushCmsUpdateToGitHub(`Delete custom block ${blockId}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `customBlocks/${blockId}`);
      }
    }
    showNotification('info', 'Custom block removed from Cloud.');
  };

  const renderSectionCustomBlocks = (sectionId: string) => {
    const sectionBlocks = customBlocks.filter((b) => b.sectionId === sectionId);
    if (sectionBlocks.length === 0 && !isAdminMode) return null;

    return (
      <div className="space-y-4 pt-4">
        {sectionBlocks.map((block) => (
          <div
            key={block.id}
            className="rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-2xs space-y-4"
            style={{ backgroundColor: block.bgColor || '#ffffff' }}
          >
            {block.imageUrl && (
              <div className="relative aspect-16/9 max-h-[340px] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={block.imageUrl}
                  alt={block.heading}
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, 'Civil Works', block.heading, 'Muscat, Oman')}
                  onClick={() => {
                    if (isAdminMode) {
                      openPhotoEditor(`Custom Block Photo (${block.heading})`, block.imageUrl, (newUrl) => {
                        handleSaveCustomBlock({ ...block, imageUrl: newUrl });
                      });
                    }
                  }}
                  className={`w-full h-full object-cover ${isAdminMode ? 'cursor-pointer' : ''}`}
                />
                {isAdminMode && (
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openPhotoEditor(`Custom Block Photo (${block.heading})`, block.imageUrl, (newUrl) => {
                          handleSaveCustomBlock({ ...block, imageUrl: newUrl });
                        })
                      }
                      className="px-3 py-1.5 text-xs font-bold bg-[#f97316] text-white rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Change / Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveCustomBlock({ ...block, imageUrl: '' })}
                      className="px-2.5 py-1.5 text-xs font-bold bg-white/95 text-red-600 rounded-lg shadow-sm cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <h3
                contentEditable={isAdminMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const val = e.currentTarget.innerText.trim() || 'Heading';
                  if (val !== block.heading) {
                    handleSaveCustomBlock({ ...block, heading: val });
                  }
                }}
                className={`text-xl sm:text-2xl font-bold ${
                  isAdminMode ? 'outline-1 outline-dashed outline-[#f97316] rounded px-1.5 py-0.5 cursor-text' : ''
                }`}
                style={{ color: block.textColor || siteConfig.primaryNavy }}
              >
                {block.heading}
              </h3>

              <p
                contentEditable={isAdminMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const val = e.currentTarget.innerText;
                  if (val !== block.body) {
                    handleSaveCustomBlock({ ...block, body: val });
                  }
                }}
                className={`text-sm sm:text-base text-slate-600 leading-relaxed ${
                  isAdminMode ? 'outline-1 outline-dashed outline-[#f97316]/70 rounded px-1.5 py-1 cursor-text' : ''
                }`}
              >
                {block.body}
              </p>
            </div>

            {isAdminMode && (
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span>Heading Color:</span>
                    <input
                      type="color"
                      value={block.textColor || '#1e3a8a'}
                      onChange={(e) => handleSaveCustomBlock({ ...block, textColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0"
                    />
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span>Block Background:</span>
                    <input
                      type="color"
                      value={block.bgColor || '#ffffff'}
                      onChange={(e) => handleSaveCustomBlock({ ...block, bgColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border-0"
                    />
                  </label>
                  {!block.imageUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        openPhotoEditor(`Add Photo to Block`, PRESET_ENGINEERING_IMAGES[0].url, (newUrl) => {
                          handleSaveCustomBlock({ ...block, imageUrl: newUrl });
                        })
                      }
                      className="px-2.5 py-1 font-semibold bg-slate-100 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#f97316]" />
                      <span>Attach Photo</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveCustomBlock(block)}
                    className="px-3 py-1.5 font-semibold text-white rounded-lg flex items-center gap-1 cursor-pointer"
                    style={{ backgroundColor: siteConfig.primaryNavy }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Block</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomBlock(block.id)}
                    className="px-3 py-1.5 font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Block</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isAdminMode && (
          <div className="p-3 bg-orange-50/70 border border-dashed border-orange-300 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#f97316]" />
              <span>Want to add a new heading, text block, or photo block to this section?</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddCustomBlock(sectionId, false)}
                className="px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#1e3a8a]" />
                <span>Add Heading & Text Block</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddCustomBlock(sectionId, true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#f97316] rounded-lg hover:bg-orange-600 flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Add Photo & Text Block</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Persist SiteConfig changes to LocalStorage + Cloud Firestore + Supabase + GitHub
  const saveSiteConfigToCloud = async (updated: SiteConfigData, sectionKey = 'site-config') => {
    const normalized: SiteConfigData = normalizeCorporateSiteConfig({
      ...updated,
      companyLogoUrl: updated.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI,
      officeMapLink: updated.officeMapLink || OFFICIAL_GOOGLE_MAPS_LINK,
    });
    setSiteConfig(normalized);
    saveToStorage(STORAGE_KEYS.SITE_CONFIG, normalized);

    if (!canWriteCloud) {
      showNotification(
        'success',
        '✓ Confirmed & Saved! Your text, logo, and settings are updated.',
        sectionKey
      );
      return;
    }

    const payload = {
      companyName: sanitizeString(normalized.companyName, 2, 160, DEFAULT_SITE_CONFIG.companyName),
      companyLogoUrl: sanitizeString(normalized.companyLogoUrl, 5, 350000, DEFAULT_COMPANY_LOGO_URI),
      tagline: sanitizeString(normalized.tagline, 2, 240, DEFAULT_SITE_CONFIG.tagline),
      heroSubtext: sanitizeString(normalized.heroSubtext, 10, 800, DEFAULT_SITE_CONFIG.heroSubtext),
      officeAddress: sanitizeString(normalized.officeAddress, 5, 300, DEFAULT_SITE_CONFIG.officeAddress),
      officeCoordinates: sanitizeString(normalized.officeCoordinates, 3, 80, DEFAULT_SITE_CONFIG.officeCoordinates),
      officeMapLink: sanitizeString(normalized.officeMapLink, 5, 500, OFFICIAL_GOOGLE_MAPS_LINK),
      officePhone: sanitizeString(normalized.officePhone, 5, 60, DEFAULT_SITE_CONFIG.officePhone),
      officeEmail: sanitizeString(normalized.officeEmail, 5, 120, DEFAULT_SITE_CONFIG.officeEmail),
      aboutBackground: sanitizeString(normalized.aboutBackground, 20, 2500, DEFAULT_SITE_CONFIG.aboutBackground),
      ourAim: sanitizeString(normalized.ourAim, 10, 800, DEFAULT_SITE_CONFIG.ourAim),
      ourVision: sanitizeString(normalized.ourVision, 10, 800, DEFAULT_SITE_CONFIG.ourVision),
      ourMission: sanitizeString(normalized.ourMission, 10, 800, DEFAULT_SITE_CONFIG.ourMission),
      primaryNavy: sanitizeHexColor(normalized.primaryNavy, '#1e3a8a'),
      accentOrange: sanitizeHexColor(normalized.accentOrange, '#f97316'),
      headingScale: normalized.headingScale || 'standard',
      adminPassword: sanitizeString(normalized.adminPassword || 'alsahab2026', 4, 100, 'alsahab2026'),
      authorId: cloudAuthorId,
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'siteConfig', 'main'), payload);
      void pushCmsUpdateToGitHub(`Update siteConfig (${sectionKey})`);
      showNotification('success', '✓ Permanently saved to Cloud Database (Live on all devices)!', sectionKey);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'siteConfig/main');
    }
  };

  // Save a single Core Service card
  const saveSingleCoreService = async (srv: CoreServiceItem) => {
    saveToStorage(STORAGE_KEYS.SERVICES, coreServices);
    if (!canWriteCloud) {
      showNotification('success', `Saved "${srv.title}" in Edit Mode.`, srv.id);
      return;
    }
    const cleanId = srv.id.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      await setDoc(doc(db, 'coreServices', cleanId), {
        orderIndex: clampNumber(srv.orderIndex, 0, 100, 1),
        title: sanitizeString(srv.title, 3, 140, 'Core Service'),
        categoryCode: sanitizeString(srv.categoryCode, 2, 60, 'DIV-01'),
        summary: sanitizeString(srv.summary, 10, 1200, 'Detailed engineering service package.'),
        specialties: sanitizeString(srv.specialties, 5, 800, 'Civil · Structural · MEP'),
        imageUrl: sanitizeString(srv.imageUrl, 5, 350000, DEFAULT_CORE_SERVICES[0].imageUrl),
        authorId: cloudAuthorId,
        updatedAt: serverTimestamp(),
      });
      void pushCmsUpdateToGitHub(`Update Core Service ${srv.title}`);
      showNotification('success', `✓ Permanently synced "${srv.title}" to Cloud Database!`, srv.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `coreServices/${cleanId}`);
    }
  };

  // Save a single Running Project card
  const saveSingleRunningProject = async (proj: RunningProjectItem) => {
    saveToStorage(STORAGE_KEYS.RUNNING, runningProjects);
    if (!canWriteCloud) {
      showNotification('success', `Confirmed edits to "${proj.title}".`, proj.id);
      return;
    }
    const cleanId = proj.id.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      await setDoc(doc(db, 'runningProjects', cleanId), {
        title: sanitizeString(proj.title, 3, 160, 'Ongoing Project Site'),
        location: sanitizeString(proj.location, 2, 120, 'Muscat, Oman'),
        client: sanitizeString(proj.client, 2, 140, 'Corporate Client'),
        category: sanitizeString(proj.category, 2, 80, 'Civil Works'),
        progress: clampNumber(proj.progress, 0, 100, 50),
        startDate: sanitizeString(proj.startDate, 4, 40, 'Jan 2026'),
        completionTarget: sanitizeString(proj.completionTarget, 4, 40, 'Dec 2026'),
        manpowerCount: clampNumber(proj.manpowerCount, 1, 50000, 50),
        engineerLead: sanitizeString(proj.engineerLead, 2, 120, 'Project Lead'),
        summary: sanitizeString(proj.summary, 10, 500, 'Ongoing construction and engineering works.'),
        scopeDetails: sanitizeString(proj.scopeDetails, 10, 2000, 'Full turnkey execution scope.'),
        imageUrl: sanitizeString(proj.imageUrl, 5, 350000, DEFAULT_RUNNING_PROJECTS[0].imageUrl),
        authorId: cloudAuthorId,
        updatedAt: serverTimestamp(),
      });
      void pushCmsUpdateToGitHub(`Update Running Project ${proj.title}`);
      showNotification('success', `✓ Permanently synced "${proj.title}" to Cloud Database!`, proj.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `runningProjects/${cleanId}`);
    }
  };

  // Save a single Gallery Photo card
  const saveSingleGalleryPhoto = async (photo: GalleryPhotoItem) => {
    saveToStorage(STORAGE_KEYS.GALLERY, galleryPhotos);
    if (!canWriteCloud) {
      showNotification('success', `Saved gallery photo "${photo.title}".`, photo.id);
      return;
    }
    const cleanId = photo.id.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      await setDoc(doc(db, 'galleryPhotos', cleanId), {
        title: sanitizeString(photo.title, 2, 140, 'Site Work Photo'),
        category: sanitizeString(photo.category, 2, 80, 'Civil Works'),
        location: sanitizeString(photo.location, 2, 120, 'Muscat, Oman'),
        caption: sanitizeString(photo.caption, 5, 600, 'Site execution photograph.'),
        imageUrl: sanitizeString(photo.imageUrl, 5, 350000, DEFAULT_GALLERY_PHOTOS[0].imageUrl),
        authorId: cloudAuthorId,
        updatedAt: serverTimestamp(),
      });
      void pushCmsUpdateToGitHub(`Update Gallery Photo ${photo.title}`);
      showNotification('success', `✓ Permanently synced photo "${photo.title}" to Cloud Database!`, photo.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `galleryPhotos/${cleanId}`);
    }
  };

  // Save a single Completed Project card
  const saveSingleCompletedProject = async (comp: CompletedProjectItem) => {
    saveToStorage(STORAGE_KEYS.COMPLETED, completedProjects);
    if (!canWriteCloud) {
      showNotification('success', `Saved portfolio project "${comp.title}".`, comp.id);
      return;
    }
    const cleanId = comp.id.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      await setDoc(doc(db, 'completedProjects', cleanId), {
        title: sanitizeString(comp.title, 3, 160, 'Completed Project'),
        client: sanitizeString(comp.client, 2, 140, 'Client Organization'),
        location: sanitizeString(comp.location, 2, 120, 'Oman'),
        completionYear: sanitizeString(comp.completionYear, 4, 20, '2025'),
        contractValue: sanitizeString(comp.contractValue, 2, 80, 'Delivered On-Time'),
        category: sanitizeString(comp.category, 2, 80, 'Civil Works'),
        description: sanitizeString(comp.description, 10, 1200, 'Successfully completed EPC package.'),
        imageUrl: sanitizeString(comp.imageUrl, 5, 350000, DEFAULT_COMPLETED_PROJECTS[0].imageUrl),
        authorId: cloudAuthorId,
        updatedAt: serverTimestamp(),
      });
      void pushCmsUpdateToGitHub(`Update Completed Project ${comp.title}`);
      showNotification('success', `✓ Permanently synced "${comp.title}" to Cloud Database!`, comp.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `completedProjects/${cleanId}`);
    }
  };

  // Seed or Sync all collections to Cloud Database + Supabase + GitHub
  const syncAllCollectionsToCloud = async () => {
    saveToStorage(STORAGE_KEYS.SITE_CONFIG, siteConfig);
    saveToStorage(STORAGE_KEYS.SERVICES, coreServices);
    saveToStorage(STORAGE_KEYS.RUNNING, runningProjects);
    saveToStorage(STORAGE_KEYS.GALLERY, galleryPhotos);
    saveToStorage(STORAGE_KEYS.COMPLETED, completedProjects);
    saveToStorage(STORAGE_KEYS.KPIS, kpiCards);
    saveToStorage(STORAGE_KEYS.VALUES, coreValues);
    saveToStorage(STORAGE_KEYS.MANPOWER, manpowerGroups);
    saveToStorage(STORAGE_KEYS.TEXT_OVERRIDES, textOverrides);
    saveToStorage(STORAGE_KEYS.CUSTOM_BLOCKS, customBlocks);

    // Also attempt syncing CMS payload to Supabase if `site_cms` table is present
    syncSiteCmsToSupabase(
      {
        siteConfig,
        coreServices,
        runningProjects,
        galleryPhotos,
        completedProjects,
        kpiCards,
        coreValues,
        manpowerGroups,
        textOverrides,
        customBlocks,
      },
      supabaseUrl,
      supabaseKey
    );

    if (!canWriteCloud) {
      showNotification(
        'success',
        'All text, headings, blocks, and photos saved to browser storage & sent to Supabase!',
        'global-sync'
      );
      return;
    }

    try {
      await saveSiteConfigToCloud(siteConfig, 'global-sync');

      for (const srv of coreServices) {
        await saveSingleCoreService(srv);
      }
      for (const proj of runningProjects) {
        await saveSingleRunningProject(proj);
      }
      for (const photo of galleryPhotos) {
        await saveSingleGalleryPhoto(photo);
      }
      for (const comp of completedProjects) {
        await saveSingleCompletedProject(comp);
      }
      for (const ov of Object.values(textOverrides)) {
        await saveTextOverride(ov);
      }
      for (const blk of customBlocks) {
        await handleSaveCustomBlock(blk);
      }

      await pushCmsUpdateToGitHub('Full Admin Portal Sync (All Sections, Photos & Settings)');

      showNotification(
        'success',
        '✓ All headings, custom blocks, photos, map links, and projects permanently synced to Cloud Database (Live on all devices)!',
        'global-sync'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batchSync');
    }
  };

  // Reset all edits to default corporate data
  const handleResetToDefaults = () => {
    setSiteConfig(DEFAULT_SITE_CONFIG);
    setCoreServices(DEFAULT_CORE_SERVICES);
    setRunningProjects(DEFAULT_RUNNING_PROJECTS);
    setGalleryPhotos(DEFAULT_GALLERY_PHOTOS);
    setCompletedProjects(DEFAULT_COMPLETED_PROJECTS);
    setKpiCards(DEFAULT_KPI_CARDS);
    setCoreValues(DEFAULT_CORE_VALUES);
    setManpowerGroups(MANPOWER_TRADE_CATALOG);
    setTextOverrides({});
    setCustomBlocks([]);
    setSelectedElementId(null);
    Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
    showNotification('info', 'Reset all headings, blocks, photos, and sections to default wwwasar.com content.');
  };

  // Add New Running Project Site
  const handleAddRunningProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `run-${Date.now()}`;
    const item: RunningProjectItem = {
      id: newId,
      title: sanitizeString(newProject.title, 3, 160, 'New Ongoing EPC Project Site'),
      location: sanitizeString(newProject.location, 2, 120, 'Muscat Governorate, Oman'),
      client: sanitizeString(newProject.client, 2, 140, 'Ministry / Industrial Client'),
      category: sanitizeString(newProject.category, 2, 80, 'Civil Works'),
      progress: clampNumber(newProject.progress, 0, 100, 35),
      startDate: sanitizeString(newProject.startDate, 4, 40, 'Oct 2026'),
      completionTarget: sanitizeString(newProject.completionTarget, 4, 40, 'Aug 2027'),
      manpowerCount: clampNumber(newProject.manpowerCount, 1, 50000, 65),
      engineerLead: sanitizeString(newProject.engineerLead, 2, 120, 'Eng. Salim Al Harthy'),
      summary: sanitizeString(newProject.summary, 10, 500, 'Ongoing civil and infrastructure construction works.'),
      scopeDetails: sanitizeString(
        newProject.scopeDetails,
        10,
        2000,
        'Comprehensive civil, earthworks, and MEP execution package.'
      ),
      imageUrl: sanitizeString(newProject.imageUrl, 5, 350000, DEFAULT_RUNNING_PROJECTS[0].imageUrl),
      authorId: cloudAuthorId,
    };

    setRunningProjects((prev) => {
      const next = [item, ...prev];
      saveToStorage(STORAGE_KEYS.RUNNING, next);
      return next;
    });
    setShowAddRunningForm(false);
    setNewProject({
      title: '',
      location: '',
      client: '',
      category: 'Civil Works & Earth Works',
      progress: 35,
      startDate: 'Oct 2026',
      completionTarget: 'Aug 2027',
      manpowerCount: 65,
      engineerLead: '',
      summary: '',
      scopeDetails: '',
      imageUrl: DEFAULT_RUNNING_PROJECTS[0].imageUrl,
    });

    if (canWriteCloud) {
      try {
        await setDoc(doc(db, 'runningProjects', newId), {
          title: item.title,
          location: item.location,
          client: item.client,
          category: item.category,
          progress: item.progress,
          startDate: item.startDate,
          completionTarget: item.completionTarget,
          manpowerCount: item.manpowerCount,
          engineerLead: item.engineerLead,
          summary: item.summary,
          scopeDetails: item.scopeDetails,
          imageUrl: item.imageUrl,
          authorId: cloudAuthorId,
          updatedAt: serverTimestamp(),
        });
        void pushCmsUpdateToGitHub(`Add Running Project ${item.title}`);
        showNotification('success', `✓ Permanently added "${item.title}" to Cloud Running Projects!`, newId);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `runningProjects/${newId}`);
      }
    } else {
      showNotification('success', `Added "${item.title}" to Running Project Sites.`, newId);
    }
  };

  const handleDeleteRunningProject = async (id: string) => {
    setRunningProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveToStorage(STORAGE_KEYS.RUNNING, next);
      return next;
    });
    if (selectedRunningProject?.id === id) setSelectedRunningProject(null);
    if (canWriteCloud) {
      try {
        await deleteDoc(doc(db, 'runningProjects', id));
        void pushCmsUpdateToGitHub(`Delete Running Project ${id}`);
        showNotification('info', 'Running project permanently removed from Cloud Database.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `runningProjects/${id}`);
      }
    } else {
      showNotification('info', 'Running project removed.');
    }
  };

  // Add New Gallery Photo
  const handleAddGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `gal-${Date.now()}`;
    const item: GalleryPhotoItem = {
      id: newId,
      title: sanitizeString(newPhoto.title, 2, 140, 'Construction Site Work Photo'),
      category: sanitizeString(newPhoto.category, 2, 80, 'Civil & Structural'),
      location: sanitizeString(newPhoto.location, 2, 120, 'Muscat, Oman'),
      caption: sanitizeString(newPhoto.caption, 5, 600, 'Site progress and quality inspection photography.'),
      imageUrl: sanitizeString(newPhoto.imageUrl, 5, 350000, DEFAULT_GALLERY_PHOTOS[0].imageUrl),
      authorId: cloudAuthorId,
    };

    setGalleryPhotos((prev) => {
      const next = [item, ...prev];
      saveToStorage(STORAGE_KEYS.GALLERY, next);
      return next;
    });
    setCurrentSlideIndex(0);
    setShowAddGalleryForm(false);
    setNewPhoto({
      title: '',
      category: 'Civil & Structural',
      location: 'Muscat, Oman',
      caption: '',
      imageUrl: DEFAULT_GALLERY_PHOTOS[0].imageUrl,
    });

    if (canWriteCloud) {
      try {
        await setDoc(doc(db, 'galleryPhotos', newId), {
          title: item.title,
          category: item.category,
          location: item.location,
          caption: item.caption,
          imageUrl: item.imageUrl,
          authorId: cloudAuthorId,
          updatedAt: serverTimestamp(),
        });
        void pushCmsUpdateToGitHub(`Add Gallery Photo ${item.title}`);
        showNotification('success', '✓ New work photo permanently saved to Cloud Gallery & Carousel!', newId);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `galleryPhotos/${newId}`);
      }
    } else {
      showNotification('success', 'New work photo added to Gallery & Carousel.', newId);
    }
  };

  const handleDeleteGalleryPhoto = async (id: string) => {
    setGalleryPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (currentSlideIndex >= filtered.length) {
        setCurrentSlideIndex(Math.max(0, filtered.length - 1));
      }
      saveToStorage(STORAGE_KEYS.GALLERY, filtered);
      return filtered;
    });
    if (canWriteCloud) {
      try {
        await deleteDoc(doc(db, 'galleryPhotos', id));
        void pushCmsUpdateToGitHub(`Delete Gallery Photo ${id}`);
        showNotification('info', 'Photo permanently removed from Cloud Gallery.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `galleryPhotos/${id}`);
      }
    } else {
      showNotification('info', 'Photo removed from gallery.');
    }
  };

  // Add New Core Service Card
  const handleAddCoreService = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `srv-${Date.now()}`;
    const item: CoreServiceItem = {
      id: newId,
      orderIndex: coreServices.length + 1,
      title: sanitizeString(newService.title, 3, 140, '06. Specialized Industrial Contracting'),
      categoryCode: sanitizeString(newService.categoryCode, 2, 60, 'DIV-06 · INDUSTRIAL'),
      summary: sanitizeString(newService.summary, 10, 1200, 'Turnkey engineering and contracting solution.'),
      specialties: sanitizeString(newService.specialties, 5, 800, 'Structural · Mechanical · Workforce'),
      imageUrl: sanitizeString(newService.imageUrl, 5, 350000, DEFAULT_CORE_SERVICES[0].imageUrl),
      authorId: cloudAuthorId,
    };

    setCoreServices((prev) => {
      const next = [...prev, item];
      saveToStorage(STORAGE_KEYS.SERVICES, next);
      return next;
    });
    setShowAddServiceForm(false);
    setNewService({
      title: '',
      categoryCode: 'DIV-06 · SPECIALIZED EPC',
      summary: '',
      specialties: '',
      imageUrl: DEFAULT_CORE_SERVICES[0].imageUrl,
    });

    if (canWriteCloud) {
      try {
        await setDoc(doc(db, 'coreServices', newId), {
          orderIndex: item.orderIndex,
          title: item.title,
          categoryCode: item.categoryCode,
          summary: item.summary,
          specialties: item.specialties,
          imageUrl: item.imageUrl,
          authorId: cloudAuthorId,
          updatedAt: serverTimestamp(),
        });
        void pushCmsUpdateToGitHub(`Add Core Service ${item.title}`);
        showNotification('success', '✓ New Core Service division permanently saved to Cloud!', newId);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `coreServices/${newId}`);
      }
    } else {
      showNotification('success', 'New Core Service division added.', newId);
    }
  };

  const handleDeleteCoreService = async (id: string) => {
    setCoreServices((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveToStorage(STORAGE_KEYS.SERVICES, next);
      return next;
    });
    if (canWriteCloud) {
      try {
        await deleteDoc(doc(db, 'coreServices', id));
        void pushCmsUpdateToGitHub(`Delete Core Service ${id}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `coreServices/${id}`);
      }
    }
    showNotification('info', 'Core Service card removed from Cloud.');
  };

  // Add New Completed Portfolio Project
  const handleAddCompletedProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `comp-${Date.now()}`;
    const item: CompletedProjectItem = {
      id: newId,
      title: sanitizeString(newCompleted.title, 3, 160, 'Completed Infrastructure Package'),
      client: sanitizeString(newCompleted.client, 2, 140, 'Oman Infrastructure Client'),
      location: sanitizeString(newCompleted.location, 2, 120, 'Muscat, Oman'),
      completionYear: sanitizeString(newCompleted.completionYear, 4, 20, '2026'),
      contractValue: sanitizeString(newCompleted.contractValue, 2, 80, '100% On-Time Handover'),
      category: sanitizeString(newCompleted.category, 2, 80, 'Civil Works'),
      description: sanitizeString(newCompleted.description, 10, 1200, 'Delivered turnkey civil and MEP scope.'),
      imageUrl: sanitizeString(newCompleted.imageUrl, 5, 350000, DEFAULT_COMPLETED_PROJECTS[0].imageUrl),
      authorId: cloudAuthorId,
    };

    setCompletedProjects((prev) => {
      const next = [item, ...prev];
      saveToStorage(STORAGE_KEYS.COMPLETED, next);
      return next;
    });
    setShowAddCompletedForm(false);
    setNewCompleted({
      title: '',
      client: '',
      location: '',
      completionYear: '2026',
      contractValue: '',
      category: 'Civil Works',
      description: '',
      imageUrl: DEFAULT_COMPLETED_PROJECTS[0].imageUrl,
    });

    if (canWriteCloud) {
      try {
        await setDoc(doc(db, 'completedProjects', newId), {
          title: item.title,
          client: item.client,
          location: item.location,
          completionYear: item.completionYear,
          contractValue: item.contractValue,
          category: item.category,
          description: item.description,
          imageUrl: item.imageUrl,
          authorId: cloudAuthorId,
          updatedAt: serverTimestamp(),
        });
        void pushCmsUpdateToGitHub(`Add Completed Project ${item.title}`);
        showNotification('success', '✓ Completed portfolio project permanently saved to Cloud!', newId);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `completedProjects/${newId}`);
      }
    } else {
      showNotification('success', 'Completed portfolio project added.', newId);
    }
  };

  const handleDeleteCompletedProject = async (id: string) => {
    setCompletedProjects((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveToStorage(STORAGE_KEYS.COMPLETED, next);
      return next;
    });
    if (canWriteCloud) {
      try {
        await deleteDoc(doc(db, 'completedProjects', id));
        void pushCmsUpdateToGitHub(`Delete Completed Project ${id}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `completedProjects/${id}`);
      }
    }
    showNotification('info', 'Completed project removed from Cloud.');
  };

  // Client Inquiry Form Submission (Persisted to Firestore `/inquiries` + Local Session Inbox)
  const handleClientInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError(null);
    setInquirySubmittedSuccess(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inquiryForm.email.trim())) {
      setInquiryError('Please provide a valid corporate or personal email address.');
      return;
    }
    if (inquiryForm.phone.trim().length < 6) {
      setInquiryError('Please provide a valid contact telephone number (including area code).');
      return;
    }
    if (inquiryForm.message.trim().length < 10) {
      setInquiryError('Please enter at least 10 characters describing your project or manpower requirement.');
      return;
    }

    setInquirySubmitting(true);
    const inquiryId = `inq-${Date.now()}`;
    const cleanInquiry: ClientInquiryItem = {
      id: inquiryId,
      clientName: sanitizeString(inquiryForm.clientName, 2, 120, 'Valued Client'),
      companyName: sanitizeString(inquiryForm.companyName, 2, 140, 'Client Organization'),
      email: sanitizeString(inquiryForm.email, 5, 120, 'client@example.com'),
      phone: sanitizeString(inquiryForm.phone, 5, 50, '+968 0000 0000'),
      inquiryType: inquiryForm.inquiryType,
      projectLocation: sanitizeString(inquiryForm.projectLocation, 2, 120, 'Muscat, Oman'),
      manpowerDetails: sanitizeString(inquiryForm.manpowerDetails, 0, 500, ''),
      message: sanitizeString(inquiryForm.message, 10, 2000, 'Requesting official quotation.'),
      status: 'new',
      authorId: currentUser ? currentUser.uid : 'public_visitor',
    };

    setLocalInquiries((prev) => [cleanInquiry, ...prev]);

    try {
      // 1. Primary Backend: Submit Inquiry to User's Supabase Database (utblsxterubtziionaja)
      const supaRes = await submitInquiryToSupabase(cleanInquiry, supabaseUrl, supabaseKey);
      setSupabaseStatus(supaRes);
      if (supaRes.ok) {
        setSupabaseInquiries((prev) => [cleanInquiry, ...prev]);
      }

      // 2. Secondary Backup: Also persist to Firestore `/inquiries` so no inquiry is ever lost
      try {
        await setDoc(doc(db, 'inquiries', inquiryId), {
          clientName: cleanInquiry.clientName,
          companyName: cleanInquiry.companyName,
          email: cleanInquiry.email,
          phone: cleanInquiry.phone,
          inquiryType: cleanInquiry.inquiryType,
          projectLocation: cleanInquiry.projectLocation,
          manpowerDetails: cleanInquiry.manpowerDetails,
          message: cleanInquiry.message,
          status: 'new',
          authorId: cleanInquiry.authorId,
          createdAt: serverTimestamp(),
        });
      } catch {
        // Ignore secondary backup errors if Supabase or LocalStorage already succeeded
      }

      // 3. Auto-Forward Inquiry to Google Sheets Webhook & User's Gmail (saadsaid.asar@gmail.com & alshakilfreelancer@gmail.com)
      const configuredSheetWebhook = (
        textOverrides['inquiry-sheet-webhook']?.textValue ||
        window.localStorage.getItem('asar_google_sheet_webhook') ||
        ''
      ).trim();

      const inquiryRecipients = ['saadsaid.asar@gmail.com', 'alshakilfreelancer@gmail.com'];
      const customInquiryEmail = (
        textOverrides['inquiry-target-email']?.textValue ||
        window.localStorage.getItem('asar_inquiry_target_email') ||
        ''
      ).trim();
      if (customInquiryEmail && customInquiryEmail.includes('@') && !inquiryRecipients.includes(customInquiryEmail)) {
        inquiryRecipients.push(customInquiryEmail);
      }

      if (configuredSheetWebhook && configuredSheetWebhook.startsWith('http')) {
        try {
          await fetch(configuredSheetWebhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              id: cleanInquiry.id,
              status: cleanInquiry.status.toUpperCase(),
              clientName: cleanInquiry.clientName,
              companyName: cleanInquiry.companyName,
              email: cleanInquiry.email,
              phone: cleanInquiry.phone,
              inquiryType: cleanInquiry.inquiryType,
              projectLocation: cleanInquiry.projectLocation,
              manpowerDetails: cleanInquiry.manpowerDetails,
              message: cleanInquiry.message,
              targetEmail: inquiryRecipients.join(', '),
            }),
          });
        } catch {
          // Continue gracefully if webhook is unreachable
        }
      }

      for (const rcpt of inquiryRecipients) {
        try {
          void fetch(`https://formsubmit.co/ajax/${encodeURIComponent(rcpt)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              _subject: `New ASAR Website Inquiry (${cleanInquiry.id.toUpperCase()}) - ${cleanInquiry.companyName}`,
              _template: 'table',
              _captcha: 'false',
              _cc: inquiryRecipients.join(','),
              Reference_ID: cleanInquiry.id.toUpperCase(),
              Submitted_At: new Date().toLocaleString(),
              Client_Name: cleanInquiry.clientName,
              Company_Name: cleanInquiry.companyName,
              Client_Email: cleanInquiry.email,
              Phone_Number: cleanInquiry.phone,
              Inquiry_Type: cleanInquiry.inquiryType,
              Project_Location: cleanInquiry.projectLocation,
              Manpower_Trades_Count: cleanInquiry.manpowerDetails || 'N/A',
              Project_Scope_Message: cleanInquiry.message,
            }),
          });
        } catch {
          // Ignore background email dispatch errors
        }
      }

      setInquirySubmittedSuccess(
        `Thank you, ${cleanInquiry.clientName}. Your official inquiry (Ref: ${inquiryId.toUpperCase()}) has been received by Al Sahab Al Rashid Trad. & Cont. Co L.L.C and forwarded directly to our engineering team at ${inquiryRecipients.join(' & ')}. Our estimating team will respond within 24 business hours.`
      );
      showNotification(
        'success',
        `Inquiry ${inquiryId.toUpperCase()} submitted! Forwarded to ${inquiryRecipients.join(' & ')}.`
      );

      setInquiryForm({
        clientName: '',
        companyName: '',
        email: '',
        phone: '',
        inquiryType: 'Skilled & Unskilled Manpower Supply',
        projectLocation: '',
        manpowerDetails: '',
        message: '',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `inquiries/${inquiryId}`);
    } finally {
      setInquirySubmitting(false);
    }
  };

  const handleCopySupabaseSql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    showNotification(
      'success',
      `Copied SQL script! Paste and run it in Supabase SQL Editor for project ${SUPABASE_PROJECT_ID}.`
    );
    window.setTimeout(() => setCopiedSql(false), 3500);
  };

  // Combined inquiries list (Supabase + Cloud + Local session)
  const allInquiries = useMemo(() => {
    const map = new Map<string, ClientInquiryItem>();
    for (const item of localInquiries) map.set(item.id, item);
    for (const item of cloudInquiries) map.set(item.id, item);
    for (const item of supabaseInquiries) map.set(item.id, item);
    return Array.from(map.values());
  }, [localInquiries, cloudInquiries, supabaseInquiries]);

  // Export all Backend Client Inquiries directly to an Excel / Google Sheets (.csv) file
  const downloadInquiriesAsExcelCsv = () => {
    const headers = [
      'Inquiry ID',
      'Status',
      'Client Name',
      'Company Name',
      'Email Address',
      'Phone Number',
      'Inquiry Type',
      'Project Location',
      'Manpower Details',
      'Message / Scope Details',
    ];
    const escapeCsvCell = (val: string) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = allInquiries.map((inq) =>
      [
        inq.id,
        inq.status.toUpperCase(),
        inq.clientName,
        inq.companyName,
        inq.email,
        inq.phone,
        inq.inquiryType,
        inq.projectLocation,
        inq.manpowerDetails || '',
        inq.message,
      ]
        .map(escapeCsvCell)
        .join(',')
    );

    const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ASAR_Client_Inquiries_Excel_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('success', 'Downloaded Client Inquiries Excel / Google Sheet (.csv) file!');
  };

  const copyGoogleSheetAppsScript = () => {
    const targetEmail =
      textOverrides['inquiry-target-email']?.textValue ||
      window.localStorage.getItem('asar_inquiry_target_email') ||
      'saadsaid.asar@gmail.com';
    const scriptCode = `// Paste this inside your Google Sheet: Extensions -> Apps Script -> Deploy -> New deployment -> Web app (Who has access: Anyone)
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Inquiry ID", "Status", "Client Name", "Company Name", "Email", "Phone", "Inquiry Type", "Project Location", "Manpower Details", "Message"]);
  }
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.id || "",
    data.status || "NEW",
    data.clientName || "",
    data.companyName || "",
    data.email || "",
    data.phone || "",
    data.inquiryType || "",
    data.projectLocation || "",
    data.manpowerDetails || "",
    data.message || ""
  ]);
  var recipient = data.targetEmail || "${targetEmail}";
  if (recipient && recipient.indexOf("@") !== -1) {
    MailApp.sendEmail({
      to: recipient,
      subject: "New ASAR Inquiry (" + (data.id || "") + ") - " + (data.companyName || ""),
      body: "New Client Inquiry Automatically Added to Google Sheet:\\n\\n" +
            "Client Name: " + data.clientName + "\\n" +
            "Company: " + data.companyName + "\\n" +
            "Email: " + data.email + "\\n" +
            "Phone: " + data.phone + "\\n" +
            "Inquiry Type: " + data.inquiryType + "\\n" +
            "Location: " + data.projectLocation + "\\n" +
            "Manpower: " + data.manpowerDetails + "\\n" +
            "Message: " + data.message
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}`;
    navigator.clipboard.writeText(scriptCode);
    showNotification(
      'success',
      'Copied Google Sheets Auto-Sync Script! Paste in Google Sheets -> Extensions -> Apps Script -> Deploy as Web App.'
    );
  };

  // Filtered collections
  const filteredGalleryPhotos = useMemo(() => {
    if (galleryCategoryFilter === 'All') return galleryPhotos;
    return galleryPhotos.filter((p) => p.category === galleryCategoryFilter);
  }, [galleryPhotos, galleryCategoryFilter]);

  const filteredCompletedProjects = useMemo(() => {
    if (portfolioFilter === 'All') return completedProjects;
    return completedProjects.filter((p) => p.category === portfolioFilter);
  }, [completedProjects, portfolioFilter]);

  const filteredManpowerGroups = useMemo(() => {
    if (selectedManpowerGroup === 'ALL') return manpowerGroups;
    return manpowerGroups.filter((g) => g.groupCode === selectedManpowerGroup);
  }, [manpowerGroups, selectedManpowerGroup]);

  const totalRunningManpower = useMemo(
    () => runningProjects.reduce((acc, item) => acc + Number(item.manpowerCount || 0), 0),
    [runningProjects]
  );

  const hiddenElementsCount = useMemo(
    () => Object.values(textOverrides).filter((o) => o.hidden).length,
    [textOverrides]
  );

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'developer') {
      setShowDeveloperModal(true);
      return;
    }
    setActiveTabId(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const headingSizeClass =
    siteConfig.headingScale === 'large'
      ? 'text-4xl sm:text-5xl lg:text-6xl'
      : siteConfig.headingScale === 'compact'
      ? 'text-2xl sm:text-3xl lg:text-4xl'
      : 'text-3xl sm:text-4xl lg:text-5xl';

  const activeSlide = galleryPhotos[currentSlideIndex] || galleryPhotos[0];
  const activeGoogleMapLink = siteConfig.officeMapLink || OFFICIAL_GOOGLE_MAPS_LINK;
  const selectedOverride = selectedElementId ? textOverrides[selectedElementId] : undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Contract: Strict 1-Row, 3-Zone Corporate Header with Replaceable Company Logo */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-6 px-6 py-3">
          {/* Zone 1: Official Company Logo + Wordmark (Click to Replace Logo or Edit Name in Admin Mode) */}
          <div className="flex items-center gap-3.5 min-w-0 shrink-0">
            <div
              onClick={() => {
                if (isAdminMode) {
                  openPhotoEditor(
                    'Official Company Logo (Header & Branding)',
                    siteConfig.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI,
                    (newLogoUrl) => {
                      saveSiteConfigToCloud({ ...siteConfig, companyLogoUrl: newLogoUrl }, 'logo-save');
                    }
                  );
                } else {
                  scrollToSection('home');
                }
              }}
              title={
                isAdminMode
                  ? 'Click to upload or replace Company Logo'
                  : `${siteConfig.companyName} — Official Logo`
              }
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-white border-2 border-slate-200/90 shadow-sm flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                isAdminMode ? 'ring-2 ring-[#f97316] hover:scale-105' : 'hover:border-[#1e3a8a]/40'
              }`}
            >
              <img
                src={siteConfig.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI}
                alt={`${siteConfig.companyName} Logo`}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_COMPANY_LOGO_URI;
                }}
                className="w-full h-full object-contain p-1"
              />
              {isAdminMode && (
                <span className="absolute bottom-0 inset-x-0 bg-[#f97316] text-white text-[9px] font-black text-center leading-tight py-0.5 tracking-wider">
                  EDIT LOGO
                </span>
              )}
            </div>

            <div className="flex flex-col min-w-0 justify-center">
              <div className="flex items-center gap-2">
                <span
                  contentEditable={isAdminMode}
                  suppressContentEditableWarning
                  onClick={(e) => {
                    if (!isAdminMode) {
                      e.preventDefault();
                      scrollToSection('home');
                    }
                  }}
                  onBlur={(e) => {
                    if (!isAdminMode) return;
                    const val = e.currentTarget.innerText.trim();
                    if (val && val !== siteConfig.companyName) {
                      saveSiteConfigToCloud({ ...siteConfig, companyName: val }, 'header-name-save');
                    }
                  }}
                  className={`text-sm sm:text-xl lg:text-2xl font-black tracking-tight leading-tight ${
                    isAdminMode
                      ? 'outline-1 outline-dashed outline-[#f97316] bg-orange-50/60 rounded px-1.5 cursor-text'
                      : 'cursor-pointer hover:opacity-90'
                  }`}
                  style={{ color: siteConfig.primaryNavy }}
                >
                  {siteConfig.companyName}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-0.5">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 tracking-wide uppercase truncate">
                  EPC Contracting & Manpower · Oman
                </span>
                <a
                  href={`tel:${(siteConfig.officePhone || '+968 9570 6749').replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[#f97316] hover:underline"
                  title="Official Office Telephone: +968 9570 6749"
                >
                  <Phone className="w-3 h-3 shrink-0" />
                  <span>Office: {siteConfig.officePhone || '+968 9570 6749'}</span>
                </a>
              </div>
              {isAdminMode && (
                <button
                  type="button"
                  onClick={() =>
                    openPhotoEditor(
                      'Official Company Logo (Header & Branding)',
                      siteConfig.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI,
                      (newLogoUrl) => {
                        saveSiteConfigToCloud({ ...siteConfig, companyLogoUrl: newLogoUrl }, 'logo-save');
                      }
                    )
                  }
                  className="text-[10px] font-bold text-[#f97316] hover:underline text-left flex items-center gap-1 cursor-pointer pt-0.5"
                >
                  <Camera className="w-3 h-3" />
                  <span>Replace Company Logo</span>
                </button>
              )}
            </div>
          </div>

          {/* Zone 2: 5 concise single-line navigation links (Always visible in Desktop Mode on both Mobile & Desktop) */}
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('services');
              }}
              className="hover:text-[#1e3a8a] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {renderEditableElement('nav-services', 'Core Services', 'span')}
            </a>
            <a
              href="#running-projects"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('running-projects');
              }}
              className="hover:text-[#1e3a8a] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {renderEditableElement('nav-running', 'Running Sites', 'span')}
            </a>
            <a
              href="#gallery"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('gallery');
              }}
              className="hover:text-[#1e3a8a] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {renderEditableElement('nav-gallery', 'Photo Gallery', 'span')}
            </a>
            <a
              href="#portfolio"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('portfolio');
              }}
              className="hover:text-[#1e3a8a] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {renderEditableElement('nav-portfolio', 'Completed Portfolio', 'span')}
            </a>
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('about');
              }}
              className="hover:text-[#1e3a8a] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {renderEditableElement('nav-about', 'About & Vision', 'span')}
            </a>
          </nav>

          {/* Zone 3: Primary Actions (Netlify Publish & Connect Domain only in Google AI Studio, Admin Mode for all) */}
          <div className="flex items-center gap-2 shrink-0">
            {isAiStudioEnv && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDeployTab('netlify');
                    setShowBluehostModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  title="Publish this website to Netlify (Fast 30-sec Drag & Drop with free SSL)"
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Publish to Netlify</span>
                  <span className="sm:hidden">Netlify</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDeployTab('domain');
                    setShowBluehostModal(true);
                  }}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1e3a8a] bg-blue-50/90 hover:bg-blue-100 border border-blue-200/90 rounded-lg transition-colors cursor-pointer"
                  title="Connect your custom domain and host (wwwasar.com) through Netlify DNS"
                >
                  <Globe className="w-3.5 h-3.5 text-[#1e3a8a]" />
                  <span>Connect Domain</span>
                </button>
              </>
            )}
            {isAdminAuthenticated ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const nextState = !isAdminMode;
                    setIsAdminMode(nextState);
                    if (!nextState) setSelectedElementId(null);
                    showNotification(
                      'info',
                      nextState
                        ? 'Admin Edit Studio ON! Drag the studio bar anywhere or click any element to edit.'
                        : 'Admin Edit Mode paused.'
                    );
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-white shadow-xs"
                  style={{ backgroundColor: isAdminMode ? siteConfig.accentOrange : siteConfig.primaryNavy }}
                >
                  {isAdminMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isAdminMode ? 'Admin Mode: ON' : 'Admin Mode: OFF'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  title="Exit & Lock Admin Mode (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAdminAuthError(null);
                  setAdminInputPassword('');
                  setShowAdminLoginModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-[#1e3a8a] border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Admin Portal Login (Password Required to Unlock Editing)"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Admin Login</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Notification Banner */}
      {statusBanner && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 shadow-xs">
          <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4 text-xs font-semibold text-emerald-900">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-emerald-600 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1B: Formal & Attractive Interactive Tabbar with Smooth Scroll & Popover Summaries */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-[1360px] mx-auto px-6 py-2.5">
          <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
              {TABBAR_ITEMS.map((tab) => {
                const isActive = activeTabId === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (tab.id === 'developer') {
                        setShowDeveloperModal(true);
                      } else {
                        scrollToSection(tab.id);
                      }
                    }}
                    onMouseEnter={() => setHoveredTabSummary(tab.summary)}
                    onMouseLeave={() => setHoveredTabSummary(null)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'text-white shadow-xs'
                        : tab.id === 'developer'
                        ? 'text-[#1e3a8a] bg-blue-50/90 border border-blue-200/80 hover:bg-blue-100 hover:text-[#1e3a8a] font-bold shadow-2xs'
                        : 'text-slate-700 hover:bg-white hover:text-[#1e3a8a]'
                    }`}
                    style={isActive ? { backgroundColor: siteConfig.primaryNavy } : undefined}
                  >
                    {renderEditableElement(`tab-label-${tab.id}`, tab.label, 'span')}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 whitespace-nowrap shrink-0">
              <a
                href={activeGoogleMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#1e3a8a] hover:text-[#f97316] flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5 text-[#f97316]" />
                <span>Google Maps Location ↗</span>
              </a>
              <span>·</span>
              <span>{hoveredTabSummary || 'wwwasar.com · Muscat, Sultanate of Oman'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Old bulky command bar removed in favor of the Compact Draggable Floating Admin Edit Studio */}

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1">
        {/* SECTION 2: HEADER & GOOGLE MAP LOCATION SECTION */}
        <section id="home" className="py-12 lg:py-16 px-6 bg-white border-b border-slate-200">
          <div className="max-w-[1360px] mx-auto space-y-10">
            {/* 2-Column Split: Main Corporate Heading + Integrated Google Map Location Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left 7 Columns: Bold Company Title, Tagline, Executive Proposition & Primary Actions */}
              <div className="lg:col-span-7 flex flex-col justify-between bg-slate-50/70 border border-slate-200 rounded-2xl p-8 lg:p-10">
                <div className="space-y-6">
                  {/* Corporate Brand Row: Enlarged High-Resolution Logo + Regional Metadata */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div
                      onClick={() => {
                        if (isAdminMode) {
                          openPhotoEditor(
                            'Official Company Logo',
                            siteConfig.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI,
                            (newLogoUrl) => {
                              saveSiteConfigToCloud(
                                { ...siteConfig, companyLogoUrl: newLogoUrl },
                                'hero-edit'
                              );
                            }
                          );
                        }
                      }}
                      title={isAdminMode ? 'Click to upload or replace Company Logo' : `${siteConfig.companyName} — Official Emblem`}
                      className={`relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-3xl bg-white border-3 border-slate-200/90 shadow-md flex items-center justify-center overflow-hidden shrink-0 transition-transform ${
                        isAdminMode ? 'cursor-pointer ring-3 ring-[#f97316] hover:scale-105' : 'hover:scale-[1.02]'
                      }`}
                    >
                      <img
                        src={siteConfig.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI}
                        alt={`${siteConfig.companyName} Logo`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.dataset.fallbackApplied === 'true') return;
                          target.dataset.fallbackApplied = 'true';
                          target.src = DEFAULT_COMPANY_LOGO_URI;
                        }}
                        className="w-full h-full object-contain p-2"
                      />
                      {isAdminMode && (
                        <span className="absolute bottom-0 inset-x-0 bg-[#f97316] text-white text-[10px] font-black text-center py-0.5 tracking-wider">
                          EDIT LOGO
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div
                        className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-wider uppercase"
                        style={{ color: siteConfig.primaryNavy }}
                      >
                        {renderEditableElement('hero-kicker-1', 'SULTANATE OF OMAN', 'span')}
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        {renderEditableElement('hero-kicker-2', 'EPC & MANPOWER CONTRACTING', 'span')}
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        {renderEditableElement('hero-kicker-3', 'WWWASAR.COM', 'span', 'font-mono-tabular', {
                          color: siteConfig.accentOrange,
                        })}
                      </div>
                      <div className="text-sm font-semibold text-slate-500">
                        CR No. Commercial Registration · Muscat, Sultanate of Oman
                      </div>
                      {isAdminMode && (
                        <button
                          type="button"
                          onClick={() =>
                            openPhotoEditor(
                              'Official Company Logo',
                              siteConfig.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI,
                              (newLogoUrl) => {
                                saveSiteConfigToCloud(
                                  { ...siteConfig, companyLogoUrl: newLogoUrl },
                                  'hero-edit'
                                );
                              }
                            )
                          }
                          className="px-3 py-1.5 text-xs font-bold bg-[#f97316] text-white rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-orange-600"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Upload / Replace Company Logo</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Main Company Heading, Tagline, and Executive Summary — Enlarged & Prominent */}
                  <div className="space-y-2">
                    <h1
                      contentEditable={isAdminMode}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        if (!isAdminMode) return;
                        const val = e.currentTarget.innerText.trim();
                        if (val && val !== siteConfig.companyName) {
                          saveSiteConfigToCloud({ ...siteConfig, companyName: val }, 'hero-edit');
                        }
                      }}
                      className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06]"
                      style={{ color: siteConfig.primaryNavy, textWrap: 'balance' }}
                    >
                      {siteConfig.companyName}
                    </h1>

                    {/* Bilingual Omani Arabic Title for authentic corporate prestige */}
                    <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-500 font-sans">
                      السحاب الرشيد للتجارة والمقاولات ش.م.م
                    </div>
                  </div>

                  <p
                    contentEditable={isAdminMode}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (!isAdminMode) return;
                      const val = e.currentTarget.innerText.trim();
                      if (val && val !== siteConfig.tagline) {
                        saveSiteConfigToCloud({ ...siteConfig, tagline: val }, 'hero-edit');
                      }
                    }}
                    className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight ${
                      isAdminMode
                        ? 'outline-1 outline-dashed outline-[#f97316] bg-white/80 rounded-lg px-2 py-1 cursor-text'
                        : ''
                    }`}
                    style={{ color: siteConfig.accentOrange, textWrap: 'balance' }}
                  >
                    {siteConfig.tagline}
                  </p>

                  <p
                    contentEditable={isAdminMode}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (!isAdminMode) return;
                      const val = e.currentTarget.innerText.trim();
                      if (val && val !== siteConfig.heroSubtext) {
                        saveSiteConfigToCloud({ ...siteConfig, heroSubtext: val }, 'hero-edit');
                      }
                    }}
                    className={`text-base sm:text-lg text-slate-600 leading-relaxed max-w-[68ch] ${
                      isAdminMode
                        ? 'outline-1 outline-dashed outline-[#f97316] bg-white/80 rounded-lg px-2 py-1.5 cursor-text'
                        : ''
                    }`}
                  >
                    {siteConfig.heroSubtext}
                  </p>

                  {/* Structured Quick-Edit Panel in Admin Mode */}
                  {isAdminMode && (
                    <div className="space-y-3 bg-white p-5 rounded-xl border-2 border-orange-300 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
                          Quick Form Editor — Header, Contact & Google Maps Link
                        </span>
                        {confirmedBadgeId === 'hero-edit' && (
                          <span className="text-xs font-bold text-emerald-700">✓ Confirmed & Saved</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="block text-xs font-semibold text-slate-700">
                          Company Title
                          <input
                            type="text"
                            value={siteConfig.companyName}
                            onChange={(e) => setSiteConfig({ ...siteConfig, companyName: e.target.value })}
                            className="mt-1 w-full px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-lg"
                          />
                        </label>
                        <label className="block text-xs font-semibold text-slate-700">
                          Corporate Tagline
                          <input
                            type="text"
                            value={siteConfig.tagline}
                            onChange={(e) => setSiteConfig({ ...siteConfig, tagline: e.target.value })}
                            className="mt-1 w-full px-3 py-1.5 text-sm font-semibold border border-slate-300 rounded-lg"
                          />
                        </label>
                      </div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Executive Summary Paragraph
                        <textarea
                          rows={2}
                          value={siteConfig.heroSubtext}
                          onChange={(e) => setSiteConfig({ ...siteConfig, heroSubtext: e.target.value })}
                          className="mt-1 w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="block text-xs font-semibold text-slate-700">
                          Official Telephone
                          <input
                            type="text"
                            value={siteConfig.officePhone}
                            onChange={(e) => setSiteConfig({ ...siteConfig, officePhone: e.target.value })}
                            className="mt-1 w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono-tabular"
                          />
                        </label>
                        <label className="block text-xs font-semibold text-slate-700">
                          Official Email
                          <input
                            type="text"
                            value={siteConfig.officeEmail}
                            onChange={(e) => setSiteConfig({ ...siteConfig, officeEmail: e.target.value })}
                            className="mt-1 w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono-tabular"
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            openPhotoEditor(
                              'Official Company Logo',
                              siteConfig.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI,
                              (newLogoUrl) => {
                                saveSiteConfigToCloud(
                                  { ...siteConfig, companyLogoUrl: newLogoUrl },
                                  'hero-edit'
                                );
                              }
                            )
                          }
                          className="px-3.5 py-2 text-xs font-semibold text-[#1e3a8a] bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#f97316]" />
                          <span>Change Company Logo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => saveSiteConfigToCloud(siteConfig, 'hero-edit')}
                          className="px-4 py-2 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
                          style={{ backgroundColor: siteConfig.primaryNavy }}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm & Save Header</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Row & Direct Contact Info */}
                <div className="pt-8 mt-8 border-t border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAdminMode) scrollToSection('contact');
                      }}
                      className="px-6 py-3 text-sm font-semibold text-white rounded-lg shadow-xs transition-transform active:scale-[0.99] whitespace-nowrap shrink-0 cursor-pointer"
                      style={{ backgroundColor: siteConfig.accentOrange }}
                    >
                      {renderEditableElement('hero-cta-primary', 'Request Manpower or Project Quote', 'span')}
                    </button>
                    <a
                      href={activeGoogleMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (isAdminMode) e.preventDefault();
                      }}
                      className="px-5 py-3 text-sm font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
                      style={{ color: siteConfig.primaryNavy }}
                    >
                      <MapPin className="w-4 h-4 text-[#f97316]" />
                      {renderEditableElement('hero-cta-map', 'Company Google Maps', 'span')}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="text-xs text-slate-500 space-y-0.5 font-mono-tabular">
                    <div>
                      {renderEditableElement('hero-tel-prefix', 'Tel: ', 'span')}
                      <span
                        contentEditable={isAdminMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          if (!isAdminMode) return;
                          const val = e.currentTarget.innerText.trim();
                          if (val && val !== siteConfig.officePhone) {
                            saveSiteConfigToCloud({ ...siteConfig, officePhone: val }, 'hero-edit');
                          }
                        }}
                        className={isAdminMode ? 'outline-1 outline-dashed outline-[#f97316] rounded px-1 cursor-text' : ''}
                      >
                        {siteConfig.officePhone}
                      </span>
                    </div>
                    <div>
                      {renderEditableElement('hero-email-prefix', 'Email: ', 'span')}
                      <span
                        contentEditable={isAdminMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          if (!isAdminMode) return;
                          const val = e.currentTarget.innerText.trim();
                          if (val && val !== siteConfig.officeEmail) {
                            saveSiteConfigToCloud({ ...siteConfig, officeEmail: val }, 'hero-edit');
                          }
                        }}
                        className={isAdminMode ? 'outline-1 outline-dashed outline-[#f97316] rounded px-1 cursor-text' : ''}
                      >
                        {siteConfig.officeEmail}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 5 Columns: Official Google Map Location Card (Integrated Beside Main Heading) */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
                  <div className="space-y-0.5 min-w-0">
                    <div
                      className="flex items-center gap-1.5 text-xs font-bold"
                      style={{ color: siteConfig.primaryNavy }}
                    >
                      <MapPin className="w-4 h-4 shrink-0" style={{ color: siteConfig.accentOrange }} />
                      {renderEditableElement('map-card-heading', 'OFFICIAL HEAD OFFICE LOCATION', 'span')}
                    </div>
                    <p
                      contentEditable={isAdminMode}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        if (!isAdminMode) return;
                        const val = e.currentTarget.innerText.trim();
                        if (val && val !== siteConfig.officeAddress) {
                          saveSiteConfigToCloud({ ...siteConfig, officeAddress: val }, 'map-edit');
                        }
                      }}
                      className={`text-xs text-slate-600 truncate ${
                        isAdminMode ? 'outline-1 outline-dashed outline-[#f97316] rounded px-1 cursor-text' : ''
                      }`}
                      title={siteConfig.officeAddress}
                    >
                      {siteConfig.officeAddress}
                    </p>
                  </div>

                  {/* Interactive Map Mode Switcher (Road Map / Satellite / Pin Card) */}
                  <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg shrink-0">
                    <button
                      type="button"
                      onClick={() => setMapViewMode('roadmap')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        mapViewMode === 'roadmap' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Road Map
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapViewMode('satellite')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        mapViewMode === 'satellite' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Satellite
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapViewMode('schematic')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        mapViewMode === 'schematic' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Pin Card
                    </button>
                  </div>
                </div>

                {/* Interactive Google Map / Engineering Locator Viewport */}
                <div className="relative flex-1 min-h-[280px] bg-slate-100">
                  {mapViewMode === 'roadmap' || mapViewMode === 'satellite' ? (
                    <div className="relative w-full h-full min-h-[280px]">
                      <iframe
                        key={mapViewMode}
                        title="Al Sahab Al Rashid Trad. & Cont. Co L.L.C Official Location Map"
                        src={`https://www.google.com/maps?q=23.5880,58.3829+(Al+Sahab+Al+Rashid+Trad.+%26+Cont.+Co+L.L.C+Muscat+Oman)&t=${
                          mapViewMode === 'satellite' ? 'k' : 'm'
                        }&hl=en&z=14&output=embed`}
                        className="w-full h-full min-h-[280px] border-0"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      <a
                        href={activeGoogleMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 px-3 py-1.5 text-xs font-bold bg-white/95 text-[#1e3a8a] hover:bg-[#f97316] hover:text-white border border-slate-300 rounded-lg shadow-md flex items-center gap-1.5 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#f97316]" />
                        <span>Open Exact Pin in Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="w-full h-full min-h-[280px] p-6 flex flex-col justify-between bg-gradient-to-br from-blue-50 via-slate-50 to-orange-50">
                      <div className="flex items-center justify-between text-xs font-mono-tabular text-slate-600">
                        {renderEditableElement('map-pin-kicker', 'SULTANATE OF OMAN · OFFICIAL LOCATION', 'span')}
                        <span className="font-semibold" style={{ color: siteConfig.primaryNavy }}>
                          {siteConfig.officeCoordinates}
                        </span>
                      </div>
                      <div className="my-auto flex flex-col items-center text-center space-y-2.5 py-4">
                        <a
                          href={activeGoogleMapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-full bg-[#f97316]/15 border-2 border-[#f97316] flex items-center justify-center text-[#f97316] hover:scale-105 transition-transform"
                        >
                          <MapPin className="w-6 h-6" />
                        </a>
                        <div className="font-bold text-slate-900 text-sm">{siteConfig.companyName}</div>
                        <div className="text-xs text-slate-600 max-w-xs">{siteConfig.officeAddress}</div>
                        <a
                          href={activeGoogleMapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#1e3a8a] rounded-lg hover:bg-blue-900 flex items-center gap-1.5"
                        >
                          <span>Open Verified Google Maps Pin</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/80 text-center text-[11px] font-mono-tabular text-slate-600">
                        {renderEditableElement('map-dist-1', 'SOHAR PORT: 210 KM', 'div')}
                        {renderEditableElement('map-dist-2', 'DUQM SEZAD: 540 KM', 'div')}
                        {renderEditableElement('map-dist-3', 'RUSAYL IND: 22 KM', 'div')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Map Footer Metadata, Direct Google Maps Link & Admin Edit Controls */}
                <div className="p-4 bg-white border-t border-slate-200 space-y-2.5">
                  {isAdminMode ? (
                    <div className="space-y-2 text-xs">
                      <div className="font-bold text-[#f97316]">
                        Edit Company Google Maps Link, Address & GPS Coordinates
                      </div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Company Google Maps Share Link (Direct URL)
                        <input
                          type="url"
                          value={siteConfig.officeMapLink}
                          onChange={(e) => setSiteConfig({ ...siteConfig, officeMapLink: e.target.value })}
                          placeholder="https://maps.app.goo.gl/..."
                          className="mt-0.5 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono-tabular"
                        />
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={siteConfig.officeAddress}
                          onChange={(e) => setSiteConfig({ ...siteConfig, officeAddress: e.target.value })}
                          placeholder="Office Address"
                          className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={siteConfig.officeCoordinates}
                          onChange={(e) => setSiteConfig({ ...siteConfig, officeCoordinates: e.target.value })}
                          placeholder="GPS Coordinates"
                          className="px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono-tabular"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => saveSiteConfigToCloud(siteConfig, 'map-edit')}
                        className="w-full py-1.5 text-xs font-semibold text-white rounded-lg cursor-pointer"
                        style={{ backgroundColor: siteConfig.primaryNavy }}
                      >
                        {confirmedBadgeId === 'map-edit' ? '✓ Map Link & Location Saved' : 'Confirm & Save Map Details'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="font-mono-tabular text-slate-600 truncate">
                        GPS: {siteConfig.officeCoordinates}
                      </span>
                      <a
                        href={activeGoogleMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 font-semibold text-white bg-[#1e3a8a] hover:bg-[#f97316] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full-Width 4-Column Quantitative Proof Strip Below Hero Split (Editable in Admin Mode) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {kpiCards.map((kpi) => (
                <div key={kpi.id} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  {isAdminMode ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={kpi.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setKpiCards((prev) =>
                            prev.map((item) => (item.id === kpi.id ? { ...item, label: val } : item))
                          );
                        }}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                      />
                      <input
                        type="text"
                        value={kpi.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          setKpiCards((prev) =>
                            prev.map((item) => (item.id === kpi.id ? { ...item, value: val } : item))
                          );
                        }}
                        className="w-full px-2 py-1 text-base font-bold font-mono-tabular bg-white border border-slate-300 rounded"
                      />
                      <input
                        type="text"
                        value={kpi.subtext}
                        onChange={(e) => {
                          const val = e.target.value;
                          setKpiCards((prev) =>
                            prev.map((item) => (item.id === kpi.id ? { ...item, subtext: val } : item))
                          );
                        }}
                        className="w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="text-xs font-medium text-slate-500">{kpi.label}</div>
                      <div
                        className="mt-1 text-2xl font-bold font-mono-tabular"
                        style={{ color: kpi.isAccent ? siteConfig.accentOrange : siteConfig.primaryNavy }}
                      >
                        {kpi.value}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">{kpi.subtext}</div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {renderSectionCustomBlocks('home')}
          </div>
        </section>

        {/* SECTION 3: COMPANY CORE SERVICES & WORK TYPES (With Images & Manpower Categorization) */}
        <section id="services" className="py-16 px-6 bg-slate-50 border-b border-slate-200">
          <div className="max-w-[1360px] mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                {renderEditableElement(
                  'sec-services-kicker',
                  'Engineering & Contracting Divisions',
                  'div',
                  'text-xs font-semibold tracking-wider uppercase',
                  { color: siteConfig.accentOrange }
                )}
                {renderEditableElement(
                  'sec-services-heading',
                  'Company Core Services & Work Types',
                  'h2',
                  'text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight',
                  { color: siteConfig.primaryNavy, textWrap: 'balance' }
                )}
                {renderEditableElement(
                  'sec-services-subtext',
                  'Comprehensive civil construction, heavy earthworks, certified technical manpower supply, MEP installations, and pipeline foundations across Oman.',
                  'p',
                  'text-sm sm:text-base text-slate-600 max-w-2xl'
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isAdminMode) setIsAdminMode(true);
                  setShowAddServiceForm(!showAddServiceForm);
                }}
                className="px-4 py-2.5 text-xs font-semibold text-white rounded-lg hover:opacity-95 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                style={{ backgroundColor: siteConfig.primaryNavy }}
              >
                <Plus className="w-4 h-4" />
                <span>{showAddServiceForm ? 'Close Service Form' : 'Add Work Type Card'}</span>
              </button>
            </div>

            {/* Admin Add Core Service Form */}
            {showAddServiceForm && (
              <form
                onSubmit={handleAddCoreService}
                className="bg-white p-6 rounded-2xl border-2 border-orange-300 shadow-xs space-y-4"
              >
                <h3 className="text-base font-bold text-slate-900">Add New Core Service & Work Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Service Title (e.g., 06. Industrial Shutdown Maintenance)"
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Division Code (e.g., DIV-06 · SHUTDOWN)"
                    value={newService.categoryCode}
                    onChange={(e) => setNewService({ ...newService, categoryCode: e.target.value })}
                    className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg font-mono-tabular"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Image URL or upload"
                      value={newService.imageUrl}
                      onChange={(e) => setNewService({ ...newService, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-tabular"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        openPhotoEditor('New Core Service Photo', newService.imageUrl, (url) =>
                          setNewService((prev) => ({ ...prev, imageUrl: url }))
                        )
                      }
                      className="px-3 py-2 text-xs font-semibold bg-orange-100 text-[#f97316] border border-orange-300 rounded-lg cursor-pointer shrink-0"
                    >
                      Upload Photo
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea
                    rows={2}
                    required
                    placeholder="Detailed work type summary..."
                    value={newService.summary}
                    onChange={(e) => setNewService({ ...newService, summary: e.target.value })}
                    className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                  <textarea
                    rows={2}
                    required
                    placeholder="Specialties separated by · (e.g., Valve Overhaul · Rigging · Hydrotesting)"
                    value={newService.specialties}
                    onChange={(e) => setNewService({ ...newService, specialties: e.target.value })}
                    className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddServiceForm(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#f97316] rounded-lg hover:bg-orange-600 cursor-pointer"
                  >
                    Save Service Card
                  </button>
                </div>
              </form>
            )}

            {/* Asymmetric Bento Grid of Core Services & Work Types */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
              {coreServices.map((service, idx) => {
                const colSpanClass = idx < 2 ? 'lg:col-span-3' : 'lg:col-span-2';
                return (
                  <article
                    key={service.id}
                    className={`${colSpanClass} bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between transition-colors hover:border-slate-300`}
                  >
                    <div>
                      <div className="relative aspect-16/9 bg-slate-100 border-b border-slate-200 overflow-hidden">
                        <img
                          src={service.imageUrl}
                          alt={service.title}
                          referrerPolicy="no-referrer"
                          onClick={() => {
                            if (isAdminMode) {
                              openPhotoEditor(`Service Photo: ${service.title}`, service.imageUrl, (newUrl) => {
                                const updated = { ...service, imageUrl: newUrl };
                                setCoreServices((prev) =>
                                  prev.map((s) => (s.id === service.id ? updated : s))
                                );
                                saveSingleCoreService(updated);
                              });
                            }
                          }}
                          onError={(e) => {
                            handleImageError(e, service.categoryCode || 'Civil Works', service.title, 'Muscat, Oman');
                          }}
                          className={`w-full h-full object-cover ${isAdminMode ? 'cursor-pointer' : ''}`}
                        />
                        {isAdminMode && (
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                openPhotoEditor(`Service Photo: ${service.title}`, service.imageUrl, (newUrl) => {
                                  const updated = { ...service, imageUrl: newUrl };
                                  setCoreServices((prev) =>
                                    prev.map((s) => (s.id === service.id ? updated : s))
                                  );
                                  saveSingleCoreService(updated);
                                })
                              }
                              className="px-2.5 py-1.5 text-xs font-bold bg-[#f97316] text-white rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Change Photo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCoreService(service.id)}
                              className="p-1.5 bg-white/95 text-red-600 rounded-lg border border-slate-200 hover:bg-red-50 cursor-pointer shadow-xs"
                              title="Delete Service Card"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-6 space-y-3">
                        {isAdminMode ? (
                          <div className="space-y-2.5 bg-orange-50/50 p-3.5 rounded-xl border border-orange-200">
                            <div className="flex items-center justify-between text-[11px] font-bold text-[#f97316]">
                              <span>EDIT CORE SERVICE CARD</span>
                              {confirmedBadgeId === service.id && (
                                <span className="text-emerald-700">✓ Saved</span>
                              )}
                            </div>
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Division Code
                              <input
                                type="text"
                                value={service.categoryCode}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCoreServices((prev) =>
                                    prev.map((s) => (s.id === service.id ? { ...s, categoryCode: val } : s))
                                  );
                                }}
                                className="mt-0.5 w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded font-mono-tabular"
                              />
                            </label>
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Service Title
                              <input
                                type="text"
                                value={service.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCoreServices((prev) =>
                                    prev.map((s) => (s.id === service.id ? { ...s, title: val } : s))
                                  );
                                }}
                                className="mt-0.5 w-full px-2.5 py-1.5 text-sm font-bold bg-white border border-slate-300 rounded"
                              />
                            </label>
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Detailed Description
                              <textarea
                                rows={3}
                                value={service.summary}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCoreServices((prev) =>
                                    prev.map((s) => (s.id === service.id ? { ...s, summary: val } : s))
                                  );
                                }}
                                className="mt-0.5 w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded"
                              />
                            </label>
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Specialties (separated by ·)
                              <textarea
                                rows={2}
                                value={service.specialties}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCoreServices((prev) =>
                                    prev.map((s) => (s.id === service.id ? { ...s, specialties: val } : s))
                                  );
                                }}
                                className="mt-0.5 w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => saveSingleCoreService(service)}
                              className="w-full py-1.5 text-xs font-semibold text-white rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                              style={{ backgroundColor: siteConfig.primaryNavy }}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirm & Save Card</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <div
                              className="text-xs font-mono-tabular font-semibold"
                              style={{ color: siteConfig.accentOrange }}
                            >
                              {service.categoryCode}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{service.summary}</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200/80">
                      {renderEditableElement(
                        `srv-scope-label-${service.id}`,
                        'Key Scope & Capabilities',
                        'div',
                        'text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1'
                      )}
                      <p className="text-xs text-slate-700 leading-relaxed">{service.specialties}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Interactive Skilled & Unskilled Manpower Categorization Breakdown */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div className="space-y-1">
                  {renderEditableElement(
                    'manpower-kicker',
                    'DIV-03 SPECIALTY MATRIX · SKILLED & UNSKILLED WORKFORCE SUPPLY',
                    'div',
                    'text-xs font-mono-tabular font-semibold',
                    { color: siteConfig.accentOrange }
                  )}
                  {renderEditableElement(
                    'manpower-heading',
                    'Categorized Technical & Construction Manpower Roster',
                    'h3',
                    'text-xl sm:text-2xl font-bold',
                    { color: siteConfig.primaryNavy }
                  )}
                  {renderEditableElement(
                    'manpower-subtext',
                    'Trade-tested, medically fit, and HSE-inducted workforce available for short-term shutdowns, long-term EPC secondment, or unit-rate subcontracts.',
                    'p',
                    'text-xs sm:text-sm text-slate-600'
                  )}
                </div>

                {/* Interactive Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedManpowerGroup('ALL')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedManpowerGroup === 'ALL' ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    style={
                      selectedManpowerGroup === 'ALL'
                        ? { backgroundColor: siteConfig.primaryNavy }
                        : undefined
                    }
                  >
                    All Categories
                  </button>
                  {manpowerGroups.map((grp) => (
                    <button
                      key={grp.groupCode}
                      type="button"
                      onClick={() => setSelectedManpowerGroup(grp.groupCode)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedManpowerGroup === grp.groupCode
                          ? 'text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      style={
                        selectedManpowerGroup === grp.groupCode
                          ? { backgroundColor: siteConfig.primaryNavy }
                          : undefined
                      }
                    >
                      {grp.groupCode.split('·')[1]?.trim() || grp.groupCode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {filteredManpowerGroups.map((group, groupIdx) => (
                  <div
                    key={group.groupCode}
                    className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono-tabular text-slate-500">
                        <span>{group.groupCode}</span>
                        <span className="font-bold" style={{ color: siteConfig.primaryNavy }}>
                          {group.totalAvailable} Active Pool
                        </span>
                      </div>

                      {isAdminMode ? (
                        <input
                          type="text"
                          value={group.groupTitle}
                          onChange={(e) => {
                            const val = e.target.value;
                            setManpowerGroups((prev) =>
                              prev.map((g, i) => (i === groupIdx ? { ...g, groupTitle: val } : g))
                            );
                          }}
                          className="w-full px-2.5 py-1 text-sm font-bold bg-white border border-slate-300 rounded"
                        />
                      ) : (
                        <h4 className="text-base font-bold text-slate-900">{group.groupTitle}</h4>
                      )}

                      <div className="divide-y divide-slate-200/80 border-t border-slate-200 pt-2">
                        {group.roles.map((role, roleIdx) => (
                          <div key={`${group.groupCode}-${roleIdx}`} className="py-2.5 space-y-1">
                            {isAdminMode ? (
                              <div className="space-y-1 bg-white p-2 rounded border border-slate-200">
                                <div className="flex gap-1.5">
                                  <input
                                    type="text"
                                    value={role.trade}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setManpowerGroups((prev) =>
                                        prev.map((g, gi) =>
                                          gi === groupIdx
                                            ? {
                                                ...g,
                                                roles: g.roles.map((r, ri) =>
                                                  ri === roleIdx ? { ...r, trade: val } : r
                                                ),
                                              }
                                            : g
                                        )
                                      );
                                    }}
                                    className="flex-1 px-2 py-0.5 text-xs font-semibold border border-slate-300 rounded"
                                  />
                                  <input
                                    type="number"
                                    value={role.headcount}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      setManpowerGroups((prev) =>
                                        prev.map((g, gi) =>
                                          gi === groupIdx
                                            ? {
                                                ...g,
                                                roles: g.roles.map((r, ri) =>
                                                  ri === roleIdx ? { ...r, headcount: val } : r
                                                ),
                                              }
                                            : g
                                        )
                                      );
                                    }}
                                    className="w-16 px-2 py-0.5 text-xs font-mono-tabular border border-slate-300 rounded"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={role.specialization}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setManpowerGroups((prev) =>
                                      prev.map((g, gi) =>
                                        gi === groupIdx
                                          ? {
                                              ...g,
                                              roles: g.roles.map((r, ri) =>
                                                ri === roleIdx ? { ...r, specialization: val } : r
                                              ),
                                            }
                                          : g
                                      )
                                    );
                                  }}
                                  className="w-full px-2 py-0.5 text-[11px] border border-slate-300 rounded"
                                />
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                                  <span>{role.trade}</span>
                                  <span
                                    className="font-mono-tabular"
                                    style={{ color: siteConfig.accentOrange }}
                                  >
                                    {role.headcount} Available
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {role.grade} · {role.specialization}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{group.certificationStandard}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setInquiryForm((prev) => ({
                            ...prev,
                            inquiryType: 'Skilled & Unskilled Manpower Supply',
                            manpowerDetails: `Requesting deployment from ${group.groupTitle}`,
                          }));
                          scrollToSection('contact');
                        }}
                        className="font-semibold text-[#1e3a8a] hover:text-[#f97316] whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Request Mobilization →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {renderSectionCustomBlocks('services')}
          </div>
        </section>

        {/* SECTION 4: RUNNING PROJECT SITES (With Interactive Details Modal & Admin Add Form) */}
        <section id="running-projects" className="py-16 px-6 bg-white border-b border-slate-200">
          <div className="max-w-[1360px] mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div
                  className="flex items-center gap-2 text-xs font-mono-tabular font-semibold"
                  style={{ color: siteConfig.accentOrange }}
                >
                  {renderEditableElement('sec-running-kicker', 'LIVE OPERATIONS TRACKER', 'span')}
                  <span>·</span>
                  <span>{runningProjects.length} ACTIVE SITES</span>
                  <span>·</span>
                  <span>{totalRunningManpower} PERSONNEL ON SITE</span>
                </div>
                {renderEditableElement(
                  'sec-running-heading',
                  'Running Project Sites Across Oman',
                  'h2',
                  'text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight',
                  { color: siteConfig.primaryNavy, textWrap: 'balance' }
                )}
                {renderEditableElement(
                  'sec-running-subtext',
                  'Click any ongoing project site below to inspect full engineering scope, mobilization timeline, and site supervision details.',
                  'p',
                  'text-sm sm:text-base text-slate-600 max-w-2xl'
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAdminMode) setIsAdminMode(true);
                    setShowAddRunningForm((prev) => !prev);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-white rounded-lg hover:opacity-95 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  style={{ backgroundColor: siteConfig.accentOrange }}
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddRunningForm ? 'Close Add Site Form' : 'Add Running Project Site'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Admin Form to Add New Ongoing Project Sites Dynamically */}
            {showAddRunningForm && (
              <form
                onSubmit={handleAddRunningProject}
                className="bg-slate-50 p-6 lg:p-8 rounded-2xl border-2 border-orange-300 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: siteConfig.primaryNavy }}>
                      Add New Ongoing Project Site (Dynamic Admin Form)
                    </h3>
                    <p className="text-xs text-slate-600">
                      New project sites appear immediately in the live tracker and sync with the database.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddRunningForm(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="block text-xs font-semibold text-slate-700">
                    Project Site Title *
                    <input
                      type="text"
                      required
                      placeholder="e.g., Salalah Freezone Drainage & Culvert Package"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Site Location (Governorate / Wilayat) *
                    <input
                      type="text"
                      required
                      placeholder="e.g., Salalah — Dhofar Governorate"
                      value={newProject.location}
                      onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Client / Main Contractor *
                    <input
                      type="text"
                      required
                      placeholder="e.g., Dhofar Municipal Infrastructure Authority"
                      value={newProject.client}
                      onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <label className="block text-xs font-semibold text-slate-700">
                    Work Type Category
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="Civil Works & Earth Works">Civil Works & Earth Works</option>
                      <option value="Mechanical & Electrical Works">Mechanical & Electrical Works</option>
                      <option value="Pipeline Works & Special Structures">Pipeline Works & Special Structures</option>
                      <option value="Skilled Manpower Mobilization">Skilled Manpower Mobilization</option>
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Completion Progress (%)
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newProject.progress}
                      onChange={(e) => setNewProject({ ...newProject, progress: Number(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono-tabular"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Active Workforce Count
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={newProject.manpowerCount}
                      onChange={(e) => setNewProject({ ...newProject, manpowerCount: Number(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono-tabular"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Start Date
                    <input
                      type="text"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Target Completion
                    <input
                      type="text"
                      value={newProject.completionTarget}
                      onChange={(e) => setNewProject({ ...newProject, completionTarget: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-xs font-semibold text-slate-700">
                    Project Lead Engineer *
                    <input
                      type="text"
                      required
                      placeholder="e.g., Eng. Hamad Al Rawahi (Sr. Project Manager)"
                      value={newProject.engineerLead}
                      onChange={(e) => setNewProject({ ...newProject, engineerLead: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                    />
                  </label>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Site Photo URL or Upload File
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          value={newProject.imageUrl}
                          onChange={(e) => setNewProject({ ...newProject, imageUrl: e.target.value })}
                          className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono-tabular"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            openPhotoEditor('New Running Site Photo', newProject.imageUrl, (url) =>
                              setNewProject((prev) => ({ ...prev, imageUrl: url }))
                            )
                          }
                          className="px-3 py-2 text-xs font-semibold bg-orange-100 text-[#f97316] border border-orange-300 rounded-lg cursor-pointer shrink-0"
                        >
                          Upload Photo
                        </button>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-xs font-semibold text-slate-700">
                    Brief Card Summary *
                    <textarea
                      rows={2}
                      required
                      placeholder="Concise summary of ongoing works..."
                      value={newProject.summary}
                      onChange={(e) => setNewProject({ ...newProject, summary: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">
                    Detailed Engineering Scope (Modal View) *
                    <textarea
                      rows={2}
                      required
                      placeholder="Full technical details, concrete volume, piping length, or manpower breakdown..."
                      value={newProject.scopeDetails}
                      onChange={(e) => setNewProject({ ...newProject, scopeDetails: e.target.value })}
                      className="mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddRunningForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-xs font-semibold text-white rounded-lg cursor-pointer"
                    style={{ backgroundColor: siteConfig.primaryNavy }}
                  >
                    Publish Running Project Site
                  </button>
                </div>
              </form>
            )}

            {/* Running Project Sites Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {runningProjects.map((project, idx) => (
                <article
                  key={project.id}
                  onClick={() => {
                    if (!isAdminMode) setSelectedRunningProject(project);
                  }}
                  className={`bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between transition-all ${
                    isAdminMode ? '' : 'hover:border-[#1e3a8a] hover:shadow-md cursor-pointer group'
                  }`}
                >
                  <div>
                    <div className="relative aspect-16/9 bg-slate-100 border-b border-slate-200 overflow-hidden">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        onClick={(e) => {
                          if (isAdminMode) {
                            e.stopPropagation();
                            openPhotoEditor(`Running Site Photo: ${project.title}`, project.imageUrl, (newUrl) => {
                              const updated = { ...project, imageUrl: newUrl };
                              setRunningProjects((prev) =>
                                prev.map((p) => (p.id === project.id ? updated : p))
                              );
                              saveSingleRunningProject(updated);
                            });
                          }
                        }}
                        onError={(e) => {
                          handleImageError(e, project.category || 'Civil Works', project.title, project.location || 'Muscat, Oman');
                        }}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
                          isAdminMode ? 'cursor-pointer' : ''
                        }`}
                      />
                      {isAdminMode && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPhotoEditor(`Running Site Photo: ${project.title}`, project.imageUrl, (newUrl) => {
                                const updated = { ...project, imageUrl: newUrl };
                                setRunningProjects((prev) =>
                                  prev.map((p) => (p.id === project.id ? updated : p))
                                );
                                saveSingleRunningProject(updated);
                              });
                            }}
                            className="px-2.5 py-1.5 text-xs font-bold bg-[#f97316] text-white rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Change Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRunningProject(project.id);
                            }}
                            className="p-1.5 bg-white/95 text-red-600 rounded-lg border border-slate-200 hover:bg-red-50 cursor-pointer shadow-xs"
                            title="Delete Running Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      {isAdminMode ? (
                        <div
                          className="space-y-2.5 bg-white p-3.5 rounded-xl border border-orange-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#f97316]">
                            <span>EDIT RUNNING SITE</span>
                            {confirmedBadgeId === project.id && (
                              <span className="text-emerald-700">✓ Confirmed</span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRunningProjects((prev) =>
                                prev.map((p) => (p.id === project.id ? { ...p, title: val } : p))
                              );
                            }}
                            placeholder="Project Title"
                            className="w-full px-2.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={project.location}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRunningProjects((prev) =>
                                  prev.map((p) => (p.id === project.id ? { ...p, location: val } : p))
                                );
                              }}
                              placeholder="Location"
                              className="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
                            />
                            <input
                              type="text"
                              value={project.client}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRunningProjects((prev) =>
                                  prev.map((p) => (p.id === project.id ? { ...p, client: val } : p))
                                );
                              }}
                              placeholder="Client"
                              className="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="text-[11px] font-semibold text-slate-600">
                              Progress: {project.progress}%
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={project.progress}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setRunningProjects((prev) =>
                                    prev.map((p) => (p.id === project.id ? { ...p, progress: val } : p))
                                  );
                                }}
                                className="mt-1 w-full accent-[#f97316] cursor-pointer"
                              />
                            </label>
                            <label className="text-[11px] font-semibold text-slate-600">
                              Workforce Count
                              <input
                                type="number"
                                value={project.manpowerCount}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setRunningProjects((prev) =>
                                    prev.map((p) => (p.id === project.id ? { ...p, manpowerCount: val } : p))
                                  );
                                }}
                                className="mt-0.5 w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded font-mono-tabular"
                              />
                            </label>
                          </div>
                          <textarea
                            rows={2}
                            value={project.summary}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRunningProjects((prev) =>
                                prev.map((p) => (p.id === project.id ? { ...p, summary: val } : p))
                              );
                            }}
                            placeholder="Card Summary"
                            className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
                          />
                          <textarea
                            rows={2}
                            value={project.scopeDetails}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRunningProjects((prev) =>
                                prev.map((p) => (p.id === project.id ? { ...p, scopeDetails: val } : p))
                              );
                            }}
                            placeholder="Full Modal Technical Scope"
                            className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => saveSingleRunningProject(project)}
                            className="w-full py-1.5 text-xs font-semibold text-white rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                            style={{ backgroundColor: siteConfig.primaryNavy }}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm & Save Site</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                            <span className="font-semibold" style={{ color: siteConfig.primaryNavy }}>
                              {project.location}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{project.category}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1e3a8a] transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-xs text-slate-500">Client: {project.client}</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{project.summary}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress & Interactive Inspect Trigger */}
                  <div className="px-6 py-4 bg-white border-t border-slate-200 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono-tabular">
                        <span className="text-slate-600">Physical Completion</span>
                        <span className="font-bold" style={{ color: siteConfig.primaryNavy }}>
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(0, project.progress))}%`,
                            backgroundColor: siteConfig.accentOrange,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-mono-tabular text-slate-600">
                        {project.manpowerCount} Personnel · Handover {project.completionTarget}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRunningProject(project);
                        }}
                        className="font-semibold text-[#1e3a8a] hover:text-[#f97316] flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Scope</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {renderSectionCustomBlocks('running-projects')}
          </div>
        </section>

        {/* SECTION 5: PHOTO GALLERY WITH SLIDER & CAROUSEL */}
        <section id="gallery" className="py-16 px-6 bg-slate-50 border-b border-slate-200">
          <div className="max-w-[1360px] mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                {renderEditableElement(
                  'sec-gallery-kicker',
                  'SITE EXECUTION PHOTOGRAPHY & SLIDER',
                  'div',
                  'text-xs font-mono-tabular font-semibold',
                  { color: siteConfig.accentOrange }
                )}
                {renderEditableElement(
                  'sec-gallery-heading',
                  'Photo Gallery & Interactive Site Carousel',
                  'h2',
                  'text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight',
                  { color: siteConfig.primaryNavy, textWrap: 'balance' }
                )}
                {renderEditableElement(
                  'sec-gallery-subtext',
                  'Visual documentation of our civil structures, box culverts, heavy earthwork fleets, MEP manifolds, and site workforce across Oman.',
                  'p',
                  'text-sm sm:text-base text-slate-600 max-w-2xl'
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAutoPlay((prev) => !prev)}
                  className="px-3.5 py-2 text-xs font-semibold bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isAutoPlay ? 'Pause Auto-Slider' : 'Resume Auto-Slider'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAdminMode) setIsAdminMode(true);
                    setShowAddGalleryForm((prev) => !prev);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-95 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  style={{ backgroundColor: siteConfig.primaryNavy }}
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddGalleryForm ? 'Close Photo Form' : 'Add Photo / Upload'}</span>
                </button>
              </div>
            </div>

            {/* Admin Add Photo Form */}
            {showAddGalleryForm && (
              <form
                onSubmit={handleAddGalleryPhoto}
                className="bg-white p-6 rounded-2xl border-2 border-orange-300 space-y-4"
              >
                <h3 className="text-base font-bold text-slate-900">
                  Add New Work Photo to Gallery & Carousel
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Photo Title *"
                    value={newPhoto.title}
                    onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                    className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                  <select
                    value={newPhoto.category}
                    onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}
                    className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  >
                    <option value="Civil & Structural">Civil & Structural</option>
                    <option value="Earth Works">Earth Works</option>
                    <option value="Manpower Teams">Manpower Teams</option>
                    <option value="MEP & Piping">MEP & Piping</option>
                    <option value="Pipeline & Structures">Pipeline & Structures</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Site Location *"
                    value={newPhoto.location}
                    onChange={(e) => setNewPhoto({ ...newPhoto, location: e.target.value })}
                    className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Image URL *"
                      value={newPhoto.imageUrl}
                      onChange={(e) => setNewPhoto({ ...newPhoto, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-tabular"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        openPhotoEditor('Upload New Gallery Photo', newPhoto.imageUrl, (url) =>
                          setNewPhoto((prev) => ({ ...prev, imageUrl: url }))
                        )
                      }
                      className="px-3 py-2 text-xs font-semibold bg-orange-100 text-[#f97316] border border-orange-300 rounded-lg cursor-pointer shrink-0"
                    >
                      Upload
                    </button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Technical caption describing the site activity..."
                  value={newPhoto.caption}
                  onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddGalleryForm(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#f97316] rounded-lg hover:bg-orange-600 cursor-pointer"
                  >
                    Add Photo to Slider
                  </button>
                </div>
              </form>
            )}

            {/* Featured Interactive Carousel / Slider */}
            {activeSlide && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="relative aspect-16/9 max-h-[480px] w-full bg-slate-100 overflow-hidden">
                  <img
                    src={activeSlide.imageUrl}
                    alt={activeSlide.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      handleImageError(e, activeSlide.category || 'Civil Works', activeSlide.title, activeSlide.location || 'Muscat, Oman');
                    }}
                    className="w-full h-full object-cover"
                  />
                  {/* Measured contrast scrim for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex flex-col justify-end p-6 sm:p-8">
                    <div className="max-w-3xl space-y-2 text-white">
                      <div className="flex items-center gap-2 text-xs font-mono-tabular text-orange-300">
                        <span>
                          SLIDE {String(currentSlideIndex + 1).padStart(2, '0')} /{' '}
                          {String(galleryPhotos.length).padStart(2, '0')}
                        </span>
                        <span>·</span>
                        <span>{activeSlide.category}</span>
                        <span>·</span>
                        <span>{activeSlide.location}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{activeSlide.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{activeSlide.caption}</p>
                    </div>
                  </div>

                  {isAdminMode && (
                    <button
                      type="button"
                      onClick={() =>
                        openPhotoEditor(`Carousel Slide: ${activeSlide.title}`, activeSlide.imageUrl, (newUrl) => {
                          const updated = { ...activeSlide, imageUrl: newUrl };
                          setGalleryPhotos((prev) =>
                            prev.map((p) => (p.id === activeSlide.id ? updated : p))
                          );
                          saveSingleGalleryPhoto(updated);
                        })
                      }
                      className="absolute top-4 right-4 px-3.5 py-2 text-xs font-bold bg-[#f97316] text-white rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Change / Upload Slide Photo</span>
                    </button>
                  )}

                  {/* Previous / Next Slider Controls */}
                  <button
                    type="button"
                    aria-label="Previous slide"
                    onClick={() =>
                      setCurrentSlideIndex(
                        (prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-slate-900 hover:bg-white flex items-center justify-center shadow-md cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next slide"
                    onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % galleryPhotos.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-slate-900 hover:bg-white flex items-center justify-center shadow-md cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Carousel Thumbnail & Indicator Strip */}
                <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-4 overflow-x-auto">
                  <div className="flex items-center gap-2">
                    {galleryPhotos.map((photo, index) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setCurrentSlideIndex(index)}
                        className={`px-3 py-1.5 text-xs font-mono-tabular rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          index === currentSlideIndex
                            ? 'text-white font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        style={
                          index === currentSlideIndex
                            ? { backgroundColor: siteConfig.primaryNavy }
                            : undefined
                        }
                      >
                        {String(index + 1).padStart(2, '0')}. {photo.title.slice(0, 22)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Category Filter & Responsive Photo Grid */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                  {[
                    'All',
                    'Civil & Structural',
                    'Earth Works',
                    'Manpower Teams',
                    'MEP & Piping',
                    'Pipeline & Structures',
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGalleryCategoryFilter(cat)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        galleryCategoryFilter === cat
                          ? 'bg-white text-[#1e3a8a] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono-tabular text-slate-500">
                  Showing {filteredGalleryPhotos.length} of {galleryPhotos.length} work photographs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGalleryPhotos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between group"
                  >
                    <div
                      onClick={() => {
                        if (isAdminMode) {
                          openPhotoEditor(`Gallery Photo: ${photo.title}`, photo.imageUrl, (newUrl) => {
                            const updated = { ...photo, imageUrl: newUrl };
                            setGalleryPhotos((prev) =>
                              prev.map((p) => (p.id === photo.id ? updated : p))
                            );
                            saveSingleGalleryPhoto(updated);
                          });
                        } else {
                          setLightboxPhoto(photo);
                        }
                      }}
                      className="relative aspect-16/9 bg-slate-100 border-b border-slate-200 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          handleImageError(e, photo.category || 'Civil Works', photo.title, photo.location || 'Muscat, Oman');
                        }}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      {isAdminMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPhotoEditor(`Gallery Photo: ${photo.title}`, photo.imageUrl, (newUrl) => {
                              const updated = { ...photo, imageUrl: newUrl };
                              setGalleryPhotos((prev) =>
                                prev.map((p) => (p.id === photo.id ? updated : p))
                              );
                              saveSingleGalleryPhoto(updated);
                            });
                          }}
                          className="absolute top-3 right-3 px-2.5 py-1.5 text-xs font-bold bg-[#f97316] text-white rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Change Photo</span>
                        </button>
                      )}
                    </div>
                    <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                      {isAdminMode ? (
                        <div className="space-y-2 bg-orange-50/50 p-3 rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#f97316]">
                            <span>EDIT GALLERY PHOTO</span>
                            {confirmedBadgeId === photo.id && (
                              <span className="text-emerald-700">✓ Saved</span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={photo.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGalleryPhotos((prev) =>
                                prev.map((p) => (p.id === photo.id ? { ...p, title: val } : p))
                              );
                            }}
                            placeholder="Photo Title"
                            className="w-full px-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded"
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={photo.category}
                              onChange={(e) => {
                                const val = e.target.value;
                                setGalleryPhotos((prev) =>
                                  prev.map((p) => (p.id === photo.id ? { ...p, category: val } : p))
                                );
                              }}
                              placeholder="Category"
                              className="px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                            />
                            <input
                              type="text"
                              value={photo.location}
                              onChange={(e) => {
                                const val = e.target.value;
                                setGalleryPhotos((prev) =>
                                  prev.map((p) => (p.id === photo.id ? { ...p, location: val } : p))
                                );
                              }}
                              placeholder="Location"
                              className="px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={photo.caption}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGalleryPhotos((prev) =>
                                prev.map((p) => (p.id === photo.id ? { ...p, caption: val } : p))
                              );
                            }}
                            placeholder="Caption"
                            className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                          />
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => saveSingleGalleryPhoto(photo)}
                              className="flex-1 py-1.5 text-xs font-semibold text-white rounded cursor-pointer"
                              style={{ backgroundColor: siteConfig.primaryNavy }}
                            >
                              Save Photo
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGalleryPhoto(photo.id)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                            <span className="font-semibold" style={{ color: siteConfig.accentOrange }}>
                              {photo.category}
                            </span>
                            <span>{photo.location}</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900">{photo.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {renderSectionCustomBlocks('gallery')}
          </div>
        </section>

        {/* SECTION 6: COMPLETED PROJECTS PORTFOLIO */}
        <section id="portfolio" className="py-16 px-6 bg-white border-b border-slate-200">
          <div className="max-w-[1360px] mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                {renderEditableElement(
                  'sec-portfolio-kicker',
                  'PROVEN TRACK RECORD & HANDOVER CREDENTIALS',
                  'div',
                  'text-xs font-mono-tabular font-semibold',
                  { color: siteConfig.accentOrange }
                )}
                {renderEditableElement(
                  'sec-portfolio-heading',
                  'Completed Projects Portfolio',
                  'h2',
                  'text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight',
                  { color: siteConfig.primaryNavy, textWrap: 'balance' }
                )}
                {renderEditableElement(
                  'sec-portfolio-subtext',
                  'Selected civil engineering, flood protection earthworks, industrial stainless piping, and utility pipeline contracts successfully handed over across the Sultanate of Oman.',
                  'p',
                  'text-sm sm:text-base text-slate-600 max-w-2xl'
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  {[
                    'All',
                    'Civil Works',
                    'Earth Works',
                    'Mechanical & Electrical Works',
                    'Pipeline Works & Special Structures',
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPortfolioFilter(cat)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        portfolioFilter === cat ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      style={
                        portfolioFilter === cat ? { backgroundColor: siteConfig.primaryNavy } : undefined
                      }
                    >
                      {cat === 'Pipeline Works & Special Structures' ? 'Pipelines & Structures' : cat}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isAdminMode) setIsAdminMode(true);
                    setShowAddCompletedForm((prev) => !prev);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-95 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  style={{ backgroundColor: siteConfig.accentOrange }}
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddCompletedForm ? 'Close Form' : 'Add Completed Project'}</span>
                </button>
              </div>
            </div>

            {/* Admin Add Completed Portfolio Form */}
            {showAddCompletedForm && (
              <form
                onSubmit={handleAddCompletedProject}
                className="bg-slate-50 p-6 rounded-2xl border-2 border-orange-300 space-y-4"
              >
                <h3 className="text-base font-bold text-slate-900">Add Completed Project to Portfolio</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Project Title *"
                    value={newCompleted.title}
                    onChange={(e) => setNewCompleted({ ...newCompleted, title: e.target.value })}
                    className="px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Client Organization *"
                    value={newCompleted.client}
                    onChange={(e) => setNewCompleted({ ...newCompleted, client: e.target.value })}
                    className="px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Location (e.g., Sohar, Oman) *"
                    value={newCompleted.location}
                    onChange={(e) => setNewCompleted({ ...newCompleted, location: e.target.value })}
                    className="px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Handover Year (e.g., 2025)"
                    value={newCompleted.completionYear}
                    onChange={(e) => setNewCompleted({ ...newCompleted, completionYear: e.target.value })}
                    className="px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono-tabular"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Quantified Metric (e.g., OMR 1.4M · Zero LTI)"
                    value={newCompleted.contractValue}
                    onChange={(e) => setNewCompleted({ ...newCompleted, contractValue: e.target.value })}
                    className="px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono-tabular"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Image URL"
                      value={newCompleted.imageUrl}
                      onChange={(e) => setNewCompleted({ ...newCompleted, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-mono-tabular"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        openPhotoEditor('Upload Completed Project Photo', newCompleted.imageUrl, (url) =>
                          setNewCompleted((prev) => ({ ...prev, imageUrl: url }))
                        )
                      }
                      className="px-3 py-2 text-xs font-semibold bg-orange-100 text-[#f97316] border border-orange-300 rounded-lg cursor-pointer shrink-0"
                    >
                      Upload
                    </button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Completed project scope and outcome description..."
                  value={newCompleted.description}
                  onChange={(e) => setNewCompleted({ ...newCompleted, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCompletedForm(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white rounded-lg cursor-pointer"
                    style={{ backgroundColor: siteConfig.primaryNavy }}
                  >
                    Save Portfolio Record
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCompletedProjects.map((item, idx) => (
                <article
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-16/9 bg-slate-100 border-b border-slate-200 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        onClick={() => {
                          if (isAdminMode) {
                            openPhotoEditor(`Completed Project Photo: ${item.title}`, item.imageUrl, (newUrl) => {
                              const updated = { ...item, imageUrl: newUrl };
                              setCompletedProjects((prev) =>
                                prev.map((c) => (c.id === item.id ? updated : c))
                              );
                              saveSingleCompletedProject(updated);
                            });
                          }
                        }}
                        onError={(e) => {
                          handleImageError(e, item.category || 'Civil Works', item.title, item.location || 'Muscat, Oman');
                        }}
                        className={`w-full h-full object-cover ${isAdminMode ? 'cursor-pointer' : ''}`}
                      />
                      {isAdminMode && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              openPhotoEditor(`Completed Project Photo: ${item.title}`, item.imageUrl, (newUrl) => {
                                const updated = { ...item, imageUrl: newUrl };
                                setCompletedProjects((prev) =>
                                  prev.map((c) => (c.id === item.id ? updated : c))
                                );
                                saveSingleCompletedProject(updated);
                              })
                            }
                            className="px-2.5 py-1.5 text-xs font-bold bg-[#f97316] text-white rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Change Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCompletedProject(item.id)}
                            className="p-1.5 bg-white/95 text-red-600 rounded-lg border border-slate-200 hover:bg-red-50 cursor-pointer shadow-xs"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      {isAdminMode ? (
                        <div className="space-y-2 bg-white p-3.5 rounded-xl border border-orange-200">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#f97316]">
                            <span>EDIT COMPLETED PROJECT</span>
                            {confirmedBadgeId === item.id && (
                              <span className="text-emerald-700">✓ Confirmed</span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCompletedProjects((prev) =>
                                prev.map((c) => (c.id === item.id ? { ...c, title: val } : c))
                              );
                            }}
                            placeholder="Project Title"
                            className="w-full px-2.5 py-1.5 text-sm font-bold bg-slate-50 border border-slate-300 rounded"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={item.client}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCompletedProjects((prev) =>
                                  prev.map((c) => (c.id === item.id ? { ...c, client: val } : c))
                                );
                              }}
                              placeholder="Client Name"
                              className="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
                            />
                            <input
                              type="text"
                              value={item.location}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCompletedProjects((prev) =>
                                  prev.map((c) => (c.id === item.id ? { ...c, location: val } : c))
                                );
                              }}
                              placeholder="Location"
                              className="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={item.category}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCompletedProjects((prev) =>
                                  prev.map((c) => (c.id === item.id ? { ...c, category: val } : c))
                                );
                              }}
                              placeholder="Category"
                              className="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
                            />
                            <input
                              type="text"
                              value={item.completionYear}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCompletedProjects((prev) =>
                                  prev.map((c) => (c.id === item.id ? { ...c, completionYear: val } : c))
                                );
                              }}
                              placeholder="Year"
                              className="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded font-mono-tabular"
                            />
                            <input
                              type="text"
                              value={item.contractValue}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCompletedProjects((prev) =>
                                  prev.map((c) => (c.id === item.id ? { ...c, contractValue: val } : c))
                                );
                              }}
                              placeholder="Contract Value"
                              className="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded font-mono-tabular"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCompletedProjects((prev) =>
                                prev.map((c) => (c.id === item.id ? { ...c, description: val } : c))
                              );
                            }}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => saveSingleCompletedProject(item)}
                            className="w-full py-1.5 text-xs font-semibold text-white rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                            style={{ backgroundColor: siteConfig.primaryNavy }}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm & Save Portfolio Card</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular text-slate-500">
                            <span className="font-semibold" style={{ color: siteConfig.primaryNavy }}>
                              {item.category}
                            </span>
                            <span>·</span>
                            <span>{item.location}</span>
                            <span>·</span>
                            <span className="font-semibold" style={{ color: siteConfig.accentOrange }}>
                              Handover {item.completionYear}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                          <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-700">Client: {item.client}</span>
                    <span
                      className="font-mono-tabular font-semibold"
                      style={{ color: siteConfig.primaryNavy }}
                    >
                      {item.contractValue}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {renderSectionCustomBlocks('portfolio')}
          </div>
        </section>

        {/* SECTION 7: ABOUT US, AIM, VISION, MISSION & CORE VALUES (Placed Near Bottom) */}
        <section id="about" className="py-16 px-6 bg-slate-50 border-b border-slate-200">
          <div className="max-w-[1360px] mx-auto space-y-12">
            {/* Company Background Narrative */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 lg:p-10 space-y-6">
              <div className="space-y-2">
                {renderEditableElement(
                  'sec-about-kicker',
                  'CORPORATE PROFILE & GOVERNANCE · WWWASAR.COM',
                  'div',
                  'text-xs font-mono-tabular font-semibold',
                  { color: siteConfig.accentOrange }
                )}
                {renderEditableElement(
                  'sec-about-heading',
                  'About Al Sahab Al Rashid Trad. & Cont. Co L.L.C',
                  'h2',
                  'text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight',
                  { color: siteConfig.primaryNavy }
                )}
              </div>

              {isAdminMode ? (
                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={siteConfig.aboutBackground}
                    onChange={(e) => setSiteConfig({ ...siteConfig, aboutBackground: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => saveSiteConfigToCloud(siteConfig, 'about-save')}
                    className="px-4 py-2 text-xs font-semibold text-white rounded-lg cursor-pointer"
                    style={{ backgroundColor: siteConfig.primaryNavy }}
                  >
                    {confirmedBadgeId === 'about-save'
                      ? '✓ Saved About Background'
                      : 'Confirm & Save About Background'}
                  </button>
                </div>
              ) : (
                <p className="text-base text-slate-700 leading-relaxed max-w-[85ch]">
                  {siteConfig.aboutBackground}
                </p>
              )}
            </div>

            {/* Dedicated Styled Cards Explicitly Showing: OUR AIM, OUR VISION, OUR MISSION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* OUR AIM */}
              <div className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"
                    style={{ color: siteConfig.primaryNavy }}
                  >
                    <Compass className="w-5 h-5" />
                  </div>
                  {renderEditableElement(
                    'card-aim-kicker',
                    '01 · STRATEGIC DIRECTION',
                    'div',
                    'text-xs font-mono-tabular font-bold tracking-wider',
                    { color: siteConfig.accentOrange }
                  )}
                  {renderEditableElement(
                    'card-aim-heading',
                    'OUR AIM',
                    'h3',
                    'text-xl font-bold',
                    { color: siteConfig.primaryNavy }
                  )}
                  {isAdminMode ? (
                    <div className="space-y-2">
                      <textarea
                        rows={4}
                        value={siteConfig.ourAim}
                        onChange={(e) => setSiteConfig({ ...siteConfig, ourAim: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => saveSiteConfigToCloud(siteConfig, 'aim-save')}
                        className="px-3 py-1.5 text-xs font-semibold text-white rounded cursor-pointer"
                        style={{ backgroundColor: siteConfig.primaryNavy }}
                      >
                        {confirmedBadgeId === 'aim-save' ? '✓ Saved Aim' : 'Save Aim'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">{siteConfig.ourAim}</p>
                  )}
                </div>
                {renderEditableElement(
                  'card-aim-footer',
                  'Zero-LTI · First-Time Right Handover',
                  'div',
                  'pt-3 border-t border-slate-100 text-xs font-mono-tabular text-slate-400'
                )}
              </div>

              {/* OUR VISION */}
              <div className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"
                    style={{ color: siteConfig.accentOrange }}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  {renderEditableElement(
                    'card-vision-kicker',
                    '02 · FUTURE BENCHMARK',
                    'div',
                    'text-xs font-mono-tabular font-bold tracking-wider',
                    { color: siteConfig.accentOrange }
                  )}
                  {renderEditableElement(
                    'card-vision-heading',
                    'OUR VISION',
                    'h3',
                    'text-xl font-bold',
                    { color: siteConfig.primaryNavy }
                  )}
                  {isAdminMode ? (
                    <div className="space-y-2">
                      <textarea
                        rows={4}
                        value={siteConfig.ourVision}
                        onChange={(e) => setSiteConfig({ ...siteConfig, ourVision: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => saveSiteConfigToCloud(siteConfig, 'vision-save')}
                        className="px-3 py-1.5 text-xs font-semibold text-white rounded cursor-pointer"
                        style={{ backgroundColor: siteConfig.primaryNavy }}
                      >
                        {confirmedBadgeId === 'vision-save' ? '✓ Saved Vision' : 'Save Vision'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">{siteConfig.ourVision}</p>
                  )}
                </div>
                {renderEditableElement(
                  'card-vision-footer',
                  'Aligned with Oman Vision 2040',
                  'div',
                  'pt-3 border-t border-slate-100 text-xs font-mono-tabular text-slate-400'
                )}
              </div>

              {/* OUR MISSION */}
              <div className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"
                    style={{ color: siteConfig.primaryNavy }}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  {renderEditableElement(
                    'card-mission-kicker',
                    '03 · OPERATIONAL MANDATE',
                    'div',
                    'text-xs font-mono-tabular font-bold tracking-wider',
                    { color: siteConfig.accentOrange }
                  )}
                  {renderEditableElement(
                    'card-mission-heading',
                    'OUR MISSION',
                    'h3',
                    'text-xl font-bold',
                    { color: siteConfig.primaryNavy }
                  )}
                  {isAdminMode ? (
                    <div className="space-y-2">
                      <textarea
                        rows={4}
                        value={siteConfig.ourMission}
                        onChange={(e) => setSiteConfig({ ...siteConfig, ourMission: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => saveSiteConfigToCloud(siteConfig, 'mission-save')}
                        className="px-3 py-1.5 text-xs font-semibold text-white rounded cursor-pointer"
                        style={{ backgroundColor: siteConfig.primaryNavy }}
                      >
                        {confirmedBadgeId === 'mission-save' ? '✓ Saved Mission' : 'Save Mission'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed">{siteConfig.ourMission}</p>
                  )}
                </div>
                {renderEditableElement(
                  'card-mission-footer',
                  'ISO 9001 & HSE Quality Execution',
                  'div',
                  'pt-3 border-t border-slate-100 text-xs font-mono-tabular text-slate-400'
                )}
              </div>
            </div>

            {/* Dedicated CORE VALUES Section (Integrity, Commitment, Excellence, Teamwork) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                <div>
                  {renderEditableElement(
                    'core-values-kicker',
                    'FOUNDATIONAL PILLARS',
                    'div',
                    'text-xs font-mono-tabular font-semibold',
                    { color: siteConfig.accentOrange }
                  )}
                  {renderEditableElement(
                    'core-values-heading',
                    'CORE VALUES',
                    'h3',
                    'text-2xl font-bold',
                    { color: siteConfig.primaryNavy }
                  )}
                </div>
                {isAdminMode ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCoreValues((prev) => [
                        ...prev,
                        {
                          id: `val-${Date.now()}`,
                          code: `VALUE 0${prev.length + 1}`,
                          title: 'Safety First',
                          description: 'Zero-harm HSE discipline across every construction and industrial site.',
                        },
                      ])
                    }
                    className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg flex items-center gap-1 cursor-pointer"
                    style={{ backgroundColor: siteConfig.accentOrange }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Core Value</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-500">
                    {coreValues.map((v) => v.title).join(' · ')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {coreValues.map((valItem) => {
                  const bulletLines = (valItem.description || '')
                    .split('\n')
                    .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
                    .filter(Boolean);

                  return (
                    <div
                      key={valItem.id}
                      className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 flex flex-col justify-between"
                    >
                      {isAdminMode ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={valItem.code}
                              onChange={(e) => {
                                const v = e.target.value;
                                setCoreValues((prev) =>
                                  prev.map((c) => (c.id === valItem.id ? { ...c, code: v } : c))
                                );
                              }}
                              className="w-24 px-2 py-0.5 text-xs font-mono-tabular font-bold bg-white border border-slate-300 rounded"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setCoreValues((prev) => prev.filter((c) => c.id !== valItem.id))
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={valItem.title}
                            onChange={(e) => {
                              const v = e.target.value;
                              setCoreValues((prev) =>
                                prev.map((c) => (c.id === valItem.id ? { ...c, title: v } : c))
                              );
                            }}
                            className="w-full px-2 py-1 text-sm font-bold bg-white border border-slate-300 rounded"
                          />
                          <textarea
                            rows={5}
                            value={valItem.description}
                            onChange={(e) => {
                              const v = e.target.value;
                              setCoreValues((prev) =>
                                prev.map((c) => (c.id === valItem.id ? { ...c, description: v } : c))
                              );
                            }}
                            className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div
                            className="text-xs font-mono-tabular font-bold"
                            style={{ color: siteConfig.accentOrange }}
                          >
                            {valItem.code}
                          </div>
                          <h4 className="text-lg font-bold text-slate-900">{valItem.title}</h4>
                          {bulletLines.length > 1 ? (
                            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed list-disc pl-4">
                              {bulletLines.map((point, idx) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                              {valItem.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {renderSectionCustomBlocks('about')}
          </div>
        </section>

        {/* SECTION 8: CLIENT INQUIRY & CONTACT FORM */}
        <section id="contact" className="py-16 px-6 bg-white">
          <div className="max-w-[1360px] mx-auto space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left 5 Columns: Direct Tendering & Contact Details */}
              <div className="lg:col-span-5 space-y-6 bg-slate-50 border border-slate-200 rounded-2xl p-8">
                <div className="space-y-2">
                  {renderEditableElement(
                    'sec-contact-kicker',
                    'TENDERING & WORKFORCE MOBILIZATION DESK',
                    'div',
                    'text-xs font-mono-tabular font-semibold',
                    { color: siteConfig.accentOrange }
                  )}
                  {renderEditableElement(
                    'sec-contact-heading',
                    'Client Inquiry & Project Quotation',
                    'h2',
                    'text-2xl sm:text-3xl font-bold',
                    { color: siteConfig.primaryNavy }
                  )}
                  {renderEditableElement(
                    'sec-contact-subtext',
                    'Submit your Bill of Quantities (BOQ) scope or skilled/unskilled manpower schedule. Our estimating engineers respond within 24 business hours.',
                    'p',
                    'text-sm text-slate-600 leading-relaxed'
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 shrink-0 mt-0.5" style={{ color: siteConfig.accentOrange }} />
                    <div className="space-y-1">
                      {renderEditableElement('contact-label-address', 'Head Office Address', 'div', 'font-bold text-slate-900')}
                      <div
                        contentEditable={isAdminMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          if (!isAdminMode) return;
                          const val = e.currentTarget.innerText.trim();
                          if (val && val !== siteConfig.officeAddress) {
                            saveSiteConfigToCloud({ ...siteConfig, officeAddress: val }, 'contact-address-save');
                          }
                        }}
                        className={`text-slate-600 ${
                          isAdminMode ? 'outline-1 outline-dashed outline-[#f97316] bg-white rounded px-1.5 py-0.5 cursor-text' : ''
                        }`}
                      >
                        {siteConfig.officeAddress}
                      </div>
                      <a
                        href={activeGoogleMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (isAdminMode) e.preventDefault();
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1e3a8a] hover:text-[#f97316] underline"
                      >
                        {renderEditableElement('contact-map-link-label', 'Open Company Google Maps Link', 'span')}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 shrink-0 mt-0.5" style={{ color: siteConfig.primaryNavy }} />
                    <div>
                      {renderEditableElement('contact-label-phone', 'Direct Telephone & Tendering', 'div', 'font-bold text-slate-900')}
                      <div
                        contentEditable={isAdminMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          if (!isAdminMode) return;
                          const val = e.currentTarget.innerText.trim();
                          if (val && val !== siteConfig.officePhone) {
                            saveSiteConfigToCloud({ ...siteConfig, officePhone: val }, 'contact-phone-save');
                          }
                        }}
                        className={`text-slate-600 font-mono-tabular ${
                          isAdminMode ? 'outline-1 outline-dashed outline-[#f97316] bg-white rounded px-1.5 py-0.5 cursor-text' : ''
                        }`}
                      >
                        {siteConfig.officePhone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 shrink-0 mt-0.5" style={{ color: siteConfig.accentOrange }} />
                    <div>
                      {renderEditableElement('contact-label-email', 'Corporate Email', 'div', 'font-bold text-slate-900')}
                      <div
                        contentEditable={isAdminMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          if (!isAdminMode) return;
                          const val = e.currentTarget.innerText.trim();
                          if (val && val !== siteConfig.officeEmail) {
                            saveSiteConfigToCloud({ ...siteConfig, officeEmail: val }, 'contact-email-save');
                          }
                        }}
                        className={`text-slate-600 font-mono-tabular ${
                          isAdminMode ? 'outline-1 outline-dashed outline-[#f97316] bg-white rounded px-1.5 py-0.5 cursor-text' : ''
                        }`}
                      >
                        {siteConfig.officeEmail}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
                  {renderEditableElement(
                    'contact-guarantee-heading',
                    'Rapid Manpower Mobilization Guarantee',
                    'div',
                    'font-bold text-slate-900'
                  )}
                  {renderEditableElement(
                    'contact-guarantee-body',
                    'Trade-tested masons, shuttering carpenters, steel fixers, 6G welders, electricians, plumbers, and HSE supervisors ready for deployment to Muscat, Duqm, Sohar, Ibri, and regional sites.',
                    'p'
                  )}
                </div>
              </div>

              {/* Right 7 Columns: Validated Client Inquiry Form (Submits to Backend Database; No Public Inquiry Status Shown on Website) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-8 shadow-2xs">
                <form onSubmit={handleClientInquirySubmit} className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {renderEditableElement(
                      'inquiry-form-heading',
                      'Request Manpower Supply or EPC Project Quote',
                      'h3',
                      'text-xl font-bold text-slate-900'
                    )}
                    {isAdminMode && (
                      <button
                        type="button"
                        onClick={() => setShowBackendConfigModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-orange-50 text-[#f97316] border border-orange-200 rounded-lg hover:bg-orange-100 cursor-pointer"
                      >
                        <Database className="w-3.5 h-3.5" />
                        <span>Manage Inquiries & Status in Backend ({allInquiries.length})</span>
                      </button>
                    )}
                  </div>

                  {inquiryError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-700">
                      {inquiryError}
                    </div>
                  )}

                  {inquirySubmittedSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
                      {inquirySubmittedSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block text-xs font-semibold text-slate-700">
                      {renderEditableElement('form-label-name', 'Your Full Name *', 'span')}
                      <input
                        type="text"
                        required
                        placeholder="e.g., Eng. Nasser Al Habsi"
                        value={inquiryForm.clientName}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, clientName: e.target.value })}
                        className="mt-1 w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:border-[#1e3a8a] focus:outline-none"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-slate-700">
                      {renderEditableElement('form-label-company', 'Company / Organization *', 'span')}
                      <input
                        type="text"
                        required
                        placeholder="e.g., Oman Infrastructure EPC LLC"
                        value={inquiryForm.companyName}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, companyName: e.target.value })}
                        className="mt-1 w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:border-[#1e3a8a] focus:outline-none"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block text-xs font-semibold text-slate-700">
                      {renderEditableElement('form-label-email', 'Official Email Address *', 'span')}
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                        className="mt-1 w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:border-[#1e3a8a] focus:outline-none"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-slate-700">
                      {renderEditableElement('form-label-phone', 'Telephone / Mobile Number *', 'span')}
                      <input
                        type="tel"
                        required
                        placeholder="+968 9XXX XXXX"
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        className="mt-1 w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:border-[#1e3a8a] focus:outline-none font-mono-tabular"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block text-xs font-semibold text-slate-700">
                      {renderEditableElement('form-label-service', 'Required Service / Work Type *', 'span')}
                      <select
                        value={inquiryForm.inquiryType}
                        onChange={(e) =>
                          setInquiryForm({
                            ...inquiryForm,
                            inquiryType: e.target.value as ClientInquiryItem['inquiryType'],
                          })
                        }
                        className="mt-1 w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:border-[#1e3a8a] focus:outline-none bg-white"
                      >
                        <option value="Skilled & Unskilled Manpower Supply">
                          Skilled & Unskilled Manpower Supply
                        </option>
                        <option value="Civil & Structural Works">Civil & Structural Works</option>
                        <option value="Earth Works & Excavation">Earth Works & Excavation</option>
                        <option value="Mechanical & Electrical Works">Mechanical & Electrical Works</option>
                        <option value="Pipeline & Special Structures">Pipeline & Special Structures</option>
                        <option value="Turnkey EPC Tender Inquiry">Turnkey EPC Tender Inquiry</option>
                      </select>
                    </label>
                    <label className="block text-xs font-semibold text-slate-700">
                      {renderEditableElement('form-label-location', 'Project Site Location *', 'span')}
                      <input
                        type="text"
                        required
                        placeholder="e.g., Duqm / Sohar / Muscat / Ibri"
                        value={inquiryForm.projectLocation}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, projectLocation: e.target.value })}
                        className="mt-1 w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:border-[#1e3a8a] focus:outline-none"
                      />
                    </label>
                  </div>

                  <label className="block text-xs font-semibold text-slate-700">
                    {renderEditableElement(
                      'form-label-manpower',
                      'Manpower Trades / Headcount or Equipment Breakdown (Optional)',
                      'span'
                    )}
                    <input
                      type="text"
                      placeholder="e.g., 25 Shutter Carpenters, 20 Steel Fixers, 10 6G Welders, 2 Civil Engineers for 6 Months"
                      value={inquiryForm.manpowerDetails}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, manpowerDetails: e.target.value })}
                      className="mt-1 w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:border-[#1e3a8a] focus:outline-none"
                    />
                  </label>

                  <label className="block text-xs font-semibold text-slate-700">
                    {renderEditableElement(
                      'form-label-message',
                      'Detailed Scope of Work / Inquiry Message *',
                      'span'
                    )}
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe your project schedule, technical specifications, or manpower mobilization dates..."
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      className="mt-1 w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:border-[#1e3a8a] focus:outline-none"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="w-full sm:w-auto px-7 py-3 text-sm font-semibold text-white rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: siteConfig.primaryNavy }}
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {inquirySubmitting
                        ? 'Submitting Inquiry...'
                        : renderEditableElement('form-submit-btn-text', 'Submit Official Inquiry', 'span')}
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {renderSectionCustomBlocks('contact')}
          </div>
        </section>
      </main>

      {/* SECTION 9: COMPLETE CORPORATE FOOTER (Light Corporate Surface — No Black Backgrounds) */}
      <footer className="bg-slate-100 border-t border-slate-200 text-slate-700 py-12 px-6">
        <div className="max-w-[1360px] mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => {
                    if (isAdminMode) {
                      openPhotoEditor(
                        'Official Company Logo',
                        siteConfig.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI,
                        (newLogoUrl) => {
                          saveSiteConfigToCloud({ ...siteConfig, companyLogoUrl: newLogoUrl }, 'footer-logo-save');
                        }
                      );
                    }
                  }}
                  title={isAdminMode ? 'Click to upload or replace Company Logo' : `${siteConfig.companyName} — Official Logo`}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-slate-200/90 flex items-center justify-center overflow-hidden shrink-0 shadow-sm ${
                    isAdminMode ? 'cursor-pointer ring-2 ring-[#f97316]' : ''
                  }`}
                >
                  <img
                    src={siteConfig.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI}
                    alt={`${siteConfig.companyName} Logo`}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.dataset.fallbackApplied === 'true') return;
                      target.dataset.fallbackApplied = 'true';
                      target.src = DEFAULT_COMPANY_LOGO_URI;
                    }}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="flex flex-col">
                  <div
                    contentEditable={isAdminMode}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (!isAdminMode) return;
                      const val = e.currentTarget.innerText.trim();
                      if (val && val !== siteConfig.companyName) {
                        saveSiteConfigToCloud({ ...siteConfig, companyName: val }, 'footer-name-save');
                      }
                    }}
                    className={`text-xl sm:text-2xl font-black tracking-tight leading-tight ${
                      isAdminMode ? 'outline-1 outline-dashed outline-[#f97316] bg-white rounded px-1.5 cursor-text' : ''
                    }`}
                    style={{ color: siteConfig.primaryNavy }}
                  >
                    {siteConfig.companyName}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">
                    السحاب الرشيد للتجارة والمقاولات ش.م.م
                  </div>
                </div>
              </div>
              {renderEditableElement(
                'footer-description',
                `${siteConfig.tagline}. Providing civil engineering, box culverts, heavy earthworks, MEP contracting, pipeline structures, and certified manpower across the Sultanate of Oman.`,
                'p',
                'text-xs text-slate-600 max-w-md leading-relaxed'
              )}
              {renderEditableElement(
                'footer-portal-line',
                'Official Web Portal: wwwasar.com · Muscat, Sultanate of Oman',
                'div',
                'text-xs font-mono-tabular text-slate-500'
              )}
            </div>

            <div className="space-y-2 text-xs">
              {renderEditableElement(
                'footer-nav-heading',
                'Quick Navigation',
                'div',
                'font-bold text-slate-900 uppercase tracking-wider'
              )}
              <ul className="space-y-1.5 text-slate-600">
                {TABBAR_ITEMS.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isAdminMode) scrollToSection(item.id);
                      }}
                      className="hover:text-[#1e3a8a] hover:underline"
                    >
                      {renderEditableElement(`footer-nav-link-${item.id}`, item.label, 'span')}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              {renderEditableElement(
                'footer-connect-heading',
                'Corporate Connect',
                'div',
                'font-bold text-slate-900 uppercase tracking-wider'
              )}
              <p
                contentEditable={isAdminMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (!isAdminMode) return;
                  const val = e.currentTarget.innerText.trim();
                  if (val && val !== siteConfig.officeAddress) {
                    saveSiteConfigToCloud({ ...siteConfig, officeAddress: val }, 'footer-addr-save');
                  }
                }}
                className={`text-slate-600 ${
                  isAdminMode ? 'outline-1 outline-dashed outline-[#f97316] bg-white rounded px-1 cursor-text' : ''
                }`}
              >
                {siteConfig.officeAddress}
              </p>
              <p
                contentEditable={isAdminMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (!isAdminMode) return;
                  const val = e.currentTarget.innerText.trim();
                  if (val && val !== siteConfig.officePhone) {
                    saveSiteConfigToCloud({ ...siteConfig, officePhone: val }, 'footer-phone-save');
                  }
                }}
                className={`font-mono-tabular text-slate-700 ${
                  isAdminMode ? 'outline-1 outline-dashed outline-[#f97316] bg-white rounded px-1 cursor-text' : ''
                }`}
              >
                {siteConfig.officePhone}
              </p>
              <p
                contentEditable={isAdminMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (!isAdminMode) return;
                  const val = e.currentTarget.innerText.trim();
                  if (val && val !== siteConfig.officeEmail) {
                    saveSiteConfigToCloud({ ...siteConfig, officeEmail: val }, 'footer-email-save');
                  }
                }}
                className={`font-mono-tabular ${
                  isAdminMode ? 'outline-1 outline-dashed outline-[#f97316] bg-white rounded px-1 cursor-text' : ''
                }`}
                style={{ color: siteConfig.primaryNavy }}
              >
                {siteConfig.officeEmail}
              </p>
              <div
                className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold"
                style={{ color: siteConfig.primaryNavy }}
              >
                <a
                  href={activeGoogleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (isAdminMode) e.preventDefault();
                  }}
                  className="text-[#f97316] hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {renderEditableElement('footer-map-label', 'Google Maps Location', 'span')}
                </a>
                <span>·</span>
                <a
                  href="https://wwwasar.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (isAdminMode) e.preventDefault();
                  }}
                  className="hover:underline"
                >
                  {renderEditableElement('footer-domain-label', 'wwwasar.com', 'span')}
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            {renderEditableElement(
              'footer-copyright',
              `© ${new Date().getFullYear()} ${siteConfig.companyName}. All Rights Reserved.`,
              'div'
            )}

            {/* Developer Details in Website Bottom (Small & Discreet) */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <span className="text-slate-400 font-medium">Developed by:</span>
              <button
                type="button"
                onClick={() => setShowDeveloperModal(true)}
                className="font-bold text-[#1e3a8a] hover:text-[#f97316] hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                title="Click to view Developer Profile"
              >
                <span>Eng Abdullah Al Osman Shakil</span>
                <span className="text-slate-300">·</span>
                <span className="font-semibold text-slate-600">Electrical Engineer</span>
              </button>
              <span className="text-slate-300">·</span>
              <a
                href="mailto:abdullahalshakil7@gmail.com"
                className="font-mono-tabular text-slate-500 hover:text-[#f97316] hover:underline"
                title="Send email to Developer"
              >
                abdullahalshakil7@gmail.com
              </a>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => {
                  setActiveDeployTab('netlify');
                  setShowBluehostModal(true);
                }}
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer font-medium"
                title="Publish on Netlify (Fast 30-sec Drag & Drop)"
              >
                <Cloud className="w-3 h-3 text-emerald-600" />
                <span>Netlify Publish</span>
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => {
                  setActiveDeployTab('domain');
                  setShowBluehostModal(true);
                }}
                className="inline-flex items-center gap-1 text-[#1e3a8a] hover:text-blue-900 hover:underline cursor-pointer font-medium"
                title="Connect Custom Domain through Netlify DNS"
              >
                <Globe className="w-3 h-3 text-[#1e3a8a]" />
                <span>Connect Domain</span>
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => {
                  setActiveDeployTab('bluehost');
                  setShowBluehostModal(true);
                }}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 hover:underline cursor-pointer font-medium"
                title="Open Bluehost cPanel Guide"
              >
                <Server className="w-3 h-3 text-slate-500" />
                <span>Bluehost cPanel</span>
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => {
                  if (!isAdminAuthenticated) {
                    setAdminAuthError(null);
                    setAdminInputPassword('');
                    setShowAdminLoginModal(true);
                  } else {
                    const next = !isAdminMode;
                    setIsAdminMode(next);
                    showNotification('info', next ? 'Admin Edit Mode activated!' : 'Admin Edit Mode closed.');
                  }
                }}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-[#1e3a8a] hover:underline cursor-pointer font-medium"
                title="Admin Portal Login (Password Protected)"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>{isAdminAuthenticated ? (isAdminMode ? 'Admin (Active)' : 'Admin (Standby)') : 'Admin Access'}</span>
              </button>
            </div>

            {renderEditableElement(
              'footer-iso-badge',
              'Sultanate of Oman · ISO 9001 & HSE Compliant EPC Contractor',
              'div'
            )}
          </div>
        </div>
      </footer>

      {/* COMPACT, USER-FRIENDLY, FREELY DRAGGABLE MULTI-TAB ADMIN EDIT STUDIO BAR */}
      {isAdminAuthenticated && isAdminMode && (() => {
        const currentFontSpec = parseFontStyleSpec(selectedOverride?.fontSize);
        const updateSelectedStyle = (partialSpec: Partial<ReturnType<typeof parseFontStyleSpec>>, extra?: Partial<TextOverrideItem>) => {
          if (!selectedElementId) return;
          const nextSpec = buildFontStyleSpec({
            ...currentFontSpec,
            ...partialSpec,
          });
          void saveTextOverride({
            elementId: selectedElementId,
            textValue: selectedOverride !== undefined ? selectedOverride.textValue : selectedElementDefaultText,
            textColor: extra?.textColor !== undefined ? extra.textColor : selectedOverride?.textColor || '',
            fontSize: nextSpec,
            bgColor: extra?.bgColor !== undefined ? extra.bgColor : selectedOverride?.bgColor || '',
            hidden: extra?.hidden !== undefined ? extra.hidden : Boolean(selectedOverride?.hidden),
            authorId: currentUser?.uid || 'local_admin',
          });
        };

        const stepSelectedFontSize = (deltaPx: number) => {
          if (!selectedElementId) return;
          const numericCurrent = parseInt(currentFontSpec.size || '16', 10) || 16;
          const nextNumeric = Math.max(10, Math.min(64, numericCurrent + deltaPx));
          updateSelectedStyle({ size: `${nextNumeric}px` });
        };

        return (
          <div
            ref={adminBarRef}
            style={
              adminBarPos
                ? { left: `${adminBarPos.x}px`, top: `${adminBarPos.y}px` }
                : { right: '16px', bottom: '16px' }
            }
            className={`fixed z-50 bg-white/98 backdrop-blur-md border-2 border-[#f97316] rounded-2xl shadow-2xl transition-shadow select-none ${
              isAdminBarMinimized ? 'w-auto max-w-xs' : 'w-[350px] sm:w-[410px]'
            }`}
          >
            {/* DRAGGABLE TOP HANDLE BAR (Drag Anywhere on Screen) */}
            <div
              onMouseDown={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                startAdminBarDrag(e.clientX, e.clientY);
              }}
              onTouchStart={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                if (e.touches[0]) {
                  startAdminBarDrag(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              className="flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-[#1e3a8a] to-[#0f172a] text-white rounded-t-xl cursor-move"
              title="Drag this bar to move the Admin Edit Studio anywhere on screen"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Move className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
                <span className="text-xs font-bold tracking-tight truncate">Admin Edit Studio</span>
                {selectedElementId && !isAdminBarMinimized && (
                  <span className="text-[10px] font-mono-tabular bg-orange-500/25 text-orange-200 px-1.5 py-0.5 rounded truncate max-w-[110px]">
                    {selectedElementId}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={syncAllCollectionsToCloud}
                  className="px-2 py-0.5 text-[10px] font-bold bg-[#f97316] hover:bg-orange-600 text-white rounded flex items-center gap-1 cursor-pointer"
                  title="Save & Confirm All Website Edits to Cloud"
                >
                  <Check className="w-3 h-3" />
                  <span>Save</span>
                </button>
                {adminBarPos && (
                  <button
                    type="button"
                    onClick={() => setAdminBarPos(null)}
                    className="px-1.5 py-0.5 text-[10px] font-semibold bg-white/15 hover:bg-white/25 text-white rounded cursor-pointer"
                    title="Reset position to bottom-right corner"
                  >
                    Dock
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsAdminBarMinimized((prev) => !prev)}
                  className="p-1 text-slate-200 hover:text-white hover:bg-white/15 rounded cursor-pointer"
                  title={isAdminBarMinimized ? 'Expand Admin Edit Studio' : 'Minimize to compact bar'}
                >
                  {isAdminBarMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="p-1 text-red-300 hover:text-white hover:bg-red-600/80 rounded cursor-pointer"
                  title="Lock & Exit Admin Mode"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* EXPANDED BODY: 5 COMPACT TABS WITH ALL EDITING TOOLS */}
            {!isAdminBarMinimized && (
              <div className="p-3 space-y-2.5 text-xs">
                {/* 5-Tab Switcher */}
                <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  {(
                    [
                      { id: 'text', label: 'Text', icon: Type },
                      { id: 'photo', label: 'Photos', icon: Camera },
                      { id: 'add', label: '+ Add', icon: Plus },
                      { id: 'brand', label: 'Brand', icon: Palette },
                      { id: 'backend', label: 'Data', icon: Database },
                    ] as const
                  ).map((t) => {
                    const IconComp = t.icon;
                    const active = activeAdminEditTab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveAdminEditTab(t.id)}
                        className={`py-1.5 px-1 rounded-md font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          active
                            ? 'bg-[#1e3a8a] text-white shadow-2xs'
                            : 'text-slate-600 hover:bg-white hover:text-[#1e3a8a]'
                        }`}
                      >
                        <IconComp className="w-3 h-3 shrink-0" />
                        <span className="truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: TEXT & TYPOGRAPHY STYLING */}
                {activeAdminEditTab === 'text' && (
                  <div className="space-y-2.5">
                    {selectedElementId ? (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-700 truncate">
                            Element: <span className="text-[#f97316] font-mono-tabular">{selectedElementId}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedElementId(null)}
                            className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            Deselect ✕
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          value={
                            selectedOverride !== undefined
                              ? selectedOverride.textValue
                              : selectedElementDefaultText
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            void saveTextOverride({
                              elementId: selectedElementId,
                              textValue: val,
                              textColor: selectedOverride?.textColor || '',
                              fontSize: selectedOverride?.fontSize || '',
                              bgColor: selectedOverride?.bgColor || '',
                              hidden: Boolean(selectedOverride?.hidden),
                              authorId: currentUser?.uid || 'local_admin',
                            });
                          }}
                          placeholder="Type text content..."
                          className="w-full px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg focus:border-[#1e3a8a] focus:outline-none resize-y"
                        />

                        {/* Row 1: Font Size + Step Buttons + Style Toggles (B, I, U, AA, Align) */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => stepSelectedFontSize(-2)}
                              className="px-1.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold hover:bg-slate-100 cursor-pointer"
                              title="Decrease Font Size"
                            >
                              A-
                            </button>
                            <select
                              value={currentFontSpec.size}
                              onChange={(e) => updateSelectedStyle({ size: e.target.value })}
                              className="px-1.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-semibold cursor-pointer"
                            >
                              <option value="">Size: Auto</option>
                              <option value="11px">11px</option>
                              <option value="12px">12px</option>
                              <option value="14px">14px</option>
                              <option value="16px">16px</option>
                              <option value="18px">18px</option>
                              <option value="20px">20px</option>
                              <option value="24px">24px</option>
                              <option value="28px">28px</option>
                              <option value="32px">32px</option>
                              <option value="40px">40px</option>
                              <option value="48px">48px</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => stepSelectedFontSize(2)}
                              className="px-1.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold hover:bg-slate-100 cursor-pointer"
                              title="Increase Font Size"
                            >
                              A+
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateSelectedStyle({ bold: !currentFontSpec.bold })}
                              className={`p-1 rounded border cursor-pointer ${
                                currentFontSpec.bold
                                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                                  : 'bg-white text-slate-700 border-slate-300'
                              }`}
                              title="Bold"
                            >
                              <Bold className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSelectedStyle({ italic: !currentFontSpec.italic })}
                              className={`p-1 rounded border cursor-pointer ${
                                currentFontSpec.italic
                                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                                  : 'bg-white text-slate-700 border-slate-300'
                              }`}
                              title="Italic"
                            >
                              <Italic className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSelectedStyle({ underline: !currentFontSpec.underline })}
                              className={`p-1 rounded border cursor-pointer ${
                                currentFontSpec.underline
                                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                                  : 'bg-white text-slate-700 border-slate-300'
                              }`}
                              title="Underline"
                            >
                              <Underline className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSelectedStyle({ uppercase: !currentFontSpec.uppercase })}
                              className={`px-1.5 py-0.5 rounded border text-[10px] font-bold cursor-pointer ${
                                currentFontSpec.uppercase
                                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                                  : 'bg-white text-slate-700 border-slate-300'
                              }`}
                              title="UPPERCASE"
                            >
                              AA
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateSelectedStyle({
                                  align: currentFontSpec.align === 'left' ? '' : 'left',
                                })
                              }
                              className={`p-1 rounded border cursor-pointer ${
                                currentFontSpec.align === 'left'
                                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                                  : 'bg-white text-slate-700 border-slate-300'
                              }`}
                              title="Align Left"
                            >
                              <AlignLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateSelectedStyle({
                                  align: currentFontSpec.align === 'center' ? '' : 'center',
                                })
                              }
                              className={`p-1 rounded border cursor-pointer ${
                                currentFontSpec.align === 'center'
                                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                                  : 'bg-white text-slate-700 border-slate-300'
                              }`}
                              title="Align Center"
                            >
                              <AlignCenter className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateSelectedStyle({
                                  align: currentFontSpec.align === 'right' ? '' : 'right',
                                })
                              }
                              className={`p-1 rounded border cursor-pointer ${
                                currentFontSpec.align === 'right'
                                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                                  : 'bg-white text-slate-700 border-slate-300'
                              }`}
                              title="Align Right"
                            >
                              <AlignRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Row 2: Text Color & Background Highlight Swatches */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                              <span>Text Color</span>
                              <button
                                type="button"
                                onClick={() => updateSelectedStyle({}, { textColor: '' })}
                                className="text-[#1e3a8a] hover:underline cursor-pointer"
                              >
                                Reset
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <input
                                type="color"
                                value={selectedOverride?.textColor || siteConfig.primaryNavy}
                                onChange={(e) => updateSelectedStyle({}, { textColor: e.target.value })}
                                className="w-5 h-5 rounded cursor-pointer border-0 shrink-0"
                              />
                              {['#1e3a8a', '#f97316', '#0f172a', '#059669', '#dc2626', '#ffffff'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => updateSelectedStyle({}, { textColor: c })}
                                  style={{ backgroundColor: c }}
                                  className="w-4 h-4 rounded-full border border-slate-300 cursor-pointer shrink-0"
                                  title={`Text color ${c}`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                              <span>Highlight BG</span>
                              <button
                                type="button"
                                onClick={() => updateSelectedStyle({}, { bgColor: '' })}
                                className="text-[#1e3a8a] hover:underline cursor-pointer"
                              >
                                Clear
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <input
                                type="color"
                                value={selectedOverride?.bgColor || '#fff7ed'}
                                onChange={(e) => updateSelectedStyle({}, { bgColor: e.target.value })}
                                className="w-5 h-5 rounded cursor-pointer border-0 shrink-0"
                              />
                              {['#fff7ed', '#eff6ff', '#ecfdf5', '#fef2f2', '#fefce8', '#0f172a'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => updateSelectedStyle({}, { bgColor: c })}
                                  style={{ backgroundColor: c }}
                                  className="w-4 h-4 rounded-full border border-slate-300 cursor-pointer shrink-0"
                                  title={`Highlight ${c}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Row 3: Hide, Reset Element, Confirm */}
                        <div className="flex items-center justify-between gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => updateSelectedStyle({}, { hidden: !selectedOverride?.hidden })}
                            className="px-2 py-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 flex items-center gap-1 cursor-pointer"
                          >
                            {selectedOverride?.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{selectedOverride?.hidden ? 'Unhide' : 'Hide'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              void saveTextOverride({
                                elementId: selectedElementId,
                                textValue: selectedElementDefaultText,
                                textColor: '',
                                fontSize: '',
                                bgColor: '',
                                hidden: false,
                                authorId: currentUser?.uid || 'local_admin',
                              });
                              showNotification('info', 'Reset element to original default text & style.');
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-md hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset Element</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              showNotification('success', '✓ Text & style saved!', selectedElementId);
                              setSelectedElementId(null);
                            }}
                            className="px-3 py-1 text-[11px] font-bold text-white bg-[#1e3a8a] hover:bg-blue-900 rounded-md flex items-center gap-1 cursor-pointer ml-auto"
                          >
                            <Check className="w-3 h-3" />
                            <span>Done</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2 text-slate-700">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-[#f97316]" />
                          <span>Click Any Text or Heading on Page to Edit</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-600">
                          Click any dashed-outlined heading, paragraph, or button label on the website to type directly or change its font size, bold/italic, alignment, text color, or highlight.
                        </p>
                        {hiddenElementsCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setTextOverrides((prev) => {
                                const next = { ...prev };
                                Object.keys(next).forEach((k) => {
                                  next[k] = { ...next[k], hidden: false };
                                });
                                return next;
                              });
                              showNotification('info', 'Restored all hidden elements.');
                            }}
                            className="w-full py-1.5 px-2.5 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-lg cursor-pointer"
                          >
                            Restore {hiddenElementsCount} Hidden Element(s)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: PHOTOS & LOGO */}
                {activeAdminEditTab === 'photo' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      💡 <strong>Tip:</strong> Click directly on <strong>any photo</strong> on the website to replace it, or use the quick shortcuts below:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          openPhotoEditor(
                            'Official Company Logo (Header, Hero & Footer)',
                            siteConfig.companyLogoUrl || DEFAULT_COMPANY_LOGO_URI,
                            (newLogoUrl) => {
                              saveSiteConfigToCloud({ ...siteConfig, companyLogoUrl: newLogoUrl }, 'logo-save');
                            }
                          )
                        }
                        className="p-2 text-[11px] font-bold bg-orange-50 text-slate-900 border border-orange-200 rounded-lg hover:bg-orange-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
                        <span>Change Logo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          scrollToSection('gallery');
                          setShowAddGalleryForm(true);
                        }}
                        className="p-2 text-[11px] font-bold bg-blue-50 text-[#1e3a8a] border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#1e3a8a] shrink-0" />
                        <span>+ Gallery Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddCustomBlock(activeTabId === 'developer' ? 'home' : activeTabId, true)}
                        className="p-2 text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
                        <span>+ Photo Card Here</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleForceSyncOfficialPhotos}
                        className="p-2 text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Sync 29 Photos</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: ADD ITEMS & SECTION JUMP */}
                {activeAdminEditTab === 'add' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <Layers className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
                      <span className="text-[11px] font-bold text-slate-700 shrink-0">Section:</span>
                      <select
                        value={targetCustomBlockSection}
                        onChange={(e) => setTargetCustomBlockSection(e.target.value)}
                        className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-semibold cursor-pointer"
                      >
                        <option value="home">Hero & Map (Top)</option>
                        <option value="services">Core Services</option>
                        <option value="running-projects">Running Projects</option>
                        <option value="manpower">Manpower Supply</option>
                        <option value="gallery">Photo Gallery</option>
                        <option value="portfolio">Completed Portfolio</option>
                        <option value="about">About, Aim & Vision</option>
                        <option value="contact">Contact & Inquiry</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          scrollToSection(targetCustomBlockSection);
                          void handleAddCustomBlock(targetCustomBlockSection, false);
                        }}
                        className="p-2 text-[11px] font-bold bg-white text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#1e3a8a] shrink-0" />
                        <span>+ Text Block</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          scrollToSection(targetCustomBlockSection);
                          void handleAddCustomBlock(targetCustomBlockSection, true);
                        }}
                        className="p-2 text-[11px] font-bold bg-orange-50 text-slate-900 border border-orange-200 rounded-lg hover:bg-orange-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
                        <span>+ Photo Block</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          scrollToSection('services');
                          setShowAddServiceForm(true);
                        }}
                        className="p-2 text-[11px] font-bold bg-white text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
                        <span>+ Core Service</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          scrollToSection('running-projects');
                          setShowAddRunningForm(true);
                        }}
                        className="p-2 text-[11px] font-bold bg-white text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#1e3a8a] shrink-0" />
                        <span>+ Running Site</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          scrollToSection('portfolio');
                          setShowAddCompletedForm(true);
                        }}
                        className="p-2 text-[11px] font-bold bg-white text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>+ Completed Proj</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          scrollToSection('gallery');
                          setShowAddGalleryForm(true);
                        }}
                        className="p-2 text-[11px] font-bold bg-white text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
                        <span>+ Gallery Photo</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: BRAND, COMPANY INFO & THEME COLORS */}
                {activeAdminEditTab === 'brand' && (
                  <div className="space-y-2">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-600">
                        Company Name
                        <input
                          type="text"
                          value={siteConfig.companyName}
                          onChange={(e) => setSiteConfig({ ...siteConfig, companyName: e.target.value })}
                          className="mt-0.5 w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <label className="block text-[10px] font-bold text-slate-600">
                          Office Phone
                          <input
                            type="text"
                            value={siteConfig.officePhone}
                            onChange={(e) => setSiteConfig({ ...siteConfig, officePhone: e.target.value })}
                            className="mt-0.5 w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded font-mono-tabular"
                          />
                        </label>
                        <label className="block text-[10px] font-bold text-slate-600">
                          Official & Form Email
                          <input
                            type="email"
                            value={siteConfig.officeEmail}
                            onChange={(e) => setSiteConfig({ ...siteConfig, officeEmail: e.target.value })}
                            className="mt-0.5 w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded font-mono-tabular"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 cursor-pointer">
                        <span>Navy</span>
                        <input
                          type="color"
                          value={siteConfig.primaryNavy}
                          onChange={(e) => setSiteConfig({ ...siteConfig, primaryNavy: e.target.value })}
                          className="w-5 h-5 rounded cursor-pointer border-0"
                        />
                      </label>
                      <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 cursor-pointer">
                        <span>Orange</span>
                        <input
                          type="color"
                          value={siteConfig.accentOrange}
                          onChange={(e) => setSiteConfig({ ...siteConfig, accentOrange: e.target.value })}
                          className="w-5 h-5 rounded cursor-pointer border-0"
                        />
                      </label>
                      <select
                        value={siteConfig.headingScale}
                        onChange={(e) =>
                          setSiteConfig({
                            ...siteConfig,
                            headingScale: e.target.value as SiteConfigData['headingScale'],
                          })
                        }
                        className="px-1.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-semibold cursor-pointer"
                      >
                        <option value="compact">Compact</option>
                        <option value="standard">Standard</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => saveSiteConfigToCloud(siteConfig, 'brand-tab-save')}
                      className="w-full py-1.5 px-3 text-xs font-bold text-white bg-[#1e3a8a] hover:bg-blue-900 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Brand & Theme to Cloud</span>
                    </button>
                  </div>
                )}

                {/* TAB 5: BACKEND, INQUIRIES, EXCEL EXPORT, GITHUB & SECURITY */}
                {activeAdminEditTab === 'backend' && (
                  <div className="space-y-2 text-xs">
                    {/* Primary Save Action */}
                    <button
                      type="button"
                      disabled={isSyncingToGithub}
                      onClick={async () => {
                        await syncAllCollectionsToCloud();
                        await pushCmsUpdateToGitHub('Manual Admin Portal Sync from Tab 5', true);
                      }}
                      className="w-full py-2 px-3 text-xs font-bold text-white bg-gradient-to-r from-[#1e3a8a] to-blue-700 hover:from-blue-900 hover:to-blue-800 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#f97316] ${isSyncingToGithub ? 'animate-spin' : ''}`} />
                      <span>{isSyncingToGithub ? 'Syncing to Cloud & GitHub...' : 'Save & Confirm All Edits (Cloud + GitHub)'}</span>
                    </button>

                    {/* Quick Gmail Inquiry Dispatch Card */}
                    <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>Client Inquiries to Gmail</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                          Active
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-800 leading-tight">
                        Client inquiries forward to <strong>saadsaid.asar@gmail.com</strong> &amp; <strong>alshakilfreelancer@gmail.com</strong>.
                      </p>
                      <button
                        type="button"
                        disabled={isSendingTestEmail}
                        onClick={handleSendTestInquiryEmail}
                        className="w-full py-1.5 px-2 text-[11px] font-bold bg-white text-emerald-900 border border-emerald-300 rounded-md hover:bg-emerald-100 flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-60"
                      >
                        <Send className={`w-3 h-3 text-emerald-700 ${isSendingTestEmail ? 'animate-spin' : ''}`} />
                        <span>{isSendingTestEmail ? 'Sending Test to Gmail...' : 'Send Test Inquiry to My Gmail'}</span>
                      </button>
                    </div>

                    {/* GitHub Auto-Commit Card */}
                    <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-[#1e3a8a] flex items-center gap-1.5 text-[11px]">
                          <Code2 className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
                          <span>GitHub Auto-Commit</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowGithubSettingsInBar((prev) => !prev)}
                          className="text-[10px] font-bold text-[#1e3a8a] hover:underline cursor-pointer"
                        >
                          {showGithubSettingsInBar ? 'Hide Config' : githubRepo ? 'Edit Config' : 'Configure'}
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-600 flex items-center justify-between gap-1">
                        <span className="truncate">
                          {githubRepo ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                              {githubRepo} ({githubBranch || 'main'})
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                              Not linked yet
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          disabled={isSyncingToGithub}
                          onClick={() => pushCmsUpdateToGitHub('Manual GitHub commit from Admin Studio', true)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-[#f97316] text-white rounded hover:bg-orange-600 cursor-pointer disabled:opacity-60 shrink-0"
                        >
                          {isSyncingToGithub ? 'Pushing...' : 'Push to GitHub'}
                        </button>
                      </div>

                      {showGithubSettingsInBar && (
                        <div className="space-y-1.5 pt-1.5 border-t border-blue-200">
                          <label className="block text-[10px] font-bold text-slate-700">
                            Repo (owner/repo):
                            <input
                              type="text"
                              value={githubRepo}
                              placeholder="e.g. username/asar-website"
                              onChange={(e) => setGithubRepo(e.target.value)}
                              className="mt-0.5 w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded font-mono-tabular"
                            />
                          </label>
                          <label className="block text-[10px] font-bold text-slate-700">
                            Personal Access Token:
                            <input
                              type="password"
                              value={githubToken}
                              placeholder="ghp_xxxxxxxxxxxx"
                              onChange={(e) => setGithubToken(e.target.value)}
                              className="mt-0.5 w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded font-mono-tabular"
                            />
                          </label>
                          <div className="flex items-center gap-1.5">
                            <label className="flex-1 block text-[10px] font-bold text-slate-700">
                              Branch:
                              <input
                                type="text"
                                value={githubBranch}
                                placeholder="main"
                                onChange={(e) => setGithubBranch(e.target.value)}
                                className="mt-0.5 w-full px-2 py-1 text-[11px] bg-white border border-slate-300 rounded font-mono-tabular"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleSaveGitHubCredentials(githubRepo, githubToken, githubBranch)}
                              className="mt-3.5 px-3 py-1 text-[11px] font-bold bg-[#1e3a8a] text-white rounded hover:bg-blue-900 cursor-pointer"
                            >
                              Save &amp; Test
                            </button>
                          </div>
                          {githubSyncStatus && (
                            <div className="text-[10px] font-mono-tabular text-slate-600 bg-white p-1 rounded border border-slate-200 break-all">
                              {githubSyncStatus}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Secondary Admin Action Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowBackendConfigModal(true)}
                        className="p-2 text-[11px] font-bold bg-orange-50 text-slate-900 border border-orange-200 rounded-lg hover:bg-orange-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Database className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
                        <span className="truncate">Inquiries ({allInquiries.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={downloadInquiriesAsExcelCsv}
                        className="p-2 text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">Excel (.csv)</span>
                      </button>

                      <button
                        type="button"
                        onClick={downloadUpdatedCodeFile}
                        className="p-2 text-[11px] font-bold bg-white text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Code2 className="w-3.5 h-3.5 text-[#1e3a8a] shrink-0" />
                        <span className="truncate">Code (.ts)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewAdminPassword('');
                          setShowPasswordChangeModal(true);
                        }}
                        className="p-2 text-[11px] font-bold bg-white text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
                        <span className="truncate">Password</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetToDefaults}
                        className="p-2 text-[11px] font-semibold bg-white text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">Reset Default</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAdminLogout}
                        className="p-2 text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Lock Admin</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* MODAL 0: UNIVERSAL PHOTO REPLACER & UPLOADER MODAL */}
      {photoEditorTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPhotoEditorTarget(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1e3a8a] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#f97316]" />
                  <span>Change or Upload Photo</span>
                </h3>
                <p className="text-xs text-slate-500">{photoEditorTarget.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setPhotoEditorTarget(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Preview */}
            <div className="aspect-16/9 w-full max-h-[220px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={photoDraftUrl || PRESET_ENGINEERING_IMAGES[0].url}
                alt="Photo preview"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, 'Civil Works', 'Photo Preview', 'Muscat, Oman')}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Option 1: Upload from Device */}
            <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#f97316]" />
                <span>Option 1: Upload Photo from Your Computer or Phone</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoFileUpload}
                className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1e3a8a] file:text-white hover:file:bg-blue-900 cursor-pointer"
              />
              {isUploadingPhoto && (
                <div className="text-xs font-semibold text-[#f97316]">Optimizing & loading photo...</div>
              )}
            </div>

            {/* Option 2: Paste Any Image URL */}
            <label className="block text-xs font-semibold text-slate-700">
              Option 2: Paste Direct Image URL
              <input
                type="text"
                value={photoDraftUrl}
                onChange={(e) => setPhotoDraftUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono-tabular"
              />
            </label>

            {/* Option 3: Authentic Construction Photos Bank (All 29 Oman Project Sites) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Option 3: Authentic Company Project Site Photos (All 29 Assets)</span>
                <span className="text-[11px] font-mono-tabular text-[#f97316]">
                  Click any photo to select instantly
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {AUTHENTIC_PHOTO_BANK_ITEMS.map((item) => {
                  const isSelected = photoDraftUrl === item.url;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPhotoDraftUrl(item.url)}
                      className={`relative aspect-4/3 rounded-lg overflow-hidden border-2 text-left cursor-pointer transition-all group ${
                        isSelected
                          ? 'border-[#f97316] ring-2 ring-[#f97316]/40 scale-95 shadow-sm'
                          : 'border-slate-200 hover:border-[#1e3a8a]'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e, item.tag, item.title, 'Muscat, Oman')}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1">
                        <span className="text-[9px] font-bold text-white line-clamp-1 leading-tight">
                          {item.tag}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-[#f97316] text-white rounded-full flex items-center justify-center text-[10px] font-black">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Option 4: Quick Engineering Vector Presets */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-700">
                Option 4: Quick Preset Shortcuts
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_ENGINEERING_IMAGES.slice(0, 6).map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPhotoDraftUrl(preset.url)}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPhotoEditorTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (photoDraftUrl.trim()) {
                    photoEditorTarget.onApply(photoDraftUrl.trim());
                  }
                  setPhotoEditorTarget(null);
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#f97316] hover:bg-orange-600 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply & Save Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEVELOPER PROFILE MODAL: Eng Abdullah Al Osman Shakil (Electrical Engineer) */}
      {showDeveloperModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowDeveloperModal(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#1e3a8a] via-[#172554] to-[#0f172a] p-6 text-white relative">
              <button
                type="button"
                onClick={() => setShowDeveloperModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white text-[#1e3a8a] flex items-center justify-center shadow-lg border-2 border-orange-400 shrink-0">
                  <Zap className="w-8 h-8 text-[#f97316]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-orange-400 flex items-center gap-1.5">
                    <span>DEVELOPER & LEAD ENGINEER</span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight truncate">
                    Eng Abdullah Al Osman Shakil
                  </h3>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                    <span>Electrical Engineer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Full Name
                    </div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      Eng Abdullah Al Osman Shakil
                    </div>
                  </div>

                  <div className="border-t border-slate-200/80 pt-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Professional Position
                    </div>
                    <div className="text-sm font-bold text-[#1e3a8a] mt-0.5 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#f97316]" />
                      <span>Electrical Engineer</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/80 pt-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Direct Email Address
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <a
                        href="mailto:abdullahalshakil7@gmail.com"
                        className="text-xs sm:text-sm font-semibold font-mono-tabular text-[#1e3a8a] hover:text-[#f97316] hover:underline flex items-center gap-1.5 truncate"
                      >
                        <Mail className="w-4 h-4 text-[#f97316] shrink-0" />
                        <span className="truncate">abdullahalshakil7@gmail.com</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('abdullahalshakil7@gmail.com');
                          setCopiedDeveloperEmail(true);
                          window.setTimeout(() => setCopiedDeveloperEmail(false), 2500);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedDeveloperEmail ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed bg-orange-50/70 border border-orange-200 rounded-2xl p-4 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#f97316]" />
                    <span>Technical Architecture & Web Platform</span>
                  </div>
                  <p>
                    Full-stack web architect for Al Sahab Al Rashid Trad. & Cont. Co L.L.C (wwwasar.com), integrating real-time database management, responsive UI/UX, and engineering project trackers.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <a
                  href="mailto:abdullahalshakil7@gmail.com"
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white rounded-xl shadow-xs flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer"
                  style={{ backgroundColor: siteConfig.primaryNavy }}
                >
                  <Send className="w-3.5 h-3.5 text-[#f97316]" />
                  <span>Send Direct Email</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowDeveloperModal(false)}
                  className="py-2.5 px-5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Running Project Site Interactive Engineering Dossier */}
      {selectedRunningProject && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedRunningProject(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/9 bg-slate-100 border-b border-slate-200">
              <img
                src={selectedRunningProject.imageUrl}
                alt={selectedRunningProject.title}
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, selectedRunningProject.category, selectedRunningProject.title, selectedRunningProject.location)}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedRunningProject(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/95 text-slate-800 flex items-center justify-center shadow-md hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div className="space-y-1.5">
                <div
                  className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular"
                  style={{ color: siteConfig.accentOrange }}
                >
                  <span>{selectedRunningProject.category}</span>
                  <span>·</span>
                  <span>{selectedRunningProject.location}</span>
                </div>
                <h3
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: siteConfig.primaryNavy }}
                >
                  {selectedRunningProject.title}
                </h3>
                <p className="text-xs text-slate-500">Client: {selectedRunningProject.client}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-400">Progress</div>
                  <div
                    className="font-mono-tabular font-bold text-sm"
                    style={{ color: siteConfig.primaryNavy }}
                  >
                    {selectedRunningProject.progress}%
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Active Workforce</div>
                  <div className="font-mono-tabular font-bold text-slate-900 text-sm">
                    {selectedRunningProject.manpowerCount} Personnel
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Start Date</div>
                  <div className="font-mono-tabular font-semibold text-slate-800">
                    {selectedRunningProject.startDate}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Target Handover</div>
                  <div
                    className="font-mono-tabular font-semibold"
                    style={{ color: siteConfig.accentOrange }}
                  >
                    {selectedRunningProject.completionTarget}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Full Engineering & Construction Scope
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedRunningProject.scopeDetails}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">Site Lead:</span>{' '}
                  {selectedRunningProject.engineerLead}
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const projTitle = selectedRunningProject.title;
                      setSelectedRunningProject(null);
                      setInquiryForm((prev) => ({
                        ...prev,
                        message: `Inquiring regarding similar EPC scope to: ${projTitle}`,
                      }));
                      scrollToSection('contact');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white rounded-lg cursor-pointer"
                    style={{ backgroundColor: siteConfig.primaryNavy }}
                  >
                    Inquire About Similar Scope
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRunningProject(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Gallery Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/9 bg-slate-100">
              <img
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.title}
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, lightboxPhoto.category, lightboxPhoto.title, lightboxPhoto.location)}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-2">
              <div
                className="text-xs font-mono-tabular"
                style={{ color: siteConfig.accentOrange }}
              >
                {lightboxPhoto.category} · {lightboxPhoto.location}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{lightboxPhoto.title}</h3>
              <p className="text-sm text-slate-600">{lightboxPhoto.caption}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Supabase Backend Architecture, Client Inquiries & Status Manager Modal (Backend Only) */}
      {showBackendConfigModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowBackendConfigModal(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: siteConfig.primaryNavy }}>
                  <Database className="w-5 h-5 text-[#f97316]" />
                  <span>Backend Database & Client Inquiries Manager ({SUPABASE_PROJECT_ID})</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Inquiry statuses (<span className="font-mono-tabular font-semibold">NEW</span>,{' '}
                  <span className="font-mono-tabular font-semibold">REVIEWED</span>,{' '}
                  <span className="font-mono-tabular font-semibold">ARCHIVED</span>) and database controls are strictly private to this backend panel and hidden from public website visitors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBackendConfigModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BACKEND CLIENT INQUIRIES & STATUS MANAGER (Shown ONLY in Backend) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-sm font-bold" style={{ color: siteConfig.primaryNavy }}>
                    Registered Client Inquiries & Status Manager ({allInquiries.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Review incoming manpower & EPC tender requests and update their backend status.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={downloadInquiriesAsExcelCsv}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Excel / Google Sheet (.csv)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => refreshSupabaseInquiries(supabaseUrl, supabaseKey)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-100 inline-flex items-center gap-1.5 text-slate-800 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#1e3a8a]" />
                    <span>Refresh Inquiries</span>
                  </button>
                </div>
              </div>

              {/* GOOGLE SHEETS & EMAIL AUTO-FORWARDING CONFIG */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                      <span>Google Sheets & Email Auto-Sync (Send Form Data to Excel / Google Sheet & Email)</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Enter the email address where form inquiries should be sent, and/or paste your Google Sheet Web App URL to automatically append every new inquiry row into Google Sheets.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyGoogleSheetAppsScript}
                    className="px-2.5 py-1.5 font-semibold bg-white text-emerald-900 border border-emerald-300 rounded-lg hover:bg-emerald-100 inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Copy Google Sheet Script</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-700">
                      Additional Target Email for Inquiries
                      <input
                        type="email"
                        placeholder="saadsaid.asar@gmail.com"
                        value={
                          textOverrides['inquiry-target-email']?.textValue ||
                          window.localStorage.getItem('asar_inquiry_target_email') ||
                          'saadsaid.asar@gmail.com'
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          try {
                            window.localStorage.setItem('asar_inquiry_target_email', val);
                          } catch {
                            // ignore
                          }
                          void saveTextOverride({
                            elementId: 'inquiry-target-email',
                            textValue: val,
                            textColor: '',
                            fontSize: '',
                            bgColor: '',
                            hidden: false,
                            authorId: cloudAuthorId,
                          });
                        }}
                        className="mt-1 w-full px-3 py-1.5 border border-emerald-300 rounded-lg font-mono-tabular bg-white"
                      />
                    </label>
                    <div className="text-[11px] text-emerald-800">
                      Active Inboxes: <strong>saadsaid.asar@gmail.com</strong> &amp; <strong>alshakilfreelancer@gmail.com</strong>
                    </div>
                    <button
                      type="button"
                      disabled={isSendingTestEmail}
                      onClick={handleSendTestInquiryEmail}
                      className="px-3 py-1.5 text-xs font-bold bg-white text-emerald-900 border border-emerald-300 rounded-lg hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <Send className={`w-3.5 h-3.5 text-emerald-700 ${isSendingTestEmail ? 'animate-spin' : ''}`} />
                      <span>{isSendingTestEmail ? 'Sending Test Inquiry...' : 'Send Test Inquiry to My Gmail Now'}</span>
                    </button>
                  </div>
                  <label className="block font-semibold text-slate-700">
                    Google Sheet Web App URL (Auto-Insert Row)
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={
                        textOverrides['inquiry-sheet-webhook']?.textValue ??
                        window.localStorage.getItem('asar_google_sheet_webhook') ??
                        ''
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        try {
                          window.localStorage.setItem('asar_google_sheet_webhook', val);
                        } catch {
                          // ignore
                        }
                        void saveTextOverride({
                          elementId: 'inquiry-sheet-webhook',
                          textValue: val,
                          textColor: '',
                          fontSize: '',
                          bgColor: '',
                          hidden: false,
                          authorId: cloudAuthorId,
                        });
                      }}
                      className="mt-1 w-full px-3 py-1.5 border border-emerald-300 rounded-lg font-mono-tabular bg-white"
                    />
                  </label>
                </div>
              </div>

              {allInquiries.length === 0 ? (
                <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                  No client inquiries recorded yet. Submissions from the public Contact & Inquiry form will appear here in the backend with their status.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1">
                  {allInquiries.map((inq) => (
                    <div key={inq.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs shadow-2xs">
                      <div className="flex items-center justify-between gap-2 font-mono-tabular">
                        <span className="font-bold truncate" style={{ color: siteConfig.primaryNavy }}>
                          {inq.inquiryType}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={inq.status}
                            onChange={async (e) => {
                              const nextStatus = e.target.value as ClientInquiryItem['status'];
                              setLocalInquiries((prev) =>
                                prev.map((item) =>
                                  item.id === inq.id ? { ...item, status: nextStatus } : item
                                )
                              );
                              setSupabaseInquiries((prev) =>
                                prev.map((item) =>
                                  item.id === inq.id ? { ...item, status: nextStatus } : item
                                )
                              );
                              await updateInquiryStatusInSupabase(inq.id, nextStatus, supabaseUrl, supabaseKey);
                              showNotification('success', `Backend inquiry status updated to ${nextStatus.toUpperCase()}.`);
                            }}
                            className={`px-2 py-0.5 text-[11px] font-bold border rounded cursor-pointer ${
                              inq.status === 'new'
                                ? 'bg-orange-50 text-[#f97316] border-orange-200'
                                : inq.status === 'reviewed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            <option value="new">STATUS: NEW</option>
                            <option value="reviewed">STATUS: REVIEWED</option>
                            <option value="archived">STATUS: ARCHIVED</option>
                          </select>
                          <button
                            type="button"
                            onClick={async () => {
                              setLocalInquiries((prev) => prev.filter((item) => item.id !== inq.id));
                              setSupabaseInquiries((prev) => prev.filter((item) => item.id !== inq.id));
                              await deleteInquiryFromSupabase(inq.id, supabaseUrl, supabaseKey);
                              showNotification('info', 'Inquiry deleted from backend.');
                            }}
                            className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        {inq.clientName} — {inq.companyName}
                      </div>
                      <div className="text-slate-600 font-mono-tabular">
                        {inq.email} · {inq.phone} · Site: {inq.projectLocation}
                      </div>
                      {inq.manpowerDetails && (
                        <div className="text-slate-700 font-medium">Trades: {inq.manpowerDetails}</div>
                      )}
                      <p className="text-slate-600 leading-relaxed">{inq.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="block font-semibold text-slate-700">
                Supabase Project URL
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular bg-slate-50"
                />
              </label>
              <label className="block font-semibold text-slate-700">
                Supabase Publishable API Key
                <input
                  type="text"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-tabular bg-slate-50"
                />
              </label>
            </div>

            {/* Live Connection Status */}
            <div
              className={`p-3.5 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
                supabaseStatus.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <span className="font-semibold">{supabaseStatus.message}</span>
              <button
                type="button"
                onClick={() => refreshSupabaseInquiries(supabaseUrl, supabaseKey)}
                className="px-3 py-1 font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1 text-slate-800 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Test / Refresh Supabase</span>
              </button>
            </div>

            {/* GITHUB AUTO-COMMIT & PERMANENT CODE SYNC (Auto-updates GitHub when Admin edits on website) */}
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-[#1e3a8a] flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-[#f97316]" />
                    <span>GitHub Auto-Update & Permanent Code Sync (Optional)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    All Admin Mode edits already save permanently to Cloud Firestore (live across all mobile & desktop devices). Connect your GitHub repository below if you also want every website edit to automatically commit to GitHub!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadUpdatedCodeFile}
                  className="px-3 py-1.5 font-semibold text-white bg-[#1e3a8a] hover:bg-blue-900 rounded-lg inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-[#f97316]" />
                  <span>Download Updated Code (.ts)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className="block font-semibold text-slate-700">
                  GitHub Repo (owner/repo)
                  <input
                    type="text"
                    placeholder="e.g. username/asar-website"
                    value={githubRepo}
                    onChange={(e) => {
                      setGithubRepo(e.target.value);
                      try {
                        window.localStorage.setItem('asar_github_repo', e.target.value);
                      } catch {
                        // ignore
                      }
                    }}
                    className="mt-1 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono-tabular bg-white"
                  />
                </label>
                <label className="block font-semibold text-slate-700">
                  Branch
                  <input
                    type="text"
                    placeholder="main"
                    value={githubBranch}
                    onChange={(e) => {
                      setGithubBranch(e.target.value);
                      try {
                        window.localStorage.setItem('asar_github_branch', e.target.value);
                      } catch {
                        // ignore
                      }
                    }}
                    className="mt-1 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono-tabular bg-white"
                  />
                </label>
                <label className="block font-semibold text-slate-700">
                  GitHub Personal Access Token
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={githubToken}
                    onChange={(e) => {
                      setGithubToken(e.target.value);
                      try {
                        window.localStorage.setItem('asar_github_token', e.target.value);
                      } catch {
                        // ignore
                      }
                    }}
                    className="mt-1 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono-tabular bg-white"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-blue-200">
                <button
                  type="button"
                  onClick={() => handleSaveGitHubCredentials(githubRepo, githubToken, githubBranch)}
                  className="px-4 py-2 font-bold bg-[#1e3a8a] text-white rounded-lg hover:bg-blue-900 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#f97316]" />
                  <span>Save &amp; Link GitHub to Cloud</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncingToGithub}
                  onClick={() => pushCmsUpdateToGitHub('Manual Admin Portal Sync to GitHub', true)}
                  className="px-4 py-2 font-bold bg-[#f97316] text-white rounded-lg hover:bg-orange-600 cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingToGithub ? 'animate-spin' : ''}`} />
                  <span>{isSyncingToGithub ? 'Pushing to GitHub...' : 'Push to GitHub Now'}</span>
                </button>
              </div>

              {githubSyncStatus && (
                <div className="p-2.5 bg-white border border-blue-200 rounded-lg font-mono-tabular text-[11px] text-slate-700 flex items-center justify-between gap-2">
                  <span>{githubSyncStatus}</span>
                </div>
              )}
            </div>

            {/* SQL Table Creation Helper for Project utblsxterubtziionaja */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold text-slate-900">
                  Supabase SQL Table Schema (<code className="font-mono-tabular">public.inquiries</code>)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySupabaseSql}
                    className="px-3 py-1 font-semibold text-white bg-[#f97316] hover:bg-orange-600 rounded-md cursor-pointer"
                  >
                    {copiedSql ? '✓ Copied SQL!' : 'Copy SQL Script'}
                  </button>
                  <a
                    href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 font-semibold text-[#1e3a8a] bg-white border border-slate-300 rounded-md hover:bg-slate-100 inline-flex items-center gap-1"
                  >
                    <span>Open Supabase SQL Editor</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <pre className="p-3 bg-white border border-slate-200 rounded-lg font-mono-tabular text-[11px] text-slate-700 overflow-x-auto max-h-40">
                {SUPABASE_SQL_SETUP_SCRIPT}
              </pre>
            </div>

            <div className="flex flex-wrap justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={downloadUpdatedCodeFile}
                className="px-4 py-2 text-xs font-semibold bg-blue-50 text-[#1e3a8a] border border-blue-200 rounded-lg cursor-pointer"
              >
                Export Permanent Code (.ts)
              </button>
              <button
                type="button"
                onClick={() => {
                  exportStandaloneHtmlFile(
                    siteConfig,
                    coreServices,
                    runningProjects,
                    galleryPhotos,
                    completedProjects,
                    coreValues,
                    supabaseUrl,
                    supabaseKey
                  );
                  setShowBackendConfigModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg cursor-pointer"
              >
                Download Single-File HTML (With Supabase)
              </button>
              <button
                type="button"
                onClick={() => {
                  syncAllCollectionsToCloud();
                  setShowBackendConfigModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white rounded-lg cursor-pointer"
                style={{ backgroundColor: siteConfig.primaryNavy }}
              >
                Save & Sync All Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WEB PUBLISHING, NETLIFY & DOMAIN SETUP CENTER MODAL */}
      {showBluehostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl text-white flex items-center justify-center shadow-sm ${
                    activeDeployTab === 'netlify'
                      ? 'bg-emerald-600'
                      : activeDeployTab === 'domain'
                      ? 'bg-[#1e3a8a]'
                      : 'bg-blue-600'
                  }`}
                >
                  {activeDeployTab === 'netlify' ? (
                    <Cloud className="w-6 h-6" />
                  ) : activeDeployTab === 'domain' ? (
                    <Globe className="w-6 h-6" />
                  ) : (
                    <Server className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      {activeDeployTab === 'netlify'
                        ? 'Publish to Netlify (Live in 30s)'
                        : activeDeployTab === 'domain'
                        ? 'Connect Custom Host & Domain (Netlify DNS)'
                        : 'Bluehost cPanel & Apache Deployment'}
                    </h2>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                        activeDeployTab === 'netlify'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeDeployTab === 'domain'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      Pre-Configured
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Al Sahab Al Rashid Trad. & Cont. Co L.L.C (wwwasar.com) · Office: +968 9570 6749 · Muscat, Sultanate of Oman
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBluehostModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveDeployTab('netlify')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeDeployTab === 'netlify'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Cloud className="w-4 h-4" />
                <span>1. Publish to Netlify</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDeployTab('domain')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeDeployTab === 'domain'
                    ? 'bg-[#1e3a8a] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>2. Connect Custom Domain</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDeployTab('bluehost')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeDeployTab === 'bluehost'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Server className="w-4 h-4" />
                <span>3. Bluehost / Apache</span>
              </button>
            </div>

            {/* TAB 1: NETLIFY DEPLOYMENT */}
            {activeDeployTab === 'netlify' && (
              <div className="space-y-5">
                {/* Primary Recommended: Complete Turnkey Zip Package with all 29 Oman photos */}
                <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                        <span>⭐ Guaranteed Fix for Missing Photos</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        Download Complete Netlify Deployment Package (.zip)
                      </h4>
                      <p className="text-xs text-emerald-100 max-w-xl">
                        Bundles the standalone <strong>index.html</strong>, <strong>_redirects</strong>, <strong>netlify.toml</strong>, AND all <strong>29 authentic Oman project photographs</strong> inside <code className="bg-black/20 px-1 py-0.5 rounded font-mono">assets/aistudio/</code>. Simply unzip and drop on Netlify Drop!
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadNetlifyZip}
                      disabled={isGeneratingZip}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-emerald-800 hover:bg-emerald-50 active:scale-98 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-60"
                    >
                      {isGeneratingZip ? (
                        <>
                          <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                          <span>Packaging 29 Photos...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-emerald-700" />
                          <span>Download Netlify Zip</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Netlify Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={downloadNetlifyTomlFile}
                    className="p-3.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">Download netlify.toml</span>
                      <Download className="w-4 h-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-1">Build command, publish dir & SPA redirects</p>
                  </button>

                  <button
                    type="button"
                    onClick={downloadNetlifyRedirectsFile}
                    className="p-3.5 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 rounded-xl text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-900">Download _redirects</span>
                      <Download className="w-4 h-4 text-cyan-600 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-cyan-700 mt-1">SPA rule (/* → /index.html 200)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      exportStandaloneHtmlFile(
                        siteConfig,
                        coreServices,
                        runningProjects,
                        galleryPhotos,
                        completedProjects,
                        coreValues,
                        supabaseUrl,
                        supabaseKey
                      )
                    }
                    className="p-3.5 bg-orange-50 border border-orange-200 hover:bg-orange-100 rounded-xl text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-900">Single-File HTML</span>
                      <Download className="w-4 h-4 text-[#f97316] group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-orange-700 mt-1">Embedded SVG fallbacks for instant drop</p>
                  </button>
                </div>

                {/* Netlify Step-by-Step Instructions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-emerald-600" />
                    <span>How to Publish to Netlify (Choose Method A or B)</span>
                  </h3>

                  {/* Method A: Netlify Drop (Fastest) */}
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2 text-xs">
                    <div className="font-bold text-emerald-950 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-mono-tabular">Method A</span>
                      <span>Instant 30-Second Drag & Drop (Netlify Drop — No Git Required)</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-700 pl-1">
                      <li>
                        <strong>Option 1 (Zero-Build — Recommended):</strong> Click <strong>"Download Netlify Zip"</strong> above. Unzip the file on your computer.
                      </li>
                      <li>
                        Open <strong><a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">app.netlify.com/drop</a></strong> in your browser and log into Netlify.
                      </li>
                      <li>
                        Drag and drop the unzipped folder (which contains <code className="font-mono">index.html</code>, <code className="font-mono">_redirects</code>, and <code className="font-mono">assets/</code> with all 29 photos) onto the upload box.
                      </li>
                      <li>
                        <strong>Option 2 (Terminal Build):</strong> Run <code className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono-tabular text-emerald-800">npm run build</code> in the terminal to generate the <code className="font-mono-tabular font-bold">dist/</code> folder, then drag and drop the <code className="font-mono-tabular font-bold">dist/</code> folder onto Netlify Drop.
                      </li>
                      <li>
                        <strong>Done!</strong> Netlify deploys your portal immediately with a live URL (e.g., <code className="font-mono-tabular text-slate-800">https://your-company.netlify.app</code>), working photos, and free automatic SSL.
                      </li>
                    </ol>
                  </div>

                  {/* Method B: Git Continuous Deployment */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-mono-tabular">Method B</span>
                      <span>GitHub Continuous Deployment (Automated Rebuilds on Git Push)</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                      <li>Push this project to your GitHub repository.</li>
                      <li>In Netlify, click <strong>"Add new site"</strong> → <strong>"Import an existing project"</strong> → select <strong>GitHub</strong>.</li>
                      <li>
                        Select your repository. Netlify automatically detects the included <code className="font-mono-tabular">netlify.toml</code>:
                        <div className="mt-1 pl-4 font-mono-tabular text-[11px] text-slate-700">
                          • Build command: <strong>npm run build</strong><br />
                          • Publish directory: <strong>dist</strong><br />
                          • Node environment: <strong>Node 20</strong>
                        </div>
                      </li>
                      <li>Click <strong>Deploy Site</strong>. Any future code updates will auto-publish in seconds.</li>
                    </ol>
                  </div>
                </div>

                {/* Netlify Optimization Checklist */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Netlify Technical Compatibility Checklist</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>`public/_redirects`:</strong> Directs `/* → /index.html 200`</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>`netlify.toml`:</strong> Build & caching configured</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Edge CDN:</strong> Global asset distribution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Supabase Cloud:</strong> Direct API (no server needed)</span>
                    </div>
                  </div>
                </div>

                {/* Netlify TOML & Redirects Code Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-900">netlify.toml Configuration Preview</span>
                    <button
                      type="button"
                      onClick={handleCopyToml}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded cursor-pointer"
                    >
                      {copiedToml ? '✓ Copied TOML' : 'Copy netlify.toml'}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono-tabular text-[11px] overflow-x-auto max-h-40 leading-relaxed">
                    {NETLIFY_TOML_TEMPLATE}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 2: CONNECT CUSTOM DOMAIN & HOST */}
            {activeDeployTab === 'domain' && (
              <div className="space-y-5 text-xs">
                <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200 space-y-1.5">
                  <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#1e3a8a]" />
                    <span>Connecting Your Custom Domain (wwwasar.com) to Netlify</span>
                  </h3>
                  <p className="text-slate-600">
                    Once your site is published on Netlify, you can connect your existing domain name and host so visitors see your professional URL (<code className="font-mono-tabular font-bold text-slate-800">wwwasar.com</code>).
                  </p>
                </div>

                {/* Step 1: Add Domain in Netlify */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="font-bold text-slate-900 text-sm">Add Domain in Netlify Dashboard</div>
                    <p className="text-slate-600">
                      In your Netlify site dashboard, navigate to <strong>Site Configuration</strong> (or <strong>Domain Management</strong>) → click <strong>"Add a domain"</strong>.
                    </p>
                    <p className="text-slate-600">
                      Type your domain: <code className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono-tabular font-bold text-[#1e3a8a]">wwwasar.com</code> and click <strong>Verify</strong> → <strong>Add domain</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 2: Configure DNS */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="font-bold text-slate-900 text-sm">Configure DNS at Your Domain Registrar / Host</div>
                    <p className="text-slate-600">
                      Choose one of the two methods below depending on how you manage your domain:
                    </p>

                    {/* Method 1: Netlify DNS (Recommended) */}
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-2">
                      <div className="font-bold text-emerald-950 flex items-center gap-2">
                        <span>⭐ Method 1: Netlify DNS (Recommended — Automatic SSL & Fastest Edge Speed)</span>
                      </div>
                      <p className="text-slate-600">
                        In Netlify, click <strong>"Set up Netlify DNS"</strong>. Netlify will give you 4 custom nameservers, for example:
                      </p>
                      <div className="grid grid-cols-2 gap-2 font-mono-tabular text-[11px] text-emerald-900 bg-white p-2.5 rounded border border-emerald-200">
                        <div>1. dns1.p01.nsone.net</div>
                        <div>2. dns2.p01.nsone.net</div>
                        <div>3. dns3.p01.nsone.net</div>
                        <div>4. dns4.p01.nsone.net</div>
                      </div>
                      <p className="text-slate-600">
                        Log into your domain provider (GoDaddy, Namecheap, Bluehost Domains, etc.) and update your domain nameservers to these 4 Netlify nameservers.
                      </p>
                    </div>

                    {/* Method 2: External DNS Records */}
                    <div className="p-3 bg-white border border-slate-300 rounded-lg space-y-2">
                      <div className="font-bold text-slate-900">
                        Method 2: Keep Existing DNS (Manual A & CNAME Records)
                      </div>
                      <p className="text-slate-600">
                        If you want to keep your existing DNS hosting, add these two DNS records in your domain control panel:
                      </p>
                      <div className="space-y-2 font-mono-tabular text-[11px]">
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-800">A Record:</span> Host <code className="bg-white px-1 border rounded">@</code> → Points to: <strong className="text-blue-700">75.2.60.5</strong>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyDnsIp}
                            className="px-2 py-0.5 bg-blue-50 text-[#1e3a8a] border border-blue-200 rounded font-sans text-xs font-semibold cursor-pointer"
                          >
                            {copiedDnsIp ? '✓ Copied IP' : 'Copy IP'}
                          </button>
                        </div>
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                          <span className="font-bold text-slate-800">CNAME Record:</span> Host <code className="bg-white px-1 border rounded">www</code> → Points to: <strong className="text-blue-700">&lt;your-site-name&gt;.netlify.app</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Free Automatic SSL */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    3
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="font-bold text-slate-900 text-sm">Automatic Free HTTPS / SSL Certificate</div>
                    <p className="text-slate-600">
                      Within a few minutes of DNS propagation, Netlify automatically provisions and installs a free <strong>Let's Encrypt SSL Certificate</strong> for both <code className="font-mono-tabular">wwwasar.com</code> and <code className="font-mono-tabular">www.wwwasar.com</code>.
                    </p>
                    <p className="text-emerald-700 font-semibold">
                      ✓ "Force HTTPS" is enabled automatically so all visitors are redirected to the secure URL.
                    </p>
                  </div>
                </div>

                {/* Step 4: Google Search, Favicon & Photo Cache Synchronization */}
                <div className="p-4 bg-orange-50/80 rounded-xl border border-orange-200 flex gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-[#f97316] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    4
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="font-bold text-slate-900 text-sm">Google Search Results & Photo Visibility on wwwasar.com</div>
                    <p className="text-slate-600 leading-relaxed">
                      If you search for <code className="font-mono font-bold text-slate-800">wwwasar.com</code> or visited before the authentic Oman photos were uploaded:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                      <li><strong>Google Search & Social Cards:</strong> The site now includes official high-resolution <code className="font-mono">favicon.svg</code>, <code className="font-mono">og:image</code>, Twitter cards, and Schema.org rich business data so Google Search and social media previews display your photos automatically.</li>
                      <li><strong>Clear Old Browser Cache on wwwasar.com:</strong> If your browser on <code className="font-mono">wwwasar.com</code> still holds old cached data from earlier visits, click below to sync all 29 Oman site photos immediately:</li>
                    </ul>
                    <button
                      type="button"
                      onClick={handleForceSyncOfficialPhotos}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f97316] hover:bg-orange-600 active:scale-98 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>🔄 Clear Stale Cache & Sync All 29 Photos</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BLUEHOST / APACHE */}
            {activeDeployTab === 'bluehost' && (
              <div className="space-y-5">
                {/* Bluehost Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={downloadHtaccessFile}
                    className="p-3.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900">1. Download .htaccess</span>
                      <Download className="w-4 h-4 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-blue-700 mt-1">Pre-configured Apache rewrite, Gzip & caching rules</p>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyHtaccess}
                    className="p-3.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">
                        {copiedHtaccess ? '✓ Copied to Clipboard!' : '2. Copy .htaccess Code'}
                      </span>
                      <Copy className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-1">Directly paste into Bluehost File Manager editor</p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      exportStandaloneHtmlFile(
                        siteConfig,
                        coreServices,
                        runningProjects,
                        galleryPhotos,
                        completedProjects,
                        coreValues,
                        supabaseUrl,
                        supabaseKey
                      )
                    }
                    className="p-3.5 bg-orange-50 border border-orange-200 hover:bg-orange-100 rounded-xl text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-orange-900">3. Single-File HTML</span>
                      <Download className="w-4 h-4 text-[#f97316] group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-orange-700 mt-1">1-click standalone file for instant cPanel upload</p>
                  </button>
                </div>

                {/* 4 Step Deployment Guide */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-600" />
                    <span>How to Deploy on Bluehost cPanel (Step-by-Step)</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3.5">
                      <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                        1
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">Build the Production Files</div>
                        <p className="text-slate-600">
                          In the terminal, run <code className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono-tabular text-blue-700">npm run build</code>. 
                          This compiles the app into <code className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono-tabular">dist/</code> with <code className="font-mono-tabular">index.html</code>, <code className="font-mono-tabular">.htaccess</code>, and <code className="font-mono-tabular">assets/</code>.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3.5">
                      <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                        2
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">Log into Bluehost File Manager</div>
                        <p className="text-slate-600">
                          Log in at <a href="https://my.bluehost.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">my.bluehost.com</a>, open <strong>cPanel</strong>, and click <strong>File Manager</strong> → double click <code className="font-mono-tabular font-bold text-slate-800">public_html</code>.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3.5">
                      <div className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                        3
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">Upload & Verify .htaccess</div>
                        <p className="text-slate-600">
                          Upload build files into <code className="font-mono-tabular">public_html</code>. Enable <strong>"Show Hidden Files (dotfiles)"</strong> in cPanel settings so <code className="font-mono-tabular font-bold">.htaccess</code> is active.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                        4
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">Free SSL (HTTPS) on Bluehost</div>
                        <p className="text-slate-600">
                          In cPanel, navigate to <strong>Security</strong> → <strong>SSL/TLS Status</strong>, select <code className="font-mono-tabular">wwwasar.com</code>, and click <strong>Run AutoSSL</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apache .htaccess Code Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-900">Apache .htaccess Configuration Preview</span>
                    <button
                      type="button"
                      onClick={handleCopyHtaccess}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer"
                    >
                      {copiedHtaccess ? '✓ Copied' : 'Copy Snippet'}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono-tabular text-[11px] overflow-x-auto max-h-40 leading-relaxed">
                    {BLUEHOST_HTACCESS_TEMPLATE}
                  </pre>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="text-[11px] text-slate-500">
                Lead Engineer: <span className="font-medium text-slate-700">Eng Abdullah Al Osman Shakil (abdullahalshakil7@gmail.com)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBluehostModal(false)}
                  className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Close Deployment Center
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Admin Password Verification Modal (Restricts Public Production Access) */}
      {showAdminLoginModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAdminLoginModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center shadow-sm shrink-0">
                  <Lock className="w-5 h-5 text-[#f97316]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Admin Portal Verification</h2>
                  <p className="text-xs text-slate-500">Al Sahab Al Rashid Trad. & Cont. Co L.L.C</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminLoginModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description / Security Notice */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600">
              <div className="font-bold text-[#1e3a8a] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#f97316]" />
                <span>Protected Management Access</span>
              </div>
              <p>
                To safeguard the live corporate portal from unauthorized edits on public domains, Admin Mode requires administrative password authentication.
              </p>
            </div>

            {/* Error Message */}
            {adminAuthError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <X className="w-4 h-4 shrink-0 text-red-500" />
                <span>{adminAuthError}</span>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handleUnlockAdminWithPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Admin Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswordPlaintext ? 'text' : 'password'}
                    value={adminInputPassword}
                    onChange={(e) => {
                      setAdminInputPassword(e.target.value);
                      setAdminAuthError(null);
                    }}
                    placeholder="Enter admin password"
                    className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:outline-none font-mono-tabular text-sm bg-white"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordPlaintext(!showPasswordPlaintext)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showPasswordPlaintext ? 'Hide password' : 'Show password'}
                  >
                    {showPasswordPlaintext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                  <span className="text-slate-500">Authorized personnel only. Password required per session.</span>
                  <span className="text-slate-400">Shortcut: <kbd className="font-mono-tabular px-1 bg-slate-100 border border-slate-200 rounded">Ctrl+Shift+A</kbd></span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Session Security: Password will be required for every new session.</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 font-bold text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: siteConfig.primaryNavy }}
              >
                <Unlock className="w-4 h-4 text-[#f97316]" />
                <span>Unlock Admin Mode</span>
              </button>
            </form>

            {/* Alternative: Google OAuth Sign-in */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <div className="text-[11px] text-center text-slate-400 font-medium">
                OR SIGN IN WITH AUTHORIZED GOOGLE ACCOUNT
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await signInAdminWithGoogle();
                    if (res.user.email === ADMIN_EMAIL) {
                      setIsAdminAuthenticated(true);
                      setIsAdminMode(true);
                      setShowAdminLoginModal(false);
                      showNotification('success', `Welcome back, Admin (${res.user.email})!`);
                    } else {
                      setAdminAuthError(`Signed in as ${res.user.email}, but this account is not authorized.`);
                    }
                  } catch {
                    setAdminAuthError('Google sign-in was cancelled or encountered an error.');
                  }
                }}
                className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Sign-In ({ADMIN_EMAIL})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Change Admin Password Modal */}
      {showPasswordChangeModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowPasswordChangeModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Admin Password Settings</h2>
                  <p className="text-xs text-slate-500">Persists to Cloud Firestore</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordChangeModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Current Master Password:</span>
                <code className="font-mono-tabular font-bold text-[#1e3a8a]">••••••••••••</code>
              </div>
              <p className="text-[11px] text-slate-500">
                You can change this password at any time. It will be required to unlock Admin Mode on public domains (Netlify, Bluehost, or wwwasar.com).
              </p>
            </div>

            <form onSubmit={handleChangeAdminPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  New Admin Master Password
                </label>
                <input
                  type="text"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Enter new admin password"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:outline-none font-mono-tabular text-sm bg-white"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPasswordChangeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white rounded-lg cursor-pointer"
                  style={{ backgroundColor: siteConfig.primaryNavy }}
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
