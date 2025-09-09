using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TriviaSpark.Api.Data.Entities;

public class Event
{
    [Key]
    public string Id { get; set; } = null!;
    
    [Required]
    public string Title { get; set; } = null!;
    
    public string? Description { get; set; }
    
    [Required]
    [ForeignKey(nameof(Host))]
    public string HostId { get; set; } = null!;
    
    [Required]
    public string EventType { get; set; } = null!; // wine_dinner, corporate, party, educational, fundraiser
    
    public int MaxParticipants { get; set; } = 50;
    
    public string Difficulty { get; set; } = "mixed"; // easy, medium, hard, mixed
    
    public string Status { get; set; } = "draft"; // draft, active, completed, cancelled
    
    public string? QrCode { get; set; }
    
    public DateTime? EventDate { get; set; }
    
    public string? EventTime { get; set; }
    
    public string? Location { get; set; }
    
    public string? SponsoringOrganization { get; set; }

    // Rich content and branding
    public string? LogoUrl { get; set; }
    
    public string? BackgroundImageUrl { get; set; }
    
    public string? EventCopy { get; set; } // AI-generated promotional description
    
    public string? WelcomeMessage { get; set; } // Custom welcome message for participants
    
    public string? ThankYouMessage { get; set; } // Message shown after event completion

    // Theme and styling
    public string? PrimaryColor { get; set; } // wine color
    
    public string? SecondaryColor { get; set; } // champagne color
    
    public string? FontFamily { get; set; }

    // Contact and social
    public string? ContactEmail { get; set; }
    
    public string? ContactPhone { get; set; }
    
    public string? WebsiteUrl { get; set; }
    
    public string? SocialLinks { get; set; } // JSON string of social media links

    // Event details
    public string? PrizeInformation { get; set; }
    
    public string? EventRules { get; set; }
    
    public string? SpecialInstructions { get; set; }
    
    public string? AccessibilityInfo { get; set; }
    
    public string? DietaryAccommodations { get; set; }
    
    public string? DressCode { get; set; }
    
    public string? AgeRestrictions { get; set; }
    
    public string? TechnicalRequirements { get; set; }

    // Business information
    public DateTime? RegistrationDeadline { get; set; }
    
    public string? CancellationPolicy { get; set; }
    
    public string? RefundPolicy { get; set; }
    
    public string? SponsorInformation { get; set; } // JSON string of sponsor details

    public string? Settings { get; set; } // JSON string for theme, timing, etc.
    
    public bool AllowParticipants { get; set; } = false; // Controls visibility of teams, participants, and leaderboard
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? StartedAt { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    // Navigation properties
    public virtual User Host { get; set; } = null!;
    
    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
    
    public virtual ICollection<Team> Teams { get; set; } = new List<Team>();
    
    public virtual ICollection<Participant> Participants { get; set; } = new List<Participant>();
    
    public virtual ICollection<FunFact> FunFacts { get; set; } = new List<FunFact>();
}
