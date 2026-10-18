// Planifica · llamadas al backend de Sensobox
import axios from "axios";
import { API_BASE_URL } from "../../config/config";

const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("jwtToken")}` } });
const base = `${API_BASE_URL}/planning`;

export const getPlan = (from, days) => axios.get(`${base}/plan`, { ...auth(), params: { from, days } }).then((r) => r.data);
export const getLoad = (days) => axios.get(`${base}/load`, { ...auth(), params: { days } }).then((r) => r.data);
export const getMaster = () => axios.get(`${base}/master`, auth()).then((r) => r.data);
export const replan = () => axios.post(`${base}/replan`, {}, auth()).then((r) => r.data);
export const moveOp = (id, body) => axios.patch(`${base}/operations/${id}`, body, auth()).then((r) => r.data);
export const unlockOp = (id) => axios.post(`${base}/operations/${id}/unlock`, {}, auth()).then((r) => r.data);
export const simulate = (body) => axios.post(`${base}/simulate`, body, auth()).then((r) => r.data);
export const confirmUrgent = (body) => axios.post(`${base}/simulate/confirm`, body, auth()).then((r) => r.data);
export const linkOrder = (id, body) => axios.post(`${base}/orders/${id}/link`, body, auth()).then((r) => r.data);
export const updateOrder = (id, body) => axios.patch(`${base}/orders/${id}`, body, auth()).then((r) => r.data);
export const updateResource = (code, body) => axios.patch(`${base}/resources/${code}`, body, auth()).then((r) => r.data);
export const updateCalendar = (code, body) => axios.patch(`${base}/calendars/${code}`, body, auth()).then((r) => r.data);
export const errorText = (e, t) => e?.response?.data?.message || t("planifica.errors.generic");
