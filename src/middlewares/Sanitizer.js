function sanitizeName(name) {
  return new Promise((resolve) => {
    const trimmedName = name.trim();
    const sanitizedName = trimmedName.replace(/\s+/g, " ");
    const regex = /^[a-zA-Z- ]+$/;
    const sanitized = regex.test(sanitizedName) ? sanitizedName : "";
    resolve(sanitized);
  });
}

function sanitizeEmail(email) {
  return new Promise((resolve) => {
    const trimmedEmail = email.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = regex.test(trimmedEmail) ? trimmedEmail : "";
    resolve(sanitized);
  });
}

module.exports = {
  sanitizeEmail,
  sanitizeName,
};
