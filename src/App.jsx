import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  Clock3,
  Cloud,
  Edit3,
  LayoutDashboard,
  MapPin,
  Menu,
  PackageCheck,
  Plus,
  RefreshCw,
  Route,
  Search,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import {
  apiMode,
  createDelivery,
  deleteDelivery,
  listDeliveries,
  updateDelivery,
} from "./api";

const emptyForm = {
  code: "",
  customer: "",
  destination: "",
  driver: "",
  status: "Pendente",
  eta: "",
  progress: 0,
};

const statusClass = (status) => status.toLowerCase().replace(" ", "-");

function Logo() {
  return (
    <div className="brand" aria-label="CloudLog">
      <span className="brand-mark"><Cloud size={22} strokeWidth={2.3} /></span>
      <span>Cloud<span>Log</span></span>
    </div>
  );
}

function StatusPill({ status }) {
  return <span className={`status ${statusClass(status)}`}><i />{status}</span>;
}

function Sidebar({ page, onNavigate, open, onClose }) {
  const links = [
    { id: "dashboard", label: "Visão operacional", icon: LayoutDashboard },
    { id: "deliveries", label: "Entregas", icon: PackageCheck },
  ];
  return (
    <>
      {open && <button className="scrim" aria-label="Fechar menu" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="icon-button mobile-only" onClick={onClose} aria-label="Fechar menu"><X size={20} /></button>
        </div>
        <p className="nav-label">OPERAÇÃO</p>
        <nav>
          {links.map(({ id, label, icon: Icon }) => (
            <button key={id} className={page === id ? "active" : ""} onClick={() => { onNavigate(id); onClose(); }}>
              <Icon size={19} /><span>{label}</span>{page === id && <ChevronRight size={16} className="chevron" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="health-dot" />
          <div><strong>Sistemas operacionais</strong><span>Última verificação agora</span></div>
        </div>
      </aside>
    </>
  );
}

function Header({ title, subtitle, onMenu }) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-only" onClick={onMenu} aria-label="Abrir menu"><Menu size={21} /></button>
      <div><h1>{title}</h1><p>{subtitle}</p></div>
      <div className="topbar-actions">
        <span className="mode"><i />{apiMode}</span>
        <div className="avatar">CL</div>
      </div>
    </header>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon size={21} /></div>
      <div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div>
    </article>
  );
}

function Dashboard({ deliveries, loading, onSeeDeliveries }) {
  const counts = useMemo(() => ({
    active: deliveries.filter((item) => item.status === "Em rota").length,
    late: deliveries.filter((item) => item.status === "Atrasada").length,
    done: deliveries.filter((item) => item.status === "Entregue").length,
  }), [deliveries]);
  return (
    <main className="content">
      <section className="hero-row">
        <div><span className="eyebrow">QUINTA-FEIRA, 03 DE SETEMBRO</span><h2>A operação está em movimento.</h2><p>Acompanhe o que precisa de atenção e mantenha as entregas no ritmo certo.</p></div>
        <button className="primary" onClick={onSeeDeliveries}>Gerenciar entregas <ArrowRight size={18} /></button>
      </section>
      <section className="metrics" aria-label="Indicadores operacionais">
        <MetricCard icon={Truck} label="Em rota" value={loading ? "—" : counts.active} detail="veículos em deslocamento" tone="blue" />
        <MetricCard icon={AlertTriangle} label="Precisam de atenção" value={loading ? "—" : counts.late} detail="entregas com atraso" tone="amber" />
        <MetricCard icon={CheckCircle2} label="Concluídas" value={loading ? "—" : counts.done} detail="com comprovante digital" tone="green" />
        <MetricCard icon={CircleGauge} label="Eficiência da frota" value="92%" detail="+4,2% nesta semana" tone="violet" />
      </section>
      <section className="dashboard-grid">
        <article className="panel route-panel">
          <div className="panel-head"><div><span className="eyebrow">TELEMETRIA</span><h3>Fluxo das rotas</h3></div><span className="live"><i /> AO VIVO</span></div>
          <div className="map-visual" role="img" aria-label="Representação das rotas ativas na região de Curitiba">
            <div className="route-line line-a" /><div className="route-line line-b" /><div className="route-line line-c" />
            <span className="map-point p1"><Truck size={15} /></span><span className="map-point p2"><Truck size={15} /></span><span className="map-point p3 alert"><AlertTriangle size={15} /></span>
            <span className="city c1">CURITIBA</span><span className="city c2">ARAUCÁRIA</span><span className="city c3">COLOMBO</span>
            <div className="map-card"><MapPin size={17} /><div><strong>{counts.active || 1} veículos acompanhados</strong><span>Atualização em menos de 10 segundos</span></div></div>
          </div>
        </article>
        <article className="panel attention-panel">
          <div className="panel-head"><div><span className="eyebrow">PRIORIDADES</span><h3>Requer atenção</h3></div><button className="text-button" onClick={onSeeDeliveries}>Ver todas</button></div>
          <div className="attention-list">
            {deliveries.filter((d) => d.status === "Atrasada").slice(0, 3).map((delivery) => (
              <div className="attention-item" key={delivery._id}>
                <span className="attention-icon"><Clock3 size={18} /></span>
                <div><strong>{delivery.code} · {delivery.customer}</strong><span>{delivery.destination} · {delivery.driver}</span></div>
                <StatusPill status={delivery.status} />
              </div>
            ))}
            {!loading && !deliveries.some((d) => d.status === "Atrasada") && <div className="empty"><CheckCircle2 size={28} /><strong>Nenhum atraso agora</strong><span>A operação está dentro do planejado.</span></div>}
          </div>
          <div className="performance"><div><span>Entregas no prazo</span><strong>87%</strong></div><div className="bar"><span style={{ width: "87%" }} /></div><p>Meta operacional: 90%</p></div>
        </article>
      </section>
    </main>
  );
}

function DeliveryModal({ delivery, onClose, onSave, busy }) {
  const [form, setForm] = useState(delivery || emptyForm);
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    onSave({ ...form, progress: Number(form.progress) });
  };
  return (
    <div className="modal-wrap" role="presentation">
      <button className="modal-scrim" aria-label="Fechar formulário" onClick={onClose} />
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-head"><div><span className="eyebrow">GESTÃO DE ENTREGA</span><h2 id="modal-title">{delivery ? "Atualizar entrega" : "Nova entrega"}</h2></div><button className="icon-button" onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label>Código<input required value={form.code} onChange={set("code")} placeholder="CL-2050" /></label>
            <label>Status<select value={form.status} onChange={set("status")}><option>Pendente</option><option>Em rota</option><option>Atrasada</option><option>Entregue</option></select></label>
            <label>Cliente<input required value={form.customer} onChange={set("customer")} placeholder="Nome do cliente" /></label>
            <label>Motorista<input required value={form.driver} onChange={set("driver")} placeholder="Nome do motorista" /></label>
            <label className="wide">Destino<input required value={form.destination} onChange={set("destination")} placeholder="Cidade, UF" /></label>
            <label>Previsão<input required value={form.eta} onChange={set("eta")} placeholder="Hoje, 17:30" /></label>
            <label>Progresso (%)<input type="number" min="0" max="100" value={form.progress} onChange={set("progress")} /></label>
          </div>
          <div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" disabled={busy}>{busy ? "Salvando…" : delivery ? "Salvar alterações" : "Criar entrega"}</button></div>
        </form>
      </section>
    </div>
  );
}

function Deliveries({ deliveries, loading, error, onRefresh, onCreate, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const filtered = deliveries.filter((item) => {
    const term = search.toLowerCase();
    return (status === "Todos" || item.status === status) && (!term || [item.code, item.customer, item.destination, item.driver].some((value) => value.toLowerCase().includes(term)));
  });
  return (
    <main className="content">
      <section className="page-title"><div><span className="eyebrow">GESTÃO OPERACIONAL</span><h2>Entregas</h2><p>Consulte e mantenha as entregas conectadas às Azure Functions.</p></div><button className="primary" onClick={onCreate}><Plus size={18} /> Nova entrega</button></section>
      <section className="panel table-panel">
        <div className="toolbar">
          <label className="search-box"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar código, cliente ou motorista" /></label>
          <div className="filters"><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por status"><option>Todos</option><option>Pendente</option><option>Em rota</option><option>Atrasada</option><option>Entregue</option></select><button className="icon-button" onClick={onRefresh} aria-label="Atualizar entregas"><RefreshCw size={18} className={loading ? "spin" : ""} /></button></div>
        </div>
        {error && <div className="error-banner"><AlertTriangle size={18} /><span>{error}</span></div>}
        <div className="table-wrap">
          <table>
            <thead><tr><th>Entrega</th><th>Destino</th><th>Motorista</th><th>Status</th><th>Progresso</th><th><span className="sr-only">Ações</span></th></tr></thead>
            <tbody>
              {filtered.map((delivery) => (
                <tr key={delivery._id}>
                  <td><strong>{delivery.code}</strong><span>{delivery.customer}</span></td>
                  <td><strong>{delivery.destination}</strong><span>{delivery.eta}</span></td>
                  <td>{delivery.driver}</td>
                  <td><StatusPill status={delivery.status} /></td>
                  <td><div className="progress-cell"><div className="bar"><span style={{ width: `${delivery.progress}%` }} /></div><span>{delivery.progress}%</span></div></td>
                  <td><div className="row-actions"><button className="icon-button" onClick={() => onEdit(delivery)} aria-label={`Editar ${delivery.code}`}><Edit3 size={17} /></button><button className="icon-button danger" onClick={() => onDelete(delivery)} aria-label={`Excluir ${delivery.code}`}><Trash2 size={17} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && <div className="empty"><PackageCheck size={31} /><strong>Nenhuma entrega encontrada</strong><span>Ajuste os filtros ou crie uma nova entrega.</span></div>}
        <div className="table-foot"><span>{filtered.length} de {deliveries.length} entregas</span><span><i /> Dados via {apiMode}</span></div>
      </section>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try { const result = await listDeliveries(); setDeliveries(result.items); }
    catch (err) { setError(`${err.message} Confira a URL da Function App e a configuração de CORS.`); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async (form) => {
    setBusy(true); setError("");
    try {
      if (modal?.delivery) await updateDelivery(modal.delivery._id, form);
      else await createDelivery(form);
      setModal(null); await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const remove = async (delivery) => {
    if (!window.confirm(`Excluir a entrega ${delivery.code}?`)) return;
    setError("");
    try { await deleteDelivery(delivery._id); await load(); }
    catch (err) { setError(err.message); }
  };

  const meta = page === "dashboard"
    ? { title: "Central de Operações", subtitle: "Visibilidade em tempo real da sua logística" }
    : { title: "Controle de Entregas", subtitle: "Ordens, rotas e comprovantes em um só lugar" };

  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={setPage} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="workspace">
        <Header {...meta} onMenu={() => setMenuOpen(true)} />
        {page === "dashboard"
          ? <Dashboard deliveries={deliveries} loading={loading} onSeeDeliveries={() => setPage("deliveries")} />
          : <Deliveries deliveries={deliveries} loading={loading} error={error} onRefresh={load} onCreate={() => setModal({})} onEdit={(delivery) => setModal({ delivery })} onDelete={remove} />}
      </div>
      {modal && <DeliveryModal delivery={modal.delivery} onClose={() => setModal(null)} onSave={save} busy={busy} />}
    </div>
  );
}
