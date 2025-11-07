// localStorage utilities for user data and preferences

export const STORAGE_KEYS = {
  USER: 'stl_user',
  ROLE: 'stl_role',
  THEME: 'stl_theme',
  DOCUMENTS: 'stl_documents',
  TRANSACTIONS: 'stl_transactions',
  VERIFICATION_REQUESTS: 'stl_verification_requests',
};

export const getStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

export const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

export const clearAllStorage = () => {
  Object.values(STORAGE_KEYS).forEach(key => removeStorage(key));
};

// User management
export const setUser = (user) => setStorage(STORAGE_KEYS.USER, user);
export const getUser = () => getStorage(STORAGE_KEYS.USER);
export const clearUser = () => removeStorage(STORAGE_KEYS.USER);

// Role management
export const setRole = (role) => setStorage(STORAGE_KEYS.ROLE, role);
export const getRole = () => getStorage(STORAGE_KEYS.ROLE);
export const clearRole = () => removeStorage(STORAGE_KEYS.ROLE);

// Theme management
export const setTheme = (theme) => setStorage(STORAGE_KEYS.THEME, theme);
export const getTheme = () => getStorage(STORAGE_KEYS.THEME, 'light');

// Documents management
export const getDocuments = () => getStorage(STORAGE_KEYS.DOCUMENTS, []);
export const addDocument = (document) => {
  const documents = getDocuments();
  documents.push(document);
  setStorage(STORAGE_KEYS.DOCUMENTS, documents);
  return documents;
};

// Transactions management
export const getTransactions = () => getStorage(STORAGE_KEYS.TRANSACTIONS, []);
export const addTransaction = (transaction) => {
  const transactions = getTransactions();
  transactions.unshift(transaction); // Add to beginning
  setStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
  return transactions;
};

// Verification requests management
export const getVerificationRequests = () => getStorage(STORAGE_KEYS.VERIFICATION_REQUESTS, []);
export const addVerificationRequest = (request) => {
  const requests = getVerificationRequests();
  requests.push(request);
  setStorage(STORAGE_KEYS.VERIFICATION_REQUESTS, requests);
  return requests;
};
export const updateVerificationRequest = (id, updates) => {
  const requests = getVerificationRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates };
    setStorage(STORAGE_KEYS.VERIFICATION_REQUESTS, requests);
  }
  return requests;
};


