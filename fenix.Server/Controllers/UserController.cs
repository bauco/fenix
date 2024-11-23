using Azure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using static fenix.Server.DTO;

namespace fenix.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly UserDbContext _context;

        public UserController(IConfiguration configuration, UserDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup(User user)
        {
            try
            {
                if (string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Password))
                {
                    ServerResponse<LoginResponse> res = new()
                    {
                        Success = false,
                        Hash = Guid.NewGuid(),
                        Errors = [
                            new ErrorMessage(){
                                Message="Email and/or Password not specified",
                            }
                        ]
                    };
                    return BadRequest(res);
                }
                // Check if user already exists
                if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                {
                    ServerResponse<LoginResponse> res = new()
                    {
                        Success = false,
                        Hash = Guid.NewGuid(),
                        Errors = [
                            new ErrorMessage(){
                                Message="User with email '" + user.Email + "' already exists",
                            }
                        ]
                    };
                    return BadRequest(res);
                }

                (user.HashedPassword, user.Salt) = PasswordHasher.HashPassword(user.Password);
                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                string accessToken = new JwtSecurityTokenHandler().WriteToken(this.GenrateToken(user));
                ServerResponse<LoginResponse> response = new()
                {
                    Data = new() {
                        AccessToken = accessToken,
                        RefreshToken = new JwtSecurityTokenHandler().WriteToken(this.GenerateRefreshToken(user, accessToken)),
                        RefreshTokenExpiry = DateTime.Now.AddDays(7)
                    },
                    Success = true,
                    Hash = Guid.NewGuid()
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest("An error occurred: " + ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(Login login)
        {
            try
            {
                if (string.IsNullOrEmpty(login.Email) || string.IsNullOrEmpty(login.Password))
                {
                    ServerResponse<LoginResponse> res = new()
                    {
                        Success = false,
                        Hash = Guid.NewGuid(),
                        Errors = [
                            new ErrorMessage(){
                                Message="Email and/or Password not specified",
                            }
                        ]
                    };

                    return BadRequest(res);
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == login.Email);
                if (user == null || !PasswordHasher.VerifyPassword(login.Password, user.HashedPassword, user.Salt))
                {
                    ServerResponse<LoginResponse> res = new()
                    {
                        Success = false,
                        Hash = Guid.NewGuid(),
                        Errors = [
                            new ErrorMessage(){
                                Message=("Invalid email or password"),
                            }
                        ]
                    };
                    return Unauthorized(res);
                }
                string accessToken = new JwtSecurityTokenHandler().WriteToken(this.GenrateToken(user));
                ServerResponse<LoginResponse> response = new()
                {
                    Data = new()
                    {
                        AccessToken = accessToken,
                        RefreshToken = new JwtSecurityTokenHandler().WriteToken(this.GenerateRefreshToken(user, accessToken)),
                        RefreshTokenExpiry = DateTime.Now.AddDays(7)
                    },
                    Success = true,
                    Hash = Guid.NewGuid()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest("An error occurred: " + ex.Message);
            }
        }
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshTokenAsync([FromBody] string refreshToken)
        {
            if (!ValidateRefreshToken(refreshToken, out JwtSecurityToken embeddedAccessToken))
            {
                return Unauthorized(new { message = "Invalid or expired refresh token" });
            }
            var userEmail = embeddedAccessToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                ServerResponse<LoginResponse> res = new()
                {
                    Success = false,
                    Hash = Guid.NewGuid(),
                    Errors = [
                        new ErrorMessage(){
                                Message=("User not found in the token"),
                            }
                    ]
                };
                return Unauthorized(new { message = "User not found in the token" });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (user == null)
            {
                ServerResponse<LoginResponse> res = new()
                {
                    Success = false,
                    Hash = Guid.NewGuid(),
                    Errors = [
                        new ErrorMessage(){
                            Message=("Invalid email User not found"),
                        }
                    ]
                };
                return Unauthorized(res);
            }

            // Generate new access and refresh tokens
            var newAccessToken = new JwtSecurityTokenHandler().WriteToken(this.GenrateToken(user));
            var newRefreshToken = GenerateRefreshToken(user, newAccessToken);

            return Ok(new
            {
                AccessToken = newAccessToken,
                RefreshToken = new JwtSecurityTokenHandler().WriteToken(newRefreshToken),
                RefreshTokenExpiry = newRefreshToken.ValidTo
            });
        }

        private JwtSecurityToken GenrateToken(User user)
        {
            SymmetricSecurityKey secretKey = new(Encoding.UTF8.GetBytes(_configuration["Authentication:SecretKey"]));
            SigningCredentials signinCredentials = new(secretKey, SecurityAlgorithms.HmacSha256);

            return new(
                issuer: _configuration["Authentication:ValidIssuer"],
                audience: _configuration["Authentication:ValidAudience"],
                claims: new[]
                {
                    new Claim(ClaimTypes.Email, user.Email),
                },
                expires: DateTime.Now.AddMinutes(10),
                signingCredentials: signinCredentials
            );
        }
        private JwtSecurityToken GenerateRefreshToken(User user, string token)
        {
            SymmetricSecurityKey secretKey = new(Encoding.UTF8.GetBytes(_configuration["Authentication:SecretKey"]));
            SigningCredentials signinCredentials = new(secretKey, SecurityAlgorithms.HmacSha256);

            return new(
                issuer: _configuration["Authentication:ValidIssuer"],
                audience: _configuration["Authentication:ValidAudience"],
                claims: new[]
                {
                    new Claim(ClaimTypes.Name,token),
                    new Claim(ClaimTypes.Email, user.Email),
                },
                expires: DateTime.Now.AddDays(7),
                signingCredentials: signinCredentials
            );
        }
        private bool ValidateRefreshToken(string refreshToken, out JwtSecurityToken embeddedAccessToken)
        {
            embeddedAccessToken = null;

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var principal = tokenHandler.ValidateToken(
                    refreshToken,
                    new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = _configuration["Authentication:ValidIssuer"],
                        ValidAudience = _configuration["Authentication:ValidAudience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Authentication:SecretKey"]))
                    },
                    out SecurityToken validatedToken
                );
                var embeddedTokenRaw = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

                if (string.IsNullOrEmpty(embeddedTokenRaw))
                    return false;
                embeddedAccessToken = tokenHandler.ReadJwtToken(embeddedTokenRaw);
                if (embeddedAccessToken.ValidTo > DateTime.UtcNow)
                    return true;

                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }

    }
}
