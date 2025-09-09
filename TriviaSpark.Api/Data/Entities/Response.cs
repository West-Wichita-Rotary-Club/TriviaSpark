using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TriviaSpark.Api.Data.Entities;

public class Response
{
    [Key]
    public string Id { get; set; } = null!;
    
    [Required]
    [ForeignKey(nameof(Participant))]
    public string ParticipantId { get; set; } = null!;
    
    [Required]
    [ForeignKey(nameof(Question))]
    public string QuestionId { get; set; } = null!;
    
    [Required]
    public string Answer { get; set; } = null!;
    
    public bool IsCorrect { get; set; }
    
    public int Points { get; set; } = 0;
    
    public int? ResponseTime { get; set; } // seconds taken to answer
    
    public int? TimeRemaining { get; set; } // seconds remaining when locked
    
    public DateTime SubmittedAt { get; set; }
    
    // Navigation properties
    public virtual Participant Participant { get; set; } = null!;
    
    public virtual Question Question { get; set; } = null!;
}
