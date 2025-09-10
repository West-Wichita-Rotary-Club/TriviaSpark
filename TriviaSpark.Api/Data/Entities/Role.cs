using System.ComponentModel.DataAnnotations;

namespace TriviaSpark.Api.Data.Entities;

public class Role
{
    [Key]
    public string Id { get; set; } = null!;
    
    [Required]
    public string Name { get; set; } = null!;
    
    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
