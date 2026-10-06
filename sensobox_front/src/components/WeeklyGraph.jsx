// Gráficas semanales de demo (overlay fuera del repo). Sustituyen a las de una línea por orden, que eran
// ilegibles: agrupan por semana, con filtro de periodo y de cliente, y un resumen arriba.
import React, { useEffect, useMemo, useState } from "react";
import { Box, MenuItem, TextField, Typography, useMediaQuery } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import axios from "axios";
import Header from "./Header";
import { API_ORDERS } from "../config/config";

const D = 24 * 3600e3;
const C = { brand: "#4F46E5", brand2: "#A5B4FC", ok: "#10B981", bad: "#DC2626", warn: "#D97706", text: "#111827", muted: "#6B7280", line: "#E5E7EB" };
const nf = (n, d = 0) => Number(n || 0).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
const weekStart = (d) => { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - day); return x.getTime(); };
const label = (w) => new Date(w).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
const nivoTheme = { fontFamily: "Inter, sans-serif", fontSize: 11.5, textColor: C.muted, grid: { line: { stroke: "#EEF0F4" } }, legends: { text: { fontSize: 12.5, fill: "#374151" } }, tooltip: { container: { fontSize: 12.5, borderRadius: 8 } } };

const CFG = {
  cantidades: {
    title: "Cantidades y merma", sub: "Unidades de partida frente a unidades buenas, por semana",
    keys: ["Unidades de partida", "Unidades buenas"], unit: "mil uds.", scale: 1000,
    sum: (w, o) => { w["Unidades de partida"] += o.initialQuantity; w["Unidades buenas"] += o.finalQuantity; },
    ratio: (w) => (w["Unidades de partida"] ? ((w["Unidades de partida"] - w["Unidades buenas"]) / w["Unidades de partida"]) * 100 : null),
    ratioName: "Merma", ratioColor: C.bad, limit: 7,
  },
  tiempos: {
    title: "Tiempos de proceso", sub: "Horas previstas frente a horas reales, por semana",
    keys: ["Horas previstas", "Horas reales"], unit: "h", scale: 1,
    sum: (w, o) => { w["Horas previstas"] += o.processingTime; w["Horas reales"] += o.processingTimeFinal; },
    ratio: (w) => (w["Horas previstas"] ? ((w["Horas reales"] - w["Horas previstas"]) / w["Horas previstas"]) * 100 : null),
    ratioName: "Desvío de tiempo", ratioColor: C.warn, limit: 10,
  },
  pedidos: {
    title: "Pedidos por periodo", sub: "Pedidos recibidos cada semana y unidades encargadas",
    keys: ["Pedidos"], unit: "pedidos", scale: 1, all: true,
    sum: (w, o) => { w.Pedidos += 1; w.uds += o.productionQuantity || 0; },
    ratio: (w) => w.uds / 1000, ratioName: "Unidades encargadas (miles)", ratioColor: C.ok,
  },
};
const PERIODS = [["1m", "Último mes", 31], ["3m", "Últimos 3 meses", 92], ["6m", "Últimos 6 meses", 183], ["1y", "Último año", 366]];

export default function WeeklyGraph({ kind }) {
  const cfg = CFG[kind];
  const [orders, setOrders] = useState([]);
  const [period, setPeriod] = useState("3m");
  const [client, setClient] = useState("");
  const isNarrow = useMediaQuery("(max-width:900px)");
  const user = JSON.parse(localStorage.getItem("userData")) || {};

  useEffect(() => {
    axios.get(`${API_ORDERS.ORDERS}`, { headers: { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` } })
      .then((r) => setOrders((r.data || []).filter((o) => o.companyName === user.companyName && (user.role !== "client" || o.clientName === user.clientName))))
      .catch((e) => console.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clients = useMemo(() => [...new Set(orders.map((o) => o.clientName))].sort(), [orders]);
  const data = useMemo(() => {
    const days = PERIODS.find((p) => p[0] === period)[2];
    const from = Date.now() - days * D;
    const sel = orders.filter((o) => new Date(o.createdAt) >= from && (!client || o.clientName === client) && (cfg.all || (o.status >= 3 && o.initialQuantity && o.finalQuantity)));
    const weeks = {};
    for (const o of sel) {
      const k = weekStart(o.createdAt);
      if (!weeks[k]) { weeks[k] = { uds: 0 }; cfg.keys.forEach((x) => (weeks[k][x] = 0)); }
      cfg.sum(weeks[k], o);
    }
    const ks = Object.keys(weeks).map(Number).sort((a, b) => a - b);
    const bars = ks.map((k) => { const r = { semana: label(k) }; cfg.keys.forEach((x) => (r[x] = +(weeks[k][x] / cfg.scale).toFixed(1))); return r; });
    const line = [{ id: cfg.ratioName, data: ks.map((k) => ({ x: label(k), y: cfg.ratio(weeks[k]) })).filter((p) => p.y != null).map((p) => ({ ...p, y: +p.y.toFixed(1) })) }];
    const tot = {}; cfg.keys.forEach((x) => (tot[x] = ks.reduce((a, k) => a + weeks[k][x], 0))); tot.uds = ks.reduce((a, k) => a + weeks[k].uds, 0);
    const worst = line[0].data.reduce((m, p) => (m == null || p.y > m.y ? p : m), null);
    return { bars, line, tot, ratioTot: cfg.ratio(tot), worst, n: sel.length };
  }, [orders, period, client, cfg]);

  const every = Math.max(1, Math.ceil(data.bars.length / (isNarrow ? 5 : 12)));
  const ticks = data.bars.filter((_, i) => i % every === 0).map((b) => b.semana);
  const Stat = ({ k, v, color }) => (
    <Box className="sb-card" sx={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: "14px", p: "14px 16px" }}>
      <Typography sx={{ fontSize: 12.5, color: C.muted, fontWeight: 500 }}>{k}</Typography>
      <Typography sx={{ fontSize: { xs: 17, sm: 22 }, fontWeight: 700, color: color || C.text, letterSpacing: "-.01em" }}>{v}</Typography>
    </Box>
  );
  const select = { minWidth: isNarrow ? "100%" : 210, "& .MuiInputBase-root": { background: "#fff", height: 42 } };

  return (
    <Box className="sb-graph" sx={{ p: { xs: "16px", md: "24px 28px" } }}>
      <Header title={cfg.title} subtitle={cfg.sub} actionElement={
        <Box display="flex" gap="10px" flexWrap="wrap" sx={{ width: isNarrow ? "100%" : "auto" }}>
          <TextField select size="small" label="Periodo" value={period} onChange={(e) => setPeriod(e.target.value)} sx={select} className="sb-periodo">
            {PERIODS.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </TextField>
          {user.role !== "client" && (
            <TextField select size="small" label="Cliente" value={client} onChange={(e) => setClient(e.target.value)} sx={select} className="sb-cliente" SelectProps={{ displayEmpty: true }} InputLabelProps={{ shrink: true }}>
              <MenuItem value="">Todos los clientes</MenuItem>
              {clients.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          )}
        </Box>
      } />
      <Box display="grid" gridTemplateColumns={isNarrow ? "1fr 1fr" : "repeat(4, 1fr)"} gap="12px" mb="14px">
        {kind === "pedidos" ? (<>
          <Stat k="Pedidos" v={nf(data.tot.Pedidos)} />
          <Stat k="Unidades encargadas" v={`${nf(data.tot.uds / 1000)} mil`} />
          <Stat k="Media semanal" v={nf(data.tot.Pedidos / Math.max(1, data.bars.length), 1)} />
          <Stat k="Clientes" v={nf(client ? 1 : clients.length)} />
        </>) : (<>
          <Stat k={cfg.keys[0]} v={`${nf(data.tot[cfg.keys[0]] / cfg.scale)} ${cfg.unit}`} />
          <Stat k={cfg.keys[1]} v={`${nf(data.tot[cfg.keys[1]] / cfg.scale)} ${cfg.unit}`} />
          <Stat k={cfg.ratioName + " del periodo"} v={`${(Math.round(data.ratioTot * 10) / 10 || 0) >= 0 && kind === "tiempos" ? "+" : ""}${nf(Math.round(data.ratioTot * 10) / 10 || 0, 1)} %`} color={data.ratioTot > cfg.limit ? C.bad : C.text} />
          <Stat k="Peor semana" v={data.worst ? `${data.worst.x} · ${nf(data.worst.y, 1)} %` : "—"} color={data.worst && data.worst.y > cfg.limit ? C.bad : C.text} />
        </>)}
      </Box>
      <Box display="grid" gridTemplateColumns={isNarrow ? "1fr" : "1.5fr 1fr"} gap="14px">
        <Box className="sb-card sb-chart-main" sx={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: "16px", p: "18px 18px 8px" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.text }}>{kind === "pedidos" ? "Pedidos por semana" : `${cfg.keys[0]} y ${cfg.keys[1].toLowerCase()}`}</Typography>
          <Typography sx={{ fontSize: 12.5, color: C.muted }}>{kind === "cantidades" ? "En miles de unidades" : kind === "tiempos" ? "En horas de máquina" : "Número de pedidos"}</Typography>
          <Box height={isNarrow ? 260 : 380}>
            <ResponsiveBar data={data.bars} keys={cfg.keys} indexBy="semana" groupMode="grouped" theme={nivoTheme} colors={cfg.keys.length > 1 ? [C.brand2, C.brand] : [C.brand]}
              margin={{ top: 16, right: 10, bottom: 64, left: 46 }} padding={0.28} innerPadding={2} borderRadius={3} enableLabel={false}
              axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 5 }} axisBottom={{ tickSize: 0, tickPadding: 10, tickValues: ticks }} gridYValues={5}
              legends={[{ dataFrom: "keys", anchor: "bottom-left", direction: "row", translateY: 58, itemWidth: isNarrow ? 135 : 170, itemHeight: 18, symbolSize: 11, symbolShape: "circle" }]} />
          </Box>
        </Box>
        <Box className="sb-card sb-chart-ratio" sx={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: "16px", p: "18px 18px 8px" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.text }}>{cfg.ratioName}{kind !== "pedidos" ? " por semana" : ""}</Typography>
          <Typography sx={{ fontSize: 12.5, color: C.muted }}>{cfg.limit ? `Línea roja: límite del ${cfg.limit} %` : "Miles de unidades por semana"}</Typography>
          <Box height={isNarrow ? 240 : 380}>
            <ResponsiveLine data={data.line} theme={nivoTheme} colors={[cfg.ratioColor]} margin={{ top: 16, right: 16, bottom: 46, left: 46 }} xScale={{ type: "point" }}
              yScale={{ type: "linear", min: kind === "tiempos" ? "auto" : 0, max: "auto" }} curve="monotoneX" lineWidth={2.5} pointSize={6} pointColor="#fff" pointBorderWidth={2} pointBorderColor={{ from: "serieColor" }}
              enableArea={kind !== "tiempos"} areaOpacity={0.08} enableGridX={false} useMesh
              axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 5, format: (v) => (cfg.limit ? `${v} %` : v) }} axisBottom={{ tickSize: 0, tickPadding: 10, tickValues: ticks.filter((_, i) => i % 2 === 0) }}
              markers={cfg.limit ? [{ axis: "y", value: cfg.limit, lineStyle: { stroke: C.bad, strokeWidth: 1.5, strokeDasharray: "5 4" } }] : []} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
