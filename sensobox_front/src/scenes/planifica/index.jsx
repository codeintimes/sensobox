// Planifica · planificación de producción y capacidad dentro de Sensobox.
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, Divider, IconButton, MenuItem, Paper, Snackbar, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import SensorsIcon from "@mui/icons-material/Sensors";
import { useTranslation } from "react-i18next";
import Gantt from "./Gantt";
import * as api from "./api";
import { P } from "./palette";
import { fmtDateTime, fmtIsoDay, fmtWeekdayNum, nf } from "../../utils/format";

const TABS = ["gantt", "load", "orders", "whatif", "setup"];
const card = { p: "18px", borderRadius: "14px", border: `1px solid ${P.line}`, boxShadow: "none" };

function StatusChip({ o }) {
  const { t } = useTranslation();
  if (o.unplanned) return <Chip size="small" label={t("planifica.status.unplanned")} sx={{ background: P.lateSoft, color: P.late, fontWeight: 700 }} />;
  return o.late
    ? <Chip size="small" label={t("planifica.status.lateBy", { h: nf(o.lateMin / 60, 1) })} sx={{ background: P.lateSoft, color: P.late, fontWeight: 700 }} />
    : <Chip size="small" label={t("planifica.status.onTime")} sx={{ background: "#D1FAE5", color: "#065F46", fontWeight: 700 }} />;
}

function Kpi({ label, value, tone }) {
  return (
    <Paper sx={{ ...card, flex: "1 1 160px", p: "14px 16px" }}>
      <Typography sx={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: P.grey }}>{label}</Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 700, color: tone || "#111827" }}>{value}</Typography>
    </Paper>
  );
}

// ---------- Gantt ----------
function GanttTab({ master, notify }) {
  const { t } = useTranslation();
  const [days, setDays] = useState(7);
  const [offset, setOffset] = useState(0);
  const [plan, setPlan] = useState(null);
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);
  const from = new Date(Date.now() - 12 * 3600000 + offset * 86400000).toISOString();
  const load = useCallback(() => api.getPlan(from, days).then(setPlan).catch((e) => notify(api.errorText(e, t), "error")), [from.slice(0, 13), days]); // eslint-disable-line
  useEffect(() => { load(); }, [load]);
  if (!plan) return <Box p={6} textAlign="center"><CircularProgress sx={{ color: P.main }} /></Box>;
  const late = plan.orders.filter((o) => o.late);
  const selOrder = sel && plan.orders.find((o) => o.id === sel.orderId);

  return (
    <Box>
      <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap", mb: "14px" }}>
        <Kpi label={t("planifica.kpi.orders")} value={nf(plan.orders.length)} />
        <Kpi label={t("planifica.kpi.late")} value={nf(late.length)} tone={late.length ? P.late : P.ok} />
        <Kpi label={t("planifica.kpi.locked")} value={nf(plan.operations.filter((o) => o.locked).length)} />
        <Kpi label={t("planifica.kpi.unlinked")} value={nf(plan.unlinked.length)} tone={P.greyDark} />
      </Box>
      {late.length > 0 && (
        <Alert severity="warning" sx={{ mb: "14px", borderRadius: "12px", "& .MuiAlert-message": { width: "100%" } }}>
          <b>{t("planifica.lateAlert", { count: late.length })}</b>
          <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap", mt: "6px" }}>
            {late.map((o) => <Chip key={o.id} size="small" label={`${t("planifica.order", { n: o.orderNumber })} · ${o.clientName} · ${t("planifica.status.lateBy", { h: nf(o.lateMin / 60, 1) })}`} sx={{ background: "#fff", border: `1px solid ${P.late}`, color: "#991B1B" }} />)}
          </Box>
        </Alert>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", mb: "10px" }}>
        <IconButton onClick={() => setOffset(offset - Math.max(1, Math.floor(days / 2)))} aria-label={t("planifica.gantt.prev")}><ChevronLeftIcon /></IconButton>
        <Button variant="text" onClick={() => setOffset(0)} sx={{ color: P.main, fontWeight: 700 }}>{t("planifica.gantt.today")}</Button>
        <IconButton onClick={() => setOffset(offset + Math.max(1, Math.floor(days / 2)))} aria-label={t("planifica.gantt.next")}><ChevronRightIcon /></IconButton>
        <ToggleButtonGroup size="small" exclusive value={days} onChange={(_, v) => v && setDays(v)}>
          {[3, 7, 14].map((d) => <ToggleButton key={d} value={d} sx={{ px: "12px", "&.Mui-selected": { background: P.soft, color: P.dark } }}>{t("planifica.gantt.days", { n: d })}</ToggleButton>)}
        </ToggleButtonGroup>
        <Chip icon={<SensorsIcon />} label={plan.ritmia.ok ? t("planifica.ritmia.on") : t("planifica.ritmia.off")} sx={{ background: plan.ritmia.ok ? P.soft : "#F3F4F6", color: plan.ritmia.ok ? P.dark : P.greyDark, fontWeight: 600 }} />
        <Box flex={1} />
        <Typography sx={{ fontSize: 12.5, color: P.grey }}>{t("planifica.gantt.hint")}</Typography>
        <Button variant="contained" startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <AutorenewIcon />} disabled={busy}
          onClick={async () => { setBusy(true); try { setPlan(await api.replan()); notify(t("planifica.replanned")); } catch (e) { notify(api.errorText(e, t), "error"); } setBusy(false); }}
          sx={{ background: P.main, "&:hover": { background: P.dark }, borderRadius: "10px", textTransform: "none", fontWeight: 700 }}>
          {t("planifica.replan")}
        </Button>
      </Box>
      <Gantt plan={plan} articles={master?.articles} selectedId={sel?._id}
        onSelect={setSel}
        onMove={async (op, body) => {
          try { await api.moveOp(op._id, body); await load(); notify(t("planifica.moved", { n: op.orderNumber })); } catch (e) { notify(api.errorText(e, t), "error"); }
        }} />
      {sel && selOrder && (
        <Paper sx={{ ...card, mt: "14px", display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" }}>
          <Box>
            <Typography sx={{ fontSize: 12, color: P.grey, fontWeight: 700, textTransform: "uppercase" }}>{t("planifica.order", { n: sel.orderNumber })}</Typography>
            <Typography sx={{ fontSize: 17, fontWeight: 700 }}>{selOrder.articleName}</Typography>
            <Typography sx={{ fontSize: 13, color: P.greyDark }}>{selOrder.clientName}</Typography>
          </Box>
          <Box><Typography sx={{ fontSize: 12, color: P.grey }}>{t("planifica.cols.progress")}</Typography><Typography sx={{ fontWeight: 700 }}>{nf(selOrder.producedGood)} / {nf(selOrder.qty)}</Typography></Box>
          <Box><Typography sx={{ fontSize: 12, color: P.grey }}>{t("planifica.cols.due")}</Typography><Typography sx={{ fontWeight: 700 }}>{fmtDateTime(selOrder.dueDate)}</Typography></Box>
          <Box><Typography sx={{ fontSize: 12, color: P.grey }}>{t("planifica.cols.end")}</Typography><Typography sx={{ fontWeight: 700 }}>{fmtDateTime(selOrder.end)}</Typography></Box>
          <StatusChip o={selOrder} />
          <Box flex={1} />
          {sel.locked && (
            <Button variant="outlined" onClick={async () => { await api.unlockOp(sel._id); setSel(null); await load(); notify(t("planifica.unlocked")); }} sx={{ borderColor: P.main, color: P.main, textTransform: "none", fontWeight: 700, borderRadius: "10px" }}>
              {t("planifica.gantt.unlock")}
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
}

// ---------- Carga por máquina ----------
function LoadTab({ notify }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  useEffect(() => { api.getLoad(14).then(setData).catch((e) => notify(api.errorText(e, t), "error")); }, []); // eslint-disable-line
  if (!data) return <Box p={6} textAlign="center"><CircularProgress sx={{ color: P.main }} /></Box>;
  const daysList = [...new Set(data.rows.map((r) => r.day))];
  const cell = (v, avail) => {
    if (!avail) return { background: "repeating-linear-gradient(135deg,#F3F4F6 0 5px,#E5E7EB 5px 7px)", color: P.grey };
    if (v > 1) return { background: P.late, color: "#fff" };
    const a = Math.min(1, v);
    return { background: `rgba(126,34,206,${0.08 + a * 0.82})`, color: a > 0.5 ? "#fff" : P.dark };
  };
  return (
    <Paper sx={{ ...card, overflowX: "auto" }}>
      <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{t("planifica.load.title")}</Typography>
      <Typography sx={{ fontSize: 13, color: P.greyDark, mb: "12px" }}>{t("planifica.load.subtitle")}</Typography>
      <Box component="table" sx={{ borderCollapse: "separate", borderSpacing: "4px", minWidth: 900 }}>
        <thead>
          <tr>
            <Box component="th" sx={{ textAlign: "left", fontSize: 12, color: P.grey, pr: "10px" }}>{t("planifica.gantt.resource")}</Box>
            {daysList.map((d) => <Box component="th" key={d} sx={{ fontSize: 11, color: P.greyDark, fontWeight: 600, whiteSpace: "nowrap" }}>{fmtWeekdayNum(`${d}T12:00:00`)}</Box>)}
            <Box component="th" sx={{ fontSize: 12, color: P.grey, pl: "10px" }}>{t("planifica.load.total")}</Box>
          </tr>
        </thead>
        <tbody>
          {data.resources.map((r) => {
            const rows = data.rows.filter((x) => x.resourceCode === r.code);
            const booked = rows.reduce((s, x) => s + x.bookedMin, 0);
            const avail = rows.reduce((s, x) => s + x.availableMin, 0);
            return (
              <tr key={r.code}>
                <Box component="td" sx={{ fontSize: 13, fontWeight: 600, pr: "10px", whiteSpace: "nowrap" }}>{r.name}</Box>
                {rows.map((x) => (
                  <Box component="td" key={x.day} title={`${nf(x.bookedMin / 60, 1)} h / ${nf(x.availableMin / 60, 1)} h`}
                    sx={{ ...cell(x.load, x.availableMin), width: 52, height: 34, textAlign: "center", fontSize: 11.5, fontWeight: 700, borderRadius: "6px" }}>
                    {x.availableMin ? nf(x.load * 100) : ""}
                  </Box>
                ))}
                <Box component="td" sx={{ pl: "10px", fontWeight: 700, color: avail && booked / avail > 0.9 ? P.late : P.dark, whiteSpace: "nowrap" }}>{avail ? `${nf((booked / avail) * 100)} %` : "—"}</Box>
              </tr>
            );
          })}
        </tbody>
      </Box>
      <Box sx={{ display: "flex", gap: "16px", mt: "12px", fontSize: 12, color: P.greyDark, flexWrap: "wrap" }}>
        <span>{t("planifica.load.legendPct")}</span>
        <span style={{ color: P.late, fontWeight: 700 }}>{t("planifica.load.legendOver")}</span>
        <span>{t("planifica.load.legendOff")}</span>
      </Box>
    </Paper>
  );
}

// ---------- Órdenes ----------
function OrdersTab({ master, notify }) {
  const { t } = useTranslation();
  const [plan, setPlan] = useState(null);
  const [linking, setLinking] = useState({});
  const load = () => api.getPlan(undefined, 7).then(setPlan).catch((e) => notify(api.errorText(e, t), "error"));
  useEffect(() => { load(); }, []); // eslint-disable-line
  if (!plan) return <Box p={6} textAlign="center"><CircularProgress sx={{ color: P.main }} /></Box>;
  const rows = [...plan.orders].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const th = { textAlign: "left", fontSize: 11.5, color: P.grey, textTransform: "uppercase", letterSpacing: ".05em", py: "8px", px: "8px", borderBottom: `1px solid ${P.line}` };
  const td = { fontSize: 13, py: "8px", px: "8px", borderBottom: `1px solid ${P.line}` };
  return (
    <Box>
      <Paper sx={{ ...card, overflowX: "auto" }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: "8px" }}>{t("planifica.orders.title")}</Typography>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
          <thead><tr>
            {["order", "client", "article", "qty", "progress", "due", "end", "status", "priority"].map((k) => <Box component="th" key={k} sx={th}>{t(`planifica.cols.${k}`)}</Box>)}
          </tr></thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <Box component="td" sx={{ ...td, fontWeight: 700, color: P.dark }}>{o.orderNumber}</Box>
                <Box component="td" sx={td}>{o.clientName}</Box>
                <Box component="td" sx={td}>{o.articleName}</Box>
                <Box component="td" sx={td}>{nf(o.qty)}</Box>
                <Box component="td" sx={td}>{nf((o.producedGood / Math.max(1, o.qty)) * 100)} %</Box>
                <Box component="td" sx={td}>{fmtDateTime(o.dueDate)}</Box>
                <Box component="td" sx={td}>{fmtDateTime(o.end)}</Box>
                <Box component="td" sx={td}><StatusChip o={o} /></Box>
                <Box component="td" sx={td}>
                  <TextField select size="small" value={o.priority} onChange={async (e) => { await api.updateOrder(o.id, { priority: e.target.value }); load(); notify(t("planifica.replanned")); }} sx={{ minWidth: 120 }}>
                    {[1, 2, 3].map((p) => <MenuItem key={p} value={p}>{t(`planifica.priority.${p}`)}</MenuItem>)}
                  </TextField>
                </Box>
              </tr>
            ))}
          </tbody>
        </Box>
      </Paper>
      {plan.unlinked.length > 0 && (
        <Paper sx={{ ...card, mt: "14px" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{t("planifica.orders.unlinkedTitle", { count: plan.unlinked.length })}</Typography>
          <Typography sx={{ fontSize: 13, color: P.greyDark, mb: "10px" }}>{t("planifica.orders.unlinkedHint")}</Typography>
          {plan.unlinked.slice(0, 12).map((o) => (
            <Box key={o.id} sx={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", py: "8px", borderBottom: `1px solid ${P.line}` }}>
              <Typography sx={{ fontWeight: 700, width: 70 }}>{o.orderNumber}</Typography>
              <Typography sx={{ fontSize: 13, flex: "1 1 220px" }}>{o.clientName} · {o.workName} · {nf(o.productionQuantity)}</Typography>
              <TextField select size="small" label={t("planifica.cols.article")} value={linking[o.id]?.articleCode ?? ""} onChange={(e) => setLinking({ ...linking, [o.id]: { ...linking[o.id], articleCode: e.target.value } })} sx={{ minWidth: 220 }}>
                {(master?.articles ?? []).map((a) => <MenuItem key={a.code} value={a.code}>{a.code} · {a.name}</MenuItem>)}
              </TextField>
              <TextField type="datetime-local" size="small" label={t("planifica.cols.due")} InputLabelProps={{ shrink: true }} value={linking[o.id]?.dueDate ?? ""} onChange={(e) => setLinking({ ...linking, [o.id]: { ...linking[o.id], dueDate: e.target.value } })} />
              <Button variant="contained" disabled={!linking[o.id]?.articleCode} onClick={async () => {
                try { await api.linkOrder(o.id, { articleCode: linking[o.id].articleCode, dueDate: linking[o.id].dueDate ? new Date(linking[o.id].dueDate).toISOString() : undefined }); load(); notify(t("planifica.linked")); } catch (e) { notify(api.errorText(e, t), "error"); }
              }} sx={{ background: P.main, "&:hover": { background: P.dark }, textTransform: "none", fontWeight: 700, borderRadius: "10px" }}>{t("planifica.orders.link")}</Button>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}

// ---------- ¿Qué pasa si…? ----------
function WhatIfTab({ master, notify }) {
  const { t } = useTranslation();
  const tomorrow = new Date(Date.now() + 36 * 3600000);
  tomorrow.setMinutes(0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  const local = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const [form, setForm] = useState({ articleCode: "TAP-38", qty: 80000, dueDate: local(tomorrow), priority: 1, clientName: "Conservas Ribera, S.A." });
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const body = () => ({ ...form, qty: Number(form.qty), dueDate: new Date(form.dueDate).toISOString() });
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setRes(null); };
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "380px 1fr" }, gap: "14px" }}>
      <Paper sx={card}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{t("planifica.whatif.title")}</Typography>
        <Typography sx={{ fontSize: 13, color: P.greyDark, mb: "14px" }}>{t("planifica.whatif.subtitle")}</Typography>
        <Box sx={{ display: "grid", gap: "12px" }}>
          <TextField select label={t("planifica.cols.article")} value={form.articleCode} onChange={set("articleCode")}>
            {(master?.articles ?? []).map((a) => <MenuItem key={a.code} value={a.code}>{a.code} · {a.name}</MenuItem>)}
          </TextField>
          <TextField type="number" label={t("planifica.cols.qty")} value={form.qty} onChange={set("qty")} />
          <TextField type="datetime-local" label={t("planifica.cols.due")} InputLabelProps={{ shrink: true }} value={form.dueDate} onChange={set("dueDate")} />
          <TextField select label={t("planifica.cols.priority")} value={form.priority} onChange={set("priority")}>
            {[1, 2, 3].map((p) => <MenuItem key={p} value={p}>{t(`planifica.priority.${p}`)}</MenuItem>)}
          </TextField>
          <TextField label={t("planifica.cols.client")} value={form.clientName} onChange={set("clientName")} />
          <Button variant="contained" disabled={busy} onClick={async () => { setBusy(true); try { setRes(await api.simulate(body())); } catch (e) { notify(api.errorText(e, t), "error"); } setBusy(false); }}
            sx={{ background: P.main, "&:hover": { background: P.dark }, textTransform: "none", fontWeight: 700, borderRadius: "10px", py: "10px" }}>
            {t("planifica.whatif.run")}
          </Button>
        </Box>
      </Paper>
      <Paper sx={card}>
        {!res && <Typography sx={{ color: P.grey, py: "40px", textAlign: "center" }}>{t("planifica.whatif.empty")}</Typography>}
        {res && (
          <Box>
            <Box sx={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Kpi label={t("planifica.whatif.finish")} value={res.urgent.end ? fmtDateTime(res.urgent.end) : "—"} tone={res.urgent.late ? P.late : P.ok} />
              <Kpi label={t("planifica.whatif.meets")} value={res.urgent.late ? t("planifica.whatif.no") : t("planifica.whatif.yes")} tone={res.urgent.late ? P.late : P.ok} />
              <Kpi label={t("planifica.whatif.lateOrders")} value={`${nf(res.lateBefore)} → ${nf(res.lateAfter)}`} tone={res.lateAfter > res.lateBefore ? P.late : undefined} />
            </Box>
            <Typography sx={{ mt: "16px", fontWeight: 700 }}>{t("planifica.whatif.machines")}</Typography>
            <Typography sx={{ fontSize: 13, color: P.greyDark }}>
              {res.urgent.ops.map((o) => `${o.resourceCode}: ${fmtDateTime(o.start)} → ${fmtDateTime(o.end)}`).join(" · ")}
            </Typography>
            <Divider sx={{ my: "14px" }} />
            <Typography sx={{ fontWeight: 700, mb: "6px" }}>{t("planifica.whatif.impact", { count: res.impact.length })}</Typography>
            {res.impact.length === 0 && <Typography sx={{ fontSize: 13, color: P.ok, fontWeight: 600 }}>{t("planifica.whatif.noImpact")}</Typography>}
            {res.impact.map((x) => (
              <Box key={x.orderId} sx={{ display: "flex", gap: "10px", alignItems: "center", py: "6px", borderBottom: `1px solid ${P.line}`, flexWrap: "wrap" }}>
                <Typography sx={{ fontWeight: 700, width: 70, color: P.dark }}>{x.orderNumber}</Typography>
                <Typography sx={{ fontSize: 13, flex: "1 1 200px" }}>{x.clientName} · {x.articleCode}</Typography>
                <Typography sx={{ fontSize: 13 }}>{t("planifica.whatif.delayed", { h: nf(x.shiftMin / 60, 1) })}</Typography>
                {x.newlyLate ? <Chip size="small" label={t("planifica.whatif.newlyLate")} sx={{ background: P.lateSoft, color: P.late, fontWeight: 700 }} /> : x.late ? <Chip size="small" label={t("planifica.status.lateBy", { h: nf(x.lateMin / 60, 1) })} sx={{ background: P.lateSoft, color: P.late }} /> : <Chip size="small" label={t("planifica.status.onTime")} sx={{ background: "#D1FAE5", color: "#065F46" }} />}
              </Box>
            ))}
            <Button variant="outlined" sx={{ mt: "16px", borderColor: P.main, color: P.main, textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
              onClick={async () => { try { const r = await api.confirmUrgent(body()); notify(t("planifica.whatif.created", { n: r.orderNumber })); setRes(null); } catch (e) { notify(api.errorText(e, t), "error"); } }}>
              {t("planifica.whatif.confirm")}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

// ---------- Recursos, calendarios y rutas ----------
function SetupTab({ master, reload, notify }) {
  const { t } = useTranslation();
  const [holiday, setHoliday] = useState({});
  if (!master) return null;
  const dayNames = [1, 2, 3, 4, 5, 6, 7].map((d) => t(`planifica.weekday.${d}`));
  return (
    <Box sx={{ display: "grid", gap: "14px" }}>
      <Paper sx={{ ...card, overflowX: "auto" }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{t("planifica.setup.resources")}</Typography>
        <Typography sx={{ fontSize: 13, color: P.greyDark, mb: "10px" }}>{master.ritmia.ok ? t("planifica.setup.ritmiaOn") : t("planifica.setup.ritmiaOff")}</Typography>
        {master.resources.map((r) => (
          <Box key={r.code} sx={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", py: "8px", borderBottom: `1px solid ${P.line}` }}>
            <Typography sx={{ fontWeight: 700, width: 70, color: P.dark }}>{r.code}</Typography>
            <Typography sx={{ fontSize: 13, flex: "1 1 220px" }}>{r.name}<br /><span style={{ color: P.grey }}>{r.line}</span></Typography>
            <TextField select size="small" label={t("planifica.setup.calendar")} value={r.calendarCode} sx={{ minWidth: 260 }}
              onChange={async (e) => { await api.updateResource(r.code, { calendarCode: e.target.value }); reload(); notify(t("planifica.replanned")); }}>
              {master.calendars.map((c) => <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>)}
            </TextField>
            <TextField size="small" type="number" label={t("planifica.setup.efficiency")} defaultValue={Math.round(r.efficiency * 100)} sx={{ width: 140 }} inputProps={{ min: 10, max: 100 }}
              onBlur={async (e) => { const v = Number(e.target.value) / 100; if (v && v !== r.efficiency) { try { await api.updateResource(r.code, { efficiency: v }); reload(); notify(t("planifica.replanned")); } catch (err) { notify(api.errorText(err, t), "error"); } } }} />
            <Chip size="small" label={r.capacity?.source === "ritmia" ? t("planifica.setup.realOee", { a: nf((r.capacity.availability || 0) * 100), p: nf((r.capacity.performance || 0) * 100) }) : t("planifica.setup.standard")}
              sx={{ background: r.capacity?.source === "ritmia" ? P.soft : "#F3F4F6", color: r.capacity?.source === "ritmia" ? P.dark : P.greyDark, fontWeight: 600 }} />
          </Box>
        ))}
      </Paper>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" }, gap: "14px" }}>
        <Paper sx={card}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, mb: "8px" }}>{t("planifica.setup.calendars")}</Typography>
          {master.calendars.map((c) => (
            <Box key={c.code} sx={{ py: "10px", borderBottom: `1px solid ${P.line}` }}>
              <Typography sx={{ fontWeight: 700 }}>{c.name}</Typography>
              {c.shifts.map((s, i) => (
                <Typography key={i} sx={{ fontSize: 13, color: P.greyDark }}>{s.name}: {s.start}–{s.end} · {s.days.map((d) => dayNames[d - 1]).join(", ")}</Typography>
              ))}
              <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap", mt: "6px", alignItems: "center" }}>
                <Typography sx={{ fontSize: 12, color: P.grey }}>{t("planifica.setup.holidays")}:</Typography>
                {(c.holidays || []).map((h) => (
                  <Chip key={h} size="small" label={fmtIsoDay(h)} onDelete={async () => { await api.updateCalendar(c.code, { holidays: c.holidays.filter((x) => x !== h) }); reload(); }} sx={{ background: P.soft, color: P.dark }} />
                ))}
                <TextField type="date" size="small" value={holiday[c.code] ?? ""} onChange={(e) => setHoliday({ ...holiday, [c.code]: e.target.value })} sx={{ width: 160 }} inputProps={{ "aria-label": t("planifica.setup.addHoliday") }} />
                <Button size="small" disabled={!holiday[c.code]} onClick={async () => { await api.updateCalendar(c.code, { holidays: [...(c.holidays || []), holiday[c.code]] }); setHoliday({ ...holiday, [c.code]: "" }); reload(); notify(t("planifica.replanned")); }} sx={{ color: P.main, textTransform: "none", fontWeight: 700 }}>
                  {t("planifica.setup.addHoliday")}
                </Button>
              </Box>
            </Box>
          ))}
        </Paper>
        <Paper sx={card}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, mb: "8px" }}>{t("planifica.setup.routes")}</Typography>
          {master.articles.map((a) => (
            <Box key={a.code} sx={{ py: "8px", borderBottom: `1px solid ${P.line}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}><span style={{ color: P.main }}>{a.code}</span> · {a.name}</Typography>
              {a.route.map((s) => (
                <Typography key={s.seq} sx={{ fontSize: 12.5, color: P.greyDark }}>
                  {s.seq} · {s.name} · {s.resources.join(" / ")} · {t("planifica.setup.rate", { n: nf(s.ratePerHour) })} · {t("planifica.gantt.setup", { n: s.setupMin })}
                </Typography>
              ))}
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );
}

export default function Planifica() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [master, setMaster] = useState(null);
  const [snack, setSnack] = useState(null);
  const notify = (msg, severity = "success") => setSnack({ msg, severity });
  const reload = () => api.getMaster().then(setMaster).catch((e) => notify(api.errorText(e, t), "error"));
  useEffect(() => { reload(); }, []); // eslint-disable-line

  return (
    <Box sx={{ p: { xs: "16px", md: "24px 28px" } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "14px", mb: "6px", flexWrap: "wrap" }}>
        <Box sx={{ width: 40, height: 40, borderRadius: "11px", background: P.main, display: "grid", placeItems: "center" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="10" height="3.2" rx="1.6" fill="#fff" /><rect x="8" y="10.4" width="12" height="3.2" rx="1.6" fill="#E9D5FF" /><rect x="5" y="15.8" width="8" height="3.2" rx="1.6" fill="#fff" /></svg>
        </Box>
        <Box>
          <Typography sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 700, letterSpacing: "-.02em", color: "#111827" }}>{t("planifica.title")}</Typography>
          <Typography sx={{ fontSize: 14, color: "#6B7280" }}>{t("planifica.subtitle")}</Typography>
        </Box>
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
        sx={{ mb: "16px", borderBottom: `1px solid ${P.line}`, "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 14 }, "& .Mui-selected": { color: `${P.main} !important` }, "& .MuiTabs-indicator": { background: P.main, height: 3 } }}>
        {TABS.map((k) => <Tab key={k} label={t(`planifica.tabs.${k}`)} />)}
      </Tabs>
      {tab === 0 && <GanttTab master={master} notify={notify} />}
      {tab === 1 && <LoadTab notify={notify} />}
      {tab === 2 && <OrdersTab master={master} notify={notify} />}
      {tab === 3 && <WhatIfTab master={master} notify={notify} />}
      {tab === 4 && <SetupTab master={master} reload={reload} notify={notify} />}
      <Snackbar open={!!snack} autoHideDuration={3500} onClose={() => setSnack(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        {snack ? <Alert severity={snack.severity} variant="filled" sx={{ background: snack.severity === "success" ? P.main : undefined }}>{snack.msg}</Alert> : <span />}
      </Snackbar>
    </Box>
  );
}
