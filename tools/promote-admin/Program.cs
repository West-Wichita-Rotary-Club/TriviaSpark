using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;

// Simple utility to promote a user to admin
// Usage: dotnet run --project promote-admin-tool.csproj username

if (args.Length != 1)
{
    Console.WriteLine("Usage: dotnet run <username>");
    Environment.Exit(1);
}

var username = args[0];
const string connectionString = "Data Source=C:\\websites\\TriviaSpark\\trivia.db";

var optionsBuilder = new DbContextOptionsBuilder<TriviaSparkDbContext>();
optionsBuilder.UseSqlite(connectionString);

using var context = new TriviaSparkDbContext(optionsBuilder.Options);

// Find user
var user = await context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Username == username);
if (user == null)
{
    Console.WriteLine($"User '{username}' not found.");
    Environment.Exit(1);
}

// Find admin role
var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
if (adminRole == null)
{
    Console.WriteLine("Admin role not found.");
    Environment.Exit(1);
}

// Update user role
user.RoleId = adminRole.Id;
await context.SaveChangesAsync();

Console.WriteLine($"User '{username}' has been promoted to Admin role.");
Console.WriteLine($"Current role: {user.Role?.Name ?? adminRole.Name}");
