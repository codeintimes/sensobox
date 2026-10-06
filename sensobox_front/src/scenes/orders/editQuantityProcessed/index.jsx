// Registrar avance (overlay fuera del repo): mismo endpoint, con el resumen de la orden encima.
import React, { useState } from "react";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import Header from "../../../components/Header";
import { API_ORDERS } from "../../../config/config";
import { OrderSummary, FormCard, nf } from "../../../components/OrderBits";

const EditQuantityProcessed = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const order = useLocation().state?.order || {};
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!(Number(value) > 0)) return;
    setBusy(true);
    try {
      await axios.post(`${API_ORDERS.ORDERS}/${id}/update-quantity-processed`, { quantityProcessed: Number(value) }, { headers: { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` } });
      navigate(-1);
    } catch (err) { console.error(err); setBusy(false); }
  };
  return (
    <Box sx={{ p: { xs: "16px", md: "24px 28px" }, maxWidth: 980 }}>
      <Header title="Registrar avance" subtitle="Unidades hechas hasta ahora. La oficina lo ve al momento." actionElement={<IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>} />
      <OrderSummary order={order} />
      <FormCard>
        <form onSubmit={submit}>
          <Typography sx={{ fontSize: 13.5, color: "#6B7280", mb: "12px" }}>Llevabas {nf(order.quantityProcessed)} de {nf(order.productionQuantity)} unidades.</Typography>
          <Box display="flex" gap="12px" flexDirection={{ xs: "column", sm: "row" }}>
            <TextField name="quantityProcessed" label="Unidades hechas" type="number" value={value} onChange={(e) => setValue(e.target.value)} fullWidth autoFocus inputProps={{ min: 0 }} />
            <Button type="submit" variant="contained" disabled={busy} className="sb-guardar" sx={{ minWidth: 180, height: 52, borderRadius: "10px", fontSize: 15 }}>Guardar avance</Button>
          </Box>
        </form>
      </FormCard>
    </Box>
  );
};
export default EditQuantityProcessed;
