using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TriviaSpark.Api.Data.Entities;

public class Team
{
    [Key]
    public string Id { get; set; } = null!;
    
    [Required]
    [ForeignKey(nameof(Event))]
    public string EventId { get; set; } = null!;
    
    [Required]
    public string Name { get; set; } = null!;
    
    public int? TableNumber { get; set; }
    
    public int MaxMembers { get; set; } = 6;
    
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public virtual Event Event { get; set; } = null!;
    
    public virtual ICollection<Participant> Participants { get; set; } = new List<Participant>();
}
