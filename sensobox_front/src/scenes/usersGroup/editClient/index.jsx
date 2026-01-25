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
import { API_USERS } from "../../../config/config";
import axios from 'axios';

const EditUser = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user } = location.state || {};
  const { t } = useTranslation();

  const handleFormSubmit = async (values) => {
    try {

      const jwt = localStorage.getItem("jwtToken");
      const response = await axios.patch(`${API_USERS.USERS}/${id}`, values, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });

      navigate(-1);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const userSchema = yup.object().shape({
    email: yup.string().email(t("validation.invalidEmail")), // "Invalid email", "Email is required"
    password: yup.string().min(8, t("validation.passwordMin")), // "Password must be at least 6 characters long", "Password is required"
    contactName: yup.string().required(t("validation.requiredContactName")), // "Nombre de contacto es requerido"
    contactPhone: yup.string().required(t("validation.requiredContactPhone")), // "Teléfono de contacto es requerido"
    contactEmail: yup.string().email(t("validation.invalidEmail")) // "Invalid email", "Email de contacto es requerido"
  });
  

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box m="20px">
      <Header
        title={t("users.editUser.title")}
        subtitle={t("users.editUser.subtitle")}
        actionElement={<IconButton onClick={handleGoBack}><ArrowBackIcon /></IconButton>}
      />
      {user && (
        <Formik
          initialValues={{
            name: user.name || "",
            email: user.email || "",
            password: "",
            role: user.role || "",
            contactName: user.contactName || "",
            contactPhone: user.contactPhone || "",
            contactEmail: user.contactEmail || ""
          }}
          validationSchema={userSchema}
          onSubmit={handleFormSubmit}
        >
          {({ values, errors, touched, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Box p={2} display="flex" flexDirection="column" gap="20px">
                <TextField
                  fullWidth
                  label={t("users.columns.name")}
                  onChange={handleChange}
                  value={values.name}
                  name="name"
                  type="text"
                  error={!!touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                />
                <TextField
                  fullWidth
                  label={t("users.columns.email")}
                  onChange={handleChange}
                  value={values.email}
                  name="email"
                  error={!!touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                />
                <TextField
                  fullWidth
                  label={t("users.columns.password")}
                  onChange={handleChange}
                  value={values.password}
                  name="password"
                  type="text"
                  error={!!touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                />
                {/* <TextField
                  select
                  fullWidth
                  label={t("users.columns.role")}
                  onChange={handleChange}
                  value={values.role}
                  name="role"
                  error={!!touched.role && !!errors.role}
                  helperText={touched.role && errors.role}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {t(`roles.${role}`)}
                    </MenuItem>
                  ))}
                </TextField> */}
                <TextField
                  fullWidth
                  label={t("users.columns.contactName")}
                  onChange={handleChange}
                  value={values.contactName}
                  name="contactName"
                  type="text"
                  error={!!touched.contactName && !!errors.contactName}
                  helperText={touched.contactName && errors.contactName}
                />
                <TextField
                  fullWidth
                  label={t("users.columns.contactPhone")}
                  onChange={handleChange}
                  value={values.contactPhone}
                  name="contactPhone"
                  type="text"
                  error={!!touched.contactPhone && !!errors.contactPhone}
                  helperText={touched.contactPhone && errors.contactPhone}
                />
                <TextField
                  fullWidth
                  label={t("users.columns.contactEmail")}
                  onChange={handleChange}
                  value={values.contactEmail}
                  name="contactEmail"
                  type="text"
                  error={!!touched.contactEmail && !!errors.contactEmail}
                  helperText={touched.contactEmail && errors.contactEmail}
                />
              </Box>
              <Box display="flex" justifyContent="flex-end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  {t("users.editClient.updateUser")} {/* Usar traducción para el texto del botón */}
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

export default EditUser;
