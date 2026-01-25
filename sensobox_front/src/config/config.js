

// const API_BASE_URL = 'http://ec2-18-144-101-87.us-west-1.compute.amazonaws.com:4000';
const API_BASE_URL = 'http://localhost:4000';

const API_ORDERS = {
  ORDERS: `${API_BASE_URL}/orders`,

};

const API_USERS = {
    USERS: `${API_BASE_URL}/auth`,

  };

export { API_BASE_URL, API_ORDERS, API_USERS };
