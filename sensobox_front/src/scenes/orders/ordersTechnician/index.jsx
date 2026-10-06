// «Mis órdenes» del técnico: tarjetas en lugar de tabla, cómodas en el móvil.
// Usa el mismo endpoint (/orders/technician) y las mismas pantallas de edición (por estado de navegación).
import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, InputBase, Typography, LinearProgress, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import Header from "../../../components/Header";
import { API_ORDERS } from "../../../config/config";
import { StatusChip, nf, fmtDT } from "../../../components/OrderBits";

const OrdersTechnician = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("todo");
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:800px)");

  useEffect(() => {
    const load = async () => {
      const u = JSON.parse(localStorage.getItem("userData")) || {};
      const jwt = localStorage.getItem("jwtToken");
      const r = await axios.get(`${API_ORDERS.ORDERS}/technician/`, { params: { technician: u.name, companyName: u.companyName }, headers: { Authorization: `Bearer ${jwt}` } });
      setOrders(r.data || []);
    };
    load().catch((e) => console.error(e));
  }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders
      .filter((o) => (tab === "todo" ? o.status <= 2 : o.status >= 3))
      .filter((o) => !term || String(o.orderNumber).includes(term) || o.clientName.toLowerCase().includes(term) || o.workName.toLowerCase().includes(term))
      .sort((a, b) => (tab === "todo" ? b.status - a.status || new Date(a.processingDate) - new Date(b.processingDate) : new Date(b.processingDateFinal || b.updatedAt) - new Date(a.processingDateFinal || a.updatedAt)));
  }, [orders, tab, q]);
  const go = (path, o) => navigate(`/${path}/${o._id}`, { state: { order: o } });
  const counts = { todo: orders.filter((o) => o.status <= 2).length, done: orders.filter((o) => o.status >= 3).length };

  return (
    <Box sx={{ p: { xs: "16px", md: "24px 28px" } }}>
      <Header title={t("techOrders.title")} subtitle={t("techOrders.subtitle")}
        actionElement={!isMobile && <Button className="sb-new-order" variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/createOrder")} sx={{ borderRadius: "10px", px: "16px", height: 40 }}>{t("table.newOrder")}</Button>} />
      <Box display="flex" gap="10px" alignItems="center" mb="16px" flexWrap="wrap">
        <Box sx={{ display: "inline-flex", background: "#E9EBF2", borderRadius: "10px", p: "3px" }}>
          {[["todo", "techOrders.tabTodo"], ["done", "techOrders.tabDone"]].map(([k, l]) => (
            <Box key={k} component="button" className={"sb-tab" + (tab === k ? " active" : "")} onClick={() => setTab(k)}
              sx={{ border: 0, cursor: "pointer", font: "inherit", fontSize: 13.5, fontWeight: 600, px: "14px", py: "7px", borderRadius: "8px", background: tab === k ? "#fff" : "transparent", color: tab === k ? "#111827" : "#6B7280", boxShadow: tab === k ? "0 1px 2px rgba(16,24,40,.08)" : "none" }}>
              {t(l)} <Box component="span" sx={{ color: "#9CA3AF", fontWeight: 500 }}>{counts[k]}</Box>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", px: "10px", height: 40, flex: isMobile ? "1 1 100%" : "0 1 280px" }}>
          <SearchIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
          <InputBase placeholder={t("techOrders.search")} value={q} onChange={(e) => setQ(e.target.value)} sx={{ flex: 1, fontSize: 14 }} />
        </Box>
      </Box>

      <Box display="grid" gridTemplateColumns={isMobile ? "1fr" : "repeat(auto-fill, minmax(360px, 1fr))"} gap="14px">
        {list.map((o) => {
          const p = Math.min(1, (o.quantityProcessed || 0) / (o.productionQuantity || 1));
          return (
            <Box key={o._id} className="sb-card sb-order-card" data-order={o.orderNumber} sx={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", p: "16px 18px", display: "flex", flexDirection: "column", gap: "10px", boxShadow: "0 1px 2px rgba(16,24,40,.04)" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" gap="8px">
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#6B7280" }}>{t("order.numberShort", { n: o.orderNumber })}</Typography>
                <StatusChip status={o.status} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{o.workName}</Typography>
                <Typography sx={{ fontSize: 13.5, color: "#4B5563" }}>{o.clientName}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" gap="8px" sx={{ fontSize: 13, color: "#6B7280" }}>
                <span>{o.status >= 3 ? t("techOrders.finishedAt", { date: fmtDT(o.processingDateFinal) }) : t("techOrders.plannedAt", { date: fmtDT(o.processingDate) })}</span>
                <span style={{ whiteSpace: "nowrap" }}>{t("order.hours", { n: nf(o.processingTime) })}</span>
              </Box>
              <Box>
                <Box display="flex" justifyContent="space-between" sx={{ fontSize: 13, mb: "6px" }}>
                  <Box component="span" sx={{ color: "#6B7280" }}>{t("orders.columns.quantityProcessed")}</Box>
                  <Box component="span" sx={{ fontWeight: 700, color: "#111827" }}>{nf(o.quantityProcessed)} <Box component="span" sx={{ color: "#9CA3AF", fontWeight: 500 }}>/ {nf(o.productionQuantity)}</Box></Box>
                </Box>
                <LinearProgress variant="determinate" value={p * 100} sx={{ height: 7, borderRadius: 4, background: "#EEF0F4", "& .MuiLinearProgress-bar": { borderRadius: 4, background: p >= 1 ? "#10B981" : "#4F46E5" } }} />
              </Box>
              {o.status <= 2 && (
                <Box display="flex" gap="8px" mt="2px">
                  {o.status === 1 && <Button className="sb-act-iniciar" variant="contained" size="small" startIcon={<PlayArrowRoundedIcon />} onClick={() => go("editOpiInitial", o)} sx={{ flex: 1, borderRadius: "9px", minHeight: 38, lineHeight: 1.2 }}>{t("techOrders.start")}</Button>}
                  {o.status === 2 && <Button className="sb-act-avance" variant="contained" size="small" startIcon={<EditNoteRoundedIcon />} onClick={() => go("editQuantityProcessed", o)} sx={{ flex: 1, borderRadius: "9px", minHeight: 38, lineHeight: 1.2 }}>{t("techOrders.progress")}</Button>}
                  {o.status === 2 && <Button className="sb-act-finalizar" variant="outlined" size="small" startIcon={<FlagRoundedIcon />} onClick={() => go("editOpiFinal", o)} sx={{ flex: 1, borderRadius: "9px", minHeight: 38, lineHeight: 1.2, borderColor: "#D1D5DB", color: "#374151" }}>{t("techOrders.finish")}</Button>}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      {list.length === 0 && <Typography sx={{ color: "#6B7280", mt: 2 }}>{t("techOrders.empty")}</Typography>}
    </Box>
  );
};

export default OrdersTechnician;
