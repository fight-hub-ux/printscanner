// Miauswap CDEX — Single source of truth for all dummy data

export interface Creator {
  id: string;
  name: string;
  slug: string;
  catSymbol: string;
  score: number;
  scoreTier: 'Platinum' | 'Gold' | 'Silver';
  currentPrice: number;
  priceChange24h: number;
  annualYield: number;
  monthlyRevenue: number;
  weeklyDistributionETH: number;
  subscribers: number;
  memberSince: string;
  catsIssued: number;
  totalETHPaid: number;
  foundersIssued: number;
  foundersRemaining: number;
  limitedIssued: number;
  limitedRemaining: number;
  standardIssued: number;
  standardRemaining: number;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  tagline: string;
}

export const creators: Creator[] = [
  {
    id: '1',
    name: 'Nella Rose',
    slug: 'nella-rose',
    catSymbol: 'NellaCAT',
    score: 85,
    scoreTier: 'Gold',
    currentPrice: 100,
    priceChange24h: 3.2,
    annualYield: 14.4,
    monthlyRevenue: 12400,
    weeklyDistributionETH: 0.0028,
    subscribers: 3200,
    memberSince: 'Sep 2025',
    catsIssued: 120,
    totalETHPaid: 3.384,
    foundersIssued: 10,
    foundersRemaining: 0,
    limitedIssued: 40,
    limitedRemaining: 12,
    standardIssued: 70,
    standardRemaining: 38,
    initials: 'NR',
    gradientFrom: '#FFB2D0',
    gradientTo: '#E8739A',
    tagline: 'Lifestyle & Wellness Creator | 3,200 active subscribers | $12,400 avg monthly revenue',
  },
  {
    id: '2',
    name: 'Jade Valentine',
    slug: 'jade-valentine',
    catSymbol: 'JadeCAT',
    score: 62,
    scoreTier: 'Silver',
    currentPrice: 78,
    priceChange24h: -1.1,
    annualYield: 11.8,
    monthlyRevenue: 8200,
    weeklyDistributionETH: 0.0019,
    subscribers: 1800,
    memberSince: 'Oct 2025',
    catsIssued: 100,
    totalETHPaid: 1.92,
    foundersIssued: 10,
    foundersRemaining: 0,
    limitedIssued: 30,
    limitedRemaining: 8,
    standardIssued: 60,
    standardRemaining: 22,
    initials: 'JV',
    gradientFrom: '#C4456B',
    gradientTo: '#8B6B61',
    tagline: 'Fashion & Beauty Creator | 1,800 active subscribers | $8,200 avg monthly revenue',
  },
  {
    id: '3',
    name: 'Mia Storm',
    slug: 'mia-storm',
    catSymbol: 'MiaCAT',
    score: 94,
    scoreTier: 'Platinum',
    currentPrice: 145,
    priceChange24h: 6.7,
    annualYield: 18.2,
    monthlyRevenue: 21000,
    weeklyDistributionETH: 0.0048,
    subscribers: 5400,
    memberSince: 'Jul 2025',
    catsIssued: 150,
    totalETHPaid: 5.76,
    foundersIssued: 10,
    foundersRemaining: 0,
    limitedIssued: 40,
    limitedRemaining: 5,
    standardIssued: 100,
    standardRemaining: 30,
    initials: 'MS',
    gradientFrom: '#E8739A',
    gradientTo: '#C4456B',
    tagline: 'Fitness & Lifestyle Creator | 5,400 active subscribers | $21,000 avg monthly revenue',
  },
  {
    id: '4',
    name: 'Luna Skye',
    slug: 'luna-skye',
    catSymbol: 'LunaCAT',
    score: 53,
    scoreTier: 'Silver',
    currentPrice: 52,
    priceChange24h: 0.8,
    annualYield: 9.6,
    monthlyRevenue: 4100,
    weeklyDistributionETH: 0.001,
    subscribers: 920,
    memberSince: 'Nov 2025',
    catsIssued: 80,
    totalETHPaid: 0.96,
    foundersIssued: 10,
    foundersRemaining: 2,
    limitedIssued: 20,
    limitedRemaining: 10,
    standardIssued: 50,
    standardRemaining: 28,
    initials: 'LS',
    gradientFrom: '#F5EDE8',
    gradientTo: '#FFB2D0',
    tagline: 'Art & Photography Creator | 920 active subscribers | $4,100 avg monthly revenue',
  },
  {
    id: '5',
    name: 'Coco Blaze',
    slug: 'coco-blaze',
    catSymbol: 'CocoCAT',
    score: 91,
    scoreTier: 'Platinum',
    currentPrice: 210,
    priceChange24h: 2.1,
    annualYield: 21.0,
    monthlyRevenue: 32000,
    weeklyDistributionETH: 0.0074,
    subscribers: 8200,
    memberSince: 'Jun 2025',
    catsIssued: 180,
    totalETHPaid: 8.88,
    foundersIssued: 10,
    foundersRemaining: 0,
    limitedIssued: 40,
    limitedRemaining: 3,
    standardIssued: 130,
    standardRemaining: 42,
    initials: 'CB',
    gradientFrom: '#C4456B',
    gradientTo: '#FFB2D0',
    tagline: 'Entertainment & Lifestyle Creator | 8,200 active subscribers | $32,000 avg monthly revenue',
  },
  {
    id: '6',
    name: 'Ivy Monroe',
    slug: 'ivy-monroe',
    catSymbol: 'IvyCAT',
    score: 71,
    scoreTier: 'Gold',
    currentPrice: 67,
    priceChange24h: -2.3,
    annualYield: 10.4,
    monthlyRevenue: 6800,
    weeklyDistributionETH: 0.0016,
    subscribers: 1400,
    memberSince: 'Oct 2025',
    catsIssued: 90,
    totalETHPaid: 1.44,
    foundersIssued: 10,
    foundersRemaining: 0,
    limitedIssued: 30,
    limitedRemaining: 10,
    standardIssued: 50,
    standardRemaining: 18,
    initials: 'IM',
    gradientFrom: '#E8739A',
    gradientTo: '#F5EDE8',
    tagline: 'Music & Dance Creator | 1,400 active subscribers | $6,800 avg monthly revenue',
  },
  {
    id: '7',
    name: 'Nova Reign',
    slug: 'nova-reign',
    catSymbol: 'NovaCAT',
    score: 78,
    scoreTier: 'Gold',
    currentPrice: 88,
    priceChange24h: 4.5,
    annualYield: 13.2,
    monthlyRevenue: 9500,
    weeklyDistributionETH: 0.0022,
    subscribers: 2100,
    memberSince: 'Aug 2025',
    catsIssued: 110,
    totalETHPaid: 2.64,
    foundersIssued: 10,
    foundersRemaining: 0,
    limitedIssued: 35,
    limitedRemaining: 7,
    standardIssued: 65,
    standardRemaining: 25,
    initials: 'NV',
    gradientFrom: '#FFB2D0',
    gradientTo: '#C4456B',
    tagline: 'Travel & Adventure Creator | 2,100 active subscribers | $9,500 avg monthly revenue',
  },
  {
    id: '8',
    name: 'Aria Voss',
    slug: 'aria-voss',
    catSymbol: 'AriaCAT',
    score: 55,
    scoreTier: 'Silver',
    currentPrice: 33,
    priceChange24h: 1.2,
    annualYield: 8.8,
    monthlyRevenue: 2800,
    weeklyDistributionETH: 0.0006,
    subscribers: 620,
    memberSince: 'Dec 2025',
    catsIssued: 60,
    totalETHPaid: 0.48,
    foundersIssued: 10,
    foundersRemaining: 4,
    limitedIssued: 20,
    limitedRemaining: 14,
    standardIssued: 30,
    standardRemaining: 22,
    initials: 'AV',
    gradientFrom: '#FEE8EF',
    gradientTo: '#E8739A',
    tagline: 'Cooking & Food Creator | 620 active subscribers | $2,800 avg monthly revenue',
  },
];

// Generate realistic price chart data
export function generatePriceData(basePrice: number, days: number, volatility: number = 0.08): { time: string; price: number; volume: number }[] {
  const data: { time: string; price: number; volume: number }[] = [];
  let price = basePrice * (1 - volatility * 2);
  const now = new Date();
  const hoursPerDay = days <= 1 ? 12 : days <= 7 ? 4 : 1;
  const totalPoints = days * (24 / hoursPerDay);

  for (let i = 0; i < totalPoints; i++) {
    const date = new Date(now.getTime() - (totalPoints - i) * hoursPerDay * 3600000);
    const change = (Math.random() - 0.45) * volatility * price;
    price = Math.max(price * 0.7, Math.min(price * 1.3, price + change));
    const trendBias = (i / totalPoints) * volatility * basePrice * 0.5;
    price += trendBias / totalPoints;

    data.push({
      time: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      price: Math.round(price * 100) / 100,
      volume: Math.round(Math.random() * 500 + 100),
    });
  }

  // Ensure last point is close to basePrice
  if (data.length > 0) {
    data[data.length - 1].price = basePrice;
  }

  return data;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export const askOrders: OrderBookEntry[] = [
  { price: 107, quantity: 15, total: 1605 },
  { price: 105, quantity: 30, total: 3150 },
  { price: 104, quantity: 8, total: 832 },
  { price: 103, quantity: 50, total: 5150 },
  { price: 102, quantity: 22, total: 2244 },
  { price: 101.5, quantity: 35, total: 3552 },
  { price: 101.2, quantity: 18, total: 1821 },
  { price: 101, quantity: 42, total: 4242 },
];

export const bidOrders: OrderBookEntry[] = [
  { price: 98, quantity: 50, total: 4900 },
  { price: 97, quantity: 100, total: 9700 },
  { price: 96, quantity: 75, total: 7200 },
  { price: 95, quantity: 40, total: 3800 },
  { price: 94, quantity: 120, total: 11280 },
  { price: 93.5, quantity: 55, total: 5142 },
  { price: 93, quantity: 80, total: 7440 },
  { price: 92, quantity: 60, total: 5520 },
];

export interface RecentTrade {
  id: string;
  time: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
}

export const recentTrades: RecentTrade[] = [
  { id: '1', time: '14:32:18', price: 100, quantity: 5, side: 'buy' },
  { id: '2', time: '14:31:45', price: 99.5, quantity: 3, side: 'sell' },
  { id: '3', time: '14:30:22', price: 100.2, quantity: 8, side: 'buy' },
  { id: '4', time: '14:28:56', price: 99.8, quantity: 2, side: 'sell' },
  { id: '5', time: '14:27:33', price: 100.5, quantity: 12, side: 'buy' },
  { id: '6', time: '14:26:10', price: 100, quantity: 6, side: 'buy' },
  { id: '7', time: '14:24:44', price: 99.2, quantity: 4, side: 'sell' },
  { id: '8', time: '14:23:18', price: 99.5, quantity: 10, side: 'buy' },
  { id: '9', time: '14:21:55', price: 98.8, quantity: 7, side: 'sell' },
  { id: '10', time: '14:20:30', price: 99.0, quantity: 15, side: 'buy' },
  { id: '11', time: '14:18:12', price: 98.5, quantity: 3, side: 'sell' },
  { id: '12', time: '14:16:48', price: 99.2, quantity: 9, side: 'buy' },
  { id: '13', time: '14:15:22', price: 98.0, quantity: 5, side: 'sell' },
  { id: '14', time: '14:13:55', price: 98.8, quantity: 20, side: 'buy' },
  { id: '15', time: '14:12:10', price: 97.5, quantity: 8, side: 'sell' },
];

export interface OpenOrder {
  id: string;
  pair: string;
  type: 'Limit' | 'Market';
  side: 'Buy' | 'Sell';
  price: number;
  quantity: number;
  filled: number;
  status: 'Pending' | 'Partial' | 'Filled';
}

export const initialOpenOrders: OpenOrder[] = [
  { id: 'ord-1', pair: 'NellaCAT/MIAU', type: 'Limit', side: 'Buy', price: 95, quantity: 8, filled: 3, status: 'Partial' },
  { id: 'ord-2', pair: 'MiaCAT/MIAU', type: 'Limit', side: 'Buy', price: 140, quantity: 5, filled: 0, status: 'Pending' },
  { id: 'ord-3', pair: 'CocoCAT/MIAU', type: 'Limit', side: 'Sell', price: 220, quantity: 2, filled: 0, status: 'Pending' },
];

export interface PortfolioHolding {
  id: string;
  creatorName: string;
  catSymbol: string;
  edition: 'Founders' | 'Limited' | 'Standard';
  catsHeld: number;
  avgBuyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  weeklyETHYield: number;
  creatorSlug: string;
}

export const portfolioHoldings: PortfolioHolding[] = [
  { id: 'h1', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'Standard', catsHeld: 5, avgBuyPrice: 85, currentPrice: 100, pnl: 75, pnlPercent: 17.6, weeklyETHYield: 0.014, creatorSlug: 'nella-rose' },
  { id: 'h2', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'Limited', catsHeld: 3, avgBuyPrice: 128, currentPrice: 140, pnl: 36, pnlPercent: 9.4, weeklyETHYield: 0.008, creatorSlug: 'nella-rose' },
  { id: 'h3', creatorName: 'Mia Storm', catSymbol: 'MiaCAT', edition: 'Standard', catsHeld: 3, avgBuyPrice: 130, currentPrice: 145, pnl: 45, pnlPercent: 11.5, weeklyETHYield: 0.016, creatorSlug: 'mia-storm' },
  { id: 'h4', creatorName: 'Coco Blaze', catSymbol: 'CocoCAT', edition: 'Standard', catsHeld: 2, avgBuyPrice: 198, currentPrice: 210, pnl: 24, pnlPercent: 6.1, weeklyETHYield: 0.019, creatorSlug: 'coco-blaze' },
  { id: 'h5', creatorName: 'Nova Reign', catSymbol: 'NovaCAT', edition: 'Limited', catsHeld: 2, avgBuyPrice: 75, currentPrice: 88, pnl: 26, pnlPercent: 17.3, weeklyETHYield: 0.007, creatorSlug: 'nova-reign' },
  { id: 'h6', creatorName: 'Nova Reign', catSymbol: 'NovaCAT', edition: 'Standard', catsHeld: 3, avgBuyPrice: 72, currentPrice: 88, pnl: 48, pnlPercent: 22.2, weeklyETHYield: 0.010, creatorSlug: 'nova-reign' },
];

export interface WeeklyDistribution {
  id: string;
  weekOf: string;
  creatorName: string;
  catSymbol: string;
  edition: string;
  grossRevenue: number;
  netRevenue: number;
  distributionPerCAT: number;
  totalETH: number;
  status: 'Paid' | 'Pending';
}

export const nellaDistributions: WeeklyDistribution[] = [
  { id: 'nd1', weekOf: 'Feb 17', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'All', grossRevenue: 14200, netRevenue: 12586, distributionPerCAT: 0.00315, totalETH: 0.378, status: 'Paid' },
  { id: 'nd2', weekOf: 'Feb 10', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'All', grossRevenue: 13800, netRevenue: 12222, distributionPerCAT: 0.00306, totalETH: 0.367, status: 'Paid' },
  { id: 'nd3', weekOf: 'Feb 3', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'All', grossRevenue: 12400, netRevenue: 10984, distributionPerCAT: 0.00274, totalETH: 0.329, status: 'Paid' },
  { id: 'nd4', weekOf: 'Jan 27', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'All', grossRevenue: 11900, netRevenue: 10541, distributionPerCAT: 0.00264, totalETH: 0.317, status: 'Paid' },
  { id: 'nd5', weekOf: 'Jan 20', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'All', grossRevenue: 13200, netRevenue: 11688, distributionPerCAT: 0.00292, totalETH: 0.350, status: 'Paid' },
  { id: 'nd6', weekOf: 'Jan 13', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'All', grossRevenue: 12700, netRevenue: 11247, distributionPerCAT: 0.00281, totalETH: 0.337, status: 'Paid' },
  { id: 'nd7', weekOf: 'Jan 6', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'All', grossRevenue: 10400, netRevenue: 9214, distributionPerCAT: 0.00230, totalETH: 0.276, status: 'Paid' },
  { id: 'nd8', weekOf: 'Dec 30', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'All', grossRevenue: 9800, netRevenue: 8682, distributionPerCAT: 0.00217, totalETH: 0.260, status: 'Paid' },
];

export const portfolioDistributions: WeeklyDistribution[] = [
  { id: 'pd1', weekOf: 'Mon 17 Feb', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'Standard', grossRevenue: 14200, netRevenue: 12586, distributionPerCAT: 0.00315, totalETH: 0.01575, status: 'Paid' },
  { id: 'pd2', weekOf: 'Mon 17 Feb', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'Limited', grossRevenue: 14200, netRevenue: 12586, distributionPerCAT: 0.00315, totalETH: 0.00945, status: 'Paid' },
  { id: 'pd3', weekOf: 'Mon 17 Feb', creatorName: 'Mia Storm', catSymbol: 'MiaCAT', edition: 'Standard', grossRevenue: 22000, netRevenue: 19580, distributionPerCAT: 0.00510, totalETH: 0.01530, status: 'Paid' },
  { id: 'pd4', weekOf: 'Mon 17 Feb', creatorName: 'Coco Blaze', catSymbol: 'CocoCAT', edition: 'Standard', grossRevenue: 34000, netRevenue: 30260, distributionPerCAT: 0.00940, totalETH: 0.01880, status: 'Paid' },
  { id: 'pd5', weekOf: 'Mon 17 Feb', creatorName: 'Nova Reign', catSymbol: 'NovaCAT', edition: 'Limited', grossRevenue: 10200, netRevenue: 9078, distributionPerCAT: 0.00350, totalETH: 0.00700, status: 'Paid' },
  { id: 'pd6', weekOf: 'Mon 17 Feb', creatorName: 'Nova Reign', catSymbol: 'NovaCAT', edition: 'Standard', grossRevenue: 10200, netRevenue: 9078, distributionPerCAT: 0.00350, totalETH: 0.01050, status: 'Paid' },
  { id: 'pd7', weekOf: 'Mon 10 Feb', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'Standard', grossRevenue: 13800, netRevenue: 12222, distributionPerCAT: 0.00306, totalETH: 0.01530, status: 'Paid' },
  { id: 'pd8', weekOf: 'Mon 10 Feb', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'Limited', grossRevenue: 13800, netRevenue: 12222, distributionPerCAT: 0.00306, totalETH: 0.00918, status: 'Paid' },
  { id: 'pd9', weekOf: 'Mon 10 Feb', creatorName: 'Mia Storm', catSymbol: 'MiaCAT', edition: 'Standard', grossRevenue: 20500, netRevenue: 18245, distributionPerCAT: 0.00475, totalETH: 0.01425, status: 'Paid' },
  { id: 'pd10', weekOf: 'Mon 10 Feb', creatorName: 'Coco Blaze', catSymbol: 'CocoCAT', edition: 'Standard', grossRevenue: 31000, netRevenue: 27590, distributionPerCAT: 0.00855, totalETH: 0.01710, status: 'Paid' },
  { id: 'pd11', weekOf: 'Mon 10 Feb', creatorName: 'Nova Reign', catSymbol: 'NovaCAT', edition: 'Limited', grossRevenue: 9800, netRevenue: 8722, distributionPerCAT: 0.00335, totalETH: 0.00670, status: 'Paid' },
  { id: 'pd12', weekOf: 'Mon 10 Feb', creatorName: 'Nova Reign', catSymbol: 'NovaCAT', edition: 'Standard', grossRevenue: 9800, netRevenue: 8722, distributionPerCAT: 0.00335, totalETH: 0.01005, status: 'Paid' },
  { id: 'pd13', weekOf: 'Mon 3 Feb', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'Standard', grossRevenue: 12400, netRevenue: 10984, distributionPerCAT: 0.00274, totalETH: 0.01370, status: 'Paid' },
  { id: 'pd14', weekOf: 'Mon 3 Feb', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'Limited', grossRevenue: 12400, netRevenue: 10984, distributionPerCAT: 0.00274, totalETH: 0.00822, status: 'Paid' },
  { id: 'pd15', weekOf: 'Mon 3 Feb', creatorName: 'Mia Storm', catSymbol: 'MiaCAT', edition: 'Standard', grossRevenue: 19800, netRevenue: 17622, distributionPerCAT: 0.00459, totalETH: 0.01377, status: 'Paid' },
  { id: 'pd16', weekOf: 'Mon 3 Feb', creatorName: 'Coco Blaze', catSymbol: 'CocoCAT', edition: 'Standard', grossRevenue: 29500, netRevenue: 26255, distributionPerCAT: 0.00814, totalETH: 0.01628, status: 'Paid' },
  { id: 'pd17', weekOf: 'Mon 3 Feb', creatorName: 'Nova Reign', catSymbol: 'NovaCAT', edition: 'Limited', grossRevenue: 9200, netRevenue: 8188, distributionPerCAT: 0.00315, totalETH: 0.00630, status: 'Paid' },
  { id: 'pd18', weekOf: 'Mon 3 Feb', creatorName: 'Nova Reign', catSymbol: 'NovaCAT', edition: 'Standard', grossRevenue: 9200, netRevenue: 8188, distributionPerCAT: 0.00315, totalETH: 0.00945, status: 'Paid' },
  { id: 'pd19', weekOf: 'Mon 27 Jan', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'Standard', grossRevenue: 11900, netRevenue: 10541, distributionPerCAT: 0.00264, totalETH: 0.01320, status: 'Paid' },
  { id: 'pd20', weekOf: 'Mon 27 Jan', creatorName: 'Nella Rose', catSymbol: 'NellaCAT', edition: 'Limited', grossRevenue: 11900, netRevenue: 10541, distributionPerCAT: 0.00264, totalETH: 0.00792, status: 'Paid' },
];

export interface WalletTransaction {
  id: string;
  date: string;
  type: 'Buy' | 'Sell' | 'Distribution Received' | 'Staking Deposit' | 'USDC Staking Reward';
  amount: string;
  pair: string;
  fee: string;
  status: 'Confirmed' | 'Pending';
}

export const walletTransactions: WalletTransaction[] = [
  { id: 't1', date: '23 Feb 2026', type: 'Buy', amount: '5 NellaCAT', pair: 'NellaCAT/MIAU', fee: '1.06 MIAU', status: 'Confirmed' },
  { id: 't2', date: '17 Feb 2026', type: 'Distribution Received', amount: '0.01575 ETH', pair: 'NellaCAT', fee: '—', status: 'Confirmed' },
  { id: 't3', date: '17 Feb 2026', type: 'Distribution Received', amount: '0.00945 ETH', pair: 'NellaCAT', fee: '—', status: 'Confirmed' },
  { id: 't4', date: '17 Feb 2026', type: 'Distribution Received', amount: '0.01530 ETH', pair: 'MiaCAT', fee: '—', status: 'Confirmed' },
  { id: 't5', date: '17 Feb 2026', type: 'Distribution Received', amount: '0.01880 ETH', pair: 'CocoCAT', fee: '—', status: 'Confirmed' },
  { id: 't6', date: '17 Feb 2026', type: 'Distribution Received', amount: '0.00700 ETH', pair: 'NovaCAT', fee: '—', status: 'Confirmed' },
  { id: 't7', date: '17 Feb 2026', type: 'Distribution Received', amount: '0.01050 ETH', pair: 'NovaCAT', fee: '—', status: 'Confirmed' },
  { id: 't8', date: '15 Feb 2026', type: 'Buy', amount: '2 CocoCAT', pair: 'CocoCAT/MIAU', fee: '0.95 MIAU', status: 'Confirmed' },
  { id: 't9', date: '12 Feb 2026', type: 'Buy', amount: '3 NovaCAT', pair: 'NovaCAT/MIAU', fee: '0.49 MIAU', status: 'Confirmed' },
  { id: 't10', date: '10 Feb 2026', type: 'Distribution Received', amount: '0.01530 ETH', pair: 'NellaCAT', fee: '—', status: 'Confirmed' },
  { id: 't11', date: '1 Feb 2026', type: 'USDC Staking Reward', amount: '208.33 USDC', pair: '—', fee: '—', status: 'Confirmed' },
  { id: 't12', date: '28 Jan 2026', type: 'Staking Deposit', amount: '50,000 MIAU', pair: '—', fee: '—', status: 'Confirmed' },
  { id: 't13', date: '25 Jan 2026', type: 'Buy', amount: '3 MiaCAT', pair: 'MiaCAT/MIAU', fee: '0.88 MIAU', status: 'Confirmed' },
  { id: 't14', date: '20 Jan 2026', type: 'Buy', amount: '2 NovaCAT', pair: 'NovaCAT/MIAU', fee: '0.34 MIAU', status: 'Confirmed' },
  { id: 't15', date: '18 Jan 2026', type: 'Buy', amount: '3 NellaCAT', pair: 'NellaCAT/MIAU', fee: '0.86 MIAU', status: 'Confirmed' },
];

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning';
  message: string;
  time: string;
  read: boolean;
}

export const initialNotifications: Notification[] = [
  { id: 'n1', type: 'success', message: 'Weekly distribution received: 0.014 ETH from NellaCAT', time: '2 hours ago', read: false },
  { id: 'n2', type: 'info', message: 'Your limit order partially filled: 3/8 NellaCATs at 98 MIAU', time: '5 hours ago', read: false },
  { id: 'n3', type: 'warning', message: 'New CAT listing: CocoCAT Limited Edition — 12 remaining', time: '1 day ago', read: false },
];

// Market stats for Discover page
export const marketStats = {
  totalCATsListed: 47,
  volume24h: 128450,
  totalMarketCap: 4200000,
  activeInvestors: 892,
  weeklyDistributionsPaid: 74250,
};

// Portfolio summary calculations
export const portfolioSummary = {
  totalValue: 12450,
  totalETHReceived: 3.24,
  unrealisedPnL: 1850,
  unrealisedPnLPercent: 17.4,
  miauBalance: 4250,
  stakedAmount: 50000,
  stakingTier: 'Silver' as const,
  stakingLockExpiry: 'Apr 26, 2026',
  feeDiscount: 10,
};

// MIAU Token stats
export const miauTokenStats = {
  price: 1.0,
  priceChange24h: 0.8,
  marketCap: 1000000000,
  circulatingSupply: 650000000,
  totalBurned: 2400000,
  totalSupply: 1000000000,
};

// Portfolio performance data for chart
export const portfolioPerformanceData = Array.from({ length: 90 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (90 - i));
  const baseValue = 8000 + (i / 90) * 4450;
  const noise = (Math.random() - 0.4) * 800;
  return {
    date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    value: Math.round(baseValue + noise),
    distributions: i % 7 === 0 ? Math.round(Math.random() * 80 + 40) : 0,
  };
});
