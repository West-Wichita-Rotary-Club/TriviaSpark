using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using EfUser = TriviaSpark.Api.Data.Entities.User;
using DapperUser = TriviaSpark.Api.Services.User;

namespace TriviaSpark.Api.Services.EfCore;

public interface IEfCoreUserService
{
    Task<DapperUser?> GetUserByIdAsync(string userId);
    Task<DapperUser?> GetUserByUsernameAsync(string username);
    Task<DapperUser?> GetUserByEmailAsync(string email);
    Task<DapperUser> CreateUserAsync(DapperUser user);
    Task<DapperUser> UpdateUserAsync(DapperUser user);
    Task<bool> DeleteUserAsync(string userId);
    Task<bool> ValidatePasswordAsync(string username, string password);
    Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
    Task<int> GetUserCountAsync();
}

public class EfCoreUserService : IEfCoreUserService
{
    private readonly TriviaSparkDbContext _context;

    public EfCoreUserService(TriviaSparkDbContext context)
    {
        _context = context;
    }

    public async Task<DapperUser?> GetUserByIdAsync(string userId)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);
        return user != null ? MapToDto(user) : null;
    }

    public async Task<DapperUser?> GetUserByUsernameAsync(string username)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == username);
        return user != null ? MapToDto(user) : null;
    }

    public async Task<DapperUser?> GetUserByEmailAsync(string email)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email);
        return user != null ? MapToDto(user) : null;
    }

    public async Task<DapperUser> CreateUserAsync(DapperUser user)
    {
        var entity = MapToEntity(user);
        entity.CreatedAt = DateTime.UtcNow;
        
        // Set default role if not specified
        if (string.IsNullOrEmpty(entity.RoleId))
        {
            var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
            if (userRole != null)
            {
                entity.RoleId = userRole.Id;
            }
        }
        
        _context.Users.Add(entity);
        await _context.SaveChangesAsync();
        
        // Return with role information
        var createdUser = await _context.Users
            .Include(u => u.Role)
            .FirstAsync(u => u.Id == entity.Id);
        return MapToDto(createdUser);
    }

    public async Task<DapperUser> UpdateUserAsync(DapperUser user)
    {
        var entity = MapToEntity(user);
        _context.Users.Update(entity);
        await _context.SaveChangesAsync();
        return MapToDto(entity);
    }

    public async Task<bool> DeleteUserAsync(string userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ValidatePasswordAsync(string username, string password)
    {
        var user = await GetUserByUsernameAsync(username);
        if (user == null)
            return false;

        // Note: In a real application, you'd use proper password hashing
        // For now, this matches the existing simple implementation
        return user.Password == password;
    }

    public async Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            return false;

        // Verify current password
        if (user.Password != currentPassword)
            return false;

        // Update password directly on the entity (in production, this should be hashed)
        user.Password = newPassword;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetUserCountAsync()
    {
        return await _context.Users.CountAsync();
    }

    private static DapperUser MapToDto(EfUser entity)
    {
        return new DapperUser
        {
            Id = entity.Id,
            Username = entity.Username,
            Email = entity.Email,
            Password = entity.Password,
            FullName = entity.FullName,
            RoleId = entity.RoleId ?? string.Empty,
            RoleName = entity.Role?.Name,
            CreatedAt = entity.CreatedAt
        };
    }

    private static EfUser MapToEntity(DapperUser dto)
    {
        return new EfUser
        {
            Id = dto.Id,
            Username = dto.Username,
            Email = dto.Email,
            Password = dto.Password,
            FullName = dto.FullName,
            RoleId = dto.RoleId,
            CreatedAt = dto.CreatedAt
        };
    }
}
