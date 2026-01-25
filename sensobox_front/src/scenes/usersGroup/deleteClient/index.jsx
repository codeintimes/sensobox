import React, { useState } from 'react';
import { Box, Button, TextField, Typography, IconButton } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../../components/Header";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const DeleteClient = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { client } = location.state || {};
  const { t } = useTranslation();
  const [error, setError] = useState(null);

  const handleFormSubmit = async (values) => {
    try {
      const jwt = localStorage.getItem("jwtToken")
      const response = await axios.put(`/api/clients/${id}`, values, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });
      if (response.ok) {
        navigate(-1);
      } else {
        setError(t('deleteClient.failedUpdate'));
      }
    } catch (error) {
      setError(t('deleteClient.errorUpdating'));
    }
  };

  const handleDelete = async () => {
    try {
      const jwt = localStorage.getItem("jwtToken")
      const response = await axios.delete(`/api/clients/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });
      if (response.ok) {
        navigate('/clients');
      } else {
        setError(t('deleteClient.failedDelete'));
      }
    } catch (error) {
      setError(t('deleteClient.errorDeleting'));
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const clientSchema = yup.object().shape({
    name: yup.string().required(t('deleteClient.nameRequired')),
  });

  return (
    <Box m="20px">
      <Header
        title={t('deleteClient.headerTitle')}
        subtitle={t('deleteClient.headerSubtitle')}
        actionElement={
          <>
            <IconButton onClick={handleGoBack}>
              <ArrowBackIcon />
            </IconButton>
            <IconButton onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </>
        }
      />
      {client && (
        <Formik
          initialValues={{
            name: client.name || '',
          }}
          validationSchema={clientSchema}
          onSubmit={handleFormSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                }}
              >
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label={t('deleteClient.nameLabel')}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.name}
                  name="name"
                  error={!!touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  sx={{ gridColumn: "span 4" }}
                />
              </Box>
              <Box display="flex" justifyContent="end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  {t('deleteClient.updateClient')}
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      )}
      {error && (
        <Typography variant="body1" color="error" mt={2}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default DeleteClient;
