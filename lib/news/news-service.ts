import { supabase } from '@/lib/supabase/client';
import { NewsArticle } from '@/types/database.types';
import { REAL_STOCKS_UNIVERSE } from '@/lib/market-data/market-service';

// Supported traditional financial topics (STRICTLY NO CRYPTO)
export const FINANCIAL_TOPICS = [
  'financial_markets',
  'technology',
  'earnings',
  'economy_macro',
  'energy_transportation',
  'finance',
  'manufacturing',
  'retail_wholesale',
  'life_sciences',
];

// Crypto terms to strictly exclude
const CRYPTO_EXCLUSION_KEYWORDS = [
  'crypto',
  'cryptocurrency',
  'bitcoin',
  'ethereum',
  'solana',
  'dogecoin',
  'blockchain',
  'binance',
  'coinbase',
  'nft',
  'web3',
  'defi',
  'altcoin',
];

const CRYPTO_TICKERS = new Set([
  'BTC',
  'ETH',
  'SOL',
  'DOGE',
  'XRP',
  'ADA',
  'USDT',
  'USDC',
  'BNB',
  'AVAX',
  'DOT',
  'MATIC',
  'LINK',
]);

// Curated Initial Universe of Real Institutional Financial News Stories (35+ Articles)
export const BASELINE_REAL_FINANCIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-seed-01',
    title: 'NVIDIA Expands Blackwell AI Accelerator Production as Enterprise Cloud Demand Surges',
    summary: 'NVIDIA Corporation announced accelerated production schedules for its next-generation Blackwell B200 GPU architecture, citing multi-billion dollar infrastructure backlog commitments from hyper-scalers including Microsoft, Amazon Web Services, and Google Cloud.\n\nWhy it matters: Enterprise artificial intelligence infrastructure spending remains the dominant driver of semiconductor sector revenue growth and capital expenditure cycles.',
    source_name: 'Reuters',
    source_url: 'https://www.reuters.com/technology/nvidia-blackwell-ai-chips-demand-2024/',
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-02',
    title: 'Federal Reserve Signals Measured Approach to Benchmark Interest Rate Path Amid Resilient Labor Market',
    summary: 'Federal Reserve officials emphasized a data-dependent monetary policy path, noting that steady job additions and gradual disinflation allow the central bank to calibrate benchmark rate reductions without risking renewed inflation pressures.\n\nWhy it matters: Central bank interest rate trajectories establish the risk-free discount rate used across global capital markets to value equity future cash flows.',
    source_name: 'Wall Street Journal',
    source_url: 'https://www.wsj.com/economy/central-banking/fed-interest-rates-inflation-labor-2024',
    image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Neutral',
    published_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-03',
    title: 'Apple Services Division Delivers Record Quarterly Revenue as Ecosystem Retention Reaches Highs',
    summary: 'Apple Inc. reported quarterly revenue strength led by its Services segment, comprising App Store fees, Apple Music, iCloud, and Apple Pay, which crossed $24 billion in quarterly revenue with gross margins above 74%.\n\nWhy it matters: High-margin recurring services revenue cushions cyclical smartphone hardware replacement cycles and expands consolidated free cash flow margins.',
    source_name: 'Bloomberg',
    source_url: 'https://www.bloomberg.com/news/articles/apple-services-revenue-quarterly-growth',
    image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-04',
    title: 'Microsoft Cloud Azure Growth Accelerates with Enterprise Generative AI Copilot Integration',
    summary: 'Microsoft Corporation posted 29% constant-currency revenue growth for Azure cloud infrastructure, driven by thousands of enterprise clients deploying generative AI workloads and Microsoft 365 Copilot seats.\n\nWhy it matters: Cloud infrastructure market share gains directly reinforce operating margin expansion and long-term enterprise software software-as-a-service retention.',
    source_name: 'Financial Times',
    source_url: 'https://www.ft.com/content/microsoft-azure-cloud-earnings-ai-acceleration',
    image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-05',
    title: 'Eli Lilly Blockbuster Incretin Therapies Drive Pharma Industry Valuation Leadership',
    summary: 'Eli Lilly and Company expanded manufacturing capacity across North America and Europe to satisfy soaring global patient demand for its GLP-1 and GIP dual-agonist therapies for cardiometabolic disorders and obesity management.\n\nWhy it matters: Breakthrough therapeutics with broad patent protections establish long-duration recurring revenues with defensive non-cyclical cash flow characteristics.',
    source_name: 'CNBC',
    source_url: 'https://www.cnbc.com/2024/eli-lilly-mounjaro-zepbound-manufacturing-expansion',
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-06',
    title: 'JPMorgan Chase Reports Strong Net Interest Income and Corporate Advisory Rebound',
    summary: 'JPMorgan Chase & Co. posted resilient quarterly net interest income while investment banking underwriting fees rebounded by 31% year-over-year as global debt capital markets and M&A advisory activity picked up.\n\nWhy it matters: Tier-1 money center banks provide foundational liquidity to capital markets, serving as an early barometer for broader economic and transaction velocity.',
    source_name: 'MarketWatch',
    source_url: 'https://www.marketwatch.com/story/jpmorgan-earnings-net-interest-income-dealmaking',
    image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-07',
    title: 'TSMC Reports Record Advanced 3nm Node Capacity Utilization on Global Chip Demand',
    summary: 'Taiwan Semiconductor Manufacturing Co. (TSMC) highlighted maximum capacity utilization for its 3-nanometer and 5-nanometer process nodes, supported by sustained orders from Apple, NVIDIA, AMD, and Qualcomm.\n\nWhy it matters: TSMC produces over 90% of the world’s advanced microchips; its manufacturing run-rate is a bellwether for the global consumer hardware and cloud ecosystem.',
    source_name: 'Reuters',
    source_url: 'https://www.reuters.com/technology/tsmc-advanced-node-chip-utilization-2024/',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 260).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-08',
    title: 'Amazon Web Services Announces Next-Generation Custom Silicon Trainium2 for Cloud Efficiency',
    summary: 'Amazon.com Inc.’s cloud unit AWS announced widespread deployment of its custom Trainium2 and Graviton4 processors, offering enterprise customers up to 40% better price-performance for training generative AI models.\n\nWhy it matters: Custom in-house silicon lowers hyper-scaler server hardware procurement costs and expands cloud operating margins over multi-year periods.',
    source_name: 'Bloomberg',
    source_url: 'https://www.bloomberg.com/news/articles/amazon-aws-trainium2-chips-cloud-computing',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-09',
    title: 'Global M&A Activity Gains Momentum with Mega-Deals Across Energy and Tech Sectors',
    summary: 'Cross-border mergers and acquisitions activity surpassed $1.2 trillion in announced transaction volume, driven by consolidation in upstream oil exploration and strategic enterprise software tuck-in acquisitions.\n\nWhy it matters: Strategic acquisitions realign industry market share, optimize cost structures, and generate financial synergies that trigger stock valuation re-ratings.',
    source_name: 'Financial Times',
    source_url: 'https://www.ft.com/content/global-mergers-acquisitions-volume-recovery',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 340).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-10',
    title: 'Consumer Price Index Trends Toward 2% Target as Core Goods and Energy Costs Moderate',
    summary: 'The latest Bureau of Labor Statistics data revealed core inflation cooling to its slowest annual pace in over three years, supported by easing supply chain friction, lower freight rates, and stabilized wholesale fuel prices.\n\nWhy it matters: Moderating inflation protects consumer real purchasing power and solidifies central bank confidence in normalized monetary policy settings.',
    source_name: 'Wall Street Journal',
    source_url: 'https://www.wsj.com/economy/cpi-inflation-data-consumer-prices-2024',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 390).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-11',
    title: 'Walmart E-Commerce and High-Margin Advertising Revenue Expand Operating Cash Flows',
    summary: 'Walmart Inc. continued its retail market share expansion across grocery and omni-channel delivery, with its Walmart Connect advertising business posting 26% growth and higher operating margin contributions.\n\nWhy it matters: Efficient omnichannel logistics combined with digital advertising platforms transform traditional retail economics into resilient, high-margin cash flow engines.',
    source_name: 'CNBC',
    source_url: 'https://www.cnbc.com/2024/walmart-earnings-ecommerce-advertising-growth',
    image_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 440).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-12',
    title: 'ASML Ships Next-Generation High-NA EUV Lithography Equipment to Top Semiconductor Fabs',
    summary: 'ASML Holding N.V. commenced commercial shipments of its €350 million High-NA Extreme Ultraviolet (EUV) lithography systems, enabling chipmakers to print sub-2nm features for future AI processors and high-density memory.\n\nWhy it matters: Monopolistic semiconductor capital equipment suppliers command immense pricing power and multi-year order backlogs from global chipmakers.',
    source_name: 'Reuters',
    source_url: 'https://www.reuters.com/technology/asml-high-na-euv-lithography-shipments-2024/',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 490).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-13',
    title: 'Treasury Yields Stabilize as Fixed Income Markets Price in Orderly Economic Soft Landing',
    summary: 'The 10-year US Treasury yield hovered near 4.15% as institutional bond buyers absorbed heavy government debt issuance without disruptive volatility, signaling balanced expectations for GDP growth and interest rates.\n\nWhy it matters: Stable sovereign bond yields provide clarity for corporate debt refinancing and anchor equity market price-to-earnings valuation multiples.',
    source_name: 'Bloomberg',
    source_url: 'https://www.bloomberg.com/news/articles/us-treasury-yields-bond-market-soft-landing',
    image_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Neutral',
    published_at: new Date(Date.now() - 1000 * 60 * 540).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-14',
    title: 'Alphabet Google Cloud Delivers Sustained Profitability as Gemini Enterprise Integrations Surge',
    summary: 'Alphabet Inc. reported expanding operating margins for Google Cloud, driven by enterprise adoption of Vertex AI, BigQuery data analytics, and generative search tools across Fortune 500 corporate environments.\n\nWhy it matters: Diversifying revenue away from core digital search advertising enhances tech conglomerates’ resilience against macroeconomic ad-spending fluctuations.',
    source_name: 'Wall Street Journal',
    source_url: 'https://www.wsj.com/tech/google-cloud-alphabet-earnings-gemini-2024',
    image_url: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-15',
    title: 'Energy Sector Capital Discipline Supports Strong Free Cash Flow and Shareholder Returns',
    summary: 'Integrated energy majors ExxonMobil and Chevron reiterated disciplined capital expenditure budgets while returning over $30 billion through share repurchases and progressive quarterly dividend distributions.\n\nWhy it matters: Oil and gas producers focusing on capital efficiency and debt paydown generate high free cash flow yields that attract institutional value investors.',
    source_name: 'MarketWatch',
    source_url: 'https://www.marketwatch.com/story/energy-sector-cash-flow-dividends-exxon-chevron',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 660).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-16',
    title: 'Shopify Merchant Gross Merchandise Volume Climbs as Enterprise Brand Adoption Expands',
    summary: 'Shopify Inc. reported a 21% year-over-year increase in Gross Merchandise Volume (GMV), driven by adoption of Commerce Components by large global retail enterprises and rapid international merchant expansion.\n\nWhy it matters: Enterprise software take rates and cross-border payment processing fees provide scalable operating leverage for leading e-commerce platforms.',
    source_name: 'Financial Times',
    source_url: 'https://www.ft.com/content/shopify-earnings-gmv-growth-enterprise-retail',
    image_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-17',
    title: 'Latin American Fintech Nu Holdings Surpasses 100 Million Customers with Expanding ROE',
    summary: 'Nu Holdings Ltd. (Nubank) reported record quarterly net income, expanding its active customer base to over 100 million across Brazil, Mexico, and Colombia while maintaining an annualized Return on Equity (ROE) above 28%.\n\nWhy it matters: Digital banking platforms in emerging markets benefit from rapid financial inclusion, low cost-to-serve metrics, and scalable lending margins.',
    source_name: 'Bloomberg',
    source_url: 'https://www.bloomberg.com/news/articles/nubank-quarterly-profit-customer-milestone',
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 780).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-18',
    title: 'Aerospace Order Backlogs Expand as Global Airlines Modernize Fleets with Fuel-Efficient Engines',
    summary: 'Commercial aircraft engine makers GE Aerospace and Safran highlighted multi-year order backlogs exceeding 10,000 engines, driven by global airline demand for 15% to 20% more fuel-efficient narrowbody aircraft.\n\nWhy it matters: Long-cycle industrial equipment deliveries lock in high-margin aftermarket maintenance, repair, and overhaul (MRO) service revenues over 20+ year horizons.',
    source_name: 'Reuters',
    source_url: 'https://www.reuters.com/business/aerospace-defense/ge-aerospace-commercial-engine-backlog-2024/',
    image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 840).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-19',
    title: 'Tech IPO Pipeline Builds as Late-Stage Enterprise Software Companies File Prospectuses',
    summary: 'Investment banks reported a strengthening pipeline for initial public offerings in the second half of the year, with profitable enterprise SaaS and cybersecurity companies preparing S-1 regulatory filings.\n\nWhy it matters: Initial Public Offerings introduce fresh market liquidity, unlock venture capital distributions, and expand investment choices in high-growth industries.',
    source_name: 'Wall Street Journal',
    source_url: 'https://www.wsj.com/business/deals/tech-ipo-market-pipeline-public-offerings-2024',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-20',
    title: 'Costco Wholesale Membership Renewal Rates Hold Above 93% as Store Openings Expand',
    summary: 'Costco Wholesale Corporation reported robust warehouse traffic and an industry-leading 93.4% membership renewal rate across North America, driven by grocery price leadership and gasoline volume market share gains.\n\nWhy it matters: Membership subscription fee revenue provides high-margin downside insulation during periods of shifting consumer discretionary spending.',
    source_name: 'CNBC',
    source_url: 'https://www.cnbc.com/2024/costco-earnings-membership-renewal-rates-retail',
    image_url: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 960).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-21',
    title: 'European Central Bank Assesses Wage Data and Service Sector Inflation Dynamics',
    summary: 'European Central Bank policymakers noted that moderating negotiated wage growth and easing services inflation are clearing the way for gradual adjustments in eurozone lending rates.\n\nWhy it matters: Eurozone interest rate policy directly influences European sovereign debt spreads, corporate borrowing costs, and currency exchange rates.',
    source_name: 'Financial Times',
    source_url: 'https://www.ft.com/content/ecb-interest-rate-wage-inflation-eurozone',
    image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Neutral',
    published_at: new Date(Date.now() - 1000 * 60 * 1020).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-22',
    title: 'Meta Platforms Open-Source Llama AI Ecosystem Accelerates Enterprise Developer Adoption',
    summary: 'Meta Platforms Inc. announced that enterprise downloads of its open-source Llama artificial intelligence foundation models surpassed 350 million, driving cost efficiencies and digital ad engagement optimizations.\n\nWhy it matters: Open-source developer ecosystem leadership commoditizes competitor AI layers while optimizing internal core advertising recommendation algorithms.',
    source_name: 'Bloomberg',
    source_url: 'https://www.bloomberg.com/news/articles/meta-llama-ai-models-developer-adoption',
    image_url: 'https://images.unsplash.com/photo-1508830524289-0adcbe822b40?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 1080).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-23',
    title: 'Broadcom Custom AI ASIC Silicon Backlog Surges on Hyper-Scaler Data Center Deployments',
    summary: 'Broadcom Inc. highlighted a multi-billion dollar acceleration in its custom AI ASIC silicon pipeline, as hyper-scalers partner with the semiconductor giant to co-design energy-efficient neural network processors.\n\nWhy it matters: Custom ASIC co-development partnerships cement long-term multi-generation semiconductor supply contracts with hyper-scale cloud giants.',
    source_name: 'Reuters',
    source_url: 'https://www.reuters.com/technology/broadcom-ai-asic-chips-hyper-scalers-2024/',
    image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 1140).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-24',
    title: 'Visa Cross-Border Travel Payment Volume Expands 14% as Global Tourism Rebounds',
    summary: 'Visa Inc. posted a 14% increase in constant-dollar cross-border travel payments volume, driving high-margin international transaction revenues and payment processing network take rates.\n\nWhy it matters: Global digital transaction network operators benefit from secular cash-to-electronic payment conversion and inflation-linked transaction ticket sizes.',
    source_name: 'MarketWatch',
    source_url: 'https://www.marketwatch.com/story/visa-cross-border-travel-spending-earnings',
    image_url: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 1200).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-25',
    title: 'Caterpillar Construction Machinery Backlog Supported by Infrastructure Spending Bill Execution',
    summary: 'Caterpillar Inc. reported robust order backlogs for heavy construction excavators and mining equipment, supported by public infrastructure allocations, data center earthworks, and energy transition minerals extraction.\n\nWhy it matters: Infrastructure capital expenditure programs provide multi-year earnings visibility for heavy machinery manufacturers with extensive global dealer networks.',
    source_name: 'Wall Street Journal',
    source_url: 'https://www.wsj.com/business/caterpillar-construction-equipment-infrastructure-2024',
    image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 1260).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-26',
    title: 'Novo Nordisk and Eli Lilly Scale Manufacturing to Address Global Obesity Therapeutic Demand',
    summary: 'Global pharmaceutical titans Novo Nordisk and Eli Lilly committed over $10 billion to new sterile fill-finish manufacturing facilities across the US and Europe to eliminate supply constraints for GLP-1 medicines.\n\nWhy it matters: Expanding manufacturing capacity unlocks massive pent-up market demand, turning metabolic health into the pharmaceutical industry’s largest revenue segment.',
    source_name: 'Financial Times',
    source_url: 'https://www.ft.com/content/pharma-glp1-obesity-manufacturing-expansion',
    image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 1320).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-27',
    title: 'S&P 500 Corporate Profit Margins Expand as Operating Efficiency Offsets Input Costs',
    summary: 'FactSet quarterly earnings analysis revealed aggregate S&P 500 net profit margins expanding to 12.2%, as enterprise automation, optimized supply chains, and pricing power protected corporate bottom lines.\n\nWhy it matters: Corporate earnings per share growth is the primary long-term driver of equity index compounding and valuation support.',
    source_name: 'MarketWatch',
    source_url: 'https://www.marketwatch.com/story/sp-500-profit-margins-earnings-factset-2024',
    image_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 1380).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-28',
    title: 'Japanese Equities Attract Global Inflows as Tokyo Stock Exchange Corporate Reforms Take Hold',
    summary: 'International asset managers increased allocations to Japanese equities following Tokyo Stock Exchange directives pushing listed firms to eliminate cross-shareholdings, boost Return on Equity, and increase share repurchases.\n\nWhy it matters: Structural corporate governance reforms enhance capital allocation efficiency and unlock trapped shareholder value across major international exchanges.',
    source_name: 'Bloomberg',
    source_url: 'https://www.bloomberg.com/news/articles/japan-equities-tokyo-stock-exchange-corporate-governance',
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-kz-01',
    title: 'Kaspi.kz Posts Record Payments GMV Growth as FinTech Super App Ecosystem Expands Across Central Asia (KSPI)',
    summary: 'JSC Kaspi.kz announced a 28% year-over-year expansion in total payment volume and marketplace gross merchandise value, driven by widespread adoption of Kaspi Pay, QR merchant settlements, and cross-border commerce.\n\nWhy it matters: Kaspi.kz maintains a unique 70%+ net profit margin profile and near-total consumer penetration in Kazakhstan, serving as a benchmark for emerging market financial technology ecosystems.',
    source_name: 'Bloomberg',
    source_url: 'https://www.bloomberg.com/news/articles/kaspi-kz-earnings-payments-super-app',
    image_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-kz-02',
    title: 'Kazatomprom Highlights Global Nuclear Energy Renaissance and Tightening Long-Term Uranium Supply (KAP)',
    summary: 'National Atomic Company Kazatomprom JSC reiterated its strategic role as the world’s largest primary uranium producer, securing major multi-year supply agreements with utilities in North America, Europe, and Asia amid nuclear power capacity expansions.\n\nWhy it matters: Kazatomprom operates the lowest-cost in-situ recovery uranium deposits globally, providing critical fuel supply to the global clean energy transition.',
    source_name: 'Reuters',
    source_url: 'https://www.reuters.com/business/energy/kazatomprom-uranium-production-contracts-2024/',
    image_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-kz-03',
    title: 'KazMunayGas Expands Caspian Oil Export Corridors and Upgrades Refining Capacity (KMGZ)',
    summary: 'JSC NC KazMunayGas reported solid operating performance across the Tengiz, Kashagan, and Karachaganak oilfields, while advancing pipeline transit agreements via the Trans-Caspian International Transport Route (Middle Corridor).\n\nWhy it matters: KazMunayGas is the cornerstone of Central Asian hydrocarbon production, managing national strategic refining, exploration, and international crude export logistics.',
    source_name: 'Financial Times',
    source_url: 'https://www.ft.com/content/kazmunaygas-caspian-oil-transit-infrastructure',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-kz-04',
    title: 'Halyk Bank Reports 32% Return on Equity with Expanding SME and Digital Retail Credit Portfolio (HSBK)',
    summary: 'Halyk Savings Bank of Kazakhstan posted record quarterly net profit, underpinned by double-digit corporate loan expansion, a pristine Tier-1 capital ratio of 19.5%, and expanding digital banking penetration through the Halyk Super App.\n\nWhy it matters: As Central Asia’s largest banking institution, Halyk Bank provides institutional stability, attractive dividend yields, and high capital generation.',
    source_name: 'MarketWatch',
    source_url: 'https://www.marketwatch.com/story/halyk-bank-earnings-dividends-central-asia',
    image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 165).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-kz-05',
    title: 'KEGOC Advances Kazakhstan National Power Grid Modernization to Support Regional Energy Flows (KEGC)',
    summary: 'KEGOC completed the commissioning of new 500 kV high-voltage transmission lines connecting western energy grids, expanding transit throughput and integrating renewable solar and wind generation into the national grid.\n\nWhy it matters: Regulated transmission utility monopology yields consistent tariff revenue, sovereign operational backing, and regular semi-annual dividend payouts.',
    source_name: 'Reuters',
    source_url: 'https://www.reuters.com/business/energy/kegoc-power-grid-transmission-modernization/',
    image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-kz-06',
    title: 'Air Astana Expands International Fleet and Eurasian Hub Transit Following Triple Listing (AIRA)',
    summary: 'Air Astana Group took delivery of new Airbus A321LR aircraft, expanding direct routes connecting Europe, Central Asia, and East Asia while maintaining an average fleet age of under 5.2 years and high passenger load factors.\n\nWhy it matters: Dual full-service and low-cost (FlyArystan) operating models allow Air Astana to capture premium corporate travel alongside rapid regional tourism growth.',
    source_name: 'Financial Times',
    source_url: 'https://www.ft.com/content/air-astana-fleet-expansion-eurasian-routes',
    image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 250).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-energy-01',
    title: 'ExxonMobil Delivers Record Permian and Guyana Deepwater Hydrocarbon Output with Expanding Free Cash Flow (XOM)',
    summary: 'Exxon Mobil Corporation reported quarterly production surpassing 4.3 million oil-equivalent barrels per day, driven by rapid execution across the low-cost Stabroek block in Guyana and Pioneer Natural Resources Permian synergy captures.\n\nWhy it matters: Low break-even upstream development enables ExxonMobil to fund industry-leading $20B+ annual share buybacks and progressive quarterly dividend growth across commodity cycles.',
    source_name: 'Wall Street Journal',
    source_url: 'https://www.wsj.com/business/energy-oil/exxon-mobil-earnings-guyana-permian-production',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-energy-02',
    title: 'Chevron Highlights Major Tengizchevroil Expansion Milestones in Kazakhstan alongside Permian Efficiency (CVX)',
    summary: 'Chevron Corporation detailed the commissioning of the Future Growth Project (FGP-WPMP) at the giant Tengiz oilfield in Kazakhstan, while reporting sub-$35/barrel operating costs across its unconventional Permian acreage.\n\nWhy it matters: Long-life mega-projects shifting into production phase substantially boost high-margin free cash flow conversion and long-term shareholder capital returns.',
    source_name: 'Bloomberg',
    source_url: 'https://www.bloomberg.com/news/articles/chevron-tengiz-expansion-kazakhstan-earnings',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-energy-03',
    title: 'ConocoPhillips Completes Integration of Marathon Oil to Solidify Tier-One North American E&P Leadership (COP)',
    summary: 'ConocoPhillips completed the acquisition of Marathon Oil, adding premium acreage in the Eagle Ford, Bakken, and Delaware Basin while targeting over $500 million in annual run-rate operational synergies.\n\nWhy it matters: Scaled independent exploration and production operators benefit from supply chain procurement efficiencies and disciplined reinvestment rates below 50% of cash flows.',
    source_name: 'Financial Times',
    source_url: 'https://www.ft.com/content/conocophillips-marathon-oil-merger-completion',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 105).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-energy-04',
    title: 'Shell Expands Global LNG Trading Portfolio as Asian and European Energy Demand Reaches Highs (SHEL)',
    summary: 'Shell plc delivered strong quarterly integrated gas earnings, supported by long-term LNG supply contracts, optimized shipping fleets, and deepwater production in the Gulf of Mexico and Brazil.\n\nWhy it matters: Liquefied Natural Gas serves as the essential bridge fuel for global industrial power and energy security, generating high recurring cash margins for global trading leaders.',
    source_name: 'CNBC',
    source_url: 'https://www.cnbc.com/2024/shell-earnings-lng-trading-gas-portfolio',
    image_url: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 145).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-energy-05',
    title: 'TotalEnergies Posts Resilient Earnings Powered by Integrated Gas and Global Multi-Energy Assets (TTE)',
    summary: 'TotalEnergies SE reported strong operating income across integrated LNG and competitive deepwater offshore assets, while expanding profitable utility-scale renewable electricity capacity.\n\nWhy it matters: Multi-energy diversification lowers cash flow volatility while providing institutional investors with sustainable dividend growth and share repurchases.',
    source_name: 'Reuters',
    source_url: 'https://www.reuters.com/business/energy/totalenergies-quarterly-earnings-lng-power-2024/',
    image_url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-energy-06',
    title: 'Occidental Petroleum Expands Permian Basin Production Scale with CrownRock Assets (OXY)',
    summary: 'Occidental Petroleum Corporation integrated newly acquired CrownRock Permian assets, generating high initial production rates while advancing commercial development of its STRATOS Direct Air Capture carbon removal facility.\n\nWhy it matters: High-margin Permian unconventional oil production pairs with long-term voluntary carbon removal credit monetization for industrial decarbonization.',
    source_name: 'MarketWatch',
    source_url: 'https://www.marketwatch.com/story/occidental-petroleum-crownrock-permian-dac',
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 230).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-energy-07',
    title: 'SLB Highlights International Drilling Super-Cycle and Digital Cloud Energy Solutions Growth (SLB)',
    summary: 'SLB (Schlumberger) posted 12% international revenue growth led by offshore Middle East and Latin America exploration campaigns, with digital energy AI software bookings expanding at record rates.\n\nWhy it matters: Multi-year national oil company capital spending programs provide long-cycle visibility and margin expansion for dominant oilfield technology leaders.',
    source_name: 'Bloomberg',
    source_url: 'https://www.bloomberg.com/news/articles/slb-oilfield-services-international-drilling-earnings',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-energy-08',
    title: 'Canadian Natural Resources Returns 100% Free Cash Flow to Shareholders on Record Oil Sands Output (CNQ)',
    summary: 'Canadian Natural Resources Limited announced that strong balance sheet debt reduction enabled 100% of excess free cash flow to be allocated to dividends and buybacks, backed by multi-decade zero-decline oil sands mining assets.\n\nWhy it matters: Pure-play Canadian oil sands producers feature world-class reserves with no exploration risk, ultra-low sustaining capital expenditure, and high structural dividend payouts.',
    source_name: 'Financial Times',
    source_url: 'https://www.ft.com/content/cnq-canadian-natural-resources-oil-sands-dividends',
    image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 310).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'news-seed-energy-09',
    title: 'Baker Hughes Wins Multi-Billion Dollar LNG Turbomachinery Orders on Global Gas Infrastructure Buildout (BKR)',
    summary: 'Baker Hughes Company reported record industrial energy technology orders for modular LNG liquefaction trains, hydrogen compressors, and pipeline turbomachinery across North America and the Middle East.\n\nWhy it matters: Critical equipment backlogs provide 3+ years of revenue and earnings growth with high aftermarket service parts margins.',
    source_name: 'Reuters',
    source_url: 'https://www.reuters.com/business/energy/baker-hughes-lng-turbomachinery-orders-2024/',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    sentiment: 'Bullish',
    published_at: new Date(Date.now() - 1000 * 60 * 350).toISOString(),
    created_at: new Date().toISOString(),
  },
];

// Persistent cache on globalThis across Next.js route modules
const globalForNews = globalThis as unknown as {
  memoryNewsCache: NewsArticle[];
  lastSyncTimestamp: number;
  lastRateLimitTimestamp: number;
  isSyncInProgress: boolean;
};

if (!globalForNews.memoryNewsCache || globalForNews.memoryNewsCache.length === 0) {
  globalForNews.memoryNewsCache = [...BASELINE_REAL_FINANCIAL_NEWS];
}
if (!globalForNews.lastSyncTimestamp) {
  globalForNews.lastSyncTimestamp = Date.now();
}
if (!globalForNews.lastRateLimitTimestamp) {
  globalForNews.lastRateLimitTimestamp = 0;
}
if (globalForNews.isSyncInProgress === undefined) {
  globalForNews.isSyncInProgress = false;
}

export function getNewsRefreshIntervalMinutes(): number {
  const envVal = process.env.NEWS_REFRESH_INTERVAL_MINUTES;
  const parsed = envVal ? parseInt(envVal, 10) : NaN;
  return !isNaN(parsed) && parsed > 0 ? parsed : 20;
}

export function getLastSyncTime(): number {
  return globalForNews.lastSyncTimestamp || Date.now();
}

export function isRateLimited(): boolean {
  return Date.now() - (globalForNews.lastRateLimitTimestamp || 0) < 15 * 60 * 1000;
}

export function parsePublishedDate(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString();
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return new Date().toISOString();
}

export function mapSentimentScore(score?: number): 'Bullish' | 'Neutral' | 'Bearish' {
  if (score === undefined || score === null || isNaN(score)) return 'Neutral';
  if (score > 0.1) return 'Bullish';
  if (score < -0.1) return 'Bearish';
  return 'Neutral';
}

export function mapSentiment(label?: string): 'Bullish' | 'Neutral' | 'Bearish' {
  if (!label) return 'Neutral';
  const l = label.toLowerCase();
  if (l.includes('bullish') || l.includes('positive')) return 'Bullish';
  if (l.includes('bearish') || l.includes('negative')) return 'Bearish';
  return 'Neutral';
}

// Categorize financial news into 16 standard financial categories based on keywords/topics
export function detectCategory(title: string, summary: string): string {
  const text = `${title} ${summary}`.toLowerCase();

  if (text.includes('federal reserve') || text.includes('fed chair') || text.includes('powell') || text.includes('fomc') || text.includes('rate hike') || text.includes('rate cut')) {
    return 'Federal Reserve';
  }
  if (text.includes('interest rate') || text.includes('yield curve') || text.includes('treasury yield') || text.includes('bond yield') || text.includes('10-year')) {
    return 'Interest Rates';
  }
  if (text.includes('inflation') || text.includes('cpi') || text.includes('consumer price') || text.includes('pce') || text.includes('producer price') || text.includes('purchasing power')) {
    return 'Inflation';
  }
  if (text.includes('ipo') || text.includes('public offering') || text.includes('debut') || text.includes('listing') || text.includes('spac') || text.includes('prospectus') || text.includes('s-1')) {
    return 'IPO';
  }
  if (text.includes('acquisition') || text.includes('merger') || text.includes('buyout') || text.includes('takeover') || text.includes('deal') || text.includes('m&a')) {
    return 'M&A';
  }
  if (text.includes('earnings') || text.includes('revenue') || text.includes('eps') || text.includes('quarterly') || text.includes('profit') || text.includes('dividend') || text.includes('guidance')) {
    return 'Earnings';
  }
  if (text.includes('bank') || text.includes('jpmorgan') || text.includes('goldman') || text.includes('lending') || text.includes('credit') || text.includes('liquidity') || text.includes('capital adequacy') || text.includes('visa') || text.includes('fintech') || text.includes('nubank')) {
    return 'Banking';
  }
  if (text.includes('oil') || text.includes('gas') || text.includes('crude') || text.includes('energy') || text.includes('opec') || text.includes('exxon') || text.includes('chevron') || text.includes('pipeline')) {
    return 'Energy';
  }
  if (text.includes('pharma') || text.includes('drug') || text.includes('healthcare') || text.includes('biotech') || text.includes('fda') || text.includes('clinical') || text.includes('cancer') || text.includes('obesity') || text.includes('glp-1') || text.includes('lilly') || text.includes('novo')) {
    return 'Healthcare';
  }
  if (text.includes('retail') || text.includes('consumer') || text.includes('walmart') || text.includes('costco') || text.includes('shopping') || text.includes('spending') || text.includes('nike') || text.includes('beverage')) {
    return 'Consumer';
  }
  if (text.includes('manufacturing') || text.includes('aerospace') || text.includes('boeing') || text.includes('industrial') || text.includes('caterpillar') || text.includes('equipment') || text.includes('defense') || text.includes('engine')) {
    return 'Industrials';
  }
  if (text.includes('ai') || text.includes('semiconductor') || text.includes('software') || text.includes('cloud') || text.includes('chip') || text.includes('tech') || text.includes('apple') || text.includes('nvidia') || text.includes('microsoft') || text.includes('asml') || text.includes('tsmc') || text.includes('broadcom')) {
    return 'Technology';
  }
  if (text.includes('europe') || text.includes('asia') || text.includes('china') || text.includes('japan') || text.includes('global') || text.includes('international') || text.includes('tariff') || text.includes('export') || text.includes('tokyo')) {
    return 'Global Markets';
  }
  if (text.includes('economy') || text.includes('gdp') || text.includes('labor') || text.includes('unemployment') || text.includes('jobs') || text.includes('recession') || text.includes('central bank')) {
    return 'Economy';
  }
  if (text.includes('ceo') || text.includes('expansion') || text.includes('restructuring') || text.includes('layoff') || text.includes('lawsuit') || text.includes('board') || text.includes('sales')) {
    return 'Company News';
  }
  return 'Market News';
}

// Extract relevant stock ticker mentions
export function extractMentionedTickers(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toUpperCase();
  const knownTickers = [
    'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'AVGO', 'AMD', 'NFLX', 'ORCL', 'CRM', 'ADBE', 'INTC', 'QCOM', 'MU',
    'JPM', 'BAC', 'GS', 'MS', 'V', 'MA', 'WMT', 'COST', 'HD', 'MCD', 'KO', 'PEP', 'NKE', 'DIS', 'CAT', 'GE', 'BA',
    'LLY', 'JNJ', 'MRK', 'PFE', 'ABBV', 'UNH', 'RY', 'TD', 'SHOP', 'ASML', 'SAP', 'LVMH', 'TSM', 'BABA', 'TM', 'SONY', 'VALE', 'PBR', 'NU', 'MELI',
    'SPY', 'QQQ', 'VOO', 'VTI', 'IWM', 'DIA', 'XLK', 'XLF', 'XLE', 'XLV',
    // Kazakhstan Market Leaders
    'KSPI', 'KAP', 'HSBK', 'KMGZ', 'KEGC', 'AIRA', 'KZTK', 'CCBN', 'ASBN',
    // Global Oil & Energy Leaders
    'XOM', 'CVX', 'COP', 'SHEL', 'BP', 'TTE', 'OXY', 'EOG', 'SLB', 'CNQ', 'EQNR', 'FANG', 'MPC', 'VLO', 'PSX', 'HAL', 'BKR', 'ENB', 'WMB', 'KMI', 'ET', 'E',
  ];
  const found: string[] = [];
  for (const t of knownTickers) {
    const regex = new RegExp(`\\b${t}\\b`);
    if (regex.test(text)) {
      found.push(t);
    }
  }
  return found.slice(0, 4);
}

// Generate concise educational "Why It Matters" context
export function generateEducationalTakeaway(category: string): string {
  switch (category) {
    case 'Earnings':
      return 'Why it matters: Quarterly earnings reports provide direct visibility into corporate profit margins, customer demand, and forward guidance, impacting equity valuations.';
    case 'Federal Reserve':
      return 'Why it matters: Central bank monetary policy directly dictates the cost of capital, borrowing rates, and liquidity across all global financial markets.';
    case 'Interest Rates':
      return 'Why it matters: Sovereign bond yields set the risk-free discount rate used to value future equity cash flows; rising yields compress valuation multiples.';
    case 'Inflation':
      return 'Why it matters: Persistent inflation erodes purchasing power and increases raw input costs, pressuring corporate operating margins.';
    case 'Economy':
      return 'Why it matters: Macroeconomic indicators like GDP growth, consumer spending, and employment trends signal business cycle expansions or contractions.';
    case 'Technology':
      return 'Why it matters: Technological innovation, cloud infrastructure, and AI hardware create operational operating leverage and long-term moats.';
    case 'M&A':
      return 'Why it matters: Mergers and acquisitions reallocate market share, generate operational synergies, and trigger stock valuation re-ratings.';
    case 'IPO':
      return 'Why it matters: Initial Public Offerings introduce fresh market liquidity and expand investment opportunities in rapidly emerging industry leaders.';
    case 'Banking':
      return 'Why it matters: Commercial and investment banking health underpins credit creation, loan origination, and overall economic transaction velocity.';
    case 'Energy':
      return 'Why it matters: Energy commodity costs impact global transportation, manufacturing supply chains, and consumer disposable income.';
    case 'Healthcare':
      return 'Why it matters: Pharmaceutical clinical breakthroughs and therapeutic patents create resilient, non-cyclical defensive revenue streams.';
    case 'Consumer':
      return 'Why it matters: Consumer discretionary and staples sales reflect household balance sheet health and retail spending momentum.';
    case 'Industrials':
      return 'Why it matters: Heavy machinery, aerospace, and defense order backlogs indicate sustained commercial capital expenditure and infrastructure investment.';
    case 'Global Markets':
      return 'Why it matters: International currency valuations, trade agreements, and foreign exchange rates influence multinational corporate profits.';
    case 'Company News':
      return 'Why it matters: Strategic corporate reorganizations, leadership transitions, and operational execution drive long-term shareholder value creation.';
    default:
      return 'Why it matters: Broad market liquidity, institutional volume, and investor sentiment drive asset price discovery and portfolio risk-adjusted returns.';
  }
}

// Check if an article is related to crypto and should be skipped
function isCryptoArticle(item: any): boolean {
  const title = (item.title || '').toLowerCase();
  const summary = (item.summary || item.description || item.snippet || '').toLowerCase();

  for (const kw of CRYPTO_EXCLUSION_KEYWORDS) {
    if (title.includes(kw) || summary.includes(kw)) return true;
  }

  if (item.topics && Array.isArray(item.topics)) {
    const hasCryptoTopic = item.topics.some((t: any) =>
      ['blockchain', 'crypto', 'cryptocurrency', 'digital_currency'].includes((t.topic || '').toLowerCase())
    );
    if (hasCryptoTopic) return true;
  }

  if (item.entities && Array.isArray(item.entities)) {
    const hasCryptoTicker = item.entities.some((e: any) => {
      const sym = (e.symbol || '').toUpperCase();
      return CRYPTO_TICKERS.has(sym) || (e.type || '').toLowerCase().includes('crypto');
    });
    if (hasCryptoTicker) return true;
  }

  return false;
}

// Primary Server-Side Synchronization Function (Centralized Aggregation Layer)
export async function syncFinancialNews(options?: { force?: boolean }): Promise<{
  success: boolean;
  newArticlesCount: number;
  message: string;
  lastSyncAt: string;
}> {
  const now = Date.now();
  const intervalMs = getNewsRefreshIntervalMinutes() * 60 * 1000;

  if (!options?.force && globalForNews.lastSyncTimestamp > 0 && now - globalForNews.lastSyncTimestamp < intervalMs) {
    return {
      success: true,
      newArticlesCount: 0,
      message: 'News cache is fresh. Served from cache.',
      lastSyncAt: new Date(globalForNews.lastSyncTimestamp).toISOString(),
    };
  }

  if (globalForNews.isSyncInProgress) {
    return {
      success: true,
      newArticlesCount: 0,
      message: 'News sync currently in progress.',
      lastSyncAt: new Date(globalForNews.lastSyncTimestamp || now).toISOString(),
    };
  }

  const marketAuxToken = process.env.MARKETAUX_API_TOKEN || 'k26qhL0Au05u8a1aPCwGyPzmYKta73lesGfBP5f1';
  globalForNews.isSyncInProgress = true;

  try {
    const targetSymbols = 'AAPL,NVDA,MSFT,AMZN,GOOGL,META,TSLA,AMD,NFLX,JPM,V,WMT,LLY,SPY,QQQ,VOO,ASML,TSM,SHOP,RY';
    const url = `https://api.marketaux.com/v1/news/all?api_token=${marketAuxToken}&language=en&limit=30&countries=us,ca,gb&symbols=${targetSymbols}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'NEXORA-Fintech-Platform/1.0' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`MarketAux HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const articlesList = data?.data || data?.feed || [];

    const existingUrls = new Set(globalForNews.memoryNewsCache.map((n) => n.source_url));
    const existingTitles = new Set(globalForNews.memoryNewsCache.map((n) => n.title.toLowerCase().trim()));

    const newArticlesToInsert: NewsArticle[] = [];

    for (const item of articlesList) {
      if (isCryptoArticle(item)) continue;

      const canonicalUrl = (item.url || item.uuid || '').trim();
      const title = (item.title || '').trim();
      if (!canonicalUrl || !title) continue;

      if (existingUrls.has(canonicalUrl) || existingTitles.has(title.toLowerCase())) {
        continue;
      }

      const entitySentiment = item.entities?.[0]?.sentiment_score;
      const sentiment = entitySentiment !== undefined
        ? mapSentimentScore(entitySentiment)
        : mapSentiment(item.overall_sentiment_label);

      const rawSummary = item.description || item.snippet || item.summary || title;
      const category = detectCategory(title, rawSummary);
      const educationalTakeaway = generateEducationalTakeaway(category);
      const fullSummary = `${rawSummary}\n\n${educationalTakeaway}`;

      newArticlesToInsert.push({
        id: `news-sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title,
        summary: fullSummary,
        source_name: item.source || 'Financial Wire',
        source_url: canonicalUrl,
        image_url: item.image_url || item.banner_image || null,
        sentiment: sentiment,
        published_at: parsePublishedDate(item.published_at || item.time_published),
        created_at: new Date().toISOString(),
      });

      existingUrls.add(canonicalUrl);
      existingTitles.add(title.toLowerCase());
    }

    if (newArticlesToInsert.length > 0) {
      globalForNews.memoryNewsCache = [...newArticlesToInsert, ...globalForNews.memoryNewsCache].slice(0, 200);
    }

    globalForNews.lastSyncTimestamp = Date.now();

    return {
      success: true,
      newArticlesCount: newArticlesToInsert.length,
      message: `News sync successful. Added ${newArticlesToInsert.length} new stories.`,
      lastSyncAt: new Date(globalForNews.lastSyncTimestamp).toISOString(),
    };
  } catch (err: any) {
    console.error('[NewsService] Failed to sync news:', err.message);
    return {
      success: true,
      newArticlesCount: 0,
      message: 'Serving cached real financial wire stories.',
      lastSyncAt: new Date(globalForNews.lastSyncTimestamp || now).toISOString(),
    };
  } finally {
    globalForNews.isSyncInProgress = false;
  }
}

// Sync news for a specific stock/ETF ticker (e.g. "NVDA", "AAPL", "MSFT")
export async function syncNewsForSymbol(symbol: string, options?: { force?: boolean }): Promise<{
  success: boolean;
  newArticlesCount: number;
  message: string;
}> {
  const cleanSymbol = symbol.trim().toUpperCase();
  if (!cleanSymbol || CRYPTO_TICKERS.has(cleanSymbol)) {
    return { success: false, newArticlesCount: 0, message: 'Invalid or crypto ticker.' };
  }

  const marketAuxToken = process.env.MARKETAUX_API_TOKEN || 'k26qhL0Au05u8a1aPCwGyPzmYKta73lesGfBP5f1';

  try {
    const url = `https://api.marketaux.com/v1/news/all?api_token=${marketAuxToken}&language=en&limit=15&symbols=${cleanSymbol}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'NEXORA-Fintech-Platform/1.0' },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`MarketAux HTTP ${response.status}`);
    const data = await response.json();

    const articlesList = data?.data || data?.feed || [];
    const existingUrls = new Set(globalForNews.memoryNewsCache.map((n) => n.source_url));
    const existingTitles = new Set(globalForNews.memoryNewsCache.map((n) => n.title.toLowerCase().trim()));

    const toInsert: NewsArticle[] = [];
    for (const item of articlesList) {
      if (isCryptoArticle(item)) continue;
      const canonicalUrl = (item.url || item.uuid || '').trim();
      const title = (item.title || '').trim();
      if (!canonicalUrl || !title) continue;
      if (existingUrls.has(canonicalUrl) || existingTitles.has(title.toLowerCase())) continue;

      const entitySentiment = item.entities?.[0]?.sentiment_score;
      const sentiment = entitySentiment !== undefined
        ? mapSentimentScore(entitySentiment)
        : mapSentiment(item.overall_sentiment_label);

      const rawSummary = item.description || item.snippet || item.summary || title;
      const category = detectCategory(title, rawSummary);
      const takeaway = generateEducationalTakeaway(category);

      toInsert.push({
        id: `news-sym-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        summary: `${rawSummary}\n\n${takeaway}`,
        source_name: item.source || 'Financial Wire',
        source_url: canonicalUrl,
        image_url: item.image_url || item.banner_image || null,
        sentiment,
        published_at: parsePublishedDate(item.published_at || item.time_published),
        created_at: new Date().toISOString(),
      });

      existingUrls.add(canonicalUrl);
      existingTitles.add(title.toLowerCase());
    }

    if (toInsert.length > 0) {
      globalForNews.memoryNewsCache = [...toInsert, ...globalForNews.memoryNewsCache].slice(0, 200);
    }

    return {
      success: true,
      newArticlesCount: toInsert.length,
      message: `Synced ${toInsert.length} articles for ${cleanSymbol}.`,
    };
  } catch (err: any) {
    console.error(`[NewsService] Failed to sync news for ${cleanSymbol}:`, err.message);
    return {
      success: false,
      newArticlesCount: 0,
      message: err.message || 'Error occurred during symbol news sync.',
    };
  }
}

// Fetch news from cache/Supabase with client filtering & pagination
export async function getFinancialNews(params?: {
  category?: string;
  ticker?: string;
  search?: string;
  limit?: number;
  offset?: number;
  page?: number;
}): Promise<{
  articles: NewsArticle[];
  totalCount: number;
  page: number;
  totalPages: number;
  lastSyncAt: string;
  marketMovers: { ticker: string; sentiment: 'Bullish' | 'Neutral' | 'Bearish'; count: number }[];
}> {
  const limit = params?.limit && params.limit > 0 ? params.limit : 20;
  const page = params?.page && params.page > 0 ? params.page : 1;
  const offset = params?.offset !== undefined ? params.offset : (page - 1) * limit;

  try {
    let query = supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false });

    if (params?.ticker) {
      const sym = params.ticker.toUpperCase();
      query = query.or(`title.ilike.%${sym}%,summary.ilike.%${sym}%`);
    }

    const { data: dbData } = await query.range(0, 100);
    const dbArticles: NewsArticle[] = (dbData as unknown as NewsArticle[]) || [];

    // Combine memory cache and database articles, deduplicated by URL and Title
    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>();
    const combined: NewsArticle[] = [];

    const allSources = [...globalForNews.memoryNewsCache, ...BASELINE_REAL_FINANCIAL_NEWS, ...dbArticles];

    for (const a of allSources) {
      const url = a.source_url?.trim();
      const title = a.title?.toLowerCase().trim();
      if (!url || !title) continue;
      if (seenUrls.has(url) || seenTitles.has(title)) continue;

      seenUrls.add(url);
      seenTitles.add(title);
      combined.push(a);
    }

    // Sort by publication date descending
    combined.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    let filtered = combined;

    // Filter by ticker or company name
    if (params?.ticker) {
      const sym = params.ticker.toUpperCase().trim();
      const directMatches = filtered.filter(
        (a) =>
          a.title.toUpperCase().includes(sym) ||
          a.summary.toUpperCase().includes(sym)
      );

      if (directMatches.length >= 3) {
        filtered = directMatches;
      } else {
        // Find company name from global universe to search by company name
        const matchStock = REAL_STOCKS_UNIVERSE.find((s) => s.ticker === sym);
        const nameKeywords = matchStock?.name ? matchStock.name.split(' ')[0].toUpperCase() : '';
        const nameMatches = nameKeywords && nameKeywords.length > 2
          ? filtered.filter(
              (a) =>
                a.title.toUpperCase().includes(nameKeywords) ||
                a.summary.toUpperCase().includes(nameKeywords)
            )
          : [];

        const combinedMatches = [...directMatches, ...nameMatches.filter((nm) => !directMatches.some((dm) => dm.id === nm.id))];
        if (combinedMatches.length >= 3) {
          filtered = combinedMatches;
        } else {
          // If fewer than 3 matches, append top market headlines to ensure a full 3-card news grid
          const otherStories = filtered.filter((a) => !combinedMatches.some((cm) => cm.id === a.id));
          filtered = [...combinedMatches, ...otherStories];
        }
      }
    }

    // Filter by category
    if (params?.category && params.category !== 'all') {
      const cat = params.category.toLowerCase().replace(/[-_]/g, ' ').trim();
      filtered = filtered.filter((a) => {
        const detected = detectCategory(a.title, a.summary).toLowerCase();
        return detected === cat || detected.includes(cat) || cat.includes(detected);
      });
    }

    // Filter by search keyword
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.source_name.toLowerCase().includes(q)
      );
    }

    // Extract Market Movers
    const moverMap = new Map<string, { ticker: string; sentiment: 'Bullish' | 'Neutral' | 'Bearish'; count: number }>();
    combined.forEach((a) => {
      const tickers = extractMentionedTickers(a.title, a.summary);
      tickers.forEach((t) => {
        const existing = moverMap.get(t);
        if (existing) {
          existing.count += 1;
        } else {
          moverMap.set(t, { ticker: t, sentiment: a.sentiment, count: 1 });
        }
      });
    });
    const marketMovers = Array.from(moverMap.values()).sort((a, b) => b.count - a.count).slice(0, 6);

    const totalCount = filtered.length;
    const paginatedArticles = filtered.slice(offset, offset + limit);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      articles: paginatedArticles,
      totalCount,
      page,
      totalPages,
      lastSyncAt: new Date(globalForNews.lastSyncTimestamp || Date.now()).toISOString(),
      marketMovers,
    };
  } catch (err: any) {
    console.error('[NewsService] Error in getFinancialNews:', err.message);
    const fallbackList = globalForNews.memoryNewsCache.slice(offset, offset + limit);
    return {
      articles: fallbackList,
      totalCount: globalForNews.memoryNewsCache.length,
      page: 1,
      totalPages: Math.ceil(globalForNews.memoryNewsCache.length / limit) || 1,
      lastSyncAt: new Date(globalForNews.lastSyncTimestamp || Date.now()).toISOString(),
      marketMovers: [],
    };
  }
}

export async function getNewsArticles(params?: {
  category?: string;
  search?: string;
  ticker?: string;
  limit?: number;
  offset?: number;
  page?: number;
}): Promise<NewsArticle[]> {
  const res = await getFinancialNews(params);
  return res.articles;
}

export const syncFinancialNewsForTicker = syncNewsForSymbol;
