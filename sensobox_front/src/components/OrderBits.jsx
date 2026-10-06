// Piezas comunes de la demo (overlay fuera del repo): estado, resumen de orden y tarjeta de formulario.
import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";

export const STATUS = {
  1: { label: "Pendiente", color: "#B45309", bg: "#FFFBEB", dot: "#F59E0B" },
  2: { label: "En producción", color: "#4338CA", bg: "#EEF2FF", dot: "#6366F1" },
  3: { label: "Terminada", color: "#047857", bg: "#ECFDF5", dot: "#10B981" },
  4: { label: "Enviada", color: "#0E7490", bg: "#ECFEFF", dot: "#06B6D4" },
};
export const nf = (n, d = 0) => Number(n || 0).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtDT = (d) => (d ? new Date(d).toLocaleString("es-ES", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
export const nowLocal = () => { const d = new Date(); d.setSeconds(0, 0); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

export const StatusChip = ({ status, sx }) => {
  const s = STATUS[status] || STATUS[1];
  return (
    <Box component="span" className="sb-status" sx={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: 12.5, fontWeight: 600, color: s.color, background: s.bg, borderRadius: "999px", px: "10px", py: "3px", whiteSpace: "nowrap", ...sx }}>
      <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }} />{s.label}
    </Box>
  );
};

const Field = ({ k, v }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>{k}</Typography>
    <Typography sx={{ fontSize: 14, color: "#111827", fontWeight: 500, mt: "2px" }}>{v}</Typography>
  </Box>
);

export const OrderSummary = ({ order: o }) => {
  if (!o || !o.orderNumber) return null;
  const p = Math.min(1, (o.quantityProcessed || 0) / (o.productionQuantity || 1));
  return (
    <Box className="sb-card sb-order-summary" sx={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", p: { xs: "16px", md: "20px 22px" }, mb: "16px" }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap="10px" mb="14px">
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 12.5, color: "#6B7280", fontWeight: 600 }}>Orden Nº {o.orderNumber}</Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827", letterSpacing: "-.01em" }}>{o.workName}</Typography>
          <Typography sx={{ fontSize: 13.5, color: "#4B5563" }}>{o.clientName}</Typography>
        </Box>
        <StatusChip status={o.status} />
      </Box>
      <Box display="grid" gridTemplateColumns={{ xs: "1fr 1fr", md: "repeat(4, 1fr)" }} gap="14px">
        <Field k="Cantidad" v={`${nf(o.productionQuantity)} uds.`} />
        <Field k="Hecho" v={`${nf(o.quantityProcessed)} uds.`} />
        <Field k="Fecha prevista" v={fmtDT(o.processingDate)} />
        <Field k="Horas previstas" v={`${nf(o.processingTime)} h`} />
        <Field k="Tipo" v={o.workType} />
        <Field k="Procesos" v={o.processes} />
        <Field k="Tintas" v={o.colors} />
        <Field k="Acabado" v={o.specialFinishes} />
      </Box>
      <LinearProgress variant="determinate" value={p * 100} sx={{ mt: "16px", height: 7, borderRadius: 4, background: "#EEF0F4", "& .MuiLinearProgress-bar": { borderRadius: 4, background: "#4F46E5" } }} />
    </Box>
  );
};

export const FormCard = ({ children }) => (
  <Box className="sb-card sb-form" sx={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", p: { xs: "16px", md: "22px" } }}>{children}</Box>
);
