using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;
using static fenix.Server.DTO;
namespace fenix.Server.Controllers
{
    [Authorize]

    [ApiController]
    [Route("[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly ILogger<SearchController> _logger;
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;

        public SearchController(ILogger<SearchController> logger, HttpClient httpClient, IMemoryCache cache)
        {
            _logger = logger;
            _httpClient = httpClient;
            _cache = cache;

        }
        [HttpGet(Name = "Search")]
        public async Task<ActionResult<string>> Search([FromQuery] string query, [FromQuery] string page, [FromQuery] string per_page)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                _logger.LogError("Query parameter 'q' is required.");
                return BadRequest(new
                {
                    message = "Query parameter 'q' is required.",
                    status = 400
                });
            }
            if (string.IsNullOrWhiteSpace(per_page) || int.Parse(per_page) > 1000)
            {
                return BadRequest(new
                {
                    message = "Parameter 'per_page' must be less than or equal to 1000.",
                    status = 400
                });
            }
            try
            {
                // get next page for faster result from cache 
                _ = FetchGitHubPageAsync(query, int.Parse(page) + 1, int.Parse(per_page));
                GitHubResponse response = await FetchGitHubPageAsync(query, int.Parse(page), int.Parse(per_page));
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError("An unexpected error occurred.");
                return StatusCode(500, new
                {
                    message = "An unexpected error occurred.",
                    details = ex.Message,
                    status = 500
                });
            }
        }

        private async Task<GitHubResponse?> FetchGitHubPageAsync(string query, int page, int perPage)
        {
            string cacheKey = $"{query}_{page}_{perPage}";
            if (_cache.TryGetValue(cacheKey, out GitHubResponse cachedData))
            {
                return cachedData;
            }

            var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.github.com/search/repositories?q={query}&page={page}&per_page={perPage}");
            request.Headers.Add("User-Agent", "your_application_name");  // Replace with your app name
            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception(response.ToString());
            }
            var content = await response.Content.ReadAsStringAsync();
            GitHubResponse response1 = JsonSerializer.Deserialize<GitHubResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            _cache.Set(cacheKey, response1, new MemoryCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromMinutes(5)
            });
            return response1;

        }
    }
}

