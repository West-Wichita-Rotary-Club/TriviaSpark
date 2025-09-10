using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using EntityUser = TriviaSpark.Api.Data.Entities.User;
using EntityRole = TriviaSpark.Api.Data.Entities.Role;

namespace TriviaSpark.Api.Services.EfCore;

public class EfCoreAdminService : IAdminService
{
    private readonly TriviaSparkDbContext _context;
    private readonly ILogger<EfCoreAdminService> _logger;

    public EfCoreAdminService(TriviaSparkDbContext context, ILogger<EfCoreAdminService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<EntityUser>> GetAllUsersAsync()
    {
        return await _context.Users
            .Include(u => u.Role)
            .OrderBy(u => u.Username)
            .ToListAsync();
    }

    public async Task<EntityUser?> GetUserByIdAsync(string id)
    {
        return await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<EntityUser> CreateUserAsync(CreateUserRequest request)
    {
        // Get default user role if no role specified
        var roleId = request.RoleId;
        if (string.IsNullOrEmpty(roleId))
        {
            var userRole = await GetRoleByNameAsync("User");
            roleId = userRole?.Id ?? throw new InvalidOperationException("Default User role not found");
        }

        var user = new EntityUser
        {
            Id = Guid.NewGuid().ToString(),
            Username = request.Username,
            Email = request.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            RoleId = roleId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        return await GetUserByIdAsync(user.Id) ?? user;
    }

    public async Task<EntityUser?> UpdateUserAsync(string id, UpdateUserRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return null;

        if (!string.IsNullOrEmpty(request.Username)) user.Username = request.Username;
        if (!string.IsNullOrEmpty(request.Email)) user.Email = request.Email;
        if (!string.IsNullOrEmpty(request.FullName)) user.FullName = request.FullName;
        if (!string.IsNullOrEmpty(request.RoleId)) user.RoleId = request.RoleId;

        await _context.SaveChangesAsync();
        return await GetUserByIdAsync(id);
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<EntityUser?> ChangeUserRoleAsync(string userId, string roleId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        var role = await _context.Roles.FindAsync(roleId);
        if (role == null) return null;

        user.RoleId = roleId;
        await _context.SaveChangesAsync();
        return await GetUserByIdAsync(userId);
    }

    public async Task<EntityUser?> PromoteToAdminAsync(string userId)
    {
        var adminRole = await GetRoleByNameAsync("Admin");
        if (adminRole == null)
        {
            throw new InvalidOperationException("Admin role not found. Please ensure default roles are created.");
        }

        return await ChangeUserRoleAsync(userId, adminRole.Id);
    }

    public async Task<IEnumerable<EntityRole>> GetAllRolesAsync()
    {
        return await _context.Roles
            .Include(r => r.Users)
            .OrderBy(r => r.Name)
            .ToListAsync();
    }

    public async Task<EntityRole?> GetRoleByIdAsync(string id)
    {
        return await _context.Roles
            .Include(r => r.Users)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<EntityRole?> GetRoleByNameAsync(string name)
    {
        return await _context.Roles
            .Include(r => r.Users)
            .FirstOrDefaultAsync(r => r.Name == name);
    }

    public async Task<EntityRole> CreateRoleAsync(CreateRoleRequest request)
    {
        var role = new EntityRole
        {
            Id = Guid.NewGuid().ToString(),
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();
        
        return role;
    }

    public async Task<EntityRole?> UpdateRoleAsync(string id, UpdateRoleRequest request)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null) return null;

        if (!string.IsNullOrEmpty(request.Name)) role.Name = request.Name;
        if (request.Description != null) role.Description = request.Description;

        await _context.SaveChangesAsync();
        return await GetRoleByIdAsync(id);
    }

    public async Task<bool> DeleteRoleAsync(string id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null) return false;

        // Check if any users have this role
        var usersWithRole = await _context.Users.CountAsync(u => u.RoleId == id);
        if (usersWithRole > 0)
        {
            throw new InvalidOperationException($"Cannot delete role: {usersWithRole} users still have this role assigned.");
        }

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task EnsureDefaultRolesExistAsync()
    {
        var adminRole = await GetRoleByNameAsync("Admin");
        if (adminRole == null)
        {
            await CreateRoleAsync(new CreateRoleRequest("Admin", "Full administrative access to the system"));
            _logger.LogInformation("Created default Admin role");
        }

        var userRole = await GetRoleByNameAsync("User");
        if (userRole == null)
        {
            await CreateRoleAsync(new CreateRoleRequest("User", "Standard user access"));
            _logger.LogInformation("Created default User role");
        }
    }
}
