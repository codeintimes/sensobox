// Panel de producción: mismos datos del backend (GET /orders), presentados como
// indicadores con su comparación, producción en curso en tiempo real, desviaciones y gráficas semanales.
import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, LinearProgress, useMediaQuery } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import axios from "axios";
import { API_ORDERS } from "../../../config/config";
import { useTranslation } from "react-i18next";
import { nf, pct, fmtDate, fmtDateTime, fmtLongDate } from "../../../utils/format";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import ContentCutOutlinedIcon from "@mui/icons-material/ContentCutOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const C = { brand: "#4F46E5", brandSoft: "#EEF2FF", ok: "#059669", okSoft: "#ECFDF5", bad: "#DC2626", badSoft: "#FEF2F2", warn: "#D97706", warnSoft: "#FFFBEB", text: "#111827", muted: "#6B7280", line: "#E5E7EB" };
const D = 24 * 3600e3;
const merma = (o) => (o.initialQuantity ? (o.initialQuantity - o.finalQuantity) / o.initialQuantity : 0);
const desvT = (o) => (o.processingTime ? o.processingTimeDifference / o.processingTime : 0);
const weekStart = (d) => { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - day); return x.getTime(); };

const Card = ({ children, sx, ...p }) => (
  <Box className="sb-card" sx={{ background: "#fff", borderRadius: "16px", border: `1px solid ${C.line}`, boxShadow: "0 1px 2px rgba(16,24,40,.05)", p: "20px 22px", ...sx }} {...p}>{children}</Box>
);
const CardTitle = ({ title, sub, right }) => (
  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb="14px" gap="12px">
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: 15.5, color: C.text }}>{title}</Typography>
      {sub && <Typography sx={{ fontSize: 12.5, color: C.muted, mt: "2px" }}>{sub}</Typography>}
    </Box>
    {right}
  </Box>
);

function Kpi({ icon, label, value, unit, delta, goodWhenUp, foot }) {
  const up = delta >= 0;
  const good = goodWhenUp ? up : !up;
  const color = Math.abs(delta) < 0.005 ? C.muted : good ? C.ok : C.bad;
  return (
    <Card sx={{ display: "flex", flexDirection: "column", gap: "10px", p: { xs: "14px", sm: "20px 22px" } }}>
      <Box display="flex" alignItems="center" gap="10px">
        <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: C.brandSoft, color: C.brand, display: "grid", placeItems: "center" }}>{icon}</Box>
        <Typography sx={{ fontSize: { xs: 12.5, sm: 13.5 }, color: C.muted, fontWeight: 500, lineHeight: 1.25 }}>{label}</Typography>
      </Box>
      <Box display="flex" alignItems="baseline" gap="6px">
        <Typography sx={{ fontSize: { xs: 24, sm: 30 }, fontWeight: 700, letterSpacing: "-.02em", color: C.text, lineHeight: 1.1 }}>{value}</Typography>
        {unit && <Typography sx={{ fontSize: 15, color: C.muted, fontWeight: 600 }}>{unit}</Typography>}
      </Box>
      <Box display="flex" alignItems="center" gap="6px" flexWrap="wrap" sx={{ fontSize: 12.5, color: C.muted }}>
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "2px", color, fontWeight: 700, background: color === C.muted ? "#F3F4F6" : good ? C.okSoft : C.badSoft, borderRadius: "999px", px: "8px", py: "2px" }}>
          {up ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
          {pct(delta * 100, 1, true)}
        </Box>
        <span>{foot}</span>
      </Box>
    </Card>
  );
}

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const isNarrow = useMediaQuery("(max-width:1100px)");
  const user = JSON.parse(localStorage.getItem("userData")) || {};

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const jwt = localStorage.getItem("jwtToken");
        const r = await axios.get(`${API_ORDERS.ORDERS}`, { headers: { Authorization: `Bearer ${jwt}` } });
        let rows = (r.data || []).filter((o) => o.companyName === user.companyName);
        if (user.role === "client") rows = rows.filter((o) => o.clientName === user.clientName);
        if (alive) setOrders(rows);
      } catch (e) { if (alive) setError(e.message); }
    };
    load();
    const timer = setInterval(load, 4000); // tiempo real: el panel se refresca solo
    return () => { alive = false; clearInterval(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = useMemo(() => {
    if (!orders) return null;
    const now = Date.now();
    const last = orders.filter((o) => now - new Date(o.createdAt) <= 30 * D);
    const prev = orders.filter((o) => now - new Date(o.createdAt) > 30 * D);
    const months = Math.max(1, (now - 30 * D - Math.min(...prev.map((o) => +new Date(o.createdAt)), now - 30 * D)) / (30 * D));
    const done = (arr) => arr.filter((o) => o.status >= 3 && o.initialQuantity && o.finalQuantity);
    const avg = (arr, f) => (arr.length ? arr.reduce((a, o) => a + f(o), 0) / arr.length : 0);
    const units = (arr) => arr.reduce((a, o) => a + (o.productionQuantity || 0), 0);
    const k = {
      pedidos: last.length, pedidosPrev: prev.length / months,
      unidades: units(last), unidadesPrev: units(prev) / months,
      merma: avg(done(last), merma), mermaPrev: avg(done(prev), merma),
      tiempo: avg(done(last), desvT), tiempoPrev: avg(done(prev), desvT),
    };
    const enCurso = orders.filter((o) => o.status === 2).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const pendientes = orders.filter((o) => o.status === 1 && new Date(o.processingDate) > now).sort((a, b) => new Date(a.processingDate) - new Date(b.processingDate));
    const retrasados = orders.filter((o) => o.status === 1 && new Date(o.processingDate) <= now).sort((a, b) => new Date(a.processingDate) - new Date(b.processingDate));
    const desviaciones = done(orders.filter((o) => now - new Date(o.processingDateFinal || o.updatedAt) <= 45 * D))
      .map((o) => ({ o, m: merma(o), t: desvT(o) }))
      .filter((x) => x.m > 0.07 || x.t > 0.3)
      .sort((a, b) => Math.max(b.m / 0.07, b.t / 0.3) - Math.max(a.m / 0.07, a.t / 0.3));
    // semanas
    const weeks = {};
    for (const o of orders) {
      const w = weekStart(o.createdAt);
      weeks[w] = weeks[w] || { pedidos: 0, ini: 0, fin: 0, plan: 0, real: 0 };
      weeks[w].pedidos++;
      if (o.status >= 3 && o.initialQuantity && o.finalQuantity) { weeks[w].ini += o.initialQuantity; weeks[w].fin += o.finalQuantity; weeks[w].plan += o.processingTime; weeks[w].real += o.processingTimeFinal; }
    }
    const ws = Object.keys(weeks).map(Number).sort((a, b) => a - b).filter((w) => w <= now);
    const label = (w) => fmtDate(w);
    const barData = ws.map((w) => ({ semana: label(w), [t("dashboard.series.orders")]: weeks[w].pedidos }));
    const mermaLine = [{ id: t("dashboard.series.waste"), data: ws.filter((w) => weeks[w].ini).map((w) => ({ x: label(w), y: +(((weeks[w].ini - weeks[w].fin) / weeks[w].ini) * 100).toFixed(2) })) },
      { id: t("dashboard.series.delay"), data: ws.filter((w) => weeks[w].plan).map((w) => ({ x: label(w), y: +(((weeks[w].real - weeks[w].plan) / weeks[w].plan) * 100).toFixed(2) })) }];
    return { k, enCurso, pendientes, retrasados, desviaciones, barData, mermaLine };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, i18n.language]);

  if (error) return <Box m="24px"><Card><Typography color="error">{t("dashboard.loadError")}</Typography></Card></Box>;
  if (!s) return <Box m="24px" sx={{ color: C.muted }}><LinearProgress sx={{ borderRadius: 4 }} /></Box>;
  const { k } = s;
  const rel = (a, b) => (b ? a / b - 1 : 0);
  const today = fmtLongDate(new Date());
  const nivoTheme = { fontFamily: "Inter, sans-serif", fontSize: 11, textColor: C.muted, grid: { line: { stroke: "#EEF0F4" } }, axis: { ticks: { text: { fill: C.muted } } }, tooltip: { container: { fontSize: 12, borderRadius: 8 } } };
  const tickEvery = (arr, n) => arr.filter((_, i) => i % n === 0).map((d) => d.semana || d.x);

  return (
    <Box className="sb-dashboard" sx={{ p: { xs: "16px", md: "24px 28px" } }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb="20px" flexWrap="wrap" gap="10px">
        <Box>
          <Typography sx={{ fontSize: 13, color: C.muted }}>{today}</Typography>
          <Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.02em", color: C.text }}>{t("dashboard.title")}</Typography>
        </Box>
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: 12.5, color: C.ok, background: C.okSoft, borderRadius: "999px", px: "12px", py: "6px", fontWeight: 600 }}>
          <FiberManualRecordIcon sx={{ fontSize: 10, animation: "sbPulse 1.6s infinite" }} /> {t("dashboard.live")}
        </Box>
      </Box>

      <Box className="sb-kpis" display="grid" gridTemplateColumns={isNarrow ? "repeat(2, 1fr)" : "repeat(4, 1fr)"} gap="16px" mb="16px">
        <Kpi icon={<Inventory2OutlinedIcon fontSize="small" />} label={t("dashboard.kpi.orders")} value={nf(k.pedidos)} delta={rel(k.pedidos, k.pedidosPrev)} goodWhenUp foot={t("dashboard.kpi.vsMonthly")} />
        <Kpi icon={<PrecisionManufacturingOutlinedIcon fontSize="small" />} label={t("dashboard.kpi.units")} value={nf(k.unidades / 1000, 0)} unit={t("dashboard.kpi.thousand")} delta={rel(k.unidades, k.unidadesPrev)} goodWhenUp foot={t("dashboard.kpi.vsMonthly")} />
        <Kpi icon={<ContentCutOutlinedIcon fontSize="small" />} label={t("dashboard.kpi.waste")} value={nf(k.merma * 100, 1)} unit="%" delta={rel(k.merma, k.mermaPrev)} foot={t("dashboard.kpi.before", { v: pct(k.mermaPrev * 100, 1) })} />
        <Kpi icon={<TimerOutlinedIcon fontSize="small" />} label={t("dashboard.kpi.timeDeviation")} value={(k.tiempo >= 0 ? "+" : "") + nf(k.tiempo * 100, 1)} unit="%" delta={k.tiempo - k.tiempoPrev} foot={t("dashboard.kpi.before", { v: pct(k.tiempoPrev * 100, 1, true) })} />
      </Box>

      <Box display="grid" gridTemplateColumns={isNarrow ? "1fr" : "1.25fr 1fr"} gap="16px" mb="16px">
        <Card className="sb-encurso">
          <CardTitle title={t("dashboard.inProduction.title")} sub={t("dashboard.inProduction.subtitle")} right={<Box sx={{ fontSize: 12.5, fontWeight: 700, color: C.brand, background: C.brandSoft, borderRadius: "999px", px: "10px", py: "3px", whiteSpace: "nowrap" }}>{t("dashboard.inProduction.count", { count: s.enCurso.length })}</Box>} />
          <Box sx={{ maxHeight: 316, overflow: "auto", mr: "-8px", pr: "8px" }}>
            {s.enCurso.map((o) => {
              const p = Math.min(1, (o.quantityProcessed || 0) / o.productionQuantity);
              return (
                <Box key={o._id} className="sb-row" sx={{ py: "10px", borderTop: `1px solid ${C.line}`, "&:first-of-type": { borderTop: 0, pt: 0 } }}>
                  <Box display="flex" justifyContent="space-between" gap="10px">
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.workName}</Typography>
                      <Typography sx={{ fontSize: 12, color: C.muted }}>{t("order.numberShort", { n: o.orderNumber })} · {o.clientName} · {o.technician.split(" ").slice(0, 2).join(" ")}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>{nf(o.quantityProcessed)} <Box component="span" sx={{ color: C.muted, fontWeight: 500 }}>/ {nf(o.productionQuantity)}</Box></Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={p * 100} sx={{ mt: "8px", height: 7, borderRadius: 4, background: "#EEF0F4", "& .MuiLinearProgress-bar": { borderRadius: 4, background: p >= 1 ? C.ok : C.brand } }} />
                </Box>
              );
            })}
          </Box>
        </Card>
        <Card className="sb-desviaciones">
          <CardTitle title={t("dashboard.deviations.title")} sub={t("dashboard.deviations.subtitle", { waste: pct(7, 0), time: pct(30, 0) })} right={<WarningAmberRoundedIcon sx={{ color: C.warn }} />} />
          <Box sx={{ maxHeight: 316, overflow: "auto", mr: "-8px", pr: "8px" }}>
            {s.desviaciones.length === 0 && <Typography sx={{ color: C.muted, fontSize: 13 }}>{t("dashboard.deviations.none")}</Typography>}
            {s.desviaciones.slice(0, 12).map(({ o, m, t: dt }) => (
              <Box key={o._id} className="sb-row" display="flex" justifyContent="space-between" alignItems="center" gap="10px" sx={{ py: "9px", borderTop: `1px solid ${C.line}`, "&:first-of-type": { borderTop: 0, pt: 0 } }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.workName}</Typography>
                  <Typography sx={{ fontSize: 12, color: C.muted }}>{t("order.numberShort", { n: o.orderNumber })} · {o.clientName} · {fmtDate(o.processingDateFinal)}</Typography>
                </Box>
                <Box display="flex" gap="6px" flexShrink={0}>
                  {m > 0.07 && <Box sx={{ fontSize: 12, fontWeight: 700, color: C.bad, background: C.badSoft, borderRadius: "8px", px: "8px", py: "3px", whiteSpace: "nowrap" }}>{t("dashboard.deviations.waste", { v: pct(m * 100, 1) })}</Box>}
                  {dt > 0.3 && <Box sx={{ fontSize: 12, fontWeight: 700, color: C.warn, background: C.warnSoft, borderRadius: "8px", px: "8px", py: "3px", whiteSpace: "nowrap" }}>{t("dashboard.deviations.time", { v: pct(dt * 100, 0, true) })}</Box>}
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      <Box display="grid" gridTemplateColumns={isNarrow ? "1fr" : "1fr 1fr"} gap="16px" mb="16px">
        <Card className="sb-chart-merma">
          <CardTitle title={t("dashboard.charts.wasteDelay")} sub={t("dashboard.charts.wasteDelaySub")} />
          <Box height={isNarrow ? 220 : 250}>
            <ResponsiveLine data={s.mermaLine} theme={nivoTheme} colors={[C.bad, C.warn]} margin={{ top: 10, right: 16, bottom: 46, left: 40 }}
              xScale={{ type: "point" }} yScale={{ type: "linear", min: "auto", max: "auto" }} curve="monotoneX" lineWidth={2.5} pointSize={5} pointColor="#fff" pointBorderWidth={2} pointBorderColor={{ from: "serieColor" }}
              enableGridX={false} yFormat={(v) => pct(v, 1)} axisLeft={{ tickSize: 0, tickPadding: 8, format: (v) => pct(v, 0), tickValues: 5 }} axisBottom={{ tickSize: 0, tickPadding: 10, tickValues: tickEvery(s.mermaLine[0].data, isNarrow ? 4 : 2) }}
              useMesh legends={[{ anchor: "bottom", direction: "row", translateY: 44, itemWidth: 110, itemHeight: 16, symbolSize: 10, symbolShape: "circle", itemTextColor: C.muted }]} />
          </Box>
        </Card>
        <Card className="sb-chart-pedidos">
          <CardTitle title={t("dashboard.charts.ordersPerWeek")} sub={t("dashboard.charts.since", { date: s.barData.length ? s.barData[0].semana : "—" })} />
          <Box height={isNarrow ? 220 : 250}>
            <ResponsiveBar data={s.barData} keys={[t("dashboard.series.orders")]} indexBy="semana" theme={nivoTheme} colors={[C.brand]} margin={{ top: 10, right: 10, bottom: 46, left: 36 }} padding={0.35} borderRadius={4}
              enableLabel={false} axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 5 }} axisBottom={{ tickSize: 0, tickPadding: 10, tickValues: tickEvery(s.barData, isNarrow ? 4 : 2) }} gridYValues={5} />
          </Box>
        </Card>
      </Box>

      <Box display="grid" gridTemplateColumns={isNarrow ? "1fr" : "1fr 1fr"} gap="16px">
        <Card className="sb-pendientes">
          <CardTitle title={t("dashboard.upcoming.title")} sub={t("dashboard.upcoming.subtitle")} right={<Box sx={{ fontSize: 12.5, fontWeight: 700, color: C.brand, background: C.brandSoft, borderRadius: "999px", px: "10px", py: "3px" }}>{s.pendientes.length}</Box>} />
          {s.pendientes.slice(0, 6).map((o) => (
            <Box key={o._id} className="sb-row" display="flex" justifyContent="space-between" alignItems="center" gap="10px" sx={{ py: "9px", borderTop: `1px solid ${C.line}`, "&:first-of-type": { borderTop: 0, pt: 0 } }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.clientName}</Typography>
                <Typography sx={{ fontSize: 12, color: C.muted }}>{o.workName} · {o.technician.split(" ").slice(0, 2).join(" ")}</Typography>
              </Box>
              <Typography sx={{ fontSize: 12.5, color: C.text, fontWeight: 600, whiteSpace: "nowrap" }}>{fmtDateTime(o.processingDate)}</Typography>
            </Box>
          ))}
        </Card>
        <Card className="sb-retrasados" sx={{ borderColor: s.retrasados.length ? "#FECACA" : C.line }}>
          <CardTitle title={t("dashboard.late.title")} sub={t("dashboard.late.subtitle")} right={<Box sx={{ fontSize: 12.5, fontWeight: 700, color: C.bad, background: C.badSoft, borderRadius: "999px", px: "10px", py: "3px" }}>{s.retrasados.length}</Box>} />
          {s.retrasados.length === 0 && <Typography sx={{ color: C.muted, fontSize: 13 }}>{t("dashboard.late.none")}</Typography>}
          {s.retrasados.slice(0, 6).map((o) => (
            <Box key={o._id} className="sb-row" display="flex" justifyContent="space-between" alignItems="center" gap="10px" sx={{ py: "9px", borderTop: `1px solid ${C.line}`, "&:first-of-type": { borderTop: 0, pt: 0 } }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 13.5, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.clientName}</Typography>
                <Typography sx={{ fontSize: 12, color: C.muted }}>{o.workName} · {o.technician.split(" ").slice(0, 2).join(" ")}</Typography>
              </Box>
              <Typography sx={{ fontSize: 12.5, color: C.bad, fontWeight: 700, whiteSpace: "nowrap" }}>{t("dashboard.late.days", { count: Math.max(1, Math.round((Date.now() - new Date(o.processingDate)) / D)) })}</Typography>
            </Box>
          ))}
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
