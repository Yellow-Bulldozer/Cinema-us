import prisma from '../config/prisma.js';

const getDateLabel = (date) => {
  const now = new Date();
  const itemDate = new Date(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  if (itemDate >= today) return 'Today';
  if (itemDate >= yesterday) return 'Yesterday';
  if (itemDate >= weekAgo) return 'This Week';
  if (itemDate >= monthAgo) return 'This Month';
  return 'Earlier';
};

export const getTimeline = async () => {
  const items = await prisma.watchItem.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const groups = {};
  const order = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier'];

  for (const label of order) {
    groups[label] = [];
  }

  for (const item of items) {
    const label = getDateLabel(item.createdAt);
    groups[label].push(item);
  }

  return order
    .filter((label) => groups[label].length > 0)
    .map((label) => ({ label, items: groups[label] }));
};
