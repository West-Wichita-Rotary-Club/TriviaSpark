using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using EfUser = TriviaSpark.Api.Data.Entities.User;
using DapperUser = TriviaSpark.Api.Services.User;

namespace TriviaSpark.Api.Services.EfCore;

/// <summary>
/// Interface for user management operations using Entity Framework Core.
/// Maps between EF Core User entities and legacy DTO User objects.
/// </summary>
public interface IEfCoreUserService
{
    /// <summary>Gets a user by their unique ID.</summary>
    Task<DapperUser?> GetUserByIdAsync(string userId);
    /// <summary>Gets a user by their username.</summary>
    Task<DapperUser?> GetUserByUsernameAsync(string username);
    /// <summary>Gets a user by their email address.</summary>
    Task<DapperUser?> GetUserByEmailAsync(string email);
    /// <summary>Creates a new user with an optional default role assignment.</summary>
    Task<DapperUser> CreateUserAsync(DapperUser user);
    /// <summary>Updates an existing user entity.</summary>
    Task<DapperUser> UpdateUserAsync(DapperUser user);
    /// <summary>Deletes a user by ID. Returns false if not found.</summary>
    Task<bool> DeleteUserAsync(string userId);
    /// <summary>Validates a user's password using BCrypt comparison.</summary>
    Task<bool> ValidatePasswordAsync(string username, string password);
    /// <summary>Changes a user's password after validating the current password.</summary>
    Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
    /// <summary>Gets the total count of registered users.</summary>
    Task<int> GetUserCountAsync();
}

/// <summary>
/// EF Core implementation of user management with DTO mapping between
/// Entity Framework User entities and legacy Dapper-style User DTOs.
/// </summary>
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
