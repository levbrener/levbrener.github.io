import { useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, BookOpenText, ChevronRight, Clock3, Feather, Instagram, Menu, Moon, Newspaper, Plus, Search, Sun, Type, X, Minus } from 'lucide-react';
import { Link, Route, Switch, useLocation, useRoute } from 'wouter';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Story = { id: string; section: string; title: string; dek: string; byline: string; time: string; image: string; featured?: boolean; color?: string };
const stories: Story[] = [
  { id: 'library-after-hours', section: 'Front page', title: 'The library after hours', dek: 'When the doors lock, a second kind of public life begins in Wheaton.', byline: 'Mara Bell', time: '8 min read', image: '/library.jpg', featured: true },
  { id: 'long-way-home', section: 'Field notes', title: 'The long way home', dek: 'A walk down Main Street, with no errands to run and nowhere much to be.', byline: 'Eli Tannen', time: '6 min read', image: '/main-street.jpg' },
  { id: 'soup-season', section: 'At the table', title: 'Soup season has arrived', dek: 'Three kitchens, four generations, one pot that keeps finding its way back.', byline: 'June Park', time: '4 min read', image: '/soup.jpg' },
  { id: 'small-business', section: 'Commerce', title: 'A little more than a hardware store', dek: 'At Kirby’s, the inventory is nails. The service is knowing your name.', byline: 'Mara Bell', time: '5 min read', image: '/hardware.jpg' },
  { id: 'weather-window', section: 'Weather desk', title: 'A window for weather', dek: 'The forecast, with less false confidence and more useful detail.', byline: 'The Weekly desk', time: '3 min read', image: '/main-street.jpg' },
  { id: 'porch-light', section: 'People', title: 'Leave the porch light on', dek: 'Notes from a neighborhood that still believes in lingering.', byline: 'Owen Wirth', time: '7 min read', image: '/library.jpg' },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className={`flex items-center gap-3 no-underline ${compact ? 'gap-2' : ''}`} data-testid="link-home">
    <span className="grid h-10 w-10 place-items-center border border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_hsl(var(--accent))]"><Newspaper size={21} strokeWidth={1.7} /></span>
    <span className="font-editorial text-[1.55rem] font-bold tracking-[-.045em] leading-none">The Wheaton<br /><i className="font-normal">Weekly</i></span>
  </Link>;
}

function SaveButton({ storyId, saved, onSave }: { storyId: string; saved: boolean; onSave: (id: string) => void }) {
  return <button onClick={() => onSave(storyId)} aria-label={saved ? 'Remove from saved stories' : 'Save story'} data-testid={`button-save-${storyId}`} className={`group inline-flex items-center gap-2 border px-3 py-2 text-[10px] uppercase tracking-[.16em] transition-colors ${saved ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-transparent hover:border-primary hover:text-primary'}`}>
    {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />} <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
  </button>;
}

function Header({ dark, setDark, onSearch, savedCount, fontScale, setFontScale }: { dark: boolean; setDark: (value: boolean) => void; onSearch: () => void; savedCount: number; fontScale: number; setFontScale: (value: number) => void }) {
  const [menu, setMenu] = useState(false);
  return <header className="site-header">
    <div className="utility-bar">
      <div className="utility-inner">
        <div className="flex items-center gap-3">
          <button className="md:hidden" onClick={() => setMenu(!menu)} aria-label="Open menu" data-testid="button-menu"><Menu size={18} /></button>
        </div>
        <div className="utility-actions">
          <button onClick={onSearch} className="utility-button utility-search" data-testid="button-search"><Search size={14} /><span className="hidden sm:inline">Search</span></button>
          <button onClick={() => setDark(!dark)} className="utility-button" data-testid="button-theme">{dark ? <Sun size={14} /> : <Moon size={14} />}<span className="hidden sm:inline">{dark ? 'Light' : 'Dark'}</span></button>
          <div className="utility-font" aria-label="Reading controls"><Type size={14} /><button onClick={() => setFontScale(Math.max(.9, fontScale - .05))} aria-label="Decrease text size" data-testid="button-font-smaller">−</button><button onClick={() => setFontScale(Math.min(1.15, fontScale + .05))} aria-label="Increase text size" data-testid="button-font-larger">＋</button></div>
          <Link href="/section/all" className="utility-link hidden sm:flex" data-testid="link-archive"><BookOpenText size={14} /> Archive</Link>
          <span className="utility-divider" />
          <Link href="/saved" className="utility-link" data-testid="link-saved">Saved {savedCount > 0 && <span className="text-accent">({savedCount})</span>}</Link>
          <button onClick={() => window.alert('Subscriptions open on the first Thursday of every month. We saved your seat.')} className="utility-subscribe" data-testid="button-subscribe">Subscribe</button>
        </div>
      </div>
    </div>
    {menu && <div className="mobile-menu page-in">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 py-4 text-[11px] uppercase tracking-[.17em]">
        <Link href="/" onClick={() => setMenu(false)} data-testid="mobile-link-front">Front page</Link>
        <Link href="/section/all" onClick={() => setMenu(false)} data-testid="mobile-link-archive">Archive</Link>
        <Link href="/saved" onClick={() => setMenu(false)} data-testid="mobile-link-saved">Saved stories ({savedCount})</Link>
      </div>
    </div>}
  </header>;
}

function Masthead({ savedCount = 0 }: { savedCount?: number }) {
  return <div className="masthead-shell mx-auto max-w-[1320px] px-5 lg:px-8">
    <div className="masthead">
      <p className="masthead-eyebrow">Wheaton’s newspaper of record since 2026</p>
      <h1 className="font-editorial">The Wheaton<br /><span>Weekly</span></h1>
    </div>
    <nav className="site-nav" aria-label="Main navigation">
      <Link href="/" data-testid="link-front-page">Front page</Link>
      <Link href="/saved" className="saved-nav-link" data-testid="link-saved-nav">Saved {savedCount > 0 && <span>({savedCount})</span>}</Link>
      <Link href="/section/all" data-testid="link-archive-nav">Archive</Link>
    </nav>
  </div>;
}

function StoryCard({ story, saved, onSave, large = false }: { story: Story; saved: boolean; onSave: (id: string) => void; large?: boolean }) {
  return <article className={`story-hover stagger-in ${large ? 'stagger-1' : ''} group ${large ? 'grid md:grid-cols-[1.07fr_.93fr]' : ''}`} data-testid={`card-story-${story.id}`}>
    <Link href={`/article/${story.id}`} className={`block overflow-hidden ${large ? 'min-h-[360px]' : 'aspect-[1.3/1]'}`} data-testid={`link-story-${story.id}`}><img src={story.image} alt="" className="h-full w-full object-cover grayscale-[18%] transition duration-500 group-hover:scale-[1.03] group-hover:grayscale-0" /></Link>
    <div className={`${large ? 'flex flex-col justify-center bg-primary px-6 py-7 text-primary-foreground md:px-10 md:py-10' : 'pt-4'}`}>
      <div className="mb-2 flex items-center justify-between gap-4"><span className={`text-[10px] uppercase tracking-[.18em] ${large ? 'text-primary-foreground/70' : 'text-accent'}`}>{story.section}</span><SaveButton storyId={story.id} saved={saved} onSave={onSave} /></div>
      <Link href={`/article/${story.id}`} className="no-underline" data-testid={`headline-${story.id}`}><h2 className={`font-editorial font-bold leading-[.96] tracking-[-.045em] ${large ? 'text-[clamp(2.15rem,4.5vw,4.35rem)]' : 'text-[clamp(1.7rem,2.5vw,2.45rem)]'} ${large ? 'text-primary-foreground' : 'text-foreground group-hover:text-accent'}`}>{story.title}</h2></Link>
      <p className={`mt-3 font-editorial leading-snug ${large ? 'text-lg text-primary-foreground/80' : 'text-base text-muted-foreground'}`}>{story.dek}</p>
      <p className={`mt-5 text-[10px] uppercase tracking-[.15em] ${large ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>By {story.byline} <span className="mx-1">·</span> {story.time}</p>
    </div>
  </article>;
}

function HomePage({ saved, onSave, onSearch }: { saved: string[]; onSave: (id: string) => void; onSearch: () => void }) {
  return <main className="page-in">
    <Masthead savedCount={saved.length} />
    <section className="mx-auto max-w-[1320px] px-5 py-8 lg:px-8 lg:py-12">
      <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-accent" /><span className="text-[10px] uppercase tracking-[.2em]">This week’s front page</span></div><button onClick={onSearch} className="hidden items-center gap-2 text-[10px] uppercase tracking-[.17em] text-muted-foreground hover:text-accent sm:flex" data-testid="button-search-stories">Search the paper <Search size={15} /></button></div>
      <StoryCard story={stories[0]} large saved={saved.includes(stories[0].id)} onSave={onSave} />
      <div className="mt-8 grid gap-x-7 gap-y-10 border-t border-border pt-8 md:grid-cols-3">
        {stories.slice(1, 4).map((story) => <StoryCard key={story.id} story={story} saved={saved.includes(story.id)} onSave={onSave} />)}
      </div>
    </section>
    <section className="border-y border-foreground bg-secondary/50">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-10 lg:grid-cols-[1.2fr_.8fr] lg:px-8">
        <div><p className="mb-3 text-[10px] uppercase tracking-[.2em] text-accent">The editor’s note</p><h2 className="max-w-xl font-editorial text-4xl leading-[.95] tracking-[-.04em] md:text-6xl">Good news is not the same as nice news.</h2><p className="mt-5 max-w-xl font-editorial text-lg leading-relaxed text-muted-foreground">We’re interested in the stuff that happens between the official lines: the quiet fix, the stubborn question, the person who keeps showing up. This week, look closely.</p><p className="mt-5 text-[10px] uppercase tracking-[.16em]">— Nora Whitcomb, editor & publisher</p></div>
        <div className="flex flex-col justify-end border-l border-border pl-7"><Feather className="mb-7 text-accent" size={28} strokeWidth={1.2} /><p className="font-editorial text-2xl leading-tight">“A paper should have a point of view. Otherwise it’s just a pile of facts.”</p><button onClick={() => window.alert('Nora’s full editor letter is delivered with Thursday’s edition.')} className="mt-6 flex w-fit items-center gap-2 text-[10px] uppercase tracking-[.16em] text-accent hover:gap-3 transition-all" data-testid="button-read-note">Read the full note <ChevronRight size={15} /></button></div>
      </div>
    </section>
    <Footer />
  </main>;
}

function SectionPage({ saved, onSave, section }: { saved: string[]; onSave: (id: string) => void; section: string }) {
  const filtered = section === 'Archive' ? stories : stories.filter((s) => s.section === section);
  return <main className="mx-auto max-w-[1320px] px-5 py-9 page-in lg:px-8 lg:py-14"><div className="mb-8 border-b-[3px] border-foreground pb-5"><p className="mb-3 text-[10px] uppercase tracking-[.22em] text-accent">The Wheaton Weekly</p><h1 className="font-editorial text-6xl font-bold tracking-[-.06em] md:text-8xl">{section}</h1><p className="mt-3 max-w-lg font-editorial text-lg text-muted-foreground">The people, places and small arguments shaping life in Wheaton.</p></div><div className="grid gap-x-7 gap-y-12 md:grid-cols-3">{filtered.map((story) => <StoryCard key={story.id} story={story} saved={saved.includes(story.id)} onSave={onSave} />)}</div>{filtered.length === 0 && <div className="py-20 text-center"><p className="font-editorial text-3xl">Nothing filed here yet.</p></div>}</main>;
}

function ArticlePage({ saved, onSave }: { saved: string[]; onSave: (id: string) => void }) {
  const [, params] = useRoute('/article/:id'); const story = stories.find((s) => s.id === params?.id) ?? stories[0];
  return <main className="page-in"><div className="mx-auto max-w-[1120px] px-5 py-9 lg:px-8 lg:py-14"><Link href="/" className="mb-10 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-accent" data-testid="link-back-home">← Back to front page</Link><div className="max-w-4xl"><p className="mb-4 text-[10px] uppercase tracking-[.21em] text-accent">{story.section}</p><h1 className="font-editorial text-[clamp(3rem,8vw,7.8rem)] font-bold leading-[.82] tracking-[-.07em]">{story.title}</h1><p className="mt-7 max-w-2xl font-editorial text-2xl leading-tight text-muted-foreground md:text-3xl">{story.dek}</p><div className="mt-7 flex flex-wrap items-center gap-5 text-[10px] uppercase tracking-[.16em]"><span>By {story.byline}</span><span className="flex items-center gap-2 text-muted-foreground"><Clock3 size={14} /> {story.time}</span><SaveButton storyId={story.id} saved={saved.includes(story.id)} onSave={onSave} /></div></div><img src={story.image} alt="" className="mt-10 max-h-[590px] w-full object-cover md:mt-14" /><div className="mx-auto mt-10 grid max-w-4xl gap-8 md:grid-cols-[80px_1fr]"><aside className="hidden border-t border-border pt-3 text-[10px] uppercase tracking-[.16em] text-muted-foreground md:block">The<br />story</aside><div className="prose prose-lg max-w-none font-editorial leading-relaxed text-foreground"><p className="lead text-2xl">There are places in town that only reveal themselves when the usual rush has gone somewhere else. This is one of them.</p><p>At 8:42 on a Tuesday evening, the lights are still on at the library. Not all of them—just the patient ones over the long tables, where a handful of neighbors have settled in with the quiet purpose of people who know a good room when they find one.</p><p>“You start to notice who comes in,” says a volunteer behind the desk. “The same faces, different reasons. That’s the nice thing about a library. Nobody needs to explain themselves.”</p><blockquote>“A town is made from the things people do when nobody is keeping score.”</blockquote><p>Outside, Main Street is doing its usual evening impression: one dog, two bicycles, a delivery van that has missed its turn. Inside, the last reader turns a page. The room holds.</p><p className="text-sm uppercase tracking-[.16em] text-muted-foreground">Reporting by {story.byline} · Photographs from the Weekly archive</p></div></div></div><Footer /></main>;
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState(''); const found = useMemo(() => stories.filter((s) => `${s.title} ${s.dek} ${s.section}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="fixed inset-0 z-50 bg-background/95 p-5 backdrop-blur-sm page-in lg:p-12"><div className="mx-auto max-w-[900px]"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.2em] text-accent">Search the paper</p><button onClick={onClose} data-testid="button-close-search"><X size={24} /></button></div><div className="mt-14 flex items-center gap-4 border-b-[3px] border-foreground pb-3"><Search size={25} className="text-accent" /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try “library”, “soup”, or a name…" className="w-full bg-transparent font-editorial text-3xl outline-none placeholder:text-muted-foreground/50 md:text-5xl" data-testid="input-search" /></div><div className="mt-10 grid gap-5">{query && found.map((story) => <Link onClick={onClose} href={`/article/${story.id}`} key={story.id} className="group flex items-center justify-between border-b border-border pb-5" data-testid={`search-result-${story.id}`}><div><p className="text-[10px] uppercase tracking-[.18em] text-accent">{story.section}</p><h2 className="mt-1 font-editorial text-3xl group-hover:text-accent">{story.title}</h2><p className="mt-1 font-editorial text-muted-foreground">{story.dek}</p></div><ChevronRight className="shrink-0 text-accent" /></Link>)}{query && found.length === 0 && <p className="font-editorial text-2xl text-muted-foreground">No luck. Try a broader search, or ask someone at the diner.</p>}{!query && <p className="font-editorial text-2xl text-muted-foreground">Search stories, names, places and the little things worth remembering.</p>}</div></div></div>;
}

function SavedPage({ saved, onSave }: { saved: string[]; onSave: (id: string) => void }) {
  const savedStories = stories.filter((s) => saved.includes(s.id));
  return <main className="mx-auto max-w-[1320px] px-5 py-9 page-in lg:px-8 lg:py-14"><div className="mb-9 border-b-[3px] border-foreground pb-5"><p className="mb-3 text-[10px] uppercase tracking-[.2em] text-accent">Your reading list</p><h1 className="font-editorial text-6xl font-bold tracking-[-.06em] md:text-8xl">Saved stories</h1></div>{savedStories.length ? <div className="grid gap-x-7 gap-y-12 md:grid-cols-3">{savedStories.map((story) => <StoryCard key={story.id} story={story} saved onSave={onSave} />)}</div> : <div className="grid min-h-[340px] place-items-center border border-dashed border-border text-center"><div><Bookmark size={28} className="mx-auto mb-5 text-accent" strokeWidth={1.3} /><h2 className="font-editorial text-4xl">Keep a few for later.</h2><p className="mt-3 font-editorial text-lg text-muted-foreground">Tap Save on a story and it’ll wait here, patiently.</p><Link href="/" className="mt-6 inline-block border border-primary bg-primary px-4 py-3 text-[10px] uppercase tracking-[.16em] text-primary-foreground" data-testid="link-browse-stories">Browse the front page</Link></div></div>}</main>;
}

function Footer() {
  return <footer className="border-t-[3px] border-foreground bg-primary text-primary-foreground">
    <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
      <div><h2 className="font-editorial text-5xl font-bold leading-[.82] tracking-[-.06em]">The Wheaton<br /><span className="font-normal">Weekly</span></h2><p className="mt-6 max-w-xs font-editorial text-lg text-primary-foreground/75">A local paper for a town with more going on than it lets on.</p></div>
      <div><p className="mb-4 text-[10px] uppercase tracking-[.2em] text-primary-foreground/55">Explore</p><div className="flex flex-col gap-3 text-sm"><Link href="/" data-testid="footer-link-front">Front page</Link><Link href="/section/all" data-testid="footer-link-sections">Archive</Link><Link href="/saved" data-testid="footer-link-saved">Saved stories</Link></div></div>
      <div><p className="mb-4 text-[10px] uppercase tracking-[.2em] text-primary-foreground/55">Stay close</p><p className="font-editorial text-lg text-primary-foreground/80">The good stuff, once a week. No noise. No breaking-news sirens.</p><button onClick={() => window.alert('You are on the list. Thursday mornings will now know where to find you.')} className="mt-4 border border-primary-foreground/50 px-4 py-2 text-[10px] uppercase tracking-[.15em] hover:bg-primary-foreground hover:text-primary" data-testid="footer-button-newsletter">Join the letter</button></div>
    </div>
    <div className="mx-auto flex max-w-[1320px] items-center justify-between border-t border-primary-foreground/20 px-5 py-5 text-[9px] uppercase tracking-[.16em] text-primary-foreground/55 lg:px-8"><span>© 2024 The Wheaton Weekly</span><span className="hidden items-center gap-5 md:flex"><span>Made in town</span><Instagram size={14} /></span></div>
  </footer>;
}

function Shell({ children, dark, setDark, onSearch, savedCount, fontScale, setFontScale }: { children: ReactNode; dark: boolean; setDark: (v: boolean) => void; onSearch: () => void; savedCount: number; fontScale: number; setFontScale: (v: number) => void }) {
  return <><Header dark={dark} setDark={setDark} onSearch={onSearch} savedCount={savedCount} fontScale={fontScale} setFontScale={setFontScale} />{children}</>;
}

function RouterView({ saved, onSave, onSearch }: { saved: string[]; onSave: (id: string) => void; onSearch: () => void }) {
  return <Switch><Route path="/" component={() => <HomePage saved={saved} onSave={onSave} onSearch={onSearch} />} /><Route path="/saved" component={() => <SavedPage saved={saved} onSave={onSave} />} /><Route path="/article/:id" component={() => <ArticlePage saved={saved} onSave={onSave} />} /><Route path="/section/:section" component={() => <SectionPage section="Archive" saved={saved} onSave={onSave} />} /><Route component={NotFound} /></Switch>;
}

function App() {
  const [dark, setDark] = useState(false); const [saved, setSaved] = useState<string[]>([]); const [searchOpen, setSearchOpen] = useState(false); const [fontScale, setFontScale] = useState(1);
  const toggleSaved = (id: string) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return <QueryClientProvider client={queryClient}><TooltipProvider><div className={dark ? 'dark min-h-[100dvh]' : 'min-h-[100dvh]'} style={{ fontSize: `${fontScale}em` }}><Shell dark={dark} setDark={setDark} onSearch={() => setSearchOpen(true)} savedCount={saved.length} fontScale={fontScale} setFontScale={setFontScale}><RouterView saved={saved} onSave={toggleSaved} onSearch={() => setSearchOpen(true)} /></Shell>{searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}</div><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;