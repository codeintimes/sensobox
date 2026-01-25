import { Box, Button, TextField, IconButton } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../../components/Header";
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { API_ORDERS } from "../../../config/config";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useParams } from "react-router-dom";

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order || {};
  const { id } = useParams();
  const { t } = useTranslation();
  const handleGoBack = () => navigate(-1);

  const initialValues = {
    finalQuantity: order.finalQuantity || 0,
    processingDateFinal: order.processingDateFinal ? order.processingDateFinal.split('T')[0] : "",
  };
  const validationSchema = yup.object().shape({
    finalQuantity: yup.number().required(t("createFinalOpi.errors.finalQuantityRequired")).positive(t("createFinalOpi.errors.finalQuantityPositive")),
    processingDateFinal: yup.date().required(t("createFinalOpi.errors.processingDateFinalRequired")).typeError(t("createFinalOpi.errors.processingDateFinalType")),
  });

  const handleFormSubmit = async (values) => {
    console.log("values", values);
    try {
      const jwt = localStorage.getItem("jwtToken");
      const response = await axios.patch(`${API_ORDERS.ORDERS}/final/${id}`, values, { // Cambiado a PATCH
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });
      if (response.status === 200) {
        // alert(t('updateOrders.messages.updateSuccess'));
        navigate(-1);
      } else {
        throw new Error('Failed to update the order');
      }
    } catch (error) {
      console.error("Failed to update OPI final", error);
    }
  };
  

  return (
    <Box m="20px">
      <Header title={t('createFinalOpi.title')} subtitle={t('createFinalOpi.subtitle')} actionElement={
        <IconButton onClick={handleGoBack}>
          <ArrowBackIcon />
        </IconButton>
      } />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap="20px">
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label={t("createFinalOpi.labels.finalQuantity")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.finalQuantity}
                name="finalQuantity"
                error={!!touched.finalQuantity && !!errors.finalQuantity}
                helperText={touched.finalQuantity && errors.finalQuantity}
              />
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label={t("createFinalOpi.labels.processingDateFinal")}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.processingDateFinal}
                name="processingDateFinal"
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!touched.processingDateFinal && !!errors.processingDateFinal}
                helperText={touched.processingDateFinal && errors.processingDateFinal}
                sx={{
                  "& .MuiInputBase-input::-webkit-calendar-picker-indicator": {
                    filter: "invert(1)"
                  },
                }}
              />
              <Box display="flex" justifyContent="flex-end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  {t("createFinalOpi.buttons.update")}
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
