using EntityUser = TriviaSpark.Api.Data.Entities.User;
using EntityRole = TriviaSpark.Api.Data.Entities.Role;

namespace TriviaSpark.Api.Services;

/// <summary>
/// Interface for administrative user and role management operations.
/// </summary>
public interface IAdminService
{
    // User Management
    /// <summary>Gets all users with their role information.</summary>
    Task<IEnumerable<EntityUser>> GetAllUsersAsync();
    /// <summary>Gets a user by their unique ID.</summary>
    Task<EntityUser?> GetUserByIdAsync(string id);
    /// <summary>Creates a new user with the specified details.</summary>
    Task<EntityUser> CreateUserAsync(CreateUserRequest request);
    /// <summary>Updates an existing user's details.</summary>
    Task<EntityUser?> UpdateUserAsync(string id, UpdateUserRequest request);
    /// <summary>Deletes a user by ID. Returns false if not found.</summary>
    Task<bool> DeleteUserAsync(string id);
    /// <summary>Changes a user's role assignment.</summary>
    Task<EntityUser?> ChangeUserRoleAsync(string userId, string roleId);
    /// <summary>Promotes a user to the Admin role.</summary>
    Task<EntityUser?> PromoteToAdminAsync(string userId);
    
    // Role Management
    /// <summary>Gets all available roles.</summary>
    Task<IEnumerable<EntityRole>> GetAllRolesAsync();
    /// <summary>Gets a role by its unique ID.</summary>
    Task<EntityRole?> GetRoleByIdAsync(string id);
    /// <summary>Gets a role by its name.</summary>
    Task<EntityRole?> GetRoleByNameAsync(string name);
    /// <summary>Creates a new role.</summary>
    Task<EntityRole> CreateRoleAsync(CreateRoleRequest request);
    /// <summary>Updates an existing role's details.</summary>
    Task<EntityRole?> UpdateRoleAsync(string id, UpdateRoleRequest request);
    /// <summary>Deletes a role by ID. Returns false if not found.</summary>
    Task<bool> DeleteRoleAsync(string id);
    
    // Initialization
    /// <summary>Ensures default roles (Admin, User) exist in the database.</summary>
    Task EnsureDefaultRolesExistAsync();

    // Password Management
    /// <summary>Changes a user's password after verifying the current password.</summary>
    Task ChangePasswordAsync(string userId, string currentPassword, string newPassword);
}

/// <summary>Request to create a new user.</summary>
public record CreateUserRequest(string Username, string Email, string Password, string FullName, string? RoleId = null);
/// <summary>Request to update an existing user's details.</summary>
public record UpdateUserRequest(string? Username = null, string? Email = null, string? FullName = null, string? RoleId = null);

/// <summary>Request to create a new role.</summary>
public record CreateRoleRequest(string Name, string? Description = null);
/// <summary>Request to update an existing role.</summary>
public record UpdateRoleRequest(string? Name = null, string? Description = null);
