namespace fenix.Server
{
    public class DTO
    {
        public class ServerResponse<T> {
            public required bool success { get; set; }
            public ErrorMessage[] errors { get; set;}
            public required Guid hash { get; set; }
            public required T data { get; set; }

        }
        public class ErrorMessage
        {
            public int Code { get; set; }
            public required string Message { get; set; }
            public required string Description { get; set; }
        }
  
        public class Login
        {
            public required string Email { get; set; }
            public required string Password { get; set; }
        }
        public class LoginResponse
        {
            
            public required string Token { get; set; }
        }
        public class GitHubResponse
        {
            public int Total_count { get; set; }
            public bool IncompleteResults { get; set; }
            public List<Item> Items { get; set; }

            public class Item
            {
                public long Id { get; set; }
                public string Full_name { get; set; }
                public Owner Owner { get; set; }

            }
            public class Owner
            {
                public string Avatar_url { get; set; }
            }
        }

    }
}
