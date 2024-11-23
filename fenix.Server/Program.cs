using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Text;
using static fenix.Server.DTO;

var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
builder.Services.AddDbContext<UserDbContext>(options =>
{
#if DEBUG
    options.UseSqlite("Data Source=UserDb_Local.db"); // SQLite for debugging
#else
    options.UseSqlServer(builder.Configuration.GetConnectionString("FenixConnection")); // SQL Server for production
#endif
});

builder.Services.AddDbContext<BookmarkDbContext>(options =>
{
#if DEBUG
    options.UseSqlite("Data Source=BookmarkDb_Local.db"); // SQLite for debugging
#else
    options.UseSqlServer(builder.Configuration.GetConnectionString("FenixConnection")); // SQL Server for production
#endif
});

builder.Services.AddDbContext<RepositoryDbContext>(options =>
{
#if DEBUG
    options.UseSqlite("Data Source=RepositoryDb_Local.db"); // SQLite for debugging
#else
    options.UseSqlServer(builder.Configuration.GetConnectionString("FenixConnection")); // SQL Server for production
#endif
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "Fenix", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});
builder.Services.AddHttpClient();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
builder.Services.AddMemoryCache();
builder.Services.AddDistributedMemoryCache();
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["Authentication:SecretKey"]!)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidIssuer =builder.Configuration["Authentication:ValidIssuer"],
            ValidAudience = builder.Configuration["Authentication:ValidAudience"],
            RequireAudience = false
        };
    }
);
builder.Services.AddAuthorization();
builder.Services.AddDbContext<BookmarkDbContext>(options =>
{
#if DEBUG
    options.UseSqlite("Data Source=local.db");
#else
    options.UseSqlServer(builder.Configuration.GetConnectionString("FenixConnection")));
#endif
});

var app = builder.Build();

app.UseSession();
app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
