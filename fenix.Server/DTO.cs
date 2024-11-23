using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.ComponentModel.DataAnnotations;
using static fenix.Server.DTO.BookmarkRespons;
using static fenix.Server.DTO.GitHubResponse;

namespace fenix.Server
{
    public class DTO
    {
        public class User
        {
            [Key]
            public string Email { get; set; }
            public string Password { get; set; }
            public string? HashedPassword { get; set; }
            public string? Salt { get; set; }
        }

        public class Bookmark 
        {
            [Key]
            public int UserId { get; set; }
            
            public int GitHubResponseRepositoryId { get; set; }
        }
        public class UserDbContext : DbContext
        {
            public UserDbContext(DbContextOptions<UserDbContext> options) : base(options) { }

            public DbSet<User> Users { get; set; }
            protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
            {
                if (!optionsBuilder.IsConfigured)
                {
                    optionsBuilder.UseSqlServer("FenixConnection");
                }
                base.OnConfiguring(optionsBuilder);
            }

            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                modelBuilder.Entity<User>()
                    .HasIndex(u => u.Email)
                    .IsUnique();
                base.OnModelCreating(modelBuilder);
            }
        }

        public class RepositoryDbContext : DbContext
        {
            public RepositoryDbContext(DbContextOptions<RepositoryDbContext> options) : base(options) { }
            public DbSet<GitHubResponse.Repository> Repository { get; set; }
            protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
            {
                if (!optionsBuilder.IsConfigured)
                {
                    optionsBuilder.UseSqlServer("FenixConnection");
                }
                base.OnConfiguring(optionsBuilder);
            }

            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                modelBuilder.Entity<GitHubResponse.Repository>()
                    .HasIndex(u => u.Id)
                    .IsUnique();
                base.OnModelCreating(modelBuilder);
            }
        }
        public class BookmarkDbContext : DbContext
        {
            public BookmarkDbContext(DbContextOptions<BookmarkDbContext> options) : base(options) { }
            public DbSet<Bookmark> Bookmark { get; set; }
            protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
            {
                if (!optionsBuilder.IsConfigured)
                {
                    optionsBuilder.UseSqlServer("FenixConnection");
                }
            }
        }
        public class ServerResponse<T>
        {
            public required bool Success { get; set; }
            public ErrorMessage[]? Errors { get; set;}
            public required Guid Hash { get; set; } = new ();
            public T? Data { get; set; }

        }
        public class ErrorMessage
        {
            public int Code { get; set; }
            public required string Message { get; set; }
        }
  
        public class Login
        {
            public required string Email { get; set; }
            public required string Password { get; set; }
        }
        public class BookmarkRespons
        {
            public required GitHubResponse.Repository[] Bookmarks { get; set; }
        }
        public class LoginResponse
        {
            public required string AccessToken { get; set; }
            public required string RefreshToken { get; set; }
            public required DateTime RefreshTokenExpiry { get; set; }

        }
        public class RefreshTokenRequest
        {
            public string AccessToken { get; set; }
            public string RefreshToken { get; set; }
        }
        public class GitHubResponse
        {
            public int Total_count { get; set; }
            public bool IncompleteResults { get; set; }
            public List<Repository> items { get; set; }

            public class Repository
            {
                [Key]
                public long Id { get; set; }
                public string Full_name { get; set; }
                public Owner Owner { get; set; }

            }
            public class Owner
            {
                [Key]
                public long Id { get; set; }
                public string Avatar_url { get; set; }
            }
        }

    }
}
