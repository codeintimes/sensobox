// Gráficas semanales. Sustituyen a las de una línea por orden, que eran
// ilegibles: agrupan por semana, con filtro de periodo y de cliente, y un resumen arriba.
import React, { useEffect, useMemo, useState } from "react";
import { Box, MenuItem, TextField, Typography, useMediaQuery } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Header from "./Header";
import { nf, pct, fmtDate } from "../utils/format";
import { API_ORDERS } from "../config/config";

const D = 24 * 3600e3;
const C = { brand: "#4F46E5", brand2: "#A5B4FC", ok: "#10B981", bad: "#DC2626", warn: "#D97706", text: "#111827", muted: "#6B7280", line: "#E5E7EB" };
const weekStart = (d) => { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - day); return x.getTime(); };
const nivoTheme = { fontFamily: "Inter, sans-serif", fontSize: 11.5, textColor: C.muted, grid: { line: { stroke: "#EEF0F4" } }, legends: { text: { fontSize: 12.5, fill: "#374151" } }, tooltip: { container: { fontSize: 12.5, borderRadius: 8 } } };

// Cada gráfica suma dos series internas (a, b) por semana; los textos están en weekly.<kind>.*
const CFG = {
  cantidades: {
    ns: "weekly.quantities", series: ["a", "b"], scale: 1000,
    sum: (w, o) => { w.a += o.initialQuantity; w.b += o.finalQuantity; },
    ratio: (w) => (w.a ? ((w.a - w.b) / w.a) * 100 : null),
    ratioColor: C.bad, limit: 7,
  },
  tiempos: {
    ns: "weekly.times", series: ["a", "b"], scale: 1,
    sum: (w, o) => { w.a += o.processingTime; w.b += o.processingTimeFinal; },
    ratio: (w) => (w.a ? ((w.b - w.a) / w.a) * 100 : null),
    ratioColor: C.warn, limit: 10,
  },
  pedidos: {
    ns: "weekly.orders", series: ["a"], scale: 1, all: true,
    sum: (w, o) => { w.a += 1; w.uds += o.productionQuantity || 0; },
    ratio: (w) => w.uds / 1000, ratioColor: C.ok,
  },
};
const PERIODS = [["1m", "weekly.periods.lastMonth", 31], ["3m", "weekly.periods.last3Months", 92], ["6m", "weekly.periods.last6Months", 183], ["1y", "weekly.periods.lastYear", 366]];

export default function WeeklyGraph({ kind }) {
  const { t, i18n } = useTranslation();
  const cfg = CFG[kind];
  const tt = (k, o) => t(`${cfg.ns}.${k}`, o);
  const names = cfg.series.map((x) => tt(`series.${x}`));
  const ratioName = tt("ratioName");
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
      if (!weeks[k]) weeks[k] = { uds: 0, a: 0, b: 0 };
      cfg.sum(weeks[k], o);
    }
    const ks = Object.keys(weeks).map(Number).sort((a, b) => a - b);
    const bars = ks.map((k) => { const r = { semana: fmtDate(k) }; cfg.series.forEach((x, i) => (r[names[i]] = +(weeks[k][x] / cfg.scale).toFixed(1))); return r; });
    const line = [{ id: ratioName, data: ks.map((k) => ({ x: fmtDate(k), y: cfg.ratio(weeks[k]) })).filter((p) => p.y != null).map((p) => ({ ...p, y: +p.y.toFixed(1) })) }];
    const tot = { uds: 0, a: 0, b: 0 }; ks.forEach((k) => { tot.a += weeks[k].a; tot.b += weeks[k].b; tot.uds += weeks[k].uds; });
    const worst = line[0].data.reduce((m, p) => (m == null || p.y > m.y ? p : m), null);
    return { bars, line, tot, ratioTot: cfg.ratio(tot), worst, n: sel.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, period, client, cfg, i18n.language]);

  const every = Math.max(1, Math.ceil(data.bars.length / (isNarrow ? 5 : 12)));
  const ticks = data.bars.filter((_, i) => i % every === 0).map((b) => b.semana);
  const Stat = ({ k, v, color }) => (
    <Box className="sb-card" sx={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: "14px", p: "14px 16px" }}>
      <Typography sx={{ fontSize: 12.5, color: C.muted, fontWeight: 500, lineHeight: 1.3 }}>{k}</Typography>
      <Typography sx={{ fontSize: { xs: 17, sm: 22 }, fontWeight: 700, color: color || C.text, letterSpacing: "-.01em" }}>{v}</Typography>
    </Box>
  );
  const select = { minWidth: isNarrow ? "100%" : 210, "& .MuiInputBase-root": { background: "#fff", height: 42 } };

  const ratioRounded = Math.round(data.ratioTot * 10) / 10 || 0;
  return (
    <Box className="sb-graph" sx={{ p: { xs: "16px", md: "24px 28px" } }}>
      <Header title={tt("title")} subtitle={tt("subtitle")} actionElement={
        <Box display="flex" gap="10px" flexWrap="wrap" sx={{ width: isNarrow ? "100%" : "auto" }}>
          <TextField select size="small" label={t("weekly.period")} value={period} onChange={(e) => setPeriod(e.target.value)} sx={select} className="sb-periodo">
            {PERIODS.map(([v, l]) => <MenuItem key={v} value={v}>{t(l)}</MenuItem>)}
          </TextField>
          {user.role !== "client" && (
            <TextField select size="small" label={t("weekly.client")} value={client} onChange={(e) => setClient(e.target.value)} sx={select} className="sb-cliente" SelectProps={{ displayEmpty: true }} InputLabelProps={{ shrink: true }}>
              <MenuItem value="">{t("weekly.allClients")}</MenuItem>
              {clients.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          )}
        </Box>
      } />
      <Box display="grid" gridTemplateColumns={isNarrow ? "1fr 1fr" : "repeat(4, 1fr)"} gap="12px" mb="14px">
        {kind === "pedidos" ? (<>
          <Stat k={tt("stats.orders")} v={nf(data.tot.a)} />
          <Stat k={tt("stats.unitsOrdered")} v={tt("stats.thousands", { n: nf(data.tot.uds / 1000) })} />
          <Stat k={tt("stats.weeklyAverage")} v={nf(data.tot.a / Math.max(1, data.bars.length), 1)} />
          <Stat k={tt("stats.clients")} v={nf(client ? 1 : clients.length)} />
        </>) : (<>
          <Stat k={names[0]} v={tt("unitValue", { n: nf(data.tot.a / cfg.scale) })} />
          <Stat k={names[1]} v={tt("unitValue", { n: nf(data.tot.b / cfg.scale) })} />
          <Stat k={tt("periodRatio")} v={pct(ratioRounded, 1, kind === "tiempos")} color={data.ratioTot > cfg.limit ? C.bad : C.text} />
          <Stat k={t("weekly.worstWeek")} v={data.worst ? `${data.worst.x} · ${pct(data.worst.y, 1)}` : "—"} color={data.worst && data.worst.y > cfg.limit ? C.bad : C.text} />
        </>)}
      </Box>
      <Box display="grid" gridTemplateColumns={isNarrow ? "1fr" : "1.5fr 1fr"} gap="14px">
        <Box className="sb-card sb-chart-main" sx={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: "16px", p: "18px 18px 8px", minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.text }}>{tt("mainTitle")}</Typography>
          <Typography sx={{ fontSize: 12.5, color: C.muted }}>{tt("mainSubtitle")}</Typography>
          <Box height={isNarrow ? 260 : 380}>
            <ResponsiveBar data={data.bars} keys={names} indexBy="semana" groupMode="grouped" theme={nivoTheme} colors={names.length > 1 ? [C.brand2, C.brand] : [C.brand]}
              margin={{ top: 16, right: 10, bottom: 64, left: 46 }} padding={0.28} innerPadding={2} borderRadius={3} enableLabel={false}
              valueFormat={(v) => nf(v, 1)}
              axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 5, format: (v) => nf(v) }} axisBottom={{ tickSize: 0, tickPadding: 10, tickValues: ticks }} gridYValues={5}
              legends={[{ dataFrom: "keys", anchor: "bottom-left", direction: "row", translateY: 58, itemWidth: isNarrow ? 150 : 190, itemHeight: 18, symbolSize: 11, symbolShape: "circle" }]} />
          </Box>
        </Box>
        <Box className="sb-card sb-chart-ratio" sx={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: "16px", p: "18px 18px 8px", minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.text }}>{tt("ratioTitle")}</Typography>
          <Typography sx={{ fontSize: 12.5, color: C.muted }}>{cfg.limit ? t("weekly.limitLine", { n: pct(cfg.limit, 0) }) : tt("ratioSubtitle")}</Typography>
          <Box height={isNarrow ? 240 : 380}>
            <ResponsiveLine data={data.line} theme={nivoTheme} colors={[cfg.ratioColor]} margin={{ top: 16, right: 16, bottom: 46, left: 50 }} xScale={{ type: "point" }}
              yScale={{ type: "linear", min: kind === "tiempos" ? "auto" : 0, max: "auto" }} curve="monotoneX" lineWidth={2.5} pointSize={6} pointColor="#fff" pointBorderWidth={2} pointBorderColor={{ from: "serieColor" }}
              enableArea={kind !== "tiempos"} areaOpacity={0.08} enableGridX={false} useMesh yFormat={(v) => (cfg.limit ? pct(v, 1) : nf(v, 1))}
              axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 5, format: (v) => (cfg.limit ? pct(v, 0) : nf(v)) }} axisBottom={{ tickSize: 0, tickPadding: 10, tickValues: ticks.filter((_, i) => i % 2 === 0) }}
              markers={cfg.limit ? [{ axis: "y", value: cfg.limit, lineStyle: { stroke: C.bad, strokeWidth: 1.5, strokeDasharray: "5 4" } }] : []} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
