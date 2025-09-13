using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TriviaSpark.Api.Data.Entities;

public class Question
{
    [Key]
    public string Id { get; set; } = null!;
    
    [Required]
    [ForeignKey(nameof(Event))]
    public string EventId { get; set; } = null!;
    
    [Required]
    public string Type { get; set; } = null!; // multiple_choice, true_false, fill_blank, image
    
    [Required]
    public string QuestionText { get; set; } = null!;
    
    public string Options { get; set; } = "[]"; // JSON string of answer options
    
    [Required]
    public string CorrectAnswer { get; set; } = null!;
    
    public string? Explanation { get; set; } // Explanation of the correct answer
    
    public int Points { get; set; } = 100;
    
    public int TimeLimit { get; set; } = 30; // seconds
    
    public string Difficulty { get; set; } = "medium";
    
    public string? Category { get; set; }
    
    public string? BackgroundImageUrl { get; set; } // Unsplash or other background image
    
    public bool AiGenerated { get; set; } = false;
    
    public int OrderIndex { get; set; } = 0;
    
    [Required]
    public string QuestionType { get; set; } = "game"; // game, training, tie-breaker
    
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public virtual Event Event { get; set; } = null!;
    
    public virtual ICollection<Response> Responses { get; set; } = new List<Response>();
}
