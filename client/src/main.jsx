import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import { AreaChart, Area, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bell, CalendarDays, ChevronDown, ChevronRight, CircleHelp, ClipboardList, Leaf, LayoutDashboard, Menu, MoreHorizontal, PackageOpen, Settings, Sparkles, TrendingDown, TrendingUp, UtensilsCrossed, X, CheckCircle2 } from 'lucide-react';
import './styles.css';

const trend = [
  { day:'Aug 18', predicted:362, actual:348, wasted:25 }, { day:'Aug 21', predicted:390, actual:384, wasted:21 },
  { day:'Aug 24', predicted:336, actual:329, wasted:19 }, { day:'Aug 27', predicted:405, actual:397, wasted:27 },
  { day:'Aug 30', predicted:376, actual:365, wasted:18 }, { day:'Sep 02', predicted:421, actual:414, wasted:22 },
  { day:'Sep 05', predicted:398, actual:401, wasted:15 }, { day:'Sep 08', predicted:430, actual:423, wasted:17 },
  { day:'Sep 11', predicted:402, actual:394, wasted:14 }, { day:'Sep 14', predicted:456, actual:447, wasted:12 }
];
const dishes = [
  { dish:'Vegetable pulao', meal:'Lunch', predicted:180, override:180, unit:'plates', confidence:96 },
  { dish:'Rajma chawal', meal:'Lunch', predicted:145, override:145, unit:'plates', confidence:94 },
  { dish:'Masala dosa', meal:'Breakfast', predicted:120, override:120, unit:'plates', confidence:91 },
  { dish:'Paneer curry', meal:'Dinner', predicted:92, override:92, unit:'kg', confidence:88 },
  { dish:'Chapati', meal:'Dinner', predicted:340, override:340, unit:'pieces', confidence:93 }
];
const pie = [{name:'Rice',value:35,color:'#16a34a'}, {name:'Breads',value:23,color:'#86efac'}, {name:'Curries',value:19,color:'#fbbf24'}, {name:'Snacks',value:13,color:'#fb923c'}, {name:'Other',value:10,color:'#cbd5e1'}];
const nav = [{label:'Dashboard',icon:LayoutDashboard},{label:'Predictions',icon:Sparkles},{label:'Analytics',icon:TrendingUp},{label:'Menu management',icon:UtensilsCrossed},{label:'Settings',icon:Settings}];

function App(){
 const [active,setActive]=useState('Dashboard'), [open,setOpen]=useState(false), [dark,setDark]=useState(false), [toast,setToast]=useState('');
 const [rows,setRows]=useState(dishes); const [filter,setFilter]=useState('All meals');
 const visible=useMemo(()=>filter==='All meals'?rows:rows.filter(r=>r.meal===filter),[filter,rows]);
 const showToast=(m)=>{setToast(m);setTimeout(()=>setToast(''),2800)};
 const update=(i,value)=>setRows(old=>old.map((r,index)=>index===i?{...r,override:Number(value)||0}:r));
 return <div className={dark?'app dark':'app'}>
  <aside className={'sidebar '+(open?'show':'')}>
   <div className="brand"><span className="brand-mark"><Leaf size={19}/></span><span>Food<span>Wise</span></span><button className="close" onClick={()=>setOpen(false)} aria-label="Close navigation"><X/></button></div>
   <div className="workspace"><span className="tiny-label">WORKSPACE</span><button className="campus">North Campus Canteen <ChevronDown size={15}/></button></div>
   <nav>{nav.map(({label,icon:Icon})=><button key={label} onClick={()=>{setActive(label);setOpen(false)}} className={active===label?'nav-item selected':'nav-item'}><Icon size={19}/><span>{label}</span>{label==='Predictions'&&<span className="nav-dot"/>}</button>)}</nav>
   <div className="side-bottom"><div className="impact"><div className="impact-icon"><Leaf size={18}/></div><div><b>146 kg saved</b><small>This month with FoodWise</small></div></div><button className="help"><CircleHelp size={18}/> Help & support</button><div className="user"><div className="avatar">AK</div><div><b>Arjun Kapoor</b><small>Canteen Admin</small></div><MoreHorizontal size={17}/></div></div>
  </aside>
  {open&&<button className="scrim" onClick={()=>setOpen(false)} aria-label="Close menu"/>}
  <main><header><button className="mobile-menu" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu/></button><div className="crumb"><span>Overview</span><ChevronRight size={15}/><b>{active}</b></div><div className="header-actions"><button className="icon-button" aria-label="Notifications"><Bell size={19}/><i/></button><button className="profile">AK</button></div></header>
  <AnimatePresence mode="wait"><motion.section key={active} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.22}} className="content">
   {active==='Dashboard'?<Dashboard onNavigate={setActive}/>:<Placeholder page={active}/>} 
  </motion.section></AnimatePresence></main>
  <AnimatePresence>{toast&&<motion.div className="toast" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:12}}><CheckCircle2 size={19}/>{toast}</motion.div>}</AnimatePresence>
 </div>
}
function Dashboard({onNavigate}){ const [rows,setRows]=useState(dishes); const [filter,setFilter]=useState('All meals'); const [toast,setToast]=useState(''); const visible=filter==='All meals'?rows:rows.filter(r=>r.meal===filter); const edit=(idx,value)=>setRows(p=>p.map((r,i)=>i===idx?{...r,override:Number(value)||0}:r)); return <>
 <div className="page-intro"><div><p className="eyebrow">TUESDAY, SEPTEMBER 16</p><h1>Good morning, Arjun <span>— here’s your canteen pulse.</span></h1><p className="subcopy">Use tomorrow’s demand forecast to prepare smarter and waste less.</p></div><button className="date-button"><CalendarDays size={18}/> Tomorrow, Sep 17 <ChevronDown size={15}/></button></div>
 <div className="kpis"><Kpi title="Tomorrow’s demand" value="877" unit="plates & servings" icon={UtensilsCrossed} tone="green" delta="7.2%" note="vs. last Wednesday"/><Kpi title="Wastage this week" value="3.8" unit="% of food prepared" icon={TrendingDown} tone="orange" delta="1.4 pts" note="lower than last week"/><Kpi title="Estimated savings" value="₹12,640" unit="this month" icon={Leaf} tone="lime" delta="18.6%" note="vs. manual planning"/><Kpi title="Last prediction accuracy" value="94.2" unit="% accuracy" icon={Sparkles} tone="blue" delta="Excellent" note="Model confidence: high"/></div>
 <div className="notice"><span><Sparkles size={18}/></span><div><b>Tomorrow looks busy.</b> An estimated 1,240 students are expected on campus due to the Cultural Fest. <button onClick={()=>onNavigate('Predictions')}>Review forecast</button></div></div>
 <div className="grid-two"><ChartCard title="Demand performance" desc="Predicted vs. actual meals served"><button className="select">Last 30 days <ChevronDown size={14}/></button><ResponsiveContainer width="100%" height={245}><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="day" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip/><Legend verticalAlign="top" align="right" iconType="circle"/><Line type="monotone" dataKey="predicted" stroke="#16a34a" strokeWidth={3} dot={false}/><Line type="monotone" dataKey="actual" stroke="#334155" strokeWidth={2.5} dot={false}/><Line type="monotone" dataKey="wasted" stroke="#f59e0b" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></ChartCard>
 <ChartCard title="Waste has trended down" desc="Daily food waste in kg"><button className="quiet-button">View analytics <ChevronRight size={15}/></button><ResponsiveContainer width="100%" height={245}><AreaChart data={trend}><defs><linearGradient id="waste" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#86efac" stopOpacity=".7"/><stop offset="100%" stopColor="#86efac" stopOpacity=".04"/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="day" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip/><Area type="monotone" dataKey="wasted" stroke="#16a34a" fill="url(#waste)" strokeWidth={2.5}/></AreaChart></ResponsiveContainer></ChartCard></div>
 <div className="forecast-card"><div className="forecast-head"><div><p className="eyebrow">AI FORECAST</p><h2>Tomorrow’s preparation plan</h2><p>Recommendations generated from recent consumption, schedule, and campus activity.</p></div><div className="forecast-actions"><select value={filter} onChange={e=>setFilter(e.target.value)} aria-label="Filter meal"><option>All meals</option><option>Breakfast</option><option>Lunch</option><option>Dinner</option></select><button onClick={()=>setToast('Forecast saved and kitchen team notified')} className="primary-button">Save preparation plan</button></div></div>
 <div className="table-wrap"><table><thead><tr><th>Dish</th><th>Meal</th><th>AI recommendation</th><th>Kitchen override</th><th>Confidence</th><th></th></tr></thead><tbody>{visible.map((r,index)=><tr key={r.dish}><td><b>{r.dish}</b></td><td><span className="meal-tag">{r.meal}</span></td><td><b>{r.predicted} <small>{r.unit}</small></b></td><td><label className="override"><input value={r.override} type="number" onChange={e=>edit(rows.indexOf(r),e.target.value)}/><span>{r.unit}</span></label></td><td><div className="confidence"><span><i style={{width:r.confidence+'%'}}/></span>{r.confidence}%</div></td><td><button className="more" aria-label={'More options for '+r.dish}><MoreHorizontal size={19}/></button></td></tr>)}</tbody></table></div><button className="link-button" onClick={()=>onNavigate('Predictions')}>View all 12 predictions <ChevronRight size={16}/></button></div>
 <div className="bottom-grid"><ChartCard title="Where waste came from" desc="Last 30 days"><ResponsiveContainer width="100%" height={190}><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={3}>{pie.map(x=><Cell key={x.name} fill={x.color}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="legend-list">{pie.slice(0,4).map(x=><span key={x.name}><i style={{background:x.color}}/>{x.name}<b>{x.value}%</b></span>)}</div></ChartCard><div className="action-card"><div className="action-icon"><ClipboardList size={21}/></div><p className="eyebrow">DAILY ROUTINE</p><h2>Log today’s service</h2><p>Record prepared, served, and leftover quantities before you close the kitchen.</p><button className="outline-button">Log today’s data <ChevronRight size={16}/></button></div></div>
 <AnimatePresence>{toast&&<motion.div className="toast" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:12}}><CheckCircle2 size={19}/>{toast}</motion.div>}</AnimatePresence>
 </> }
function Kpi({title,value,unit,icon:Icon,tone,delta,note}){return <article className="kpi"><div className={'kpi-icon '+tone}><Icon size={20}/></div><p>{title}</p><h2>{value}</h2><span className="unit">{unit}</span><div className="delta"><b className={tone==='orange'?'positive':'green-text'}>{tone==='orange'?<TrendingDown size={14}/>:<TrendingUp size={14}/>} {delta}</b><small>{note}</small></div></article>}
function ChartCard({title,desc,children}){return <article className="chart-card"><div className="card-head"><div><h2>{title}</h2><p>{desc}</p></div>{children[0]}</div>{children.slice(1)}</article>}
function Placeholder({page}){return <div className="placeholder"><PackageOpen size={38}/><h1>{page}</h1><p>This module is ready to connect to the FoodWise API. The dashboard remains available with a complete interactive forecast.</p></div>}
createRoot(document.getElementById('root')).render(<App/>);
