import React from "react";
import { Box, Button, TextField, IconButton } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../../components/Header";
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from 'react-i18next';
import { API_ORDERS } from "../../../config/config";
import axios from 'axios';
import { useParams } from "react-router-dom";

const Form = () => {
  const { t } = useTranslation();

  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const order = location.state?.order || {};

  const handleFormSubmit = async (values) => {
    try {
      const jwt = localStorage.getItem("jwtToken")
      const response = await axios.post(`${API_ORDERS.ORDERS}/${id}/update-quantity-processed`, {
        quantityProcessed: values.quantityProcessed
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });

      navigate(-1);
    } catch (error) {
      console.error("Failed to update current quantity", error);
    }
  };

  const handleGoBack = () => {

    navigate(-1);
  };

  const initialValues = {
    quantityProcessed: order.quantityProcessed || 0,
  };

  const checkoutSchema = yup.object().shape({
    quantityProcessed: yup
      .number()
      .required(t("orders.currentQuantity.quantity_required"))
      .positive(t("orders.currentQuantity.quantity_positive")),
  });

  return (
    <Box m="20px">
      <Header
        title={t("orders.currentQuantity.title")}
        subtitle={t("orders.currentQuantity.subtitle")}
        actionElement={
          <IconButton onClick={handleGoBack}>
            <ArrowBackIcon />
          </IconButton>
        }
      />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap="20px">
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("orders.currentQuantity.quantityProcessed")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.quantityProcessed}
                name="quantityProcessed"
                error={!!touched.quantityProcessed && !!errors.quantityProcessed}
                helperText={touched.quantityProcessed && errors.quantityProcessed}
              />
              <Box display="flex" justifyContent="flex-end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  {t("orders.currentQuantity.buttons.update")}
                </Button>
              </Box>

            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Form;
