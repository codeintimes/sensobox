
// API Base URL - puede ser configurada mediante variable de entorno
// En producción, se usa REACT_APP_API_URL desde GitHub Secrets
// En desarrollo, usa localhost por defecto
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const API_ORDERS = {
  ORDERS: `${API_BASE_URL}/orders`,

};

const API_USERS = {
    USERS: `${API_BASE_URL}/auth`,

  };

export { API_BASE_URL, API_ORDERS, API_USERS };
