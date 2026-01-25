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

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { client } = location.state || {}; // Obtén los datos del cliente del estado de la ubicación
console.log(client)

  const handleFormSubmit = async (values) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        navigate('/clients');
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
            initialValues={client}  // Utiliza los datos del cliente como initialValues
            validationSchema={checkoutSchema}
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
                    label="Registrar ID"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.registrarId}
                    name="registrarId"
                    error={!!touched.registrarId && !!errors.registrarId}
                    helperText={touched.registrarId && errors.registrarId}
                    sx={{ gridColumn: "span 4" }}
                  />
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
                  <TextField
                    fullWidth
                    variant="filled"
                    type="number"
                    label="Age"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.age}
                    name="age"
                    error={!!touched.age && !!errors.age}
                    helperText={touched.age && errors.age}
                    sx={{ gridColumn: "span 2" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Phone"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.phone}
                    name="phone"
                    error={!!touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                    sx={{ gridColumn: "span 4" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="email"
                    label="Email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.email}
                    name="email"
                    error={!!touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    sx={{ gridColumn: "span 4" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Address"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.address}
                    name="address"
                    error={!!touched.address && !!errors.address}
                    helperText={touched.address && errors.address}
                    sx={{ gridColumn: "span 4" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="City"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.city}
                    name="city"
                    error={!!touched.city && !!errors.city}
                    helperText={touched.city && errors.city}
                    sx={{ gridColumn: "span 2" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Zip Code"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.zipCode}
                    name="zipCode"
                    error={!!touched.zipCode && !!errors.zipCode}
                    helperText={touched.zipCode && errors.zipCode}
                    sx={{ gridColumn: "span 2" }}
                  />

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

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
  address1: yup.string().required("required"),
  address2: yup.string().required("required"),
});

export default Form;

