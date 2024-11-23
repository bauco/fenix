namespace fenix.Server.Middelware
{
    public class TokenExpirationMiddleware
    {
        private readonly RequestDelegate _next;

        public TokenExpirationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var response = context.Response;

            await _next(context);
            if (response.Headers.TryGetValue("WWW-Authenticate", out var authHeaderValues))
            {
                foreach (var authHeader in authHeaderValues)
                {
                    if (authHeader.Contains("Bearer") && authHeader.Contains("invalid_token"))
                    {
                        if (authHeader.Contains("The token expired"))
                        {
                            await RefreshTokenAsync();
                            break;
                        }
                    }
                }
            }
        }

        private async Task RefreshTokenAsync()
        {
            Console.WriteLine("Token has expired. Refreshing...");
            await Task.CompletedTask;
        }
    }

}
