using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.Security.Cryptography;
using System.Text;

public static class PasswordHasher
{
    private const int SaltSize = 128 / 8; // 128 bits (16 bytes)
    private const int IterationCount = 100000; // Adjustable based on security needs
    private const int KeyDerivationLength = 256 / 8; // 256 bits (32 bytes)

    public static (string HashedPassword, string Salt) HashPassword(string password)
    {
        // Generate a random salt
        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);

        // Derive a secure key from the password and salt
        string hashedPassword = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: IterationCount,
            numBytesRequested: KeyDerivationLength));

        return (hashedPassword, Convert.ToBase64String(salt));
    }

    public static bool VerifyPassword(string password, string storedHashedPassword, string storedSalt)
    {
        byte[] salt = Convert.FromBase64String(storedSalt);

        string newHashedPassword = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: IterationCount,
            numBytesRequested: KeyDerivationLength));

        return storedHashedPassword == newHashedPassword;
    }
}