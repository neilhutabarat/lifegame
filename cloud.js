// CLOUD SYNC MODULE (OFFLINE LOCALSTORAGE + FIREBASE FIRESTORE v10 COMPAT)
// Mendukung pindah perangkat Laptop <-> HP menggunakan Sync ID + Auto-Sync saat Online

const CLOUD_CFG_KEY = 'oneilverse_fb_config_v1';
const CLOUD_ID_KEY = 'oneilverse_sync_id_v1';

const CloudSync = {
  db: null,
  initialized: false,
  syncId: localStorage.getItem(CLOUD_ID_KEY) || 'oneil_default',
  lastCloudPush: 0,

  getConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem(CLOUD_CFG_KEY) || 'null');
      if (saved && saved.apiKey && saved.projectId) return saved;
    } catch (e) {}
    if (window.DEFAULT_FIREBASE_CONFIG && window.DEFAULT_FIREBASE_CONFIG.apiKey) {
      return window.DEFAULT_FIREBASE_CONFIG;
    }
    return null;
  },

  init() {
    if (this.initialized) return true;
    const cfg = this.getConfig();
    if (!cfg || !cfg.apiKey || !cfg.projectId || typeof firebase === 'undefined') {
      return false;
    }
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(cfg);
      }
      this.db = firebase.firestore();
      this.initialized = true;
      return true;
    } catch (err) {
      console.warn('Firestore init error:', err);
      return false;
    }
  },

  setSyncId(newId) {
    const clean = (newId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (clean.length >= 4) {
      this.syncId = clean;
      localStorage.setItem(CLOUD_ID_KEY, clean);
      return true;
    }
    return false;
  },

  saveCustomConfig(cfgObj) {
    localStorage.setItem(CLOUD_CFG_KEY, JSON.stringify(cfgObj));
    this.initialized = false;
    return this.init();
  },

  async pushToCloud(stateObj, force = false) {
    if (!navigator.onLine) return { ok: false, reason: 'offline' };
    if (!this.init()) return { ok: false, reason: 'unconfigured' };

    const now = Date.now();
    if (!force && now - this.lastCloudPush < 8000) {
      return { ok: true, skipped: true };
    }

    try {
      this.lastCloudPush = now;
      const serialized = JSON.stringify(stateObj);
      await this.db.collection('rental_simulator_saves').doc(this.syncId).set({
        syncId: this.syncId,
        rentalName: stateObj.rentalName || 'Rental Oneilverse',
        updatedAt: now,
        payload: serialized
      }, { merge: true });
      return { ok: true, updatedAt: now };
    } catch (err) {
      console.warn('Cloud push failed:', err);
      return { ok: false, reason: err.message || 'error' };
    }
  },

  async pullFromCloud() {
    if (!navigator.onLine) return { ok: false, reason: 'offline' };
    if (!this.init()) return { ok: false, reason: 'unconfigured' };

    try {
      const snap = await this.db.collection('rental_simulator_saves').doc(this.syncId).get();
      if (!snap.exists) return { ok: false, reason: 'not_found' };
      const data = snap.data();
      if (!data || !data.payload) return { ok: false, reason: 'empty' };
      const parsed = JSON.parse(data.payload);
      return { ok: true, state: parsed, updatedAt: data.updatedAt || 0 };
    } catch (err) {
      console.warn('Cloud pull failed:', err);
      return { ok: false, reason: err.message || 'error' };
    }
  }
};
