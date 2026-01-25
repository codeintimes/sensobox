import React from 'react';
import { Box, Button, TextField, MenuItem } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../../components/Header";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_USERS } from "../../../config/config";
import axios from 'axios';

const CreateUser = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { t } = useTranslation();

  // const roles = ['admin', 'technician'];

  const initialValues = {
    name: "",
    email: "",
    password: "",
    // role: "",
    contactName: "",
    contactPhone: "",
    contactEmail: ""
  };

  const userSchema = yup.object().shape({
    name: yup.string().required(t("validation.requiredName")).matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, t("validation.invalidName")),
    email: yup.string().email(t("validation.invalidEmail")).required(t("validation.requiredEmail")),
    password: yup.string().min(6, t("validation.passwordMin")).required(t("validation.requiredPassword")),
    // role: yup.string().required(t("validation.requiredRole")),
    contactName: yup.string().required(t("validation.requiredContactName")),
    contactPhone: yup.string().required(t("validation.requiredContactPhone")),
    contactEmail: yup.string().email(t("validation.invalidContactEmail")).required(t("validation.requiredContactEmail"))
  });
  const handleFormSubmit = async (values) => {
    try {
      const jwt = localStorage.getItem("jwtToken");
      const userData = JSON.parse(localStorage.getItem('userData'));
      const companyName = userData ? userData.companyName : '';
  
      if (!companyName) {
        alert('Company name is missing. Please log in again.');
        return;
      }
  
      const payload = {
        ...values,
        companyName: companyName,
        clientName: companyName,
        role: "admin"
      };
      console.log("payload", payload);
      
      const response = await axios.post(`${API_USERS.USERS}/register`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        }
      });
  
      console.log("User created successfully:", response);
      navigate('/admins');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert('El correo electrónico ya existe');
      } else {
        console.error('Error creating user:', error);
        alert('Error creating user: ' + error.message);
      }
    }
  };
  
  
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box m="20px" >
      <Header
        title={t("createUser.title")}
        subtitle={t("createUser.subtitle")}
        actionElement={<IconButton onClick={handleGoBack}><ArrowBackIcon /></IconButton>}
      />
      <Formik
        initialValues={initialValues}
        validationSchema={userSchema}
        onSubmit={handleFormSubmit}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Box p={2} display="flex" flexDirection="column" gap="20px">
              <TextField
                fullWidth
                label={t("createUser.name")}
                onChange={handleChange}
                value={values.name}
                name="name"
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
              />
              {/* <TextField
                fullWidth
                label={t("createUser.companyName")}
                onChange={handleChange}
                value={values.companyName}
                name="companyName"
                error={!!touched.companyName && !!errors.companyName}
                helperText={touched.companyName && errors.companyName}
              /> */}
              <TextField
                fullWidth
                label={t("createUser.email")}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
              />
              <TextField
                fullWidth
                label={t("createUser.password")}
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
                label={t("createUser.role")}
                onChange={handleChange}
                value={values.role}
                name="role"
                error={!!touched.role && !!errors.role}
                helperText={touched.role && errors.role}
              >

                {roles.map(role => (
                  <MenuItem key={role} value={role}>
                    {t(`roles.${role}`)}
                  </MenuItem>
                ))}
              </TextField> */}
              <TextField
                fullWidth
                label={t("createUser.contactName")}
                onChange={handleChange}
                value={values.contactName}
                name="contactName"
                error={!!touched.contactName && !!errors.contactName}
                helperText={touched.contactName && errors.contactName}
              />
              <TextField
                fullWidth
                label={t("createUser.contactPhone")}
                onChange={handleChange}
                value={values.contactPhone}
                name="contactPhone"
                error={!!touched.contactPhone && !!errors.contactPhone}
                helperText={touched.contactPhone && errors.contactPhone}
              />
              <TextField
                fullWidth
                label={t("createUser.contactEmail")}
                onChange={handleChange}
                value={values.contactEmail}
                name="contactEmail"
                error={!!touched.contactEmail && !!errors.contactEmail}
                helperText={touched.contactEmail && errors.contactEmail}
              />
            </Box>
            <Box display="flex" justifyContent="flex-end" mt="20px">
              <Button type="submit" color="secondary" variant="contained" >
                {t("createUser.createButton")}
              </Button>
            </Box>

          </form>

        )}
      </Formik>
      <Box sx={{ height: '20px' }} />


    </Box>
  );
};

export default CreateUser;
