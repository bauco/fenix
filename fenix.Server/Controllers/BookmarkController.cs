using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static fenix.Server.DTO;
using Microsoft.AspNetCore.Authorization;
using static fenix.Server.DTO.BookmarkRespons;

namespace fenix.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class BookmarkController : ControllerBase
    {
        private readonly IConfiguration _configuration;


        public BookmarkController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost(Name = "Bookmark")]
        public IActionResult Bookmark([FromBody] GitHubResponse.Repository repo)
        {
            if (repo == null)
            {
                ServerResponse<GitHubResponse.Repository[]> response = new()
                {

                    Success = false,
                    Hash = Guid.NewGuid()
                };
                return BadRequest("repo is missing");
            }
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            int userId = userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
            string? sessionBookmarks = HttpContext.Session.GetString("Bookmarks" + userId);
            List<GitHubResponse.Repository> bookmarks;
            if (sessionBookmarks == null)
            {
                bookmarks = [];
            }
            else
            {
                bookmarks = JsonConvert.DeserializeObject<List<GitHubResponse.Repository>>(sessionBookmarks);
            }

            var existingBookmark = bookmarks.FirstOrDefault(b => b.Id == repo.Id);

            if (existingBookmark != null)
            {
                bookmarks.Remove(existingBookmark);
            }
            else
            {
                bookmarks.Add(repo);
            }
            HttpContext.Session.SetString("Bookmarks" + userId, JsonConvert.SerializeObject(bookmarks));

            Bookmark[] bookmarksArray = bookmarks.Select(b => new Bookmark
            {
                UserId = userId,
                GitHubResponseRepositoryId = (int)b.Id
            }).ToArray();

            ServerResponse<GitHubResponse.Repository[]> res = new()
            {
                Success = true,
                Hash = Guid.NewGuid(),
                Data =  bookmarks.ToArray()
                
            };

            return Ok(res);
        }
        [HttpGet(Name = "Bookmark")]
        public IActionResult Bookmarks()
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            int userId = userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;

            var sessionBookmarks = HttpContext.Session.GetString("Bookmarks" + +userId);
            List<GitHubResponse.Repository> bookmarks;
            if (sessionBookmarks == null)
            {
                bookmarks = new List<GitHubResponse.Repository>();
            }
            else
            {
                bookmarks = JsonConvert.DeserializeObject<List<GitHubResponse.Repository>>(sessionBookmarks) ?? new List<GitHubResponse.Repository>();
            }
            ServerResponse<GitHubResponse.Repository[]> res = new()
            {
                Success = true,
                Hash = Guid.NewGuid(),
                Data = bookmarks.ToArray()
            };
            return Ok(res);
        }
    }
}

