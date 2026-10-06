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
import { SensoboxLogo } from '../../global/Sidebar';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../../components/LanguageSelector';
import { API_USERS } from "../../../config/config";
import axios from 'axios';



const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [errorKey, setErrorKey] = React.useState('popUp.incorrect_password');
  const [showPassword, setShowPassword] = React.useState(false);
  const { t } = useTranslation();

  const handleLoginSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
  
    // Construct the login URL using the current URL scheme
    const loginUrl = `${API_USERS.USERS}/login`;
  
    try {
      // No enviar JWT en el login, solo las credenciales
      const response = await axios.post(loginUrl, values, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const data = response.data;
  
      if (data.token) {
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setIsAuthenticated(true);
  
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
      setErrorKey(error.response?.status === 401 ? 'popUp.incorrect_password' : 'popUp.connection_error');
      setOpen(true);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="sb-login" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 16px', boxSizing: 'border-box', background: 'radial-gradient(900px 520px at 85% -10%, rgba(99,102,241,.22), transparent 60%), radial-gradient(700px 480px at -10% 110%, rgba(16,185,129,.14), transparent 60%), #F3F4F8' }}>
      <Container component="main" maxWidth="xs" disableGutters>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb="22px"><SensoboxLogo size={40} /><LanguageSelector compact /></Box>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'stretch', borderRadius: '18px', border: '1px solid #E5E7EB', boxShadow: '0 20px 50px -24px rgba(17,24,39,.25)' }}>
          <Header title={t("login.title")} subtitle={t("app.tagline")} />
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
                            aria-label={t("login.togglePassword")}
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
                    
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    style={{ backgroundColor: '#4F46E5', color: '#fff', height: 46, fontSize: 15, borderRadius: 10 }}
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
            {t(errorKey)}
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
