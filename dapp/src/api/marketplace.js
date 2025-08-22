import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

export const getSmartAccount = async (eoa) => {
  const res = await axios.get(`${API_BASE}/marketplace/smart-account`, { params: { eoa }, withCredentials: true });
  return res.data;
};

export const getSmartAccountPredict = async (eoa) => {
  const res = await axios.get(`${API_BASE}/marketplace/smart-account/predict`, { params: { eoa }, withCredentials: true });
  return res.data;
};

export const getAxcBalance = async (address) => {
  const res = await axios.get(`${API_BASE}/marketplace/balance`, { params: { address }, withCredentials: true });
  return res.data;
};

export const getListing = async (tokenId) => {
  const res = await axios.get(`${API_BASE}/marketplace/listing/${tokenId}`, { withCredentials: true });
  return res.data;
};

export const listNFT = async (tokenId, price, password) => {
  const res = await axios.post(`${API_BASE}/marketplace/list`, { tokenId, price, password }, { withCredentials: true });
  return res.data;
};

export const cancelListing = async (tokenId, password) => {
  const res = await axios.post(`${API_BASE}/marketplace/cancel`, { tokenId, password }, { withCredentials: true });
  return res.data;
};

export const buyNFT = async (tokenId, password) => {
  const res = await axios.post(`${API_BASE}/marketplace/buy`, { tokenId, password }, { withCredentials: true });
  return res.data;
};

export const getEthBalance = async (address) => {
  const res = await axios.get(`${API_BASE}/marketplace/eth-balance`, { params: { address }, withCredentials: true });
  return res.data;
}; 