// Finalizar orden: unidades buenas y hora de fin; el backend calcula merma y tiempo real.
import React, { useState } from "react";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Header from "../../../components/Header";
import { API_ORDERS } from "../../../config/config";
import { OrderSummary, FormCard, nowLocal, nf } from "../../../components/OrderBits";
import { pct } from "../../../utils/format";

const EditOpiFinal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const order = useLocation().state?.order || {};
  const [qty, setQty] = useState("");
  const [when, setWhen] = useState(nowLocal());
  const [busy, setBusy] = useState(false);
  const merma = order.initialQuantity && Number(qty) > 0 ? (order.initialQuantity - Number(qty)) / order.initialQuantity : null;
  const submit = async (e) => {
    e.preventDefault();
    if (!(Number(qty) > 0) || !when) return;
    setBusy(true);
    try {
      await axios.patch(`${API_ORDERS.ORDERS}/final/${id}`, { finalQuantity: Number(qty), processingDateFinal: new Date(when).toISOString() }, { headers: { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` } });
      navigate(-1);
    } catch (err) { console.error(err); setBusy(false); }
  };
  return (
    <Box sx={{ p: { xs: "16px", md: "24px 28px" }, maxWidth: 980 }}>
      <Header title={t("createFinalOpi.title")} subtitle={t("createFinalOpi.subtitle")} actionElement={<IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>} />
      <OrderSummary order={order} />
      <FormCard>
        <form onSubmit={submit}>
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap="14px">
            <TextField name="finalQuantity" label={t("createFinalOpi.labels.finalQuantity")} type="number" value={qty} onChange={(e) => setQty(e.target.value)} fullWidth inputProps={{ min: 0 }} />
            <TextField name="processingDateFinal" label={t("createFinalOpi.labels.processingDateFinal")} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mt="16px" gap="12px" flexWrap="wrap">
            <Typography className="sb-merma-preview" sx={{ fontSize: 14, color: merma == null ? "#9CA3AF" : merma > 0.07 ? "#DC2626" : "#047857", fontWeight: 600 }}>
              {merma == null ? t("createFinalOpi.startedWith", { n: nf(order.initialQuantity) }) : t("createFinalOpi.wastePreview", { n: nf(order.initialQuantity - Number(qty)), pct: pct(merma * 100, 1) })}
            </Typography>
            <Button type="submit" variant="contained" disabled={busy} className="sb-guardar" sx={{ minWidth: 180, height: 46, borderRadius: "10px", fontSize: 15 }}>{t("createFinalOpi.buttons.update")}</Button>
          </Box>
        </form>
      </FormCard>
    </Box>
  );
};
export default EditOpiFinal;
