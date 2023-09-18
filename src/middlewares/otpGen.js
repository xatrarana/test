function generateUniqueToken(length) {
  return new Promise((resolve, reject) => {
    const characters = "0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters.charAt(randomIndex);
    }
    resolve(token);
  });
}

module.exports = generateUniqueToken;
