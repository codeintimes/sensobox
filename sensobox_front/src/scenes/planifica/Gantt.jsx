// Planifica · diagrama de Gantt con arrastrar y soltar.
// Filas = recursos (máquinas y puestos), barras = operaciones. Al soltar una barra en otra hora o en otra máquina
// válida, la operación queda fijada y el resto del plan se recalcula con capacidad finita.
import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import { Box, Chip, Tooltip, Typography } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import { useTranslation } from "react-i18next";
import { fmtHour, fmtWeekdayDay, nf } from "../../utils/format";
import { P } from "./palette";

const ROW_H = 46;
const LEFT = 220;
const HEADER_H = 46;
const SNAP = 15 * 60000;

const fmtDay = fmtWeekdayDay;

export default function Gantt({ plan, articles, onMove, onSelect, selectedId }) {
  const { t } = useTranslation();
  const wrap = useRef(null);
  const [width, setWidth] = useState(900);
  const [drag, setDrag] = useState(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setWidth(Math.max(400, el.clientWidth - LEFT)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const from = new Date(plan.from).getTime();
  const to = new Date(plan.to).getTime();
  const span = to - from;
  const x = (ms) => ((ms - from) / span) * width;
  const msPerPx = span / width;
  const days = span / 86400000;
  const tickHours = days <= 3 ? 2 : days <= 7 ? 6 : 12;

  const ticks = useMemo(() => {
    const out = [];
    const first = new Date(from);
    first.setMinutes(0, 0, 0);
    for (let tt = first.getTime(); tt <= to; tt += 3600000) {
      const d = new Date(tt);
      if (d.getHours() % tickHours === 0) out.push({ t: tt, day: d.getHours() === 0 });
    }
    return out;
  }, [from, to, tickHours]);

  const orderById = useMemo(() => Object.fromEntries(plan.orders.map((o) => [o.id, o])), [plan.orders]);
  const rowIndex = useMemo(() => Object.fromEntries(plan.resources.map((r, i) => [r.code, i])), [plan.resources]);
  const allowed = (op) => {
    const art = articles?.find((a) => a.code === op.articleCode);
    return art?.route.find((s) => s.seq === op.seq)?.resources ?? [op.resourceCode];
  };

  const startDrag = (e, op) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ op, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, moved: false, allowed: allowed(op) });
  };
  const moveDrag = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x0;
    const dy = e.clientY - drag.y0;
    setDrag({ ...drag, dx, dy, moved: drag.moved || Math.abs(dx) > 4 || Math.abs(dy) > 4 });
  };
  const target = (d) => {
    const row = Math.min(plan.resources.length - 1, Math.max(0, rowIndex[d.op.resourceCode] + Math.round(d.dy / ROW_H)));
    const code = plan.resources[row].code;
    const start = Math.round((new Date(d.op.start).getTime() + d.dx * msPerPx) / SNAP) * SNAP;
    return { code, start, ok: d.allowed.includes(code) };
  };
  const endDrag = () => {
    if (!drag) return;
    const d = drag;
    setDrag(null);
    if (!d.moved) return onSelect(d.op);
    const tg = target(d);
    if (tg.ok) onMove(d.op, { resourceCode: tg.code, start: new Date(tg.start).toISOString() });
  };

  const now = new Date(plan.now).getTime();
  const tg = drag?.moved ? target(drag) : null;

  return (
    <Box ref={wrap} sx={{ position: "relative", overflow: "hidden", userSelect: "none", border: `1px solid ${P.line}`, borderRadius: "14px", background: "#fff" }} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerLeave={() => drag && setDrag(null)}>
      {/* cabecera de tiempo */}
      <Box sx={{ display: "flex", height: HEADER_H, borderBottom: `1px solid ${P.line}`, background: P.softer }}>
        <Box sx={{ width: LEFT, flexShrink: 0, px: "14px", display: "flex", alignItems: "center", fontSize: 12, fontWeight: 700, color: P.greyDark, textTransform: "uppercase", letterSpacing: ".06em" }}>{t("planifica.gantt.resource")}</Box>
        <Box sx={{ position: "relative", flex: 1 }}>
          {ticks.map((k) => (
            <Box key={k.t} sx={{ position: "absolute", left: x(k.t), top: 0, height: "100%", borderLeft: `1px solid ${k.day ? P.grey : P.line}`, pl: "4px" }}>
              {k.day && <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: P.dark, whiteSpace: "nowrap", mt: "4px" }}>{fmtDay(k.t)}</Typography>}
              <Typography sx={{ fontSize: 10.5, color: P.grey, position: "absolute", bottom: 4, whiteSpace: "nowrap" }}>{fmtHour(k.t)}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* filas */}
      {plan.resources.map((r, i) => {
        const off = plan.offTime.find((o) => o.code === r.code)?.off ?? [];
        const ops = plan.operations.filter((o) => o.resourceCode === r.code);
        const highlight = drag?.moved && (drag.allowed.includes(r.code) ? "allowed" : "blocked");
        return (
          <Box key={r.code} sx={{ display: "flex", height: ROW_H, borderBottom: `1px solid ${P.line}`, background: highlight === "allowed" && tg?.code === r.code ? P.soft : i % 2 ? "#FCFCFD" : "#fff" }}>
            <Box sx={{ width: LEFT, flexShrink: 0, px: "14px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: `1px solid ${P.line}` }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={r.name}>{r.name}</Typography>
              <Typography sx={{ fontSize: 11, color: r.capacity?.source === "ritmia" ? P.main : P.grey }}>
                {r.capacity?.source === "ritmia" ? t("planifica.gantt.realCapacity", { v: nf((r.capacity.factor || 0) * 100) }) : t("planifica.gantt.stdCapacity", { v: nf((r.capacity?.factor || 0) * 100) })}
              </Typography>
            </Box>
            <Box sx={{ position: "relative", flex: 1, opacity: highlight === "blocked" ? 0.45 : 1 }}>
              {off.map(([a, b], k) => (
                <Box key={k} sx={{ position: "absolute", top: 0, bottom: 0, left: x(new Date(a).getTime()), width: Math.max(0, x(new Date(b).getTime()) - x(new Date(a).getTime())),
                  backgroundImage: `repeating-linear-gradient(135deg, #F3F4F6 0 6px, #E5E7EB 6px 8px)` }} />
              ))}
              {ops.map((op) => {
                const o = orderById[op.orderId] || {};
                const s = new Date(op.start).getTime();
                const e = new Date(op.end).getTime();
                const isDrag = drag?.op._id === op._id && drag.moved;
                const left = x(s) + (isDrag ? drag.dx : 0);
                const top = 7 + (isDrag ? drag.dy : 0);
                const w = Math.max(6, x(e) - x(s));
                const late = o.late;
                const progress = o.qty ? Math.min(1, (o.producedGood || 0) / o.qty) : 0;
                const sel = selectedId === op._id;
                return (
                  <Tooltip key={op._id} arrow disableInteractive title={
                    <Box sx={{ fontSize: 12 }}>
                      <b>{t("planifica.order", { n: op.orderNumber })}</b> · {o.clientName}<br />
                      {o.articleName}<br />
                      {fmtDay(s)} {fmtHour(s)} → {fmtDay(e)} {fmtHour(e)}<br />
                      {t("planifica.gantt.qty", { n: nf(op.qty) })} · {t("planifica.gantt.setup", { n: nf(op.setupMin) })}<br />
                      {late ? t("planifica.status.lateBy", { h: nf(o.lateMin / 60, 1) }) : t("planifica.status.onTime")}
                      {op.locked ? ` · ${t("planifica.gantt.locked")}` : ""}
                    </Box>
                  }>
                    <Box
                      onPointerDown={(ev) => startDrag(ev, op)}
                      sx={{
                        position: "absolute", left, top, width: w, height: ROW_H - 14, borderRadius: "8px", cursor: isDrag ? "grabbing" : "grab",
                        background: late ? P.lateSoft : op.seq > 10 ? "#EDE9FE" : P.soft, border: `1.5px solid ${late ? P.late : sel ? P.dark : P.main}`,
                        boxShadow: isDrag ? "0 8px 20px rgba(88,28,135,.3)" : sel ? `0 0 0 3px ${P.mid}55` : "none", zIndex: isDrag ? 5 : 1,
                        overflow: "hidden", display: "flex", alignItems: "center", gap: "4px", px: "6px", transition: isDrag ? "none" : "box-shadow .15s",
                      }}
                    >
                      <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progress * 100}%`, background: late ? "#FCA5A5" : "#D8B4FE", opacity: 0.7 }} />
                      {op.locked && <PushPinIcon sx={{ fontSize: 13, color: P.dark, position: "relative" }} />}
                      <Typography sx={{ position: "relative", fontSize: 11.5, fontWeight: 700, color: late ? "#991B1B" : P.dark, whiteSpace: "nowrap" }}>{op.orderNumber}</Typography>
                      <Typography sx={{ position: "relative", fontSize: 11, color: P.greyDark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{op.articleCode}</Typography>
                    </Box>
                  </Tooltip>
                );
              })}
              {tg && tg.code === r.code && (
                <Box sx={{ position: "absolute", top: 3, bottom: 3, left: x(tg.start), width: Math.max(6, x(new Date(drag.op.end).getTime()) - x(new Date(drag.op.start).getTime())), border: `2px dashed ${tg.ok ? P.main : P.late}`, borderRadius: "8px", pointerEvents: "none" }} />
              )}
            </Box>
          </Box>
        );
      })}

      {/* línea de ahora */}
      {now > from && now < to && (
        <Box sx={{ position: "absolute", top: 0, bottom: 0, left: LEFT + x(now), width: "2px", background: P.late, pointerEvents: "none", zIndex: 6 }}>
          <Chip label={t("planifica.gantt.now")} size="small" sx={{ position: "absolute", top: 4, left: -24, height: 18, fontSize: 10, fontWeight: 700, background: P.late, color: "#fff" }} />
        </Box>
      )}
    </Box>
  );
}
