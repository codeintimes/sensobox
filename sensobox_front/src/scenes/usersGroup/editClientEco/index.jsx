import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, MenuItem } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../../components/Header";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import {API_USERS} from "../../../config/config";
import axios from 'axios';

const EditClientEco = (companyName) => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user } = location.state || {};
  const { t } = useTranslation();


  const handleFormSubmit = async (values) => {
    try {
      console.log("2",values)
      const jwt = localStorage.getItem("jwtToken")
      values.clientName = user.clientName;
      const response = await axios.patch(`${API_USERS.USERS}/eco-data`, values, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });
      console.log(response)
      if (response.status=200) {
        navigate('/clientsEco');
      } else {
        console.error('Failed to update user:', response.status);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const ecoSchema = yup.object().shape({
    eco: yup.boolean().required(t('editClientEco.validationMessages.ecoStatusRequired')),
    ecoEmissions: yup.number().required(t('editClientEco.validationMessages.ecoEmissionsRequired'))
  });

  return (
    <Box m="20px">
     <Header
        title={t('editClientEco.headerTitle')}
        subtitle={t('editClientEco.headerSubtitle')}
        actionElement={<IconButton onClick={handleGoBack}><ArrowBackIcon /></IconButton>}
      />
      {user && (
        <Formik
          initialValues={{
            eco: user.eco || false,
            ecoEmissions: user.ecoEmissions || 0,
          }}
          validationSchema={ecoSchema}
          onSubmit={handleFormSubmit}
        >
          {({ values, errors, touched, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Box p={2} display="flex" flexDirection="column" gap="20px">
                <TextField
                  select
                  fullWidth
                  label={t('ecoForm.ecoStatus')} 
                  onChange={handleChange}
                  value={values.eco.toString()}
                  name="eco"
                  error={!!touched.eco && !!errors.eco}
                  helperText={touched.eco && errors.eco}
                >
                  <MenuItem value="true">{t('common.enabled')}</MenuItem>
                  <MenuItem value="false">{t('common.disabled')}</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label={t('ecoForm.ecoEmissions')}
                  onChange={handleChange}
                  value={values.ecoEmissions}
                  name="ecoEmissions"
                  type="number"
                  error={!!touched.ecoEmissions && !!errors.ecoEmissions}
                  helperText={touched.ecoEmissions && errors.ecoEmissions}
                />
              </Box>
              <Box display="flex" justifyContent="flex-end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                {t('ecoForm.updateEcoData')}
                </Button>
              </Box>
            </form>
          )}
          
        </Formik>
      )}
      <Box sx={{ height: '20px' }} />
    </Box>
  );
};



export default EditClientEco;
