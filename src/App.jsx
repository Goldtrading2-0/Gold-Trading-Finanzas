import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient";
import {
  Users, TrendingUp, TrendingDown, Wallet, Plus, X, Trash2, Pencil,
  LogOut, Loader2, AlertTriangle, LayoutDashboard, Receipt, ArrowDownCircle,
  ArrowUpCircle, Search
} from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

/* ===========================================================
   GOLD TRADING 2.0 — PANEL FINANCIERO (privado / solo admin)
=========================================================== */

const METODOS = ["Mercado Pago", "Transferencia", "Hotmart", "Efectivo", "Otro"];
const CATEGORIAS = ["Plataformas y software", "Publicidad", "Comisiones de pago", "Producción de contenido", "Otros"];
const ESTADOS = [["activo", "Activo"], ["pausado", "Pausado"], ["cancelado", "Cancelado"]];

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const MESES_LARGO = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function monthKey(dateStr) { return dateStr ? dateStr.slice(0, 7) : ""; }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function addMonths(dateStr, n) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + n);
  return d;
}
function daysBetween(a, b) { return Math.round((b - a) / 86400000); }

function GTMark({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="gtgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4d976" /><stop offset="55%" stopColor="#d4af37" /><stop offset="100%" stopColor="#8a6a1c" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" stroke="url(#gtgrad)" strokeWidth="3" fill="none" />
      <text x="50" y="63" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold" fontSize="42" fill="url(#gtgrad)">GT</text>
    </svg>
  );
}

const GlobalStyle = () => (
  <style>{`
    * { box-sizing: border-box; }
    body { margin: 0; }
    .gt-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
    .gt-scroll::-webkit-scrollbar-thumb { background: #4a3d20; border-radius: 4px; }
    .gt-btn { cursor: pointer; transition: all .15s ease; }
    .gt-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
    .gt-btn:active { transform: translateY(0); }
    .gt-row:hover { background: rgba(212,175,55,0.06) !important; }
    input, select, textarea, button { font-family: inherit; }
    input:focus, select:focus, textarea:focus { outline: 2px solid #d4af37; outline-offset: 1px; }
    ::placeholder { color: #6b6048; }
    @keyframes spin { to { transform: rotate(360deg); } }
    table { border-collapse: collapse; width: 100%; }
    th { text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #8a7c58; padding: 8px 10px; border-bottom: 1px solid rgba(212,175,55,0.2); }
    td { padding: 10px; font-size: 13px; border-bottom: 1px solid rgba(212,175,55,0.08); color: #e8dcc0; }
  `}</style>
);

/* =================== AUTENTICACIÓN =================== */
function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg({ ok: true, text: "Cuenta creada. Recordá desactivar el registro público en Supabase después de esto — este panel es solo para vos." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMsg({ ok: false, text: err.message || "Ocurrió un error." });
    }
    setBusy(false);
  };

  const inputStyle = { width: "100%", background: "#0d0b08", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 7, padding: "11px 12px", color: "#f0e6d2", fontSize: 14, marginBottom: 12 };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% -10%, #1a150c 0%, #0a0908 55%, #060504 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, color: "#f0e6d2", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <GlobalStyle />
      <div style={{ width: "min(400px,100%)", background: "#0d0b08", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 14, padding: 30 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
          <GTMark size={52} />
          <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 20, marginTop: 10, background: "linear-gradient(135deg,#f4d976,#d4af37 50%,#a67c1f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textAlign: "center" }}>
            GOLD TRADING 2.0
          </div>
          <div style={{ fontSize: 11, color: "#9c8f6f", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>Panel financiero · Acceso privado</div>
        </div>

        <div style={{ display: "flex", gap: 6, background: "#14110c", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 9, padding: 4, marginBottom: 20 }}>
          <button onClick={() => setMode("login")} className="gt-btn" style={{ flex: 1, border: "none", padding: "8px 0", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", background: mode === "login" ? "linear-gradient(135deg,#f4d976,#c9973f)" : "transparent", color: mode === "login" ? "#1a1206" : "#c9b98a" }}>Ingresar</button>
          <button onClick={() => setMode("signup")} className="gt-btn" style={{ flex: 1, border: "none", padding: "8px 0", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", background: mode === "signup" ? "linear-gradient(135deg,#f4d976,#c9973f)" : "transparent", color: mode === "signup" ? "#1a1206" : "#c9b98a" }}>Crear cuenta</button>
        </div>

        <form onSubmit={submit}>
          <input type="email" required placeholder="Email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" required minLength={6} placeholder="Contraseña" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
          {msg && <div style={{ fontSize: 12, marginBottom: 12, color: msg.ok ? "#3ecf8e" : "#e0554f" }}>{msg.text}</div>}
          <button type="submit" disabled={busy} className="gt-btn" style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4d976,#c9973f)", color: "#1a1206", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {busy && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {mode === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =================== APP =================== */
export default function App() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div style={{ minHeight: "100vh", background: "#0a0908", display: "flex", alignItems: "center", justifyContent: "center", color: "#a89968" }}><GlobalStyle /><Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} /></div>;
  }
  if (!session) return <AuthScreen />;
  return <FinanceApp session={session} />;
}

function FinanceApp({ session }) {
  const [tab, setTab] = useState("resumen");
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentForm, setStudentForm] = useState(null); // {} nuevo | {...} editar | null cerrado
  const [paymentForm, setPaymentForm] = useState(null);
  const [expenseForm, setExpenseForm] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [{ data: s }, { data: p }, { data: e }] = await Promise.all([
      supabase.from("students").select("*").order("name"),
      supabase.from("payments").select("*").order("payment_date", { ascending: false }),
      supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
    ]);
    setStudents(s || []); setPayments(p || []); setExpenses(e || []);
    setLoading(false);
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  const logout = () => supabase.auth.signOut();

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% -10%, #1a150c 0%, #0a0908 55%, #060504 100%)", color: "#f0e6d2", fontFamily: "'Helvetica Neue', Arial, sans-serif", paddingBottom: 60 }}>
      <GlobalStyle />
      <Header tab={tab} setTab={setTab} onLogout={logout} email={session.user.email} />
      <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80, color: "#a89968" }}><Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} /></div>
        ) : tab === "resumen" ? (
          <Resumen students={students} payments={payments} expenses={expenses} />
        ) : tab === "alumnos" ? (
          <Alumnos students={students} payments={payments} onNew={() => setStudentForm({})} onEdit={(s) => setStudentForm(s)} reload={loadAll} />
        ) : tab === "ingresos" ? (
          <Ingresos payments={payments} students={students} onNew={() => setPaymentForm({})} onEdit={(p) => setPaymentForm(p)} reload={loadAll} />
        ) : (
          <Egresos expenses={expenses} onNew={() => setExpenseForm({})} onEdit={(e) => setExpenseForm(e)} reload={loadAll} />
        )}
      </div>

      {studentForm !== null && <StudentForm initial={studentForm} onClose={() => setStudentForm(null)} onSaved={() => { setStudentForm(null); loadAll(); }} />}
      {paymentForm !== null && <PaymentForm initial={paymentForm} students={students} onClose={() => setPaymentForm(null)} onSaved={() => { setPaymentForm(null); loadAll(); }} />}
      {expenseForm !== null && <ExpenseForm initial={expenseForm} onClose={() => setExpenseForm(null)} onSaved={() => { setExpenseForm(null); loadAll(); }} />}
    </div>
  );
}

function Header({ tab, setTab, onLogout, email }) {
  const tabs = [
    ["resumen", "Resumen", <LayoutDashboard size={14} />],
    ["alumnos", "Alumnos", <Users size={14} />],
    ["ingresos", "Ingresos", <ArrowUpCircle size={14} />],
    ["egresos", "Egresos", <ArrowDownCircle size={14} />],
  ];
  return (
    <div style={{ borderBottom: "1px solid rgba(212,175,55,0.25)", padding: "20px 16px" }}>
      <div style={{ maxWidth: 1150, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <GTMark size={40} />
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 19, letterSpacing: 0.5, background: "linear-gradient(135deg,#f4d976,#d4af37 50%,#a67c1f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              GOLD TRADING <span style={{ opacity: 0.85 }}>2.0</span>
            </div>
            <div style={{ fontSize: 10.5, letterSpacing: 1.3, color: "#9c8f6f", textTransform: "uppercase" }}>Panel financiero</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, background: "#14110c", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 10, padding: 4 }}>
            {tabs.map(([val, lab, icon]) => (
              <button key={val} onClick={() => setTab(val)} className="gt-btn" style={{ display: "flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer", padding: "8px 14px", borderRadius: 7, fontSize: 12.5, fontWeight: 600, background: tab === val ? "linear-gradient(135deg,#f4d976,#c9973f)" : "transparent", color: tab === val ? "#1a1206" : "#c9b98a" }}>{icon}{lab}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9c8f6f" }}>
            {email}
            <button onClick={onLogout} className="gt-btn" style={{ background: "none", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", borderRadius: 6, padding: 6, cursor: "pointer", display: "flex" }}><LogOut size={13} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Métricas compartidas ---------------- */
function useComputedMetrics(students, payments, expenses) {
  return useMemo(() => {
    const now = new Date();
    const curMonth = monthKey(todayISO());
    const ingresosMes = payments.filter((p) => monthKey(p.payment_date) === curMonth).reduce((s, p) => s + Number(p.amount), 0);
    const egresosMes = expenses.filter((e) => monthKey(e.expense_date) === curMonth).reduce((s, e) => s + Number(e.amount), 0);
    const activos = students.filter((s) => s.status === "activo");
    const mrr = activos.reduce((s, st) => s + Number(st.plan_amount || 0), 0);

    // vencimientos: última fecha de pago de cada alumno + 1 mes
    const lastPaymentByStudent = {};
    payments.forEach((p) => {
      if (!p.student_id) return;
      if (!lastPaymentByStudent[p.student_id] || p.payment_date > lastPaymentByStudent[p.student_id]) lastPaymentByStudent[p.student_id] = p.payment_date;
    });
    const vencidos = activos.filter((s) => {
      const last = lastPaymentByStudent[s.id];
      if (!last) return true; // nunca pagó
      const nextDue = addMonths(last, 1);
      return daysBetween(nextDue, now) > 0;
    });

    // series últimos 6 meses
    const months = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: `${MESES[d.getMonth()]} '${String(d.getFullYear()).slice(2)}` }); }
    const series = months.map(({ key, label }) => {
      const ing = payments.filter((p) => monthKey(p.payment_date) === key).reduce((s, p) => s + Number(p.amount), 0);
      const egr = expenses.filter((e) => monthKey(e.expense_date) === key).reduce((s, e) => s + Number(e.amount), 0);
      return { mes: label, Ingresos: ing, Egresos: egr, Neto: ing - egr };
    });

    return { ingresosMes, egresosMes, netoMes: ingresosMes - egresosMes, activosCount: activos.length, mrr, vencidos, lastPaymentByStudent, series };
  }, [students, payments, expenses]);
}

/* ---------------- Resumen ---------------- */
function Resumen({ students, payments, expenses }) {
  const m = useComputedMetrics(students, payments, expenses);
  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14, marginBottom: 20 }}>
        <MetricCard icon={<Users size={16} />} label="Alumnos activos" value={m.activosCount} color="#d4af37" />
        <MetricCard icon={<Wallet size={16} />} label="MRR estimado" value={money(m.mrr)} color="#d4af37" />
        <MetricCard icon={<TrendingUp size={16} />} label="Ingresos del mes" value={money(m.ingresosMes)} color="#3ecf8e" />
        <MetricCard icon={<TrendingDown size={16} />} label="Egresos del mes" value={money(m.egresosMes)} color="#e0554f" />
        <MetricCard icon={<Wallet size={16} />} label="Neto del mes" value={money(m.netoMes)} color={m.netoMes >= 0 ? "#3ecf8e" : "#e0554f"} />
      </div>

      {m.vencidos.length > 0 && (
        <div style={{ background: "rgba(224,85,79,0.1)", border: "1px solid rgba(224,85,79,0.4)", borderRadius: 10, padding: 14, marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <AlertTriangle size={18} style={{ color: "#e0554f", flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, color: "#e0554f", fontSize: 13, marginBottom: 4 }}>{m.vencidos.length} alumno(s) con pago vencido o sin registrar</div>
            <div style={{ fontSize: 12, color: "#d9b9a8" }}>{m.vencidos.map((s) => s.name).join(" · ")}</div>
          </div>
        </div>
      )}

      <div style={{ background: "#14110c", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 15, color: "#f4d976", marginBottom: 16 }}>Ingresos vs. Egresos — últimos 6 meses</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={m.series}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.1)" />
            <XAxis dataKey="mes" stroke="#8a7c58" fontSize={12} />
            <YAxis stroke="#8a7c58" fontSize={12} />
            <Tooltip contentStyle={{ background: "#0d0b08", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#f4d976" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Ingresos" fill="#3ecf8e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Egresos" fill="#e0554f" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="Neto" stroke="#d4af37" strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
function MetricCard({ icon, label, value, color }) {
  return (
    <div style={{ background: "#14110c", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 10, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color, marginBottom: 8 }}>{icon}<span style={{ fontSize: 10.5, color: "#8a7c58", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span></div>
      <div style={{ fontSize: 21, fontWeight: 700, fontFamily: "Georgia, serif", color }}>{value}</div>
    </div>
  );
}

/* ---------------- Alumnos ---------------- */
function Alumnos({ students, payments, onNew, onEdit, reload }) {
  const [search, setSearch] = useState("");
  const lastPaymentByStudent = useMemo(() => {
    const map = {};
    payments.forEach((p) => { if (!p.student_id) return; if (!map[p.student_id] || p.payment_date > map[p.student_id]) map[p.student_id] = p.payment_date; });
    return map;
  }, [payments]);

  const filtered = students.filter((s) => (s.name || "").toLowerCase().includes(search.toLowerCase()) || (s.email || "").toLowerCase().includes(search.toLowerCase()));

  const remove = async (id) => {
    if (!confirm("¿Eliminar este alumno? También se pierden sus pagos asociados.")) return;
    await supabase.from("students").delete().eq("id", id);
    reload();
  };

  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "#8a7c58" }} />
          <input placeholder="Buscar alumno..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", background: "#0d0b08", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 7, padding: "8px 10px 8px 30px", color: "#f0e6d2", fontSize: 13 }} />
        </div>
        <button onClick={onNew} className="gt-btn" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4d976,#c9973f)", color: "#1a1206", fontWeight: 700, fontSize: 13, cursor: "pointer" }}><Plus size={15} /> Nuevo alumno</button>
      </div>

      <div style={{ background: "#14110c", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Nombre</th><th>Contacto</th><th>Plan</th><th>Estado</th><th>Último pago</th><th></th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#7a6f54", padding: 30 }}>No hay alumnos cargados todavía.</td></tr>
              ) : filtered.map((s) => {
                const last = lastPaymentByStudent[s.id];
                const overdue = s.status === "activo" && (!last || daysBetween(addMonths(last, 1), new Date()) > 0);
                return (
                  <tr key={s.id} className="gt-row">
                    <td style={{ fontWeight: 600, color: "#f0e6d2" }}>{s.name}</td>
                    <td style={{ color: "#9c8f6f" }}>{s.email || "—"}{s.phone ? ` · ${s.phone}` : ""}</td>
                    <td>{money(s.plan_amount)}/mes</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td style={{ color: overdue ? "#e0554f" : "#c9b98a" }}>{last || "Nunca"}{overdue && <span style={{ marginLeft: 6, fontSize: 10, border: "1px solid #e0554f", borderRadius: 8, padding: "1px 6px" }}>VENCIDO</span>}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => onEdit(s)} className="gt-btn" style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", borderRadius: 6, padding: 5, cursor: "pointer" }}><Pencil size={12} /></button>
                        <button onClick={() => remove(s.id)} className="gt-btn" style={{ background: "transparent", border: "1px solid rgba(224,85,79,0.4)", color: "#e0554f", borderRadius: 6, padding: 5, cursor: "pointer" }}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
function StatusBadge({ status }) {
  const map = { activo: ["#3ecf8e", "Activo"], pausado: ["#e0a94f", "Pausado"], cancelado: ["#e0554f", "Cancelado"] };
  const [color, label] = map[status] || map.activo;
  return <span style={{ fontSize: 11, fontWeight: 600, color, border: `1px solid ${color}55`, background: `${color}18`, borderRadius: 20, padding: "2px 9px" }}>{label}</span>;
}

function StudentForm({ initial, onClose, onSaved }) {
  const isNew = !initial.id;
  const [f, setF] = useState({ name: initial.name || "", email: initial.email || "", phone: initial.phone || "", plan_amount: initial.plan_amount ?? 47, status: initial.status || "activo", join_date: initial.join_date || todayISO(), notes: initial.notes || "" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const inputStyle = { width: "100%", background: "#0d0b08", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 7, padding: "9px 10px", color: "#f0e6d2", fontSize: 13 };
  const labelStyle = { fontSize: 11, color: "#9c8f6f", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 5, display: "block" };

  const submit = async () => {
    if (!f.name.trim()) return;
    setBusy(true);
    if (isNew) await supabase.from("students").insert(f);
    else await supabase.from("students").update(f).eq("id", initial.id);
    setBusy(false);
    onSaved();
  };

  return (
    <Modal title={isNew ? "Nuevo alumno" : "Editar alumno"} onClose={onClose}>
      <div style={{ marginBottom: 12 }}><label style={labelStyle}>Nombre</label><input style={inputStyle} value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div style={{ flex: 1 }}><label style={labelStyle}>Teléfono</label><input style={inputStyle} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}><label style={labelStyle}>Monto del plan (mensual)</label><input type="number" style={inputStyle} value={f.plan_amount} onChange={(e) => set("plan_amount", e.target.value)} /></div>
        <div style={{ flex: 1 }}><label style={labelStyle}>Fecha de alta</label><input type="date" style={inputStyle} value={f.join_date} onChange={(e) => set("join_date", e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Estado</label>
        <div style={{ display: "flex", gap: 8 }}>
          {ESTADOS.map(([val, lab]) => (
            <button key={val} onClick={() => set("status", val)} className="gt-btn" style={{ flex: 1, padding: "8px 0", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, border: `1px solid ${f.status === val ? "#d4af37" : "rgba(212,175,55,0.25)"}`, background: f.status === val ? "rgba(212,175,55,0.15)" : "transparent", color: f.status === val ? "#f4d976" : "#9c8f6f" }}>{lab}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 18 }}><label style={labelStyle}>Notas</label><textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={f.notes} onChange={(e) => set("notes", e.target.value)} /></div>
      <FormButtons onCancel={onClose} onSubmit={submit} busy={busy} label={isNew ? "Crear alumno" : "Guardar cambios"} />
    </Modal>
  );
}

/* ---------------- Ingresos ---------------- */
function Ingresos({ payments, students, onNew, onEdit, reload }) {
  const [filterMonth, setFilterMonth] = useState("");
  const studentName = (id) => students.find((s) => s.id === id)?.name || "— (sin asignar) —";
  const filtered = filterMonth ? payments.filter((p) => monthKey(p.payment_date) === filterMonth) : payments;
  const total = filtered.reduce((s, p) => s + Number(p.amount), 0);

  const remove = async (id) => { if (!confirm("¿Eliminar este ingreso?")) return; await supabase.from("payments").delete().eq("id", id); reload(); };

  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
        <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ background: "#0d0b08", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 7, padding: "8px 10px", color: "#f0e6d2", fontSize: 13 }} />
        <button onClick={onNew} className="gt-btn" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4d976,#c9973f)", color: "#1a1206", fontWeight: 700, fontSize: 13, cursor: "pointer" }}><Plus size={15} /> Nuevo ingreso</button>
      </div>
      <div style={{ fontSize: 13, color: "#9c8f6f", marginBottom: 10 }}>Total: <b style={{ color: "#3ecf8e" }}>{money(total)}</b> ({filtered.length} pagos)</div>
      <div style={{ background: "#14110c", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Fecha</th><th>Alumno</th><th>Monto</th><th>Método</th><th>Período</th><th></th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={6} style={{ textAlign: "center", color: "#7a6f54", padding: 30 }}>No hay ingresos cargados.</td></tr> : filtered.map((p) => (
                <tr key={p.id} className="gt-row">
                  <td>{p.payment_date}</td>
                  <td style={{ color: "#f0e6d2" }}>{studentName(p.student_id)}</td>
                  <td style={{ color: "#3ecf8e", fontWeight: 600 }}>{money(p.amount)}</td>
                  <td>{p.method}</td>
                  <td style={{ color: "#9c8f6f" }}>{p.period_label || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => onEdit(p)} className="gt-btn" style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", borderRadius: 6, padding: 5, cursor: "pointer" }}><Pencil size={12} /></button>
                      <button onClick={() => remove(p.id)} className="gt-btn" style={{ background: "transparent", border: "1px solid rgba(224,85,79,0.4)", color: "#e0554f", borderRadius: 6, padding: 5, cursor: "pointer" }}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PaymentForm({ initial, students, onClose, onSaved }) {
  const isNew = !initial.id;
  const [f, setF] = useState({ student_id: initial.student_id || "", amount: initial.amount ?? "", payment_date: initial.payment_date || todayISO(), method: initial.method || METODOS[0], period_label: initial.period_label || "", notes: initial.notes || "" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const inputStyle = { width: "100%", background: "#0d0b08", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 7, padding: "9px 10px", color: "#f0e6d2", fontSize: 13 };
  const labelStyle = { fontSize: 11, color: "#9c8f6f", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 5, display: "block" };

  const onStudentChange = (id) => {
    const st = students.find((s) => s.id === id);
    setF((p) => ({ ...p, student_id: id, amount: p.amount || st?.plan_amount || "" }));
  };

  const submit = async () => {
    if (!f.amount) return;
    setBusy(true);
    const payload = { ...f, student_id: f.student_id || null, amount: Number(f.amount) };
    if (isNew) await supabase.from("payments").insert(payload);
    else await supabase.from("payments").update(payload).eq("id", initial.id);
    setBusy(false);
    onSaved();
  };

  return (
    <Modal title={isNew ? "Nuevo ingreso" : "Editar ingreso"} onClose={onClose}>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Alumno</label>
        <select style={inputStyle} value={f.student_id} onChange={(e) => onStudentChange(e.target.value)}>
          <option value="">— Sin asignar —</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}><label style={labelStyle}>Monto</label><input type="number" style={inputStyle} value={f.amount} onChange={(e) => set("amount", e.target.value)} /></div>
        <div style={{ flex: 1 }}><label style={labelStyle}>Fecha</label><input type="date" style={inputStyle} value={f.payment_date} onChange={(e) => set("payment_date", e.target.value)} /></div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}><label style={labelStyle}>Método</label><select style={inputStyle} value={f.method} onChange={(e) => set("method", e.target.value)}>{METODOS.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
        <div style={{ flex: 1 }}><label style={labelStyle}>Período (opcional)</label><input placeholder="ej. Agosto 2026" style={inputStyle} value={f.period_label} onChange={(e) => set("period_label", e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: 18 }}><label style={labelStyle}>Notas</label><textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={f.notes} onChange={(e) => set("notes", e.target.value)} /></div>
      <FormButtons onCancel={onClose} onSubmit={submit} busy={busy} label={isNew ? "Registrar ingreso" : "Guardar cambios"} />
    </Modal>
  );
}

/* ---------------- Egresos ---------------- */
function Egresos({ expenses, onNew, onEdit, reload }) {
  const [filterMonth, setFilterMonth] = useState("");
  const filtered = filterMonth ? expenses.filter((e) => monthKey(e.expense_date) === filterMonth) : expenses;
  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);
  const remove = async (id) => { if (!confirm("¿Eliminar este egreso?")) return; await supabase.from("expenses").delete().eq("id", id); reload(); };

  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
        <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ background: "#0d0b08", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 7, padding: "8px 10px", color: "#f0e6d2", fontSize: 13 }} />
        <button onClick={onNew} className="gt-btn" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4d976,#c9973f)", color: "#1a1206", fontWeight: 700, fontSize: 13, cursor: "pointer" }}><Plus size={15} /> Nuevo egreso</button>
      </div>
      <div style={{ fontSize: 13, color: "#9c8f6f", marginBottom: 10 }}>Total: <b style={{ color: "#e0554f" }}>{money(total)}</b> ({filtered.length} gastos)</div>
      <div style={{ background: "#14110c", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Monto</th><th></th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", color: "#7a6f54", padding: 30 }}>No hay egresos cargados.</td></tr> : filtered.map((e) => (
                <tr key={e.id} className="gt-row">
                  <td>{e.expense_date}</td>
                  <td>{e.category}</td>
                  <td style={{ color: "#9c8f6f" }}>{e.description || "—"}</td>
                  <td style={{ color: "#e0554f", fontWeight: 600 }}>{money(e.amount)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => onEdit(e)} className="gt-btn" style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37", borderRadius: 6, padding: 5, cursor: "pointer" }}><Pencil size={12} /></button>
                      <button onClick={() => remove(e.id)} className="gt-btn" style={{ background: "transparent", border: "1px solid rgba(224,85,79,0.4)", color: "#e0554f", borderRadius: 6, padding: 5, cursor: "pointer" }}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ExpenseForm({ initial, onClose, onSaved }) {
  const isNew = !initial.id;
  const [f, setF] = useState({ expense_date: initial.expense_date || todayISO(), category: initial.category || CATEGORIAS[0], description: initial.description || "", amount: initial.amount ?? "" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const inputStyle = { width: "100%", background: "#0d0b08", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 7, padding: "9px 10px", color: "#f0e6d2", fontSize: 13 };
  const labelStyle = { fontSize: 11, color: "#9c8f6f", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 5, display: "block" };

  const submit = async () => {
    if (!f.amount) return;
    setBusy(true);
    const payload = { ...f, amount: Number(f.amount) };
    if (isNew) await supabase.from("expenses").insert(payload);
    else await supabase.from("expenses").update(payload).eq("id", initial.id);
    setBusy(false);
    onSaved();
  };

  return (
    <Modal title={isNew ? "Nuevo egreso" : "Editar egreso"} onClose={onClose}>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}><label style={labelStyle}>Fecha</label><input type="date" style={inputStyle} value={f.expense_date} onChange={(e) => set("expense_date", e.target.value)} /></div>
        <div style={{ flex: 1 }}><label style={labelStyle}>Monto</label><input type="number" style={inputStyle} value={f.amount} onChange={(e) => set("amount", e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: 12 }}><label style={labelStyle}>Categoría</label><select style={inputStyle} value={f.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
      <div style={{ marginBottom: 18 }}><label style={labelStyle}>Descripción</label><textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <FormButtons onCancel={onClose} onSubmit={submit} busy={busy} label={isNew ? "Registrar egreso" : "Guardar cambios"} />
    </Modal>
  );
}

/* ---------------- Componentes genéricos ---------------- */
function Modal({ title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50 }} />
      <div className="gt-scroll" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(480px,92vw)", maxHeight: "90vh", overflowY: "auto", background: "#0d0b08", border: "1px solid rgba(212,175,55,0.35)", borderRadius: 14, zIndex: 51, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#f4d976" }}>{title}</div>
          <button onClick={onClose} className="gt-btn" style={{ background: "none", border: "none", color: "#c9b98a", cursor: "pointer" }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </>
  );
}
function FormButtons({ onCancel, onSubmit, busy, label }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button onClick={onCancel} className="gt-btn" style={{ flex: 1, padding: "11px", borderRadius: 8, border: "1px solid rgba(212,175,55,0.3)", background: "transparent", color: "#c9b98a", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Cancelar</button>
      <button onClick={onSubmit} disabled={busy} className="gt-btn" style={{ flex: 2, padding: "11px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f4d976,#c9973f)", color: "#1a1206", cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {busy && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}{label}
      </button>
    </div>
  );
}
