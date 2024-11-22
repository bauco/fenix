using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static fenix.Server.DTO;
using Microsoft.AspNetCore.Authorization;

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
        public IActionResult Bookmark([FromBody] GitHubResponse.Item repo)
        {
            if (repo == null)
            {
                return BadRequest("repo is missing");
            }
            var sessionBookmarks = HttpContext.Session.GetString("Bookmarks");
            List<GitHubResponse.Item> bookmarks;
            if (sessionBookmarks == null)
            {
                bookmarks = new List<GitHubResponse.Item>();
            }
            else
            {
                bookmarks = JsonConvert.DeserializeObject<List<GitHubResponse.Item>>(sessionBookmarks) ?? new List<GitHubResponse.Item>();
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
            HttpContext.Session.SetString("Bookmarks", JsonConvert.SerializeObject(bookmarks));
            return Ok(bookmarks);
        }
        [HttpGet(Name = "Bookmark")]
        public IActionResult Bookmarks()
        {
            var sessionBookmarks = HttpContext.Session.GetString("Bookmarks");
            List<GitHubResponse.Item> bookmarks;
            if (sessionBookmarks == null)
            {
                bookmarks = new List<GitHubResponse.Item>();
            }
            else
            {
                bookmarks = JsonConvert.DeserializeObject<List<GitHubResponse.Item>>(sessionBookmarks) ?? new List<GitHubResponse.Item>();
            }
            return Ok(bookmarks);
        }
    }
}

