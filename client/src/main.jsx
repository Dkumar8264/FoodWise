import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import {
  AlertTriangle, ArrowDownToLine, ArrowRight, BarChart3, Bell, Check, CheckCircle2,
  ChevronDown, ClipboardCheck, ClipboardList, CloudSun, Eye, EyeOff, FileSpreadsheet,
  FileText, Gauge, Leaf, LoaderCircle, LockKeyhole, LogOut, Mail, Menu, Moon, Plus,
  RefreshCw, Save, Sparkles, Sun, Target, Trash2, TrendingDown, UtensilsCrossed,
  WandSparkles, Zap
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  createDish, createServiceLog, deactivateDish, deleteLatestServiceLog, downloadPdfReport, downloadReport,
  generatePredictions, getAlerts, getDashboard, getEvaluation, getLatestServiceLog, getMenu, signIn, updatePrediction
} from './api';
import './styles.css';

const sectionLinks = [
  { id: 'overview', label: 'Overview', icon: Gauge },
  { id: 'forecast', label: "Tomorrow's plan", icon: Sparkles },
  { id: 'service-log', label: 'Service log', icon: ClipboardList },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'insights', label: 'Insights & reports', icon: BarChart3 }
];
const today = new Date().toLocaleDateString('en-CA');

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('foodwise-token') || '');
  const [dark, setDark] = useState(() => localStorage.getItem('foodwise-theme') === 'dark');
  useEffect(() => {
    localStorage.setItem('foodwise-theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  useEffect(() => { if (window.location.pathname !== '/') window.history.replaceState({}, '', '/'); }, []);
  const handleLogin = ({ token: nextToken }) => {
    localStorage.setItem('foodwise-token', nextToken);
    window.scrollTo({ top: 0, behavior: 'auto' });
    setToken(nextToken);
  };
  const logout = () => { localStorage.removeItem('foodwise-token'); setToken(''); };
  return <TooltipProvider delayDuration={250}>{token ? <Workspace token={token} dark={dark} setDark={setDark} logout={logout} /> : <Login dark={dark} setDark={setDark} done={handleLogin} />}</TooltipProvider>;
}

function Brand({ compact = false }) {
  return <div className="brand-lockup" aria-label="FoodWise"><span className="brand-symbol"><Leaf aria-hidden="true" /></span>{!compact && <span className="brand-name">Food<span>Wise</span></span>}</div>;
}

function Login({ done, dark, setDark }) {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState('admin@foodwise.in');
  const [password, setPassword] = useState('foodwise123');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setSubmitting(true); setError('');
    try { done(await signIn(email, password)); } catch (loginError) { setError(loginError.message); } finally { setSubmitting(false); }
  };
  return <main className="login-page">
    <div className="login-ambient login-ambient-one" aria-hidden="true" /><div className="login-ambient login-ambient-two" aria-hidden="true" />
    <Button variant="outline" size="icon-lg" className="login-theme" aria-label={dark ? 'Use light theme' : 'Use dark theme'} onClick={() => setDark((value) => !value)}>{dark ? <Sun /> : <Moon />}</Button>
    <motion.section className="login-story" initial={reduceMotion ? false : { opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
      <Brand />
      <div className="login-story-copy"><Badge className="hero-badge"><Sparkles /> AI-powered canteen operations</Badge><h1>Cook with clarity.<br /><span>Waste almost nothing.</span></h1><p>Turn daily service data into confident preparation plans, measurable savings, and a calmer kitchen.</p></div>
      <div className="login-proof"><div><TrendingDown /><span><b>20%</b> waste-reduction target</span></div><div><Zap /><span><b>Daily</b> demand forecasts</span></div></div>
    </motion.section>
    <motion.section className="login-entry" initial={reduceMotion ? false : { opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
      <Card className="login-card"><CardHeader><p className="section-kicker">WELCOME BACK</p><CardTitle>Sign in to your kitchen</CardTitle><CardDescription>Continue to the North Campus command center.</CardDescription></CardHeader><CardContent>
        <form className="auth-form" onSubmit={submit}>{error && <div className="inline-alert error" role="alert"><AlertTriangle />{error}</div>}
          <div className="field-stack"><Label htmlFor="email">Email address</Label><div className="input-with-icon"><Mail aria-hidden="true" /><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div></div>
          <div className="field-stack"><Label htmlFor="password">Password</Label><div className="input-with-icon"><LockKeyhole aria-hidden="true" /><Input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /><Button type="button" variant="ghost" size="icon" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((value) => !value)}>{show ? <EyeOff /> : <Eye />}</Button></div></div>
          <Button className="auth-submit" size="lg" disabled={submitting}>{submitting ? <LoaderCircle className="spin" /> : <ArrowRight />}{submitting ? 'Signing in…' : 'Enter workspace'}</Button>
          <p className="demo-hint"><CheckCircle2 /> Demo access is already filled in for you.</p>
        </form>
      </CardContent></Card>
    </motion.section>
  </main>;
}

function Workspace({ token, dark, setDark, logout }) {
  const reduceMotion = useReducedMotion();
  const [dashboard, setDashboard] = useState(null);
  const [rows, setRows] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [dishToDeactivate, setDishToDeactivate] = useState(null);
  const notify = useCallback((message, tone = 'success') => setToast({ id: Date.now(), message, tone }), []);
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(null), 4200); return () => window.clearTimeout(timer); }, [toast]);
  const loadAll = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true); setError('');
    const [dashboardResult, alertsResult, evaluationResult, menuResult] = await Promise.allSettled([getDashboard(token), getAlerts(token), getEvaluation(token), getMenu(token)]);
    if (dashboardResult.status === 'fulfilled') { setDashboard(dashboardResult.value); setRows(dashboardResult.value.predictions.map((row) => ({ ...row, override: row.override ?? row.predictedQuantity }))); }
    else setError(dashboardResult.reason?.message || 'FoodWise could not load the dashboard.');
    if (alertsResult.status === 'fulfilled') setAlerts(alertsResult.value);
    if (evaluationResult.status === 'fulfilled') setEvaluation(evaluationResult.value);
    if (menuResult.status === 'fulfilled') setDishes(menuResult.value);
    setLoading(false); setRefreshing(false);
  }, [token]);
  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => {
    const sections = sectionLinks.map(({ id }) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver((entries) => { const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (visible) setActiveSection(visible.target.id); }, { rootMargin: '-22% 0px -60% 0px', threshold: [0.08, 0.25, 0.5] });
    sections.forEach((section) => observer.observe(section)); return () => observer.disconnect();
  }, [loading]);
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); setMobileOpen(false); };
  const generatePlan = async () => { setGenerating(true); try { const result = await generatePredictions(token); await loadAll(true); notify(`Tomorrow's plan is ready${result.metrics?.model ? ` using ${result.metrics.model}` : ''}.`); scrollTo('forecast'); } catch (actionError) { notify(actionError.message, 'error'); } finally { setGenerating(false); } };
  const savePlan = async () => { setSavingPlan(true); try { await Promise.all(rows.map((row) => updatePrediction(token, row._id, row.override))); await loadAll(true); notify('Kitchen overrides saved.'); } catch (actionError) { notify(actionError.message, 'error'); } finally { setSavingPlan(false); } };
  const changeOverride = (id, value) => setRows((current) => current.map((row) => row._id === id ? { ...row, override: Number(value) || 0 } : row));
  const exportFile = async (type) => { try { const blob = type === 'pdf' ? await downloadPdfReport(token) : await downloadReport(token); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = type === 'pdf' ? 'foodwise-waste-report.pdf' : 'foodwise-service-report.csv'; link.click(); URL.revokeObjectURL(url); notify(`${type.toUpperCase()} report downloaded.`); } catch (actionError) { notify(actionError.message, 'error'); } };
  const confirmDeactivate = async () => { if (!dishToDeactivate) return; try { await deactivateDish(token, dishToDeactivate._id); notify(`${dishToDeactivate.name} moved off the active menu.`); setDishToDeactivate(null); await loadAll(true); } catch (actionError) { notify(actionError.message, 'error'); } };
  if (loading) return <LoadingScreen />;
  if (!dashboard) return <ErrorScreen message={error} retry={() => loadAll()} logout={logout} />;
  return <div className="app-shell">
    <aside className="desktop-sidebar"><SidebarContent activeSection={activeSection} onNavigate={scrollTo} alerts={alerts.length} logout={logout} /></aside>
    <div className="app-main">
      <header className="topbar">
        <div className="mobile-brand"><Brand compact /></div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetTrigger asChild><Button className="mobile-nav-trigger" variant="outline" size="icon-lg" aria-label="Open navigation"><Menu /></Button></SheetTrigger><SheetContent side="left" className="mobile-sheet"><SheetHeader className="sr-only"><SheetTitle>FoodWise navigation</SheetTitle><SheetDescription>Move between sections of this dashboard.</SheetDescription></SheetHeader><SidebarContent activeSection={activeSection} onNavigate={scrollTo} alerts={alerts.length} logout={logout} /></SheetContent></Sheet>
        <div className="topbar-context"><span className="live-dot" aria-hidden="true" /><div><span>North Campus Canteen</span><small>Live operations workspace</small></div></div>
        <div className="topbar-actions">
          <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon-lg" aria-label="Refresh dashboard" onClick={() => loadAll(true)} disabled={refreshing}><RefreshCw className={refreshing ? 'spin' : ''} /></Button></TooltipTrigger><TooltipContent>Refresh data</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon-lg" aria-label="View waste alerts" onClick={() => scrollTo('insights')} className="notification-button"><Bell />{alerts.length > 0 && <span>{alerts.length}</span>}</Button></TooltipTrigger><TooltipContent>Waste alerts</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon-lg" aria-label={dark ? 'Use light theme' : 'Use dark theme'} onClick={() => setDark((value) => !value)}>{dark ? <Sun /> : <Moon />}</Button></TooltipTrigger><TooltipContent>{dark ? 'Light theme' : 'Dark theme'}</TooltipContent></Tooltip>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="profile-button"><Avatar><AvatarFallback>FW</AvatarFallback></Avatar><span className="profile-copy"><b>Operations Admin</b><small>North Campus</small></span><ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="profile-menu"><DropdownMenuLabel>FoodWise workspace</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onClick={() => scrollTo('service-log')}><ClipboardList /> Log today&apos;s service</DropdownMenuItem><DropdownMenuItem onClick={() => exportFile('pdf')}><FileText /> Download report</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={logout}><LogOut /> Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
      </header>
      <main className="workspace">{error && <div className="inline-alert error workspace-alert" role="alert"><AlertTriangle />{error}<Button variant="ghost" size="sm" onClick={() => loadAll(true)}>Retry</Button></div>}
        <Overview dashboard={dashboard} evaluation={evaluation} onGenerate={generatePlan} generating={generating} onNavigate={scrollTo} onExport={exportFile} reduceMotion={reduceMotion} />
        <Forecast rows={rows} onChange={changeOverride} onGenerate={generatePlan} onSave={savePlan} generating={generating} saving={savingPlan} reduceMotion={reduceMotion} />
        <ServiceLog token={token} onChanged={() => loadAll(true)} notify={notify} reduceMotion={reduceMotion} />
        <MenuManager token={token} dishes={dishes} onAdded={() => loadAll(true)} notify={notify} onDeactivate={setDishToDeactivate} reduceMotion={reduceMotion} />
        <Insights alerts={alerts} evaluation={evaluation} onExport={exportFile} reduceMotion={reduceMotion} />
      </main>
    </div>
    <AnimatePresence>{toast && <motion.div className={`toast ${toast.tone}`} role="status" initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ type: 'spring', stiffness: 420, damping: 32 }}>{toast.tone === 'error' ? <AlertTriangle /> : <CheckCircle2 />}{toast.message}</motion.div>}</AnimatePresence>
    <Dialog open={Boolean(dishToDeactivate)} onOpenChange={(open) => !open && setDishToDeactivate(null)}><DialogContent><DialogHeader><DialogTitle>Remove {dishToDeactivate?.name} from the active menu?</DialogTitle><DialogDescription>Historical service data will stay intact. You can add this dish again later.</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="outline">Keep dish</Button></DialogClose><Button variant="destructive" onClick={confirmDeactivate}><Trash2 /> Deactivate dish</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}

function SidebarContent({ activeSection, onNavigate, alerts, logout }) {
  return <div className="sidebar-content"><div className="sidebar-brand"><Brand /><Badge variant="outline">BETA</Badge></div><div className="campus-card"><span className="campus-icon"><CloudSun /></span><div><small>ACTIVE LOCATION</small><b>North Campus</b><span>Clear · 29°C</span></div></div>
    <nav className="section-nav" aria-label="Dashboard sections"><p>WORKSPACE</p>{sectionLinks.map(({ id, label, icon: Icon }) => <button key={id} className={activeSection === id ? 'active' : ''} aria-current={activeSection === id ? 'location' : undefined} onClick={() => onNavigate(id)}><Icon aria-hidden="true" /><span>{label}</span>{id === 'insights' && alerts > 0 && <Badge>{alerts}</Badge>}</button>)}</nav>
    <div className="sidebar-impact"><div className="impact-mark"><Leaf /></div><div><b>Every plate counts</b><p>FoodWise turns small daily choices into measurable impact.</p></div></div><Button variant="ghost" className="sidebar-signout" onClick={logout}><LogOut /> Sign out</Button>
  </div>;
}

function SectionHeading({ kicker, title, copy, action }) { return <div className="section-heading"><div><p className="section-kicker">{kicker}</p><h2>{title}</h2><p>{copy}</p></div>{action}</div>; }

function Overview({ dashboard, evaluation, onGenerate, generating, onNavigate, onExport, reduceMotion }) {
  const metrics = [
    { label: "Tomorrow's demand", value: dashboard.metrics.predictedDemand.toLocaleString('en-IN'), suffix: 'portions', icon: UtensilsCrossed, tone: 'green', detail: 'AI-recommended total' },
    { label: 'Waste rate', value: `${dashboard.metrics.wastePercent}%`, suffix: 'last 30 records', icon: TrendingDown, tone: 'amber', detail: dashboard.metrics.wastePercent <= 5 ? 'On a healthy trajectory' : 'Needs attention' },
    { label: 'Estimated savings', value: `₹${dashboard.metrics.savings.toLocaleString('en-IN')}`, suffix: 'avoided waste value', icon: Leaf, tone: 'lime', detail: 'Based on recent service' },
    { label: 'Prediction accuracy', value: `${dashboard.metrics.accuracy}%`, suffix: 'observed demand fit', icon: Target, tone: 'blue', detail: 'Model confidence signal' }
  ];
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] };
  return <motion.section id="overview" className="workspace-section overview-section" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
    <div className="hero-copy"><div><Badge variant="outline" className="status-badge"><span /> System ready</Badge><h1>Good morning.<br /><span>Your kitchen is on track.</span></h1><p>One clear view of tomorrow&apos;s demand, today&apos;s service, and your waste-reduction progress.</p></div><div className="hero-actions"><Button variant="outline" size="lg" onClick={() => onNavigate('service-log')}><ClipboardCheck /> Log today&apos;s service</Button><Button size="lg" onClick={onGenerate} disabled={generating}>{generating ? <LoaderCircle className="spin" /> : <WandSparkles />}{generating ? 'Building plan…' : 'Generate tomorrow'}</Button></div></div>
    <motion.div className="metric-grid" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } } }}>{metrics.map(({ label, value, suffix, icon: Icon, tone, detail }) => <motion.div key={label} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition } }} whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}><Card className="metric-card"><CardContent><span className={`metric-icon ${tone}`}><Icon /></span><p>{label}</p><div className="metric-value"><strong>{value}</strong><small>{suffix}</small></div><div className="metric-detail"><span className={`metric-dot ${tone}`} />{detail}</div></CardContent></Card></motion.div>)}</motion.div>
    <div className="overview-grid">
      <Card className="chart-panel"><CardHeader><div><CardTitle>Demand performance</CardTitle><CardDescription>Predicted demand compared with portions served</CardDescription></div><Badge variant="secondary">Last 30 services</Badge></CardHeader><CardContent>{dashboard.trend.length ? <ResponsiveContainer width="100%" height={292}><AreaChart data={dashboard.trend} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}><defs><linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--brand)" stopOpacity={0.3}/><stop offset="100%" stopColor="var(--brand)" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="var(--grid)" vertical={false} strokeDasharray="4 5"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-text)', fontSize: 11 }} minTickGap={24}/><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-text)', fontSize: 11 }}/><ChartTooltip content={<DemandTooltip />}/><Area type="monotone" dataKey="predicted" stroke="var(--chart-predicted)" fill="transparent" strokeWidth={2} strokeDasharray="5 5"/><Area type="monotone" dataKey="actual" stroke="var(--brand)" fill="url(#actualFill)" strokeWidth={3}/></AreaChart></ResponsiveContainer> : <EmptyState icon={BarChart3} title="No service trend yet" copy="Log daily service to build the demand chart." />}</CardContent><CardFooter className="chart-legend"><span><i className="actual" /> Portions served</span><span><i className="predicted" /> Predicted demand</span></CardFooter></Card>
      <Card className="impact-panel"><CardHeader><span className="panel-icon"><Target /></span><CardTitle>20% reduction goal</CardTitle><CardDescription>Historical walk-forward evaluation</CardDescription></CardHeader><CardContent><div className="impact-score"><strong>{evaluation?.reductionPercent ?? 0}%</strong><Badge variant={evaluation?.targetAchieved ? 'default' : 'secondary'}>{evaluation?.targetAchieved ? 'Target achieved' : 'In progress'}</Badge></div><Progress value={Math.min(100, Math.max(0, ((evaluation?.reductionPercent || 0) / 20) * 100))} aria-label="Progress toward the 20 percent reduction goal" /><div className="impact-breakdown"><span><small>Baseline waste</small><b>{evaluation?.baselineWaste ?? 0} units</b></span><span><small>Model-guided</small><b>{evaluation?.modeledWaste ?? 0} units</b></span></div></CardContent><CardFooter><Button variant="outline" onClick={() => onExport('pdf')}><ArrowDownToLine /> Download impact report</Button></CardFooter></Card>
    </div>
  </motion.section>;
}

function DemandTooltip({ active, payload, label }) { if (!active || !payload?.length) return null; const data = Object.fromEntries(payload.map((item) => [item.dataKey, item.value])); return <div className="chart-tooltip"><b>{label}</b><span><i className="actual" /> Served <strong>{data.actual ?? 0}</strong></span><span><i className="predicted" /> Predicted <strong>{data.predicted ?? 0}</strong></span></div>; }

function Forecast({ rows, onChange, onGenerate, onSave, generating, saving, reduceMotion }) {
  return <motion.section id="forecast" className="workspace-section" initial={reduceMotion ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}><SectionHeading kicker="AI FORECAST" title="Tomorrow's preparation plan" copy="Start with the model recommendation, then layer in the local context only your kitchen knows." action={<div className="section-actions"><Button variant="outline" onClick={onGenerate} disabled={generating}>{generating ? <LoaderCircle className="spin" /> : <RefreshCw />}{generating ? 'Generating…' : 'Regenerate'}</Button><Button onClick={onSave} disabled={saving || !rows.length}>{saving ? <LoaderCircle className="spin" /> : <Save />}{saving ? 'Saving…' : 'Save overrides'}</Button></div>} />
    <Card className="data-card">{rows.length ? <div className="responsive-table"><Table><TableHeader><TableRow><TableHead>Dish</TableHead><TableHead>Meal</TableHead><TableHead>AI recommendation</TableHead><TableHead>Kitchen override</TableHead><TableHead>Confidence</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row._id}><TableCell><div className="dish-cell"><span>{row.dish.slice(0, 1).toUpperCase()}</span><b>{row.dish}</b></div></TableCell><TableCell><Badge variant="secondary">{row.meal}</Badge></TableCell><TableCell><strong>{row.predictedQuantity}</strong> <small>{row.unit}</small></TableCell><TableCell><div className="quantity-input"><Input aria-label={`Override quantity for ${row.dish}`} type="number" min="0" value={row.override} onChange={(event) => onChange(row._id, event.target.value)} /><span>{row.unit}</span></div></TableCell><TableCell><div className="confidence-cell"><Progress value={row.confidence} /><span>{row.confidence}%</span></div></TableCell></TableRow>)}</TableBody></Table></div> : <EmptyState icon={Sparkles} title="No plan for tomorrow yet" copy="Add dishes to the active menu, then generate a preparation plan." action={<Button onClick={onGenerate} disabled={generating}><WandSparkles /> Generate first plan</Button>} />}</Card>
  </motion.section>;
}

function ServiceLog({ token, onChanged, notify, reduceMotion }) {
  const [entry, setEntry] = useState({ date: today, dish: 'Vegetable pulao', meal: 'Lunch', prepared: 190, consumed: 176, wasted: 14, studentCount: 1200, weather: 'Clear', event: 'None' });
  const [errors, setErrors] = useState({}); const [saving, setSaving] = useState(false); const [checkingLatest, setCheckingLatest] = useState(false); const [deleting, setDeleting] = useState(false); const [deleteOpen, setDeleteOpen] = useState(false); const [latestLog, setLatestLog] = useState(null); const numericFields = ['prepared', 'consumed', 'wasted', 'studentCount'];
  const update = (key, value) => { setEntry((current) => ({ ...current, [key]: numericFields.includes(key) ? Number(value) : value })); setErrors((current) => ({ ...current, [key]: '', quantities: '' })); };
  const validate = () => { const next = {}; if (!entry.date) next.date = 'Choose a service date.'; if (!entry.dish.trim()) next.dish = 'Enter a dish name.'; if (entry.prepared <= 0) next.prepared = 'Prepared quantity must be greater than zero.'; if (entry.consumed < 0) next.consumed = 'Served quantity cannot be negative.'; if (entry.wasted < 0) next.wasted = 'Waste quantity cannot be negative.'; if (entry.studentCount < 0) next.studentCount = 'Student count cannot be negative.'; if (entry.consumed + entry.wasted > entry.prepared) next.quantities = 'Served plus waste cannot exceed the prepared quantity.'; setErrors(next); return Object.keys(next).length === 0; };
  const submit = async (event) => { event.preventDefault(); if (!validate()) return; setSaving(true); try { await createServiceLog(token, { ...entry, dish: entry.dish.trim(), date: new Date(`${entry.date}T12:00:00`).toISOString() }); notify('Service log saved and included in analytics.'); onChanged(); } catch (actionError) { notify(actionError.message, 'error'); } finally { setSaving(false); } };
  const prepareDelete = async () => { setCheckingLatest(true); try { setLatestLog(await getLatestServiceLog(token)); setDeleteOpen(true); } catch (actionError) { notify(actionError.message, 'error'); } finally { setCheckingLatest(false); } };
  const confirmDelete = async (event) => { event.preventDefault(); setDeleting(true); try { const result = await deleteLatestServiceLog(token); const removed = result.log; notify(`${removed.dish} from ${new Date(removed.date).toLocaleDateString('en-IN')} was deleted.`); setDeleteOpen(false); setLatestLog(null); await onChanged(); } catch (actionError) { notify(actionError.message, 'error'); } finally { setDeleting(false); } };
  const fieldError = (key) => errors[key] ? <small className="field-error" id={`${key}-error`}>{errors[key]}</small> : null;
  const latestDate = latestLog ? new Date(latestLog.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  return <motion.section id="service-log" className="workspace-section" initial={reduceMotion ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}><SectionHeading kicker="DAILY OPERATIONS" title="Log today's service" copy="Good forecasts start with clean service data. One dish takes less than a minute." />
    <Card className="form-card"><form onSubmit={submit} noValidate>{errors.quantities && <div className="inline-alert error" role="alert"><AlertTriangle />{errors.quantities}</div>}<div className="form-grid">
      <Field label="Service date" error={fieldError('date')}><Input type="date" max={today} value={entry.date} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? 'date-error' : undefined} onChange={(event) => update('date', event.target.value)} /></Field>
      <Field label="Dish name" error={fieldError('dish')}><Input value={entry.dish} aria-invalid={Boolean(errors.dish)} aria-describedby={errors.dish ? 'dish-error' : undefined} onChange={(event) => update('dish', event.target.value)} /></Field>
      <Field label="Meal"><Select value={entry.meal} onValueChange={(value) => update('meal', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Breakfast">Breakfast</SelectItem><SelectItem value="Lunch">Lunch</SelectItem><SelectItem value="Dinner">Dinner</SelectItem></SelectContent></Select></Field>
      <Field label="Weather"><Select value={entry.weather} onValueChange={(value) => update('weather', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Clear">Clear</SelectItem><SelectItem value="Rain">Rain</SelectItem><SelectItem value="Cloudy">Cloudy</SelectItem><SelectItem value="Hot">Hot</SelectItem></SelectContent></Select></Field>
      {[["Prepared quantity", 'prepared'], ["Served quantity", 'consumed'], ["Waste / leftovers", 'wasted'], ["Students on campus", 'studentCount']].map(([label, key]) => <Field key={key} label={label} error={fieldError(key)}><Input type="number" min="0" value={entry[key]} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `${key}-error` : undefined} onChange={(event) => update(key, event.target.value)} /></Field>)}
      <Field label="Campus event" hint="Optional context improves demand forecasting."><Input value={entry.event} placeholder="None, exam week, fest…" onChange={(event) => update('event', event.target.value)} /></Field>
    </div><div className="form-submit-row"><p><Leaf /> This entry will update your live metrics.</p><div className="form-actions"><Button type="button" variant="outline" size="lg" onClick={prepareDelete} disabled={checkingLatest || deleting}>{checkingLatest ? <LoaderCircle className="spin" /> : <Trash2 />}{checkingLatest ? 'Checking latest…' : 'Delete latest log'}</Button><Button size="lg" disabled={saving}>{saving ? <LoaderCircle className="spin" /> : <Save />}{saving ? 'Saving service…' : 'Save service log'}</Button></div></div></form></Card>
    <AlertDialog open={deleteOpen} onOpenChange={(open) => { if (!deleting) { setDeleteOpen(open); if (!open) setLatestLog(null); } }}><AlertDialogContent><AlertDialogHeader><AlertDialogMedia className="delete-dialog-icon"><Trash2 /></AlertDialogMedia><AlertDialogTitle>Delete the latest service log?</AlertDialogTitle><AlertDialogDescription>{latestLog ? <><strong>{latestLog.dish}</strong> · {latestLog.meal} · {latestDate}<br />Prepared {latestLog.prepared}, served {latestLog.consumed}, waste {latestLog.wasted}. This permanently removes the record and updates your analytics.</> : 'This permanently removes the newest service record and updates your analytics.'}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={deleting}>Keep log</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={deleting}>{deleting ? <LoaderCircle className="spin" /> : <Trash2 />}{deleting ? 'Deleting…' : 'Delete latest log'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </motion.section>;
}

function Field({ label, error, hint, children }) { return <div className="field-stack"><Label>{label}</Label>{children}{error || (hint && <small className="field-hint">{hint}</small>)}</div>; }

function MenuManager({ token, dishes, onAdded, notify, onDeactivate, reduceMotion }) {
  const [form, setForm] = useState({ name: '', meal: 'Lunch', unit: 'plates' }); const [adding, setAdding] = useState(false);
  const add = async (event) => { event.preventDefault(); if (!form.name.trim()) return; setAdding(true); try { await createDish(token, { ...form, name: form.name.trim() }); notify(`${form.name.trim()} added to the active menu.`); setForm({ name: '', meal: 'Lunch', unit: 'plates' }); onAdded(); } catch (actionError) { notify(actionError.message, 'error'); } finally { setAdding(false); } };
  return <motion.section id="menu" className="workspace-section" initial={reduceMotion ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}><SectionHeading kicker="MENU CONTROL" title="Active canteen menu" copy="Keep the forecasting menu focused on what your kitchen actually serves." /><div className="menu-layout">
    <Card className="menu-form-card"><CardHeader><CardTitle>Add a dish</CardTitle><CardDescription>Make it available for tomorrow&apos;s plan.</CardDescription></CardHeader><CardContent><form onSubmit={add} className="menu-form"><Field label="Dish name"><Input placeholder="e.g. Lemon rice" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field><Field label="Meal"><Select value={form.meal} onValueChange={(value) => setForm({ ...form, meal: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Breakfast">Breakfast</SelectItem><SelectItem value="Lunch">Lunch</SelectItem><SelectItem value="Dinner">Dinner</SelectItem></SelectContent></Select></Field><Field label="Serving unit"><Select value={form.unit} onValueChange={(value) => setForm({ ...form, unit: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="plates">Plates</SelectItem><SelectItem value="kg">Kilograms</SelectItem><SelectItem value="pieces">Pieces</SelectItem></SelectContent></Select></Field><Button size="lg" disabled={adding || !form.name.trim()}>{adding ? <LoaderCircle className="spin" /> : <Plus />}{adding ? 'Adding…' : 'Add to menu'}</Button></form></CardContent></Card>
    <Card className="menu-list-card"><CardHeader><div><CardTitle>Serving now</CardTitle><CardDescription>{dishes.length} active {dishes.length === 1 ? 'dish' : 'dishes'}</CardDescription></div><Badge variant="secondary">Live menu</Badge></CardHeader><CardContent>{dishes.length ? <div className="dish-list">{dishes.map((dish) => <div className="dish-list-item" key={dish._id}><span className="dish-avatar">{dish.name.slice(0, 1).toUpperCase()}</span><div><b>{dish.name}</b><small>{dish.meal} · {dish.unit}</small></div><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-lg" aria-label={`Deactivate ${dish.name}`} onClick={() => onDeactivate(dish)}><Trash2 /></Button></TooltipTrigger><TooltipContent>Deactivate dish</TooltipContent></Tooltip></div>)}</div> : <EmptyState icon={UtensilsCrossed} title="The active menu is empty" copy="Add your first dish to start forecasting." />}</CardContent></Card>
  </div></motion.section>;
}

function Insights({ alerts, evaluation, onExport, reduceMotion }) {
  const methodology = evaluation?.methodology || 'Add enough service history to run a walk-forward evaluation.';
  return <motion.section id="insights" className="workspace-section final-section" initial={reduceMotion ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}><SectionHeading kicker="INSIGHTS & REPORTING" title="Turn patterns into action" copy="Review high-waste dishes, validate impact, and share a report with stakeholders." action={<div className="section-actions"><Button variant="outline" onClick={() => onExport('csv')}><FileSpreadsheet /> Export CSV</Button><Button onClick={() => onExport('pdf')}><FileText /> Download PDF</Button></div>} /><div className="insights-grid">
    <Card className="alerts-card"><CardHeader><div><CardTitle>Waste alerts</CardTitle><CardDescription>Patterns that need a kitchen decision</CardDescription></div><Badge variant={alerts.length ? 'destructive' : 'secondary'}>{alerts.length} active</Badge></CardHeader><CardContent>{alerts.length ? <div className="alert-list">{alerts.map((alert) => <div className="alert-row" key={alert.dish}><span className={`severity ${alert.severity}`}><AlertTriangle /></span><div><b>{alert.dish}</b><p>{alert.message || `Waste is ${alert.wastePercent}% of prepared food.`}</p></div><strong>{alert.wastePercent}%</strong></div>)}</div> : <div className="healthy-state"><span><Check /></span><div><b>No high-waste patterns</b><p>Your recent service data is within the current alert threshold.</p></div></div>}</CardContent></Card>
    <Card className="evaluation-card"><CardHeader><span className="panel-icon"><BarChart3 /></span><CardTitle>Target validation</CardTitle><CardDescription>Walk-forward historical backtest</CardDescription></CardHeader><CardContent><div className="evaluation-score"><strong>{evaluation?.reductionPercent ?? 0}%</strong><span>waste reduction</span></div><div className="evaluation-stats"><span><small>Evaluated</small><b>{evaluation?.evaluatedRecords ?? 0}/{evaluation?.records ?? 0} records</b></span><span><small>Mean error</small><b>{evaluation?.mae ?? 'n/a'} units</b></span></div><Separator /><details><summary>How this is calculated</summary><p>{methodology}</p></details></CardContent></Card>
  </div><div className="closing-banner"><div><span className="panel-icon"><Leaf /></span><div><p className="section-kicker">THE DAILY LOOP</p><h3>Log → learn → prepare with confidence.</h3><p>Keep recording real service outcomes. FoodWise gets more useful with every honest data point.</p></div></div><Button size="lg" onClick={() => document.getElementById('service-log')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })}><ClipboardCheck /> Log another service</Button></div>
  </motion.section>;
}

function EmptyState({ icon: Icon, title, copy, action }) { return <div className="empty-state"><span><Icon /></span><div><b>{title}</b><p>{copy}</p></div>{action}</div>; }
function LoadingScreen() { return <div className="loading-shell"><aside><Skeleton className="skeleton-brand" /><Skeleton className="skeleton-nav" /><Skeleton className="skeleton-nav" /><Skeleton className="skeleton-nav" /></aside><main><div className="loading-top"><Skeleton /><Skeleton /></div><div className="loading-content"><Skeleton className="skeleton-title" /><div className="loading-metrics">{[1, 2, 3, 4].map((item) => <Skeleton key={item} />)}</div><Skeleton className="skeleton-chart" /></div></main></div>; }
function ErrorScreen({ message, retry, logout }) { return <main className="error-screen"><span className="error-illustration"><Leaf /></span><p className="section-kicker">CONNECTION PAUSED</p><h1>FoodWise can&apos;t reach the kitchen data.</h1><p>{message}</p><div><Button onClick={retry}><RefreshCw /> Try again</Button><Button variant="outline" onClick={logout}><LogOut /> Sign out</Button></div></main>; }

createRoot(document.getElementById('root')).render(<App />);
