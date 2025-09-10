using EntityUser = TriviaSpark.Api.Data.Entities.User;
using EntityRole = TriviaSpark.Api.Data.Entities.Role;

namespace TriviaSpark.Api.Services;

public interface IAdminService
{
    // User Management
    Task<IEnumerable<EntityUser>> GetAllUsersAsync();
    Task<EntityUser?> GetUserByIdAsync(string id);
    Task<EntityUser> CreateUserAsync(CreateUserRequest request);
    Task<EntityUser?> UpdateUserAsync(string id, UpdateUserRequest request);
    Task<bool> DeleteUserAsync(string id);
    Task<EntityUser?> ChangeUserRoleAsync(string userId, string roleId);
    Task<EntityUser?> PromoteToAdminAsync(string userId);
    
    // Role Management
    Task<IEnumerable<EntityRole>> GetAllRolesAsync();
    Task<EntityRole?> GetRoleByIdAsync(string id);
    Task<EntityRole?> GetRoleByNameAsync(string name);
    Task<EntityRole> CreateRoleAsync(CreateRoleRequest request);
    Task<EntityRole?> UpdateRoleAsync(string id, UpdateRoleRequest request);
    Task<bool> DeleteRoleAsync(string id);
    
    // Initialization
    Task EnsureDefaultRolesExistAsync();
}

public record CreateUserRequest(string Username, string Email, string Password, string FullName, string? RoleId = null);
public record UpdateUserRequest(string? Username = null, string? Email = null, string? FullName = null, string? RoleId = null);

public record CreateRoleRequest(string Name, string? Description = null);
public record UpdateRoleRequest(string? Name = null, string? Description = null);
