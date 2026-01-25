import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";

// Suponiendo que esta es una función de API simulada para obtener los datos del usuario
const getUserById = async (id) => {
  // Implementa la lógica de búsqueda de usuario aquí
  return {
    id: id,
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    contact: "+123456789",
    address1: "123 Main St",
    address2: "Apt 1",
  };
};

// Esquema de validación de Yup
const validationSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  contact: yup.string().matches(/^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/, "Phone number is not valid").required("Contact number is required"),
  address1: yup.string().required("Address 1 is required"),
  address2: yup.string().required("Address 2 is required"),
});

const Form = ({ onSubmit }) => {
  const { id } = useParams();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [initialValues, setInitialValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    address1: "",
    address2: "",
  });

  useEffect(() => {
    if (id) {
      getUserById(id).then(setInitialValues);
    }
  }, [id]);

  return (
    <Box m="20px">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize // Asegúrate de reinitializar el formulario cuando initialValues cambie
        onSubmit={(values, { setSubmitting }) => {
          onSubmit(values);
          setSubmitting(false);
        }}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{ "& > div": { gridColumn: isNonMobile ? undefined : "span 4" } }}
            >
              {/* Campos del formulario, ajustados para usar variant="outlined" */}
              <TextField
                fullWidth
                variant="outlined"
                label="First Name"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.firstName && Boolean(errors.firstName)}
                helperText={touched.firstName && errors.firstName}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Last Name"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.lastName && Boolean(errors.lastName)}
                helperText={touched.lastName && errors.lastName}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Contact Number"
                name="contact"
                value={values.contact}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.contact && Boolean(errors.contact)}
                helperText={touched.contact && errors.contact}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Address 1"
                name="address1"
                value={values.address1}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.address1 && Boolean(errors.address1)}
                helperText={touched.address1 && errors.address1}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Address 2"
                name="address2"
                value={values.address2}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.address2 && Boolean(errors.address2)}
                helperText={touched.address2 && errors.address2}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="primary" variant="contained">
                {id ? "Update User" : "Create New User"}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Form;
