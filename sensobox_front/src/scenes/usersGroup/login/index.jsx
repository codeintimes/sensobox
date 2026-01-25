import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box, Button, TextField, Container, Paper, Typography, InputAdornment, IconButton } from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Header from '../../../components/Header';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { API_USERS } from "../../../config/config";
import axios from 'axios';



const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const { t } = useTranslation();

  const handleLoginSubmit = async (values, { setSubmitting }) => {
    console.log(values);
    console.log('API URL:', API_USERS.USERS);
    setSubmitting(true);
  
    // Construct the login URL using the current URL scheme
    const loginUrl = `${API_USERS.USERS}/login`;
  
    console.log('Login URL:', loginUrl);
  
    try {
      // No enviar JWT en el login, solo las credenciales
      const response = await axios.post(loginUrl, values, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Login response:', response.data);
  
      const data = response.data;
  
      if (data.token) {
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setIsAuthenticated(true);
        console.log("User data saved:", JSON.stringify(data.user))
  
        const role = data.user.role;
  
        if (role === 'admin') {
          navigate("/");
        } else if (role === 'technician') {
          navigate("/ordersTechnician");
        } else {
          navigate("/ordersClient");
        }
      } else {
        throw new Error('Authentication failed!');
      }
    } catch (error) {
      console.error("Error during login:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: loginUrl
      });
      setOpen(true);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage: 'url("https://img.freepik.com/fotos-premium/vista-superior-fondo-caja-carton-marron-vacia-abierta_293060-9462.jpg")', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Header title={t('login.title')} subtitle={t('login.subtitle')} />
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={yup.object({
              email: yup.string().email(t('login.email_error')).required(t('login.email_required')),
              password: yup.string().required(t('login.password_required')).min(8, t('login.password_min')),
            })}
            onSubmit={handleLoginSubmit}
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit}>
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={t('login.email_label')}
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon /></InputAdornment>), style: { backgroundColor: theme.palette.background.paper } }}
                    InputLabelProps={{ style: { color: theme.palette.text.primary } }}
                  />
                  <TextField
                    fullWidth
                    variant="outlined"
                    label={t('login.password_label')}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            style={{ color: theme.palette.text.secondary }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      style: { backgroundColor: theme.palette.background.paper } 
                    }}
                    InputLabelProps={{ style: { color: theme.palette.text.primary } }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    style={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}
                  >
                    {t('login.login_button')}
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Paper>
      </Container>

      {/* Popup Dialog for Login Error */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{
        style: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary
        }
      }}>
        <DialogTitle style={{ color: theme.palette.secondary.main }}>{t('popUp.login_error_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ color: theme.palette.text.secondary }}>
            {t('popUp.incorrect_password')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} style={{ color: theme.palette.secondary.main }}>
            {t('popUp.close_button')}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default Login;
