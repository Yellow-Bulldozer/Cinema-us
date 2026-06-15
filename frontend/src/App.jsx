import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import toast, { Toaster } from 'react-hot-toast';
import {
  FiArchive,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiDownload,
  FiEdit3,
  FiEye,
  FiFilm,
  FiHeart,
  FiHome,
  FiMoon,
  FiPlus,
  FiSearch,
  FiSettings,
  FiShare2,
  FiShuffle,
  FiStar,
  FiSun,
  FiTrash2,
  FiUpload,
  FiX,
} from 'react-icons/fi';
import { assetUrl, metaApi, transferApi, watchlistApi } from './services/api';
import { emptyForm, filterLocal, SORTS, STATUSES, toFormData, TYPES, unique } from './utils/watchlist';
import soundEngine from './utils/SoundEngine';
import InteractiveBackground from './components/InteractiveBackground';
import IntroLoader from './components/IntroLoader';
import './App.css';

const navItems = [
  ['/', 'Home', FiHome],
  ['/watchlist', 'Archive', FiFilm],
  ['/timeline', 'Timeline', FiArchive],
  ['/calendar', 'Calendar', FiCalendar],
  ['/settings', 'Settings', FiSettings],
];

const defaultQuery = {
  search: '',
  type: 'All',
  status: 'All',
  favorite: false,
  genre: '',
  platform: '',
  mood: '',
  sort: 'newest',
};

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('watchlist-theme') || 'dark');
  const [showLoader, setShowLoader] = useState(() => {
    const entered = sessionStorage.getItem('cinema-us-entered');
    return !entered;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('watchlist-theme', theme);
  }, [theme]);

  // Global hover and click SFX
  useEffect(() => {
    if (!showLoader) {
      soundEngine.init();
    }

    const handleGlobalClick = (e) => {
      const interactive = e.target.closest('a, button, select, input[type="checkbox"], input[type="range"], .chip-btn, .reel-card');
      if (interactive) {
        soundEngine.playClick();
      }
    };

    const handleGlobalMouseOver = (e) => {
      const interactive = e.target.closest('a, button, select, input[type="checkbox"], input[type="range"], .chip-btn, .reel-card');
      if (interactive) {
        if (interactive !== window._lastHoveredElement) {
          soundEngine.playHover();
          window._lastHoveredElement = interactive;
        }
      }
    };

    const handleGlobalMouseOut = (e) => {
      const interactive = e.target.closest('a, button, select, input[type="checkbox"], input[type="range"], .chip-btn, .reel-card');
      if (interactive && interactive === window._lastHoveredElement) {
        window._lastHoveredElement = null;
      }
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('mouseover', handleGlobalMouseOver);
    window.addEventListener('mouseout', handleGlobalMouseOut);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('mouseover', handleGlobalMouseOver);
      window.removeEventListener('mouseout', handleGlobalMouseOut);
    };
  }, [showLoader]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'toast' }} />
      <InteractiveBackground />
      <AnimatePresence mode="wait">
        {showLoader && (
          <IntroLoader
            onEnter={() => {
              setShowLoader(false);
              sessionStorage.setItem('cinema-us-entered', 'true');
            }}
          />
        )}
      </AnimatePresence>
      <Routes>
        <Route element={<Shell theme={theme} setTheme={setTheme} />}>
          <Route index element={<Landing />} />
          <Route path="watchlist" element={<OwnerWatchlist />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="settings" element={<SettingsPage theme={theme} setTheme={setTheme} />} />
        </Route>
        <Route path="/share/:token" element={<SharePage theme={theme} setTheme={setTheme} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function Shell({ theme, setTheme }) {
  const [audioActive, setAudioActive] = useState(() => !soundEngine.isMuted && soundEngine.isInitialized);

  const toggleAudio = () => {
    const active = soundEngine.toggle();
    setAudioActive(active);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand-mark">C&U</span>
          <span>Cinema & Us</span>
        </Link>
        <nav>
          {navItems.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <button className={`audio-wave-btn ${audioActive ? 'active' : ''}`} onClick={toggleAudio} aria-label="Toggle sound">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <rect x="3" y="10" width="2" height="4" fill="currentColor" className="bar bar-1" />
            <rect x="7" y="6" width="2" height="12" fill="currentColor" className="bar bar-2" />
            <rect x="11" y="3" width="2" height="18" fill="currentColor" className="bar bar-3" />
            <rect x="15" y="8" width="2" height="8" fill="currentColor" className="bar bar-4" />
            <rect x="19" y="11" width="2" height="2" fill="currentColor" className="bar bar-5" />
          </svg>
          <span>{audioActive ? 'Mute SFX' : 'Enable SFX'}</span>
        </button>

        <button className="icon-row" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </aside>
      <main className="page-wrap">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}

function Landing() {
  const navigate = useNavigate();
  const reels = [
    {
      num: 'Reel 01',
      title: 'The Scrapbook',
      desc: 'Explore your personal repository of cinema memories. Filter, search, and edit your journals.',
      path: '/watchlist',
      actionText: 'Open Archive'
    },
    {
      num: 'Reel 02',
      title: 'The Timeline',
      desc: 'A chronological log of your watch history, showing exactly when you added and completed entries.',
      path: '/timeline',
      actionText: 'View Timeline'
    },
    {
      num: 'Reel 03',
      title: 'The Calendar',
      desc: 'Visualize your movie nights plotted on a temporal map. Never forget a movie date.',
      path: '/calendar',
      actionText: 'Open Calendar'
    },
    {
      num: 'Reel 04',
      title: 'Preferences',
      desc: 'Manage your settings, toggle theme, export data as JSON/CSV/PDF, or restore backups.',
      path: '/settings',
      actionText: 'Adjust System'
    }
  ];

  return (
    <section className="hero-page">
      <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="eyebrow">// private film memory system</p>
        <h1>Cinema & Us</h1>
        <p className="subtitle">Every movie tells a story. Every memory deserves a place.</p>
      </motion.div>

      <div className="reels-showcase">
        {reels.map((r, idx) => (
          <motion.div 
            className="reel-card" 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            onClick={() => navigate(r.path)}
          >
            <div>
              <span className="card-number">{r.num}</span>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </div>
            <div className="card-action">
              {r.actionText} <FiShuffle />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function OwnerWatchlist() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState(defaultQuery);
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [list, statsData] = await Promise.all([
        watchlistApi.list({ page: 1, limit: 200, sort: query.sort }),
        metaApi.stats(),
      ]);
      setItems(list.items);
      setStats(statsData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load watchlist');
    } finally {
      setLoading(false);
    }
  }, [query.sort]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(false);
  }, [load]);

  const filtered = useMemo(() => filterLocal(items, query), [items, query]);

  const saveItem = async (values) => {
    try {
      if (modalItem?.id) {
        await watchlistApi.update(modalItem.id, toFormData(values));
        toast.success('Movie updated');
      } else {
        await watchlistApi.create(toFormData(values));
        toast.success('Movie added');
      }
      setModalOpen(false);
      setModalItem(null);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save item');
    }
  };

  const removeItem = async (item) => {
    if (!confirm(`Delete "${item.title}" from your scrapbook?`)) return;
    await watchlistApi.remove(item.id);
    toast.success('Movie deleted');
    load();
  };

  const patchStatus = async (item, status) => {
    await watchlistApi.status(item.id, status);
    toast.success('Status changed');
    load();
  };

  const toggleFavorite = async (item) => {
    const updated = await watchlistApi.favorite(item.id);
    toast.success(updated.favorite ? 'Favorite added' : 'Favorite removed');
    load();
  };

  const surprise = () => {
    if (!items.length) return;
    const pick = items[Math.floor(Math.random() * items.length)];
    toast(`Tonight's pick: ${pick.title}`, { icon: '*' });
  };

  return (
    <section className="content-page">
      <PageHeader eyebrow="owner archive" title="cinema memories" action={<button className="ghost-btn" onClick={surprise}><FiShuffle /> Surprise me</button>} />
      <StatsGrid stats={stats} loading={loading} />
      <Filters query={query} setQuery={setQuery} items={items} />
      {loading ? (
        <SkeletonGrid />
      ) : filtered.length ? (
        <motion.div className="watch-grid" layout>
          <AnimatePresence>
            {filtered.map((item) => (
              <WatchCard
                key={item.id}
                item={item}
                onEdit={() => {
                  setModalItem(item);
                  setModalOpen(true);
                }}
                onDelete={() => removeItem(item)}
                onStatus={(status) => patchStatus(item, status)}
                onFavorite={() => toggleFavorite(item)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <EmptyState onAdd={() => setModalOpen(true)} />
      )}
      <button className="floating-add" aria-label="Add movie" onClick={() => { setModalItem(null); setModalOpen(true); }}>
        <FiPlus />
      </button>
      <AnimatePresence>
        {modalOpen && <ItemModal initial={modalItem} onClose={() => setModalOpen(false)} onSave={saveItem} />}
      </AnimatePresence>
    </section>
  );
}

function StatsGrid({ stats, loading }) {
  const cards = [
    ['Total Movies', stats?.totalMovies ?? 0, FiFilm],
    ['Total Series', stats?.totalSeries ?? 0, FiArchive],
    ['Completed', stats?.statusCounts?.completed ?? 0, FiCheck],
    ['Watching', stats?.statusCounts?.watching ?? 0, FiEye],
    ['Not Watched', stats?.statusCounts?.notWatched ?? 0, FiCalendar],
    ['Favorites', stats?.favorites ?? 0, FiHeart],
    ['Average Rating', `${(stats?.averageRating ?? 0).toFixed(1)}/10`, FiStar],
    ['Recently Added', stats?.recentlyAdded?.length ?? 0, FiPlus],
  ];

  return (
    <div className="stats-grid">
      {cards.map(([label, value, Icon]) => (
        <motion.div className="stat-card glass" key={label} whileHover={{ y: -4 }}>
          <Icon />
          <span>{loading ? '...' : value}</span>
          <p>{label}</p>
        </motion.div>
      ))}
    </div>
  );
}

function Filters({ query, setQuery, items, readOnly = false }) {
  const set = (patch) => setQuery((current) => ({ ...current, ...patch }));
  return (
    <div className="filter-panel glass">
      <label className="search-box">
        <FiSearch />
        <input value={query.search} onChange={(event) => set({ search: event.target.value })} placeholder="Search title, genre, platform, mood" />
      </label>
      <div className="filter-row">
        <select value={query.type} onChange={(event) => set({ type: event.target.value })}>
          <option>All</option>
          {TYPES.map((type) => <option key={type}>{type}</option>)}
        </select>
        <select value={query.status} onChange={(event) => set({ status: event.target.value })}>
          <option>All</option>
          {STATUSES.map((status) => <option key={status}>{status}</option>)}
        </select>
        <select value={query.genre} onChange={(event) => set({ genre: event.target.value })}>
          <option value="">All genres</option>
          {unique(items, 'genre').map((value) => <option key={value}>{value}</option>)}
        </select>
        <select value={query.platform} onChange={(event) => set({ platform: event.target.value })}>
          <option value="">All platforms</option>
          {unique(items, 'platform').map((value) => <option key={value}>{value}</option>)}
        </select>
        <select value={query.mood} onChange={(event) => set({ mood: event.target.value })}>
          <option value="">All moods</option>
          {unique(items, 'mood').map((value) => <option key={value}>{value}</option>)}
        </select>
        <select value={query.sort} onChange={(event) => set({ sort: event.target.value })}>
          {SORTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button className={`chip-btn ${query.favorite ? 'active' : ''}`} onClick={() => set({ favorite: !query.favorite })}>
          <FiHeart /> Favorites
        </button>
        {readOnly && <span className="read-only-pill">Read-only share</span>}
      </div>
    </div>
  );
}

function WatchCard({ item, readOnly = false, onEdit, onDelete, onStatus, onFavorite }) {
  const [expanded, setExpanded] = useState(false);
  const completed = item.status === 'Completed';
  return (
    <motion.article className={`watch-card glass ${completed ? 'completed' : ''}`} layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} whileHover={{ y: -5 }}>
      <div className="poster">
        {item.poster ? <img src={assetUrl(item.poster)} alt={item.title} /> : <FiFilm />}
        {item.favorite && <span className="poster-heart"><FiHeart /></span>}
      </div>
      <div className="card-body">
        <div className="card-title-row">
          {!readOnly && (
            <button className={`check ${completed ? 'checked' : ''}`} onClick={() => onStatus(completed ? 'Watching' : 'Completed')} aria-label="Mark completed">
              {completed && <FiCheck />}
            </button>
          )}
          <div>
            <h3>{item.title}</h3>
            <div className="meta-line">
              <span>{item.type}</span>
              <span>{item.status}</span>
              {item.pinned && <span>Pinned</span>}
            </div>
          </div>
        </div>
        <Rating rating={item.rating} />
        <div className="tag-row">
          {item.genre && <span>{item.genre}</span>}
          {item.platform && <span>{item.platform}</span>}
          {item.mood && <span>{item.mood}</span>}
        </div>
        <p className="date-line">Added {formatDate(item.createdAt)}{item.watchedDate ? ` · Watched ${formatDate(item.watchedDate)}` : ''}</p>
        <button className="experience-toggle" onClick={() => setExpanded(!expanded)}>
          Personal experience <FiChevronDown className={expanded ? 'rotated' : ''} />
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div className="experience prose" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <ReactMarkdown>{item.experience || 'No journal entry yet.'}</ReactMarkdown>
            </motion.div>
          )}
        </AnimatePresence>
        {!readOnly && (
          <div className="card-actions">
            <button onClick={onFavorite} className={item.favorite ? 'danger-soft' : ''}><FiHeart /> {item.favorite ? 'Unfavorite' : 'Favorite'}</button>
            <button onClick={onEdit}><FiEdit3 /> Edit</button>
            <button onClick={onDelete} className="danger-soft"><FiTrash2 /> Delete</button>
          </div>
        )}
      </div>
    </motion.article>
  );
}

function Rating({ rating = 0 }) {
  const rounded = Math.round(rating);
  return (
    <div className="rating">
      <div aria-label={`${rating} out of 10`}>
        {Array.from({ length: 10 }, (_, index) => <FiStar key={index} className={index < rounded ? 'filled' : ''} />)}
      </div>
      <span>{rating}/10</span>
      <b style={{ width: `${rating * 10}%` }} />
    </div>
  );
}

function ItemModal({ initial, onClose, onSave }) {
  const draftKey = initial?.id ? `draft-${initial.id}` : 'draft-new';
  const [values, setValues] = useState(() => {
    const base = initial ? { ...emptyForm, ...initial, poster: null } : { ...emptyForm };
    const saved = !initial ? localStorage.getItem(draftKey) : '';
    return saved ? { ...base, experience: saved } : base;
  });
  const [preview, setPreview] = useState(initial?.poster ? assetUrl(initial.poster) : '');

  useEffect(() => {
    localStorage.setItem(draftKey, values.experience || '');
  }, [draftKey, values.experience]);

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (!values.title.trim()) return toast.error('Movie/Series name is required');
    onSave(values);
  };

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.form className="item-modal glass" onSubmit={submit} initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">{initial ? 'Edit memory' : 'New memory'}</p>
            <h2>{initial ? 'Polish this entry' : 'Add to the scrapbook'}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}><FiX /></button>
        </div>
        <div className="form-grid">
          <label>Movie/Series Name<input value={values.title} onChange={(e) => update('title', e.target.value)} required /></label>
          <label>Type<select value={values.type} onChange={(e) => update('type', e.target.value)}>{TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label>Rating: {values.rating}/10<input type="range" min="1" max="10" value={values.rating} onChange={(e) => update('rating', e.target.value)} /></label>
          <label>Status<select value={values.status} onChange={(e) => update('status', e.target.value)}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label>Genre<input value={values.genre || ''} onChange={(e) => update('genre', e.target.value)} /></label>
          <label>Mood<input value={values.mood || ''} onChange={(e) => update('mood', e.target.value)} /></label>
          <label>OTT Platform<input value={values.platform || ''} onChange={(e) => update('platform', e.target.value)} /></label>
          <label>Watch date<input type="date" value={values.watchedDate || ''} onChange={(e) => update('watchedDate', e.target.value)} /></label>
          <label className="wide">Personal Experience<textarea value={values.experience || ''} onChange={(e) => update('experience', e.target.value)} rows="8" /></label>
          <label className="upload-box">
            <FiUpload />
            Poster upload
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                update('poster', file);
                setPreview(URL.createObjectURL(file));
              }
            }} />
          </label>
          {preview && <img className="poster-preview" src={preview} alt="Poster preview" />}
          <label className="toggle-line"><input type="checkbox" checked={values.favorite} onChange={(e) => update('favorite', e.target.checked)} /> Favorite</label>
          <label className="toggle-line"><input type="checkbox" checked={values.pinned} onChange={(e) => update('pinned', e.target.checked)} /> Pin important movie</label>
        </div>
        <div className="modal-actions">
          <button type="button" className="ghost-btn" onClick={onClose}>Cancel</button>
          <button className="primary-btn" type="submit"><FiCheck /> Save</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function TimelinePage() {
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    metaApi.timeline().then(setGroups).catch(() => toast.error('Timeline could not load'));
  }, []);
  return (
    <section className="content-page">
      <PageHeader eyebrow="activity" title="timeline" />
      <div className="timeline">
        {groups.map((group) => (
          <div key={group.label} className="timeline-group">
            <h3>{group.label}</h3>
            {group.items.map((item) => (
              <div className="timeline-item glass" key={item.id}>
                <FiFilm />
                <span>{item.status === 'Completed' ? 'Completed' : 'Added'} {item.title}</span>
                <small>{formatDate(item.createdAt)}</small>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function CalendarPage() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    watchlistApi.list({ limit: 200 }).then((data) => setItems(data.items)).catch(() => toast.error('Calendar could not load'));
  }, []);
  const days = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      const key = (item.watchedDate || item.createdAt || '').slice(0, 10);
      if (!key) return;
      map[key] = [...(map[key] || []), item];
    });
    return map;
  }, [items]);
  return (
    <section className="content-page">
      <PageHeader eyebrow="dates" title="calendar view" />
      <div className="calendar-grid">
        {Object.entries(days).map(([day, dayItems]) => (
          <div className="calendar-day glass" key={day}>
            <strong>{formatDate(day)}</strong>
            {dayItems.map((item) => <span key={item.id}>{item.title}</span>)}
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsPage({ theme, setTheme }) {
  const [share, setShare] = useState(null);
  const fileRef = useRef(null);
  const loadShare = () => metaApi.shareStatus().then(setShare).catch(() => toast.error('Share settings could not load'));
  useEffect(() => { loadShare(); }, []);

  const copyLink = async () => {
    const link = `${window.location.origin}/share/${share.shareToken}`;
    await navigator.clipboard.writeText(link);
    toast.success('Share link copied');
  };

  return (
    <section className="content-page">
      <PageHeader eyebrow="preferences" title="settings" />
      <div className="settings-grid">
        <div className="settings-card glass">
          <h3>Theme</h3>
          <div className="segmented">
            <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}><FiMoon /> Dark</button>
            <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}><FiSun /> Light</button>
          </div>
        </div>
        <div className="settings-card glass">
          <h3>Share mode</h3>
          <p>Generate a read-only link.</p>
          <button className="primary-btn" onClick={async () => { setShare(await metaApi.toggleShare()); toast.success('Sharing updated'); }}>
            <FiShare2 /> {share?.shareEnabled ? 'Disable sharing' : 'Enable sharing'}
          </button>
          {share?.shareEnabled && <button className="ghost-btn" onClick={copyLink}>Copy share link</button>}
        </div>
        <div className="settings-card glass">
          <h3>Export data</h3>
          <div className="button-row">
            {['json', 'csv', 'pdf'].map((type) => (
              <a className="ghost-btn" key={type} href={transferApi.downloadUrl(type)}><FiDownload /> {type.toUpperCase()}</a>
            ))}
          </div>
        </div>
        <div className="settings-card glass">
          <h3>Import / restore</h3>
          <input ref={fileRef} hidden type="file" accept="application/json" onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const result = await transferApi.importJson(file);
            toast.success(`Imported ${result.imported} memories`);
          }} />
          <button className="ghost-btn" onClick={() => fileRef.current?.click()}><FiUpload /> Import JSON</button>
        </div>
        <div className="settings-card glass danger-zone">
          <h3>Clear all data</h3>
          <p>This removes every watchlist item from the local database.</p>
          <button className="danger-btn" onClick={async () => {
            if (!confirm('Clear all saved memories?')) return;
            await metaApi.clearAll();
            toast.success('All data cleared');
          }}><FiTrash2 /> Clear all</button>
        </div>
      </div>
    </section>
  );
}

function SharePage({ theme, setTheme }) {
  const { token } = useParams();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState(defaultQuery);
  const [error, setError] = useState('');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    metaApi.shared(token).then(setItems).catch((err) => setError(err.response?.data?.message || 'This shared watchlist is unavailable'));
  }, [theme, token]);
  const filtered = useMemo(() => filterLocal(items, query), [items, query]);
  return (
    <main className="share-page">
      <header className="share-head">
        <div>
          <p className="eyebrow">shared archive</p>
          <h1>Cinema & Us</h1>
        </div>
        <button className="icon-row" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <FiSun /> : <FiMoon />}</button>
      </header>
      {error ? <div className="empty-state glass"><h2>{error}</h2></div> : (
        <>
          <Filters query={query} setQuery={setQuery} items={items} readOnly />
          <div className="watch-grid">
            {filtered.map((item) => <WatchCard key={item.id} item={item} readOnly />)}
          </div>
        </>
      )}
    </main>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="empty-state glass">
      <div className="empty-illustration">+</div>
      <h2>No memories yet.</h2>
      <p>Start adding movies and create your own cinematic scrapbook.</p>
      <button className="primary-btn" onClick={onAdd}><FiPlus /> Add Your First Movie</button>
    </div>
  );
}

function SkeletonGrid() {
  return <div className="watch-grid">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton glass" />)}</div>;
}

function PageHeader({ eyebrow, title, action }) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {action}
    </header>
  );
}

function NotFound() {
  return (
    <main className="not-found">
      <h1>404</h1>
      <p>This memory reel does not exist.</p>
      <Link className="primary-btn" to="/">Go home</Link>
    </main>
  );
}

function formatDate(date) {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default App;
