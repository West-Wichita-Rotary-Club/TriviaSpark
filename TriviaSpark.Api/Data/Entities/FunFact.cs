using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TriviaSpark.Api.Data.Entities;

public class FunFact
{
    [Key]
    public string Id { get; set; } = null!;
    
    [Required]
    [ForeignKey(nameof(Event))]
    public string EventId { get; set; } = null!;
    
    [Required]
    public string Title { get; set; } = null!;
    
    [Required]
    public string Content { get; set; } = null!;
    
    public int OrderIndex { get; set; } = 0;
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public virtual Event Event { get; set; } = null!;
}
