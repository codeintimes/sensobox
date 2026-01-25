import React, { useEffect, useState } from 'react';
import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../src/components/Header"; // Asegúrate de que la ruta a Header es correcta según tu estructura de archivos.
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';

const EditClient = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { client } = location.state || {};
  console.log("2222222222222222",id)
  const handleFormSubmit = async (values) => {
    try {
      console.log("2222222222222222",id)
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        navigate('/users');
      } else {
        console.error('Failed to update client:', response.status);
      }
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box m="20px">
      <Header
        title="EDIT CLIENT"
        subtitle="Edit Client Profile"
        bgcolor="#f0f0f0"
        actionElement={
          <IconButton onClick={handleGoBack}>
            <ArrowBackIcon />
          </IconButton>
        }
      />
      {client && (
        <Box p={2}>
          <Formik
            onSubmit={handleFormSubmit}
            initialValues={client}
            validationSchema={clientSchema} // Usa el esquema de validación de cliente
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
                    label="Name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.name}
                    name="name"
                    error={!!touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                    sx={{ gridColumn: "span 4" }}
                  />
                  {/* Agrega otros campos de formulario similares aquí */}
                </Box>
                <Box display="flex" justifyContent="end" mt="20px">
                  <Button type="submit" color="secondary" variant="contained">
                    Update Client
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Box>
      )}
    </Box>
  );
};

const clientSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  // Agrega validaciones para otros campos del cliente aquí
});

export default EditClient;
