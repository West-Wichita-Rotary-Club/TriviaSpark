using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TriviaSpark.Api.Data.Entities;

public class Participant
{
    [Key]
    public string Id { get; set; } = null!;
    
    [Required]
    [ForeignKey(nameof(Event))]
    public string EventId { get; set; } = null!;
    
    [ForeignKey(nameof(Team))]
    public string? TeamId { get; set; }
    
    [Required]
    public string Name { get; set; } = null!;
    
    [Required]
    public string ParticipantToken { get; set; } = null!; // For cookie-based auth
    
    public DateTime JoinedAt { get; set; }
    
    public DateTime LastActiveAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public bool CanSwitchTeam { get; set; } = true;
    
    // Navigation properties
    public virtual Event Event { get; set; } = null!;
    
    public virtual Team? Team { get; set; }
    
    public virtual ICollection<Response> Responses { get; set; } = new List<Response>();
}
