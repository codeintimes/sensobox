import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../src/components/Header";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from 'react-router-dom';

const ClientList = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { client } = location.state || {};
  const [error, setError] = useState(null);

  const handleFormSubmit = async (values) => {
    try {
      const jwt = localStorage.getItem("jwtToken");
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        navigate('/clients');
      } else {
        setError('Failed to update client');
      }
    } catch (error) {
      setError('Error updating client');
    }
  };

  const handleDelete = async () => {
    try {
      const jwt = localStorage.getItem("jwtToken");
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
      });
      if (response.ok) {
        navigate('/clients');
      } else {
        setError('Failed to delete client');
      }
    } catch (error) {
      setError('Error deleting client');
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
        <Box p={2}>
          <Formik
            onSubmit={handleFormSubmit}
            initialValues={client}
            validationSchema={clientSchema}
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
          {error && (
            <Typography variant="body1" color="error" mt={2}>
              {error}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

const clientSchema = yup.object().shape({
  name: yup.string().required("Name is required"),

});

export default ClientList;
