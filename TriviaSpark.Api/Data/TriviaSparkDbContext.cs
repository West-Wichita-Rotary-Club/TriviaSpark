using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api.Data;

public class TriviaSparkDbContext : DbContext
{
    public TriviaSparkDbContext(DbContextOptions<TriviaSparkDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<Participant> Participants { get; set; }
    public DbSet<Response> Responses { get; set; }
    public DbSet<FunFact> FunFacts { get; set; }
    public DbSet<EventImage> EventImages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure table names to match existing SQLite schema
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<Role>().ToTable("roles");
        modelBuilder.Entity<Event>().ToTable("events");
        modelBuilder.Entity<Question>().ToTable("questions");
        modelBuilder.Entity<Team>().ToTable("teams");
        modelBuilder.Entity<Participant>().ToTable("participants");
        modelBuilder.Entity<Response>().ToTable("responses");
        modelBuilder.Entity<FunFact>().ToTable("fun_facts");
        modelBuilder.Entity<EventImage>().ToTable("event_images");

        // Configure column names to match existing schema (snake_case)
        ConfigureUserEntity(modelBuilder);
        ConfigureRoleEntity(modelBuilder);
        ConfigureEventEntity(modelBuilder);
        ConfigureQuestionEntity(modelBuilder);
        ConfigureTeamEntity(modelBuilder);
        ConfigureParticipantEntity(modelBuilder);
        ConfigureResponseEntity(modelBuilder);
        ConfigureFunFactEntity(modelBuilder);
        ConfigureEventImageEntity(modelBuilder);

        // Configure relationships
        ConfigureRelationships(modelBuilder);
    }

    private static void ConfigureUserEntity(ModelBuilder modelBuilder)
    {
        var userEntity = modelBuilder.Entity<User>();
        userEntity.Property(e => e.Id).HasColumnName("id");
        userEntity.Property(e => e.Username).HasColumnName("username");
        userEntity.Property(e => e.Email).HasColumnName("email");
        userEntity.Property(e => e.Password).HasColumnName("password");
        userEntity.Property(e => e.FullName).HasColumnName("full_name");
        userEntity.Property(e => e.RoleId).HasColumnName("role_id");
        
        // Handle ISO date string conversion for created_at
        userEntity.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .HasConversion(
                v => v.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                v => DateTime.Parse(v));

        userEntity.HasIndex(e => e.Username).IsUnique();
        userEntity.HasIndex(e => e.Email).IsUnique();
    }

    private static void ConfigureRoleEntity(ModelBuilder modelBuilder)
    {
        var roleEntity = modelBuilder.Entity<Role>();
        roleEntity.Property(e => e.Id).HasColumnName("id");
        roleEntity.Property(e => e.Name).HasColumnName("name");
        roleEntity.Property(e => e.Description).HasColumnName("description");
        
        roleEntity.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .HasConversion(
                v => v.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                v => DateTime.Parse(v));

        roleEntity.HasIndex(e => e.Name).IsUnique();
    }

    private static void ConfigureEventEntity(ModelBuilder modelBuilder)
    {
        var eventEntity = modelBuilder.Entity<Event>();
        eventEntity.Property(e => e.Id).HasColumnName("id");
        eventEntity.Property(e => e.Title).HasColumnName("title");
        eventEntity.Property(e => e.Description).HasColumnName("description");
        eventEntity.Property(e => e.HostId).HasColumnName("host_id");
        eventEntity.Property(e => e.EventType).HasColumnName("event_type");
        eventEntity.Property(e => e.MaxParticipants).HasColumnName("max_participants");
        eventEntity.Property(e => e.Difficulty).HasColumnName("difficulty");
        eventEntity.Property(e => e.Status).HasColumnName("status");
        eventEntity.Property(e => e.QrCode).HasColumnName("qr_code");
        
        // Handle Unix timestamp conversions for date columns (milliseconds)
        eventEntity.Property(e => e.EventDate)
            .HasColumnName("event_date")
            .HasConversion(
                v => v.HasValue ? new DateTimeOffset(DateTime.SpecifyKind(v.Value, DateTimeKind.Utc), TimeSpan.Zero).ToUnixTimeMilliseconds() : (long?)null,
                v => v.HasValue ? DateTimeOffset.FromUnixTimeMilliseconds(v.Value).UtcDateTime : (DateTime?)null);
                
        eventEntity.Property(e => e.EventTime).HasColumnName("event_time");
        eventEntity.Property(e => e.Location).HasColumnName("location");
        eventEntity.Property(e => e.SponsoringOrganization).HasColumnName("sponsoring_organization");
        eventEntity.Property(e => e.LogoUrl).HasColumnName("logo_url");
        eventEntity.Property(e => e.BackgroundImageUrl).HasColumnName("background_image_url");
        eventEntity.Property(e => e.EventCopy).HasColumnName("event_copy");
        eventEntity.Property(e => e.WelcomeMessage).HasColumnName("welcome_message");
        eventEntity.Property(e => e.ThankYouMessage).HasColumnName("thank_you_message");
        eventEntity.Property(e => e.PrimaryColor).HasColumnName("primary_color");
        eventEntity.Property(e => e.SecondaryColor).HasColumnName("secondary_color");
        eventEntity.Property(e => e.FontFamily).HasColumnName("font_family");
        eventEntity.Property(e => e.ContactEmail).HasColumnName("contact_email");
        eventEntity.Property(e => e.ContactPhone).HasColumnName("contact_phone");
        eventEntity.Property(e => e.WebsiteUrl).HasColumnName("website_url");
        eventEntity.Property(e => e.SocialLinks).HasColumnName("social_links");
        eventEntity.Property(e => e.PrizeInformation).HasColumnName("prize_information");
        eventEntity.Property(e => e.EventRules).HasColumnName("event_rules");
        eventEntity.Property(e => e.SpecialInstructions).HasColumnName("special_instructions");
        eventEntity.Property(e => e.AccessibilityInfo).HasColumnName("accessibility_info");
        eventEntity.Property(e => e.DietaryAccommodations).HasColumnName("dietary_accommodations");
        eventEntity.Property(e => e.DressCode).HasColumnName("dress_code");
        eventEntity.Property(e => e.AgeRestrictions).HasColumnName("age_restrictions");
        eventEntity.Property(e => e.TechnicalRequirements).HasColumnName("technical_requirements");
        
        eventEntity.Property(e => e.RegistrationDeadline)
            .HasColumnName("registration_deadline")
            .HasConversion(
                v => v.HasValue ? new DateTimeOffset(DateTime.SpecifyKind(v.Value, DateTimeKind.Utc), TimeSpan.Zero).ToUnixTimeMilliseconds() : (long?)null,
                v => v.HasValue ? DateTimeOffset.FromUnixTimeMilliseconds(v.Value).UtcDateTime : (DateTime?)null);
                
        eventEntity.Property(e => e.CancellationPolicy).HasColumnName("cancellation_policy");
        eventEntity.Property(e => e.RefundPolicy).HasColumnName("refund_policy");
        eventEntity.Property(e => e.SponsorInformation).HasColumnName("sponsor_information");
        eventEntity.Property(e => e.Settings).HasColumnName("settings");
        eventEntity.Property(e => e.AllowParticipants).HasColumnName("allow_participants");
        
        eventEntity.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .HasConversion(
                v => new DateTimeOffset(DateTime.SpecifyKind(v, DateTimeKind.Utc), TimeSpan.Zero).ToUnixTimeMilliseconds(),
                v => DateTimeOffset.FromUnixTimeMilliseconds(v).UtcDateTime);
                
        eventEntity.Property(e => e.StartedAt)
            .HasColumnName("started_at")
            .HasConversion(
                v => v.HasValue ? new DateTimeOffset(DateTime.SpecifyKind(v.Value, DateTimeKind.Utc), TimeSpan.Zero).ToUnixTimeMilliseconds() : (long?)null,
                v => v.HasValue ? DateTimeOffset.FromUnixTimeMilliseconds(v.Value).UtcDateTime : (DateTime?)null);
                
        eventEntity.Property(e => e.CompletedAt)
            .HasColumnName("completed_at")
            .HasConversion(
                v => v.HasValue ? new DateTimeOffset(DateTime.SpecifyKind(v.Value, DateTimeKind.Utc), TimeSpan.Zero).ToUnixTimeMilliseconds() : (long?)null,
                v => v.HasValue ? DateTimeOffset.FromUnixTimeMilliseconds(v.Value).UtcDateTime : (DateTime?)null);
    }

    private static void ConfigureQuestionEntity(ModelBuilder modelBuilder)
    {
        var questionEntity = modelBuilder.Entity<Question>();
        questionEntity.Property(e => e.Id).HasColumnName("id");
        questionEntity.Property(e => e.EventId).HasColumnName("event_id");
        questionEntity.Property(e => e.Type).HasColumnName("type");
        questionEntity.Property(e => e.QuestionText).HasColumnName("question");
        questionEntity.Property(e => e.Options).HasColumnName("options");
        questionEntity.Property(e => e.CorrectAnswer).HasColumnName("correct_answer");
        questionEntity.Property(e => e.Explanation).HasColumnName("explanation");
        questionEntity.Property(e => e.Points).HasColumnName("points");
        questionEntity.Property(e => e.TimeLimit).HasColumnName("time_limit");
        questionEntity.Property(e => e.Difficulty).HasColumnName("difficulty");
        questionEntity.Property(e => e.Category).HasColumnName("category");
        questionEntity.Property(e => e.BackgroundImageUrl).HasColumnName("background_image_url");
        questionEntity.Property(e => e.AiGenerated).HasColumnName("ai_generated");
        questionEntity.Property(e => e.OrderIndex).HasColumnName("order_index");
        
        questionEntity.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .HasConversion(
                v => v.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                v => DateTime.Parse(v));
    }

    private static void ConfigureTeamEntity(ModelBuilder modelBuilder)
    {
        var teamEntity = modelBuilder.Entity<Team>();
        teamEntity.Property(e => e.Id).HasColumnName("id");
        teamEntity.Property(e => e.EventId).HasColumnName("event_id");
        teamEntity.Property(e => e.Name).HasColumnName("name");
        teamEntity.Property(e => e.TableNumber).HasColumnName("table_number");
        teamEntity.Property(e => e.MaxMembers).HasColumnName("max_members");
        
        teamEntity.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .HasConversion(
                v => v.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                v => DateTime.Parse(v));
    }

    private static void ConfigureParticipantEntity(ModelBuilder modelBuilder)
    {
        var participantEntity = modelBuilder.Entity<Participant>();
        participantEntity.Property(e => e.Id).HasColumnName("id");
        participantEntity.Property(e => e.EventId).HasColumnName("event_id");
        participantEntity.Property(e => e.TeamId).HasColumnName("team_id");
        participantEntity.Property(e => e.Name).HasColumnName("name");
        participantEntity.Property(e => e.ParticipantToken).HasColumnName("participant_token");
        
        participantEntity.Property(e => e.JoinedAt)
            .HasColumnName("joined_at")
            .HasConversion(
                v => v.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                v => DateTime.Parse(v));
                
        participantEntity.Property(e => e.LastActiveAt)
            .HasColumnName("last_active_at")
            .HasConversion(
                v => v.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                v => DateTime.Parse(v));
                
        participantEntity.Property(e => e.IsActive).HasColumnName("is_active");
        participantEntity.Property(e => e.CanSwitchTeam).HasColumnName("can_switch_team");

        participantEntity.HasIndex(e => e.ParticipantToken).IsUnique();
    }

    private static void ConfigureResponseEntity(ModelBuilder modelBuilder)
    {
        var responseEntity = modelBuilder.Entity<Response>();
        responseEntity.Property(e => e.Id).HasColumnName("id");
        responseEntity.Property(e => e.ParticipantId).HasColumnName("participant_id");
        responseEntity.Property(e => e.QuestionId).HasColumnName("question_id");
        responseEntity.Property(e => e.Answer).HasColumnName("answer");
        responseEntity.Property(e => e.IsCorrect).HasColumnName("is_correct");
        responseEntity.Property(e => e.Points).HasColumnName("points");
        responseEntity.Property(e => e.ResponseTime).HasColumnName("response_time");
        responseEntity.Property(e => e.TimeRemaining).HasColumnName("time_remaining");
        
        responseEntity.Property(e => e.SubmittedAt)
            .HasColumnName("submitted_at")
            .HasConversion(
                v => v.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                v => DateTime.Parse(v));
    }

    private static void ConfigureFunFactEntity(ModelBuilder modelBuilder)
    {
        var funFactEntity = modelBuilder.Entity<FunFact>();
        funFactEntity.Property(e => e.Id).HasColumnName("id");
        funFactEntity.Property(e => e.EventId).HasColumnName("event_id");
        funFactEntity.Property(e => e.Title).HasColumnName("title");
        funFactEntity.Property(e => e.Content).HasColumnName("content");
        funFactEntity.Property(e => e.OrderIndex).HasColumnName("order_index");
        funFactEntity.Property(e => e.IsActive).HasColumnName("is_active");
        
        funFactEntity.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .HasConversion(
                v => v.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                v => DateTime.Parse(v));
    }

    private static void ConfigureEventImageEntity(ModelBuilder modelBuilder)
    {
        var eventImageEntity = modelBuilder.Entity<EventImage>();
        eventImageEntity.Property(e => e.Id).HasColumnName("id");
        eventImageEntity.Property(e => e.QuestionId).HasColumnName("question_id");
        eventImageEntity.Property(e => e.UnsplashImageId).HasColumnName("unsplash_image_id");
        eventImageEntity.Property(e => e.ImageUrl).HasColumnName("image_url");
        eventImageEntity.Property(e => e.ThumbnailUrl).HasColumnName("thumbnail_url");
        eventImageEntity.Property(e => e.Description).HasColumnName("description");
        eventImageEntity.Property(e => e.AttributionText).HasColumnName("attribution_text");
        eventImageEntity.Property(e => e.AttributionUrl).HasColumnName("attribution_url");
        eventImageEntity.Property(e => e.DownloadTrackingUrl).HasColumnName("download_tracking_url");
        eventImageEntity.Property(e => e.Width).HasColumnName("width");
        eventImageEntity.Property(e => e.Height).HasColumnName("height");
        eventImageEntity.Property(e => e.Color).HasColumnName("color");
        eventImageEntity.Property(e => e.SizeVariant).HasColumnName("size_variant");
        eventImageEntity.Property(e => e.UsageContext).HasColumnName("usage_context");
        eventImageEntity.Property(e => e.DownloadTracked).HasColumnName("download_tracked");
        eventImageEntity.Property(e => e.SelectedByUserId).HasColumnName("selected_by_user_id");
        eventImageEntity.Property(e => e.SearchContext).HasColumnName("search_context");
        
        eventImageEntity.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .HasConversion(
                v => v.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                v => DateTime.Parse(v));
                
        eventImageEntity.Property(e => e.LastUsedAt)
            .HasColumnName("last_used_at")
            .HasConversion(
                v => v.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                v => DateTime.Parse(v));
                
        eventImageEntity.Property(e => e.ExpiresAt)
            .HasColumnName("expires_at")
            .HasConversion(
                v => v.HasValue ? v.Value.ToString("yyyy-MM-ddTHH:mm:ss.fffZ") : null,
                v => v != null ? DateTime.Parse(v) : (DateTime?)null);

        // Add indexes for performance
        eventImageEntity.HasIndex(e => e.QuestionId).IsUnique(); // One image per question
        eventImageEntity.HasIndex(e => e.UnsplashImageId);
        eventImageEntity.HasIndex(e => e.DownloadTracked);
        eventImageEntity.HasIndex(e => e.CreatedAt);
    }

    private static void ConfigureRelationships(ModelBuilder modelBuilder)
    {
        // Role -> Users (one-to-many)
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.SetNull);

        // User -> Events (one-to-many)
        modelBuilder.Entity<Event>()
            .HasOne(e => e.Host)
            .WithMany(u => u.Events)
            .HasForeignKey(e => e.HostId)
            .OnDelete(DeleteBehavior.Restrict);

        // Event -> Questions (one-to-many)
        modelBuilder.Entity<Question>()
            .HasOne(q => q.Event)
            .WithMany(e => e.Questions)
            .HasForeignKey(q => q.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        // Event -> Teams (one-to-many)
        modelBuilder.Entity<Team>()
            .HasOne(t => t.Event)
            .WithMany(e => e.Teams)
            .HasForeignKey(t => t.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        // Event -> Participants (one-to-many)
        modelBuilder.Entity<Participant>()
            .HasOne(p => p.Event)
            .WithMany(e => e.Participants)
            .HasForeignKey(p => p.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        // Team -> Participants (one-to-many, optional)
        modelBuilder.Entity<Participant>()
            .HasOne(p => p.Team)
            .WithMany(t => t.Participants)
            .HasForeignKey(p => p.TeamId)
            .OnDelete(DeleteBehavior.SetNull);

        // Question -> Responses (one-to-many)
        modelBuilder.Entity<Response>()
            .HasOne(r => r.Question)
            .WithMany(q => q.Responses)
            .HasForeignKey(r => r.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Participant -> Responses (one-to-many)
        modelBuilder.Entity<Response>()
            .HasOne(r => r.Participant)
            .WithMany(p => p.Responses)
            .HasForeignKey(r => r.ParticipantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Event -> FunFacts (one-to-many)
        modelBuilder.Entity<FunFact>()
            .HasOne(f => f.Event)
            .WithMany(e => e.FunFacts)
            .HasForeignKey(f => f.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        // Question -> EventImages (one-to-one)
        modelBuilder.Entity<EventImage>()
            .HasOne(ei => ei.Question)
            .WithMany()
            .HasForeignKey(ei => ei.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // User -> EventImages (one-to-many, optional)
        modelBuilder.Entity<EventImage>()
            .HasOne(ei => ei.SelectedBy)
            .WithMany()
            .HasForeignKey(ei => ei.SelectedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
