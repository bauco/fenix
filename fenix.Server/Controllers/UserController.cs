using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static fenix.Server.DTO;

namespace fenix.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public UserController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost(Name = "User")]
        public IActionResult User(Login login)
        {
            try
            {
                if (string.IsNullOrEmpty(login.Email) ||
                string.IsNullOrEmpty(login.Password))
                {
                    return BadRequest("Email and/or Password not specified");
                }

                SymmetricSecurityKey secretKey = new (Encoding.UTF8.GetBytes(_configuration["Authentication:SecretKey"]));
                SigningCredentials signinCredentials = new (secretKey, SecurityAlgorithms.HmacSha256);
                JwtSecurityToken jwtSecurityToken = new (
                    issuer: _configuration["Authentication:ValidIssuer"],
                    audience: _configuration["Authentication:ValidAudience"],
                    claims:
                    [
                        new Claim(ClaimTypes.Email, login.Email),
                    ],
                    expires: DateTime.Now.AddMinutes(10),
                    signingCredentials: signinCredentials
                );
                ServerResponse<LoginResponse> response = new()
                {
                    data = new() { Token = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken) },
                    hash = new Guid(),
                    success = true
                };

                return Ok( response);
            }
            catch(Exception ex)
            {
                return BadRequest("An error occurred in generating the token err: " + ex.Message);
            }
        }
    }
}

