export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone) => {
  return /^(\+237|237)?[6-9]\d{8}$/.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password) => {
  if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
  return null;
};

export const validateBudget = (budget) => {
  if (!budget || isNaN(budget)) return 'Montant invalide';
  if (parseInt(budget) < 1000) return 'Le montant minimum est de 1 000 FCFA';
  return null;
};

export const validateRequired = (value, label) => {
  if (!value || value.toString().trim() === '') return `${label} est requis`;
  return null;
};
