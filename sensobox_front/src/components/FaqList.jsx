// Lista de preguntas frecuentes. «ns» es el grupo de preguntas en las traducciones (faq.admin, faq.technician, faq.client).
import React from "react";
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import Header from "./Header";

const FaqList = ({ ns }) => {
  const { t } = useTranslation();
  const items = t(`faq.${ns}.items`, { returnObjects: true });
  return (
    <Box sx={{ p: { xs: "16px", md: "24px 28px" }, maxWidth: 920 }}>
      <Header title={t("faq.title")} subtitle={t(`faq.${ns}.subtitle`)} />
      {Array.isArray(items) && items.map(({ q, a }, i) => (
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
};
export default FaqList;
