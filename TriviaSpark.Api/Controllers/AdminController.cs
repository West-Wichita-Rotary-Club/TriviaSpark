using Microsoft.AspNetCore.Mvc;
using TriviaSpark.Api.Services;
using EntityUser = TriviaSpark.Api.Data.Entities.User;
using EntityRole = TriviaSpark.Api.Data.Entities.Role;

namespace TriviaSpark.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IAdminService adminService, ILogger<AdminController> logger)
    {
        _adminService = adminService;
        _logger = logger;
    }

    // User Management Endpoints
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var users = await _adminService.GetAllUsersAsync();
            return Ok(users.Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.FullName,
                u.CreatedAt,
                Role = u.Role != null ? new { u.Role.Id, u.Role.Name, u.Role.Description } : null
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all users");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        try
        {
            var user = await _adminService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.CreatedAt,
                Role = user.Role != null ? new { user.Role.Id, user.Role.Name, user.Role.Description } : null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user {UserId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Username) || 
                string.IsNullOrWhiteSpace(request.Email) || 
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest(new { error = "Username, email, password, and full name are required" });
            }

            var user = await _adminService.CreateUserAsync(request);
            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.CreatedAt,
                Role = user.Role != null ? new { user.Role.Id, user.Role.Name, user.Role.Description } : null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        try
        {
            var user = await _adminService.UpdateUserAsync(id, request);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.CreatedAt,
                Role = user.Role != null ? new { user.Role.Id, user.Role.Name, user.Role.Description } : null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        try
        {
            var result = await _adminService.DeleteUserAsync(id);
            if (!result)
            {
                return NotFound(new { error = "User not found" });
            }

            return Ok(new { message = "User deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("users/{userId}/role")]
    public async Task<IActionResult> ChangeUserRole(string userId, [FromBody] ChangeRoleRequest request)
    {
        try
        {
            var user = await _adminService.ChangeUserRoleAsync(userId, request.RoleId);
            if (user == null)
            {
                return NotFound(new { error = "User or role not found" });
            }

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.CreatedAt,
                Role = user.Role != null ? new { user.Role.Id, user.Role.Name, user.Role.Description } : null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing user role for {UserId}", userId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("users/{userId}/promote")]
    public async Task<IActionResult> PromoteToAdmin(string userId)
    {
        try
        {
            var user = await _adminService.PromoteToAdminAsync(userId);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                user.FullName,
                user.CreatedAt,
                Role = user.Role != null ? new { user.Role.Id, user.Role.Name, user.Role.Description } : null,
                Message = "User promoted to admin successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error promoting user {UserId} to admin", userId);
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Role Management Endpoints
    [HttpGet("roles")]
    public async Task<IActionResult> GetAllRoles()
    {
        try
        {
            var roles = await _adminService.GetAllRolesAsync();
            return Ok(roles.Select(r => new
            {
                r.Id,
                r.Name,
                r.Description,
                r.CreatedAt,
                UserCount = r.Users.Count
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all roles");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("roles")]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { error = "Role name is required" });
            }

            var role = await _adminService.CreateRoleAsync(request);
            return Ok(new
            {
                role.Id,
                role.Name,
                role.Description,
                role.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating role");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("roles/{id}")]
    public async Task<IActionResult> UpdateRole(string id, [FromBody] UpdateRoleRequest request)
    {
        try
        {
            var role = await _adminService.UpdateRoleAsync(id, request);
            if (role == null)
            {
                return NotFound(new { error = "Role not found" });
            }

            return Ok(new
            {
                role.Id,
                role.Name,
                role.Description,
                role.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating role {RoleId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpDelete("roles/{id}")]
    public async Task<IActionResult> DeleteRole(string id)
    {
        try
        {
            var result = await _adminService.DeleteRoleAsync(id);
            if (!result)
            {
                return NotFound(new { error = "Role not found" });
            }

            return Ok(new { message = "Role deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting role {RoleId}: {Message}", id, ex.Message);
            return BadRequest(new { error = ex.Message });
        }
    }
}

public record ChangeRoleRequest(string RoleId);
