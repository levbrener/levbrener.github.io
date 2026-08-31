import { useMemo, useState } from 'react';
import { BookOpenText, ChevronRight, Clock3, Instagram, Menu, Newspaper, Search, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, useRoute } from 'wouter';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Story = { id: string; section: string; title: string; dek: string; byline: string; time: string; image: string; body?: string; featured?: boolean; color?: string };
// Add new article objects here. They automatically appear in Archive; the first four also appear on Front page.
const initialStories: Story[] = [
  { id: 'library-after-hours', section: 'Front page', title: 'The library after hours', dek: 'When the doors lock, a second kind of public life begins in Wheaton.', byline: 'Mara Bell', time: '8 min read', image: '/library.jpg', featured: true },
  { id: 'long-way-home', section: 'Field notes', title: 'The long way home', dek: 'A walk down Main Street, with no errands to run and nowhere much to be.', byline: 'Eli Tannen', time: '6 min read', image: '/main-street.jpg' },
  { id: 'soup-season', section: 'At the table', title: 'Soup season has arrived', dek: 'Three kitchens, four generations, one pot that keeps finding its way back.', byline: 'June Park', time: '4 min read', image: '/soup.jpg' },
  { id: 'small-business', section: 'Commerce', title: 'A little more than a hardware store', dek: 'At Kirby’s, the inventory is nails. The service is knowing your name.', byline: 'Mara Bell', time: '5 min read', image: '/hardware.jpg' },
  { id: 'weather-window', section: 'Weather desk', title: 'A window for weather', dek: 'The forecast, with less false confidence and more useful detail.', byline: 'The Weekly desk', time: '3 min read', image: '/main-street.jpg' },
  { id: 'porch-light', section: 'People', title: 'Leave the porch light on', dek: 'Notes from a neighborhood that still believes in lingering.', byline: 'Owen Wirth', time: '7 min read', image: '/library.jpg' },
];
const stories: Story[] = initialStories;

function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className={`flex items-center gap-3 no-underline ${compact ? 'gap-2' : ''}`} data-testid="link-home">
    <span className="grid h-10 w-10 place-items-center border border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_hsl(var(--accent))]"><Newspaper size={21} strokeWidth={1.7} /></span>
    <span className="font-editorial text-[1.55rem] font-bold tracking-[-.045em] leading-none">The Wheaton<br /><i className="font-normal">Weekly</i></span>
  </Link>;
}

function Header({ onSearch }: { onSearch: () => void }) {
  const [menu, setMenu] = useState(false);
  return <header className="site-header">
    <div className="utility-bar">
      <div className="utility-inner">
        <div className="flex items-center gap-3">
          <button className="md:hidden" onClick={() => setMenu(!menu)} aria-label="Open menu" data-testid="button-menu"><Menu size={18} /></button>
        </div>
        <div className="utility-actions">
          <button onClick={onSearch} className="utility-button utility-search" data-testid="button-search"><Search size={14} /><span className="hidden sm:inline">Search</span></button>
          <Link href="/section/all" className="utility-link hidden sm:flex" data-testid="link-archive"><BookOpenText size={14} /> Archive</Link>
        </div>
      </div>
    </div>
    {menu && <div className="mobile-menu page-in">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 py-4 text-[11px] uppercase tracking-[.17em]">
        <Link href="/" onClick={() => setMenu(false)} data-testid="mobile-link-front">Front page</Link>
        <Link href="/section/all" onClick={() => setMenu(false)} data-testid="mobile-link-archive">Archive</Link>
        <Link href="/about" onClick={() => setMenu(false)} data-testid="mobile-link-about">About</Link>
      </div>
    </div>}
  </header>;
}

function Masthead() {
  return <div className="masthead-shell mx-auto max-w-[1320px] px-5 lg:px-8">
    <div className="masthead">
      <p className="masthead-eyebrow">Wheaton’s newspaper of record since 2026</p>
      <h1 className="font-editorial">The Wheaton<br /><span>Weekly</span></h1>
    </div>
    <nav className="site-nav" aria-label="Main navigation">
      <Link href="/" data-testid="link-front-page">Front page</Link>
      <Link href="/section/all" data-testid="link-archive-nav">Archive</Link>
      <Link href="/about" data-testid="link-about-nav">About</Link>
    </nav>
  </div>;
}

function StoryCard({ story, large = false }: { story: Story; large?: boolean }) {
  return <article className={`story-hover stagger-in ${large ? 'stagger-1' : ''} group ${large ? 'grid md:grid-cols-[1.07fr_.93fr]' : ''}`} data-testid={`card-story-${story.id}`}>
    <Link href={`/article/${story.id}`} className={`block overflow-hidden ${large ? 'min-h-[360px]' : 'aspect-[1.3/1]'}`} data-testid={`link-story-${story.id}`}><img src={story.image} alt="" className="h-full w-full object-cover grayscale-[18%] transition duration-500 group-hover:scale-[1.03] group-hover:grayscale-0" /></Link>
      <div className={`${large ? 'flex flex-col justify-center bg-primary px-6 py-7 text-primary-foreground md:px-10 md:py-10' : 'pt-4'}`}>
      <div className="mb-2"><span className={`text-[10px] uppercase tracking-[.18em] ${large ? 'text-primary-foreground/70' : 'text-accent'}`}>{story.section}</span></div>
      <Link href={`/article/${story.id}`} className="no-underline" data-testid={`headline-${story.id}`}><h2 className={`font-editorial font-bold leading-[.96] tracking-[-.045em] ${large ? 'text-[clamp(2.15rem,4.5vw,4.35rem)]' : 'text-[clamp(1.7rem,2.5vw,2.45rem)]'} ${large ? 'text-primary-foreground' : 'text-foreground group-hover:text-accent'}`}>{story.title}</h2></Link>
      <p className={`mt-3 font-editorial leading-snug ${large ? 'text-lg text-primary-foreground/80' : 'text-base text-muted-foreground'}`}>{story.dek}</p>
      <p className={`mt-5 text-[10px] uppercase tracking-[.15em] ${large ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>By {story.byline} <span className="mx-1">·</span> {story.time}</p>
    </div>
  </article>;
}

function HomePage({ onSearch }: { onSearch: () => void }) {
  return <main className="page-in">
    <Masthead />
    <section className="mx-auto max-w-[1320px] px-5 py-8 lg:px-8 lg:py-12">
      <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-accent" /><span className="text-[10px] uppercase tracking-[.2em]">This week’s front page</span></div><button onClick={onSearch} className="hidden items-center gap-2 text-[10px] uppercase tracking-[.17em] text-muted-foreground hover:text-accent sm:flex" data-testid="button-search-stories">Search the paper <Search size={15} /></button></div>
       <StoryCard story={stories[0]} large />
      <div className="mt-8 grid gap-x-7 gap-y-10 border-t border-border pt-8 md:grid-cols-3">
         {stories.slice(1, 4).map((story) => <StoryCard key={story.id} story={story} />)}
      </div>
    </section>
    <Footer />
  </main>;
}

function AboutPage() {
  return (
    <main className="page-in">
      <div className="mx-auto max-w-[1320px] px-5 py-9 lg:px-8 lg:py-14">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-accent" data-testid="link-about-back-home">← Back to front page</Link>
        <div className="about-hero">
          <p className="mb-4 text-[10px] uppercase tracking-[.22em] text-accent">About the paper</p>
          <h1 className="font-editorial">Independent Reporting, Weekly Publications</h1>
        </div>
        <div className="about-grid">
          <div className="about-fact">
            <p className="about-kicker">The Weekly in brief</p>
            <div className="about-fact-row"><span>Founded</span><strong>2026</strong></div>
            <div className="about-fact-row"><span>Based in</span><strong>Silver Spring, Maryland</strong></div>
            <div className="about-fact-row"><span>Coverage</span><strong>People, places &amp; daily life</strong></div>
            <div className="about-fact-row"><span>Approach</span><strong>Local, independent</strong></div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function SectionPage({ section }: { section: string }) {
  const filtered = section === 'Archive' ? stories : stories.filter((s) => s.section === section);
  return <main className="mx-auto max-w-[1320px] px-5 py-9 page-in lg:px-8 lg:py-14"><Link href="/" className="mb-9 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-accent" data-testid="link-archive-back-home">← Back to front page</Link><div className="mb-8 border-b-[3px] border-foreground pb-5"><p className="mb-3 text-[10px] uppercase tracking-[.22em] text-accent">The Wheaton Weekly</p><h1 className="font-editorial text-6xl font-bold tracking-[-.06em] md:text-8xl">{section}</h1><p className="mt-3 max-w-lg font-editorial text-lg text-muted-foreground">The people, places and small arguments shaping life in Wheaton.</p></div><div className="grid gap-x-7 gap-y-12 md:grid-cols-3">{filtered.map((story) => <StoryCard key={story.id} story={story} />)}</div>{filtered.length === 0 && <div className="py-20 text-center"><p className="font-editorial text-3xl">Nothing filed here yet.</p></div>}</main>;
}

function ArticlePage() {
  const [, params] = useRoute('/article/:id');
  const story = stories.find((s) => s.id === params?.id) ?? stories[0];
  const paragraphs = story.body?.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean) ?? [
    'There are places in town that only reveal themselves when the usual rush has gone somewhere else. This is one of them.',
    'At 8:42 on a Tuesday evening, the lights are still on at the library. Not all of them—just the patient ones over the long tables, where a handful of neighbors have settled in with the quiet purpose of people who know a good room when they find one.',
    '“You start to notice who comes in,” says a volunteer behind the desk. “The same faces, different reasons. That’s the nice thing about a library. Nobody needs to explain themselves.”',
    'Outside, Main Street is doing its usual evening impression: one dog, two bicycles, a delivery van that has missed its turn. Inside, the last reader turns a page. The room holds.',
  ];
  return <main className="page-in"><div className="mx-auto max-w-[1120px] px-5 py-9 lg:px-8 lg:py-14"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-accent" data-testid="link-back-home">← Back to front page</Link><div className="max-w-4xl"><p className="mb-4 text-[10px] uppercase tracking-[.21em] text-accent">{story.section}</p><h1 className="font-editorial text-[clamp(3rem,8vw,7.8rem)] font-bold leading-[.82] tracking-[-.07em]">{story.title}</h1><p className="mt-7 max-w-2xl font-editorial text-2xl leading-tight text-muted-foreground md:text-3xl">{story.dek}</p><div className="mt-7 flex flex-wrap items-center gap-5 text-[10px] uppercase tracking-[.16em]"><span>By {story.byline}</span><span className="flex items-center gap-2 text-muted-foreground"><Clock3 size={14} /> {story.time}</span></div></div><img src={story.image} alt="" className="mt-10 max-h-[590px] w-full object-cover md:mt-14" /><div className="mx-auto mt-10 grid max-w-4xl gap-8 md:grid-cols-[80px_1fr]"><aside className="hidden border-t border-border pt-3 text-[10px] uppercase tracking-[.16em] text-muted-foreground md:block">The<br />story</aside><div className="prose prose-lg max-w-none font-editorial leading-relaxed text-foreground">{paragraphs.map((paragraph, index) => <p key={`${story.id}-paragraph-${index}`} className={index === 0 ? 'lead text-2xl' : undefined}>{paragraph}</p>)}<p className="text-sm uppercase tracking-[.16em] text-muted-foreground">Reporting by {story.byline} · Photographs from the Weekly archive</p></div></div></div><Footer /></main>;
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState(''); const found = useMemo(() => stories.filter((s) => `${s.title} ${s.dek} ${s.section}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="fixed inset-0 z-50 bg-background/95 p-5 backdrop-blur-sm page-in lg:p-12"><div className="mx-auto max-w-[900px]"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.2em] text-accent">Search the paper</p><button onClick={onClose} data-testid="button-close-search"><X size={24} /></button></div><div className="mt-14 flex items-center gap-4 border-b-[3px] border-foreground pb-3"><Search size={25} className="text-accent" /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try “library”, “soup”, or a name…" className="w-full bg-transparent font-editorial text-3xl outline-none placeholder:text-muted-foreground/50 md:text-5xl" data-testid="input-search" /></div><div className="mt-10 grid gap-5">{query && found.map((story) => <Link onClick={onClose} href={`/article/${story.id}`} key={story.id} className="group flex items-center justify-between border-b border-border pb-5" data-testid={`search-result-${story.id}`}><div><p className="text-[10px] uppercase tracking-[.18em] text-accent">{story.section}</p><h2 className="mt-1 font-editorial text-3xl group-hover:text-accent">{story.title}</h2><p className="mt-1 font-editorial text-muted-foreground">{story.dek}</p></div><ChevronRight className="shrink-0 text-accent" /></Link>)}{query && found.length === 0 && <p className="font-editorial text-2xl text-muted-foreground">No luck. Try a broader search, or ask someone at the diner.</p>}{!query && <p className="font-editorial text-2xl text-muted-foreground">Search stories, names, places and the little things worth remembering.</p>}</div></div></div>;
}

function Footer() {
  return <footer className="border-t-[3px] border-foreground bg-primary text-primary-foreground">
    <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-12 lg:grid-cols-[1.4fr_1fr] lg:px-8">
      <div><h2 className="font-editorial text-5xl font-bold leading-[.82] tracking-[-.06em]">The Wheaton<br /><span className="font-normal">Weekly</span></h2></div>
      <div><p className="mb-4 text-[10px] uppercase tracking-[.2em] text-primary-foreground/55">Explore</p><div className="flex flex-col gap-3 text-sm"><Link href="/" data-testid="footer-link-front">Front page</Link><Link href="/section/all" data-testid="footer-link-sections">Archive</Link><Link href="/about" data-testid="footer-link-about">About</Link></div></div>
    </div>
     <div className="mx-auto flex max-w-[1320px] items-center justify-between border-t border-primary-foreground/20 px-5 py-5 text-[9px] uppercase tracking-[.16em] text-primary-foreground/55 lg:px-8"><span>The Wheaton Weekly</span><span className="hidden items-center gap-5 md:flex"><span>Silver Spring, Maryland</span><Instagram size={14} /></span></div>
  </footer>;
}

function Shell({ children, onSearch }: { children: ReactNode; onSearch: () => void }) {
  return <><Header onSearch={onSearch} />{children}</>;
}

function RouterView({ onSearch }: { onSearch: () => void }) {
  return <Switch><Route path="/" component={() => <HomePage onSearch={onSearch} />} /><Route path="/article/:id" component={ArticlePage} /><Route path="/section/:section" component={() => <SectionPage section="Archive" />} /><Route path="/about" component={AboutPage} /><Route component={NotFound} /></Switch>;
}

function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  return <QueryClientProvider client={queryClient}><TooltipProvider><div className="min-h-[100dvh]"><Shell onSearch={() => setSearchOpen(true)}><RouterView onSearch={() => setSearchOpen(true)} /></Shell>{searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}</div><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;