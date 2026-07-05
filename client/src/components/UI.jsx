import { AlertTriangle,CheckCircle2,Info,ShieldAlert } from 'lucide-react';
export function SeverityBadge({level='Low'}){const c={High:'bg-red-50 text-red-700 border-red-200',Medium:'bg-amber-50 text-amber-700 border-amber-200',Low:'bg-emerald-50 text-emerald-700 border-emerald-200'}[level]||'bg-slate-100 text-slate-600';return <span className={`badge border ${c}`}>{level==='High'?<ShieldAlert size={12}/>:level==='Medium'?<AlertTriangle size={12}/>:<Info size={12}/>} {level}</span>}
export function StatusBadge({status}){const c=status==='Resolved'?'bg-emerald-50 text-emerald-700':status==='In Progress'?'bg-blue-50 text-blue-700':'bg-amber-50 text-amber-700';return <span className={`badge ${c}`}>{status==='Resolved'&&<CheckCircle2 size={12}/>} {status}</span>}
export function Skeleton({className=''}){return <div className={`skeleton ${className}`}/>}
export function Empty({children}){return <div className="py-12 text-center text-sm text-slate-500">{children}</div>}
export function SectionTitle({eyebrow,title,action}){return <div className="mb-5 flex items-end justify-between gap-4"><div>{eyebrow&&<p className="eyebrow mb-2">{eyebrow}</p>}<h2 className="text-xl font-extrabold tracking-tight text-ink">{title}</h2></div>{action}</div>}

