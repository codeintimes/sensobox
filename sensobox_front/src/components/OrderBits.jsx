// Piezas comunes: estado, resumen de orden y tarjeta de formulario.
import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { nf, fmtWeekdayDateTime } from "../utils/format";

export { nf };
export const fmtDT = fmtWeekdayDateTime;

// Estados de una orden: la etiqueta es una clave de traducción
export const STATUS = {
  1: { key: "orders.status.pending", color: "#B45309", bg: "#FFFBEB", dot: "#F59E0B" },
  2: { key: "orders.status.processing", color: "#4338CA", bg: "#EEF2FF", dot: "#6366F1" },
  3: { key: "orders.status.processed", color: "#047857", bg: "#ECFDF5", dot: "#10B981" },
  4: { key: "orders.status.shipping", color: "#0E7490", bg: "#ECFEFF", dot: "#06B6D4" },
};
export const nowLocal = () => { const d = new Date(); d.setSeconds(0, 0); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

export const StatusChip = ({ status, sx }) => {
  const { t } = useTranslation();
  const s = STATUS[status] || STATUS[1];
  return (
    <Box component="span" className="sb-status" sx={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: 12.5, fontWeight: 600, color: s.color, background: s.bg, borderRadius: "999px", px: "10px", py: "3px", whiteSpace: "nowrap", ...sx }}>
      <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }} />{t(s.key)}
    </Box>
  );
};

const Field = ({ k, v }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", overflowWrap: "anywhere" }}>{k}</Typography>
    <Typography sx={{ fontSize: 14, color: "#111827", fontWeight: 500, mt: "2px", overflowWrap: "anywhere" }}>{v}</Typography>
  </Box>
);

export const OrderSummary = ({ order: o }) => {
  const { t } = useTranslation();
  if (!o || !o.orderNumber) return null;
  const p = Math.min(1, (o.quantityProcessed || 0) / (o.productionQuantity || 1));
  return (
    <Box className="sb-card sb-order-summary" sx={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", p: { xs: "16px", md: "20px 22px" }, mb: "16px" }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap="10px" mb="14px">
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 12.5, color: "#6B7280", fontWeight: 600 }}>{t("order.numberLong", { n: o.orderNumber })}</Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827", letterSpacing: "-.01em" }}>{o.workName}</Typography>
          <Typography sx={{ fontSize: 13.5, color: "#4B5563" }}>{o.clientName}</Typography>
        </Box>
        <StatusChip status={o.status} />
      </Box>
      <Box display="grid" gridTemplateColumns={{ xs: "1fr 1fr", md: "repeat(4, 1fr)" }} gap="14px">
        <Field k={t("orders.columns.productionQuantity")} v={t("order.units", { n: nf(o.productionQuantity) })} />
        <Field k={t("orders.columns.quantityProcessed")} v={t("order.units", { n: nf(o.quantityProcessed) })} />
        <Field k={t("orders.columns.processingDate")} v={fmtDT(o.processingDate)} />
        <Field k={t("orders.columns.processingTime")} v={t("order.hours", { n: nf(o.processingTime) })} />
        <Field k={t("orders.columns.workType")} v={o.workType} />
        <Field k={t("orders.columns.processes")} v={o.processes} />
        <Field k={t("orders.columns.colors")} v={o.colors} />
        <Field k={t("orders.columns.specialFinishes")} v={o.specialFinishes} />
      </Box>
      <LinearProgress variant="determinate" value={p * 100} sx={{ mt: "16px", height: 7, borderRadius: 4, background: "#EEF0F4", "& .MuiLinearProgress-bar": { borderRadius: 4, background: "#4F46E5" } }} />
    </Box>
  );
};

export const FormCard = ({ children }) => (
  <Box className="sb-card sb-form" sx={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", p: { xs: "16px", md: "22px" } }}>{children}</Box>
);
