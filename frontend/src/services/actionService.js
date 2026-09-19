// import axios from "axios";

// const API_BASE =
//   import.meta.env.VITE_API_BASE_URL || "https://household-sustainability-system.onrender.com/api";

// const ACTION_API = `${API_BASE}/actions`;

// const authConfig = (token, isMultipart = false) => ({
//   headers: {
//     Authorization: `Bearer ${token}`,
//     ...(isMultipart ? { "Content-Type": "multipart/form-data" } : {}),
//   },
// });

// export const getAllActions = async () => {
//   const res = await axios.get(ACTION_API);
//   return res.data;
// };

// export const createAction = async (formData, token) => {
//   const res = await axios.post(ACTION_API, formData, authConfig(token, true));
//   return res.data;
// };

// export const updateAction = async (id, formData, token) => {
//   const res = await axios.put(`${ACTION_API}/${id}`, formData, authConfig(token, true));
//   return res.data;
// };

// export const deleteAction = async (id, token) => {
//   const res = await axios.delete(`${ACTION_API}/${id}`, authConfig(token));
//   return res.data;
// };

// export const likeAction = async (id, token) => {
//   const res = await axios.put(`${ACTION_API}/like/${id}`, {}, authConfig(token));
//   return res.data;
// };

// export const unlikeAction = async (id, token) => {
//   const res = await axios.put(`${ACTION_API}/unlike/${id}`, {}, authConfig(token));
//   return res.data;
// };

// export const addComment = async (id, text, token) => {
//   const res = await axios.post(
//     `${ACTION_API}/comment/${id}`,
//     { text },
//     authConfig(token)
//   );
//   return res.data;
// };

// export const removeComment = async (actionId, commentId, token) => {
//   const res = await axios.delete(
//     `${ACTION_API}/comment/${actionId}/${commentId}`,
//     authConfig(token)
//   );
//   return res.data;
// };

// export const reportAction = async (id, reason, token) => {
//   const res = await axios.post(
//     `${ACTION_API}/report/${id}`,
//     { reason },
//     authConfig(token)
//   );
//   return res.data;
// };


import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://household-sustainability-system.onrender.com/api";

const ACTION_API = `${API_BASE}/actions`;

const authConfig = (token, isMultipart = false) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    ...(isMultipart ? { "Content-Type": "multipart/form-data" } : {}),
  },
});

// ✅ GET ALL
export const getAllActions = async () => {
  const res = await axios.get(ACTION_API);
  return res.data;
};

// ✅ GET FLAGGED (🔥 NEW)
export const getFlaggedActions = async (token) => {
  const res = await axios.get(
    `${ACTION_API}/flagged`,
    authConfig(token)
  );
  return res.data;
};

// ✅ CREATE
export const createAction = async (formData, token) => {
  const res = await axios.post(
    ACTION_API,
    formData,
    authConfig(token, true)
  );
  return res.data;
};

// ✅ UPDATE
export const updateAction = async (id, formData, token) => {
  const res = await axios.put(
    `${ACTION_API}/${id}`,
    formData,
    authConfig(token, true)
  );
  return res.data;
};

// ✅ DELETE
export const deleteAction = async (id, token) => {
  const res = await axios.delete(
    `${ACTION_API}/${id}`,
    authConfig(token)
  );
  return res.data;
};

// ✅ LIKE
export const likeAction = async (id, token) => {
  const res = await axios.put(
    `${ACTION_API}/like/${id}`,
    {},
    authConfig(token)
  );
  return res.data;
};

// ✅ UNLIKE
export const unlikeAction = async (id, token) => {
  const res = await axios.put(
    `${ACTION_API}/unlike/${id}`,
    {},
    authConfig(token)
  );
  return res.data;
};

// ✅ COMMENT
export const addComment = async (id, text, token) => {
  const res = await axios.post(
    `${ACTION_API}/comment/${id}`,
    { text },
    authConfig(token)
  );
  return res.data;
};

// ✅ DELETE COMMENT
export const removeComment = async (actionId, commentId, token) => {
  const res = await axios.delete(
    `${ACTION_API}/comment/${actionId}/${commentId}`,
    authConfig(token)
  );
  return res.data;
};

// ✅ REPORT
export const reportAction = async (id, reason, token) => {
  const res = await axios.post(
    `${ACTION_API}/report/${id}`,
    { reason },
    authConfig(token)
  );
  return res.data;
};