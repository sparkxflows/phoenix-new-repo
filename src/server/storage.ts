import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ARTISTS, GALLERY_ITEMS } from '../data/studioData.js';
import { 
  DEFAULT_CUSTOMER_REVIEWS, 
  DEFAULT_STUDIO_PHILOSOPHY, 
  DEFAULT_HOME_HERO_SETTINGS, 
  DEFAULT_ABOUT_SETTINGS 
} from '../lib/studioContent.js';
import { DEFAULT_LOGO_SETTINGS } from '../lib/branding.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'studio_store.json');

export interface StudioStoreData {
  version: number;
  updatedAt: string;
  customer_reviews: any[];
  custom_artists: any[];
  custom_gallery: any[];
  home_hero: any;
  about_settings: any;
  studio_philosophy: any;
  custom_logo: any;
  admin_user: any | null;
  [key: string]: any;
}

const DEFAULT_STORE: StudioStoreData = {
  version: Date.now(),
  updatedAt: new Date().toISOString(),
  customer_reviews: DEFAULT_CUSTOMER_REVIEWS,
  custom_artists: ARTISTS,
  custom_gallery: GALLERY_ITEMS,
  home_hero: DEFAULT_HOME_HERO_SETTINGS,
  about_settings: DEFAULT_ABOUT_SETTINGS,
  studio_philosophy: DEFAULT_STUDIO_PHILOSOPHY,
  custom_logo: DEFAULT_LOGO_SETTINGS,
  admin_user: null,
};

let inMemoryStore: StudioStoreData = { ...DEFAULT_STORE };

// Initialize storage on module load
function initStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      inMemoryStore = {
        ...DEFAULT_STORE,
        ...parsed,
      };
    } else {
      inMemoryStore = {
        ...DEFAULT_STORE,
        version: Date.now(),
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(inMemoryStore, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[StudioStorage] Error initializing store from disk, using memory fallback:', err);
    inMemoryStore = { ...DEFAULT_STORE };
  }
}

// Persist to disk
function persistStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${STORE_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(inMemoryStore, null, 2), 'utf-8');
    fs.renameSync(tempFile, STORE_FILE);
  } catch (err) {
    console.error('[StudioStorage] Error writing store file:', err);
  }
}

initStore();

export const studioStorage = {
  getAppInfo() {
    return {
      version: inMemoryStore.version,
      updatedAt: inMemoryStore.updatedAt,
      timestamp: Date.now(),
    };
  },

  getAll() {
    return { ...inMemoryStore };
  },

  getValue(key: string) {
    return inMemoryStore[key] ?? null;
  },

  setValue(key: string, value: any) {
    inMemoryStore[key] = value;
    inMemoryStore.updatedAt = new Date().toISOString();
    inMemoryStore.version = Date.now();
    persistStore();
    return {
      success: true,
      key,
      updatedAt: inMemoryStore.updatedAt,
      version: inMemoryStore.version,
    };
  },

  // If server has default reviews but client has modified or added reviews, sync them up
  syncReviewsIfMore(clientReviews: any[]) {
    if (!Array.isArray(clientReviews) || clientReviews.length === 0) {
      return inMemoryStore.customer_reviews;
    }
    const current = inMemoryStore.customer_reviews || [];
    // If client has more reviews or custom flags, adopt client reviews
    const hasNewIds = clientReviews.some(
      (cr) => !current.some((sr) => sr.id === cr.id)
    );
    const hasDifferentApproved = clientReviews.some((cr) => {
      const match = current.find((sr) => sr.id === cr.id);
      return match && match.approved !== cr.approved;
    });

    if (hasNewIds || hasDifferentApproved || clientReviews.length > current.length) {
      inMemoryStore.customer_reviews = clientReviews;
      inMemoryStore.updatedAt = new Date().toISOString();
      inMemoryStore.version = Date.now();
      persistStore();
    }
    return inMemoryStore.customer_reviews;
  },

  getAdminUser() {
    return inMemoryStore.admin_user;
  },

  setAdminUser(user: any) {
    inMemoryStore.admin_user = user;
    inMemoryStore.updatedAt = new Date().toISOString();
    inMemoryStore.version = Date.now();
    persistStore();
    return user;
  },
};
