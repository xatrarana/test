const { pbkdf2Sync, randomBytes } = require("crypto");

const getKey = async () => {
  const passphrase =
    "b323f20200b13ea151d2c3c5aa4267dc4e1cb7722c94812626e837bd5ae8ba54"; // Set your passphrase here

  // Generate a key using PBKDF2
  const salt = randomBytes(16); // Generate a random salt
  const iterations = 10000; // Number of iterations
  const keyLength = 32; // Desired key length in bytes

  const derivedKey = pbkdf2Sync(
    passphrase,
    salt,
    iterations,
    keyLength,
    "sha512"
  );
  console.log(derivedKey);
  const key = derivedKey; // Use the derived key directly as buffer

  return key;
};

module.exports = getKey;
