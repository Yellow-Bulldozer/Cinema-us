export const STATUSES = ['Not Watched', 'Watching', 'Completed'];
export const TYPES = ['Movie', 'Series'];
export const SORTS = [
  ['newest', 'Newest'],
  ['oldest', 'Oldest'],
  ['highest', 'Highest Rated'],
  ['lowest', 'Lowest Rated'],
  ['az', 'Alphabetical A-Z'],
  ['za', 'Alphabetical Z-A'],
];

export const emptyForm = {
  title: '',
  type: 'Movie',
  rating: 8,
  experience: '',
  genre: '',
  mood: '',
  platform: '',
  watchedDate: '',
  status: 'Not Watched',
  favorite: false,
  pinned: false,
  poster: null,
};

export const toFormData = (values) => {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== null && value !== undefined) formData.append(key, value);
  });
  return formData;
};

export const filterLocal = (items, query) => {
  const text = query.search.toLowerCase();
  return items
    .filter((item) => {
      const matchesSearch = !text || [item.title, item.genre, item.platform, item.mood].some((value) => value?.toLowerCase().includes(text));
      const matchesType = query.type === 'All' || item.type === query.type;
      const matchesStatus = query.status === 'All' || item.status === query.status;
      const matchesFavorite = !query.favorite || item.favorite;
      const matchesGenre = !query.genre || item.genre === query.genre;
      const matchesPlatform = !query.platform || item.platform === query.platform;
      const matchesMood = !query.mood || item.mood === query.mood;
      return matchesSearch && matchesType && matchesStatus && matchesFavorite && matchesGenre && matchesPlatform && matchesMood;
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
      if (a.favorite !== b.favorite) return Number(b.favorite) - Number(a.favorite);
      if (query.sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (query.sort === 'highest') return b.rating - a.rating;
      if (query.sort === 'lowest') return a.rating - b.rating;
      if (query.sort === 'az') return a.title.localeCompare(b.title);
      if (query.sort === 'za') return b.title.localeCompare(a.title);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
};

export const unique = (items, key) => [...new Set(items.map((item) => item[key]).filter(Boolean))];
