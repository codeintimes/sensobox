// Lista de preguntas frecuentes de demo (overlay fuera del repo)
import React from "react";
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Header from "./Header";

const FaqList = ({ subtitle, items }) => (
  <Box sx={{ p: { xs: "16px", md: "24px 28px" }, maxWidth: 920 }}>
    <Header title="Preguntas frecuentes" subtitle={subtitle} />
    {items.map(([q, a], i) => (
      <Accordion key={i} defaultExpanded={i < 2} disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>{q}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ fontSize: 14, color: "#4B5563", lineHeight: 1.6 }}>{a}</Typography>
        </AccordionDetails>
      </Accordion>
    ))}
  </Box>
);
export default FaqList;
