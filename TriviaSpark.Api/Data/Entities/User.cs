using System.ComponentModel.DataAnnotations;

namespace TriviaSpark.Api.Data.Entities;

public class User
{
    [Key]
    public string Id { get; set; } = null!;
    
    [Required]
    public string Username { get; set; } = null!;
    
    [Required]
    public string Email { get; set; } = null!;
    
    [Required]
    public string Password { get; set; } = null!;
    
    [Required]
    public string FullName { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; }
    
    public string? RoleId { get; set; }
    
    // Navigation properties
    public virtual ICollection<Event> Events { get; set; } = new List<Event>();
    public virtual Role? Role { get; set; }
}
