// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Box, Button, TextField, Container, Paper, Typography, InputAdornment } from '@mui/material';
// import { Formik } from 'formik';
// import * as yup from 'yup';
// import EmailIcon from '@mui/icons-material/Email';
// import LockIcon from '@mui/icons-material/Lock';
// import Header from '../../components/Header';
// import { useTheme } from '@mui/material/styles';
// import {API_USERS} from "../config/config";
// const Login = ({ setIsAuthenticated }) => {
//   const navigate = useNavigate();
//   const theme = useTheme();

//   const handleLoginSubmit = async (values, { setSubmitting }) => {
//     setSubmitting(true);
  

//     const loginUrl = `${API_USERS.USERS}/login`;
  
//     try {
//       const jwt = localStorage.getItem("jwtToken")

//       const response = await fetch(loginUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${jwt}`
//         },
//         body: JSON.stringify(values),
//       });
  
//       const data = await response.json();
//       if (data.token) {
//         localStorage.setItem('jwtToken', data.token);
//         localStorage.setItem('userData', JSON.stringify({ userId: data.userId, email: data.email, role: data.role }));
//         setIsAuthenticated(true);
//         navigate("/");
//       } else {
//         throw new Error('Authentication failed!');
//       }
//     } catch (error) {
//       console.error("Error during login:", error);
//       setIsAuthenticated(false);
//     } finally {
//       setSubmitting(false);
//     }
//   };  

//   return (
//     <div style={{
//       minHeight: '100vh',
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundImage: 'url("https:
//       backgroundRepeat: 'no-repeat',
//       backgroundSize: 'cover',
//       backgroundPosition: 'center',
//     }}>
//       <Container component="main" maxWidth="xs">
//         <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//           <Header title="USER LOGIN" subtitle="Access Your Account" />
//           <Formik
//             initialValues={{
//               email: '',
//               password: '',
//             }}
//             validationSchema={yup.object({
//               email: yup.string().email('Invalid email address').required('Required'),
//               password: yup.string().required('Required').min(8, 'Password must be at least 8 characters long'),
//             })}
//             onSubmit={handleLoginSubmit}
//           >
//             {(formik) => (
//               <form onSubmit={formik.handleSubmit}>
//                 <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2, }}>
//                   <TextField
//                     fullWidth
//                     variant="outlined"
//                     label="Email Address"
//                     name="email"
//                     type="email"
//                     value={formik.values.email}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={formik.touched.email && Boolean(formik.errors.email)}
//                     helperText={formik.touched.email && formik.errors.email}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <EmailIcon />
//                         </InputAdornment>
//                       ),
//                       style: { backgroundColor: theme.palette.background.paper },
//                     }}
//                     InputLabelProps={{
//                       style: { color: theme.palette.text.primary },
//                     }}
//                   />
//                   <TextField
//                     fullWidth
//                     variant="outlined"
//                     label="Password"
//                     name="password"
//                     type="password"
//                     value={formik.values.password}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                     error={formik.touched.password && Boolean(formik.errors.password)}
//                     helperText={formik.touched.password && formik.errors.password}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <LockIcon />
//                         </InputAdornment>
//                       ),
//                       style: { backgroundColor: theme.palette.background.paper },
//                     }}
//                     InputLabelProps={{
//                       style: { color: theme.palette.text.primary },
//                     }}
//                   />
//                   <Button
//                     type="submit"
//                     fullWidth
//                     variant="contained"
//                     sx={{ mt: 3, mb: 2 }}
//                     style={{
//                       backgroundColor: theme.palette.primary.main,
//                       color: theme.palette.primary.contrastText,
//                     }}
//                   >
//                     Log In
//                   </Button>
//                 </Box>
//               </form>
//             )}
//           </Formik>
//         </Paper>
//       </Container>
//     </div>
//   );
// };

// export default Login;
