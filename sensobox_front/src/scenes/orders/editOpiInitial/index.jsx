// Iniciar orden: unidades de partida y hora de inicio (con hora, no solo fecha).
import React, { useState } from "react";
import { Box, Button, IconButton, TextField } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Header from "../../../components/Header";
import { API_ORDERS } from "../../../config/config";
import { OrderSummary, FormCard, nowLocal } from "../../../components/OrderBits";

const EditOpiInitial = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const order = useLocation().state?.order || {};
  const [qty, setQty] = useState("");
  const [when, setWhen] = useState(nowLocal());
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!(Number(qty) > 0) || !when) return;
    setBusy(true);
    try {
      await axios.patch(`${API_ORDERS.ORDERS}/initial/${id}`, { initialQuantity: Number(qty), processingDateInitial: new Date(when).toISOString() }, { headers: { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` } });
      navigate(-1);
    } catch (err) { console.error(err); setBusy(false); }
  };
  return (
    <Box sx={{ p: { xs: "16px", md: "24px 28px" }, maxWidth: 980 }}>
      <Header title={t("opiInitialForm.title")} subtitle={t("opiInitialForm.subtitle")} actionElement={<IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>} />
      <OrderSummary order={order} />
      <FormCard>
        <form onSubmit={submit}>
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap="14px">
            <TextField name="initialQuantity" label={t("opiInitialForm.labels.initialQuantity")} type="number" value={qty} onChange={(e) => setQty(e.target.value)} fullWidth inputProps={{ min: 0 }} />
            <TextField name="processingDateInitial" label={t("opiInitialForm.labels.processingDateInitial")} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Box>
          <Box display="flex" justifyContent="flex-end" mt="16px">
            <Button type="submit" variant="contained" disabled={busy} className="sb-guardar" sx={{ minWidth: 180, height: 46, borderRadius: "10px", fontSize: 15 }}>{t("opiInitialForm.buttons.update")}</Button>
          </Box>
        </form>
      </FormCard>
    </Box>
  );
};
export default EditOpiInitial;
