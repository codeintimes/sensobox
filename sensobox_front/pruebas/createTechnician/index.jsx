import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";



const getUserById = (id) => {

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
  const [initialValues, setInitialValues] = useState(null);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  useEffect(() => {
    if (id) {
      const userData = getUserById(id);
      setInitialValues(userData);
    }
  }, [id]);


  if (!initialValues) return null;

  return (
    <Box m="20px">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          onSubmit(values);
          setSubmitting(false);
        }}
      >
        {/* La estructura del formulario y campos aquí */}
      </Formik>
    </Box>
  );
};

export default Form;
