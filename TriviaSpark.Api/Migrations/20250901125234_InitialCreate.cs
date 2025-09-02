using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TriviaSpark.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<string>(type: "TEXT", nullable: false),
                    username = table.Column<string>(type: "TEXT", nullable: false),
                    email = table.Column<string>(type: "TEXT", nullable: false),
                    password = table.Column<string>(type: "TEXT", nullable: false),
                    full_name = table.Column<string>(type: "TEXT", nullable: false),
                    created_at = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "events",
                columns: table => new
                {
                    id = table.Column<string>(type: "TEXT", nullable: false),
                    title = table.Column<string>(type: "TEXT", nullable: false),
                    description = table.Column<string>(type: "TEXT", nullable: true),
                    host_id = table.Column<string>(type: "TEXT", nullable: false),
                    event_type = table.Column<string>(type: "TEXT", nullable: false),
                    max_participants = table.Column<int>(type: "INTEGER", nullable: false),
                    difficulty = table.Column<string>(type: "TEXT", nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false),
                    qr_code = table.Column<string>(type: "TEXT", nullable: true),
                    event_date = table.Column<long>(type: "INTEGER", nullable: true),
                    event_time = table.Column<string>(type: "TEXT", nullable: true),
                    location = table.Column<string>(type: "TEXT", nullable: true),
                    sponsoring_organization = table.Column<string>(type: "TEXT", nullable: true),
                    logo_url = table.Column<string>(type: "TEXT", nullable: true),
                    background_image_url = table.Column<string>(type: "TEXT", nullable: true),
                    event_copy = table.Column<string>(type: "TEXT", nullable: true),
                    welcome_message = table.Column<string>(type: "TEXT", nullable: true),
                    thank_you_message = table.Column<string>(type: "TEXT", nullable: true),
                    primary_color = table.Column<string>(type: "TEXT", nullable: false),
                    secondary_color = table.Column<string>(type: "TEXT", nullable: false),
                    font_family = table.Column<string>(type: "TEXT", nullable: false),
                    contact_email = table.Column<string>(type: "TEXT", nullable: true),
                    contact_phone = table.Column<string>(type: "TEXT", nullable: true),
                    website_url = table.Column<string>(type: "TEXT", nullable: true),
                    social_links = table.Column<string>(type: "TEXT", nullable: true),
                    prize_information = table.Column<string>(type: "TEXT", nullable: true),
                    event_rules = table.Column<string>(type: "TEXT", nullable: true),
                    special_instructions = table.Column<string>(type: "TEXT", nullable: true),
                    accessibility_info = table.Column<string>(type: "TEXT", nullable: true),
                    dietary_accommodations = table.Column<string>(type: "TEXT", nullable: true),
                    dress_code = table.Column<string>(type: "TEXT", nullable: true),
                    age_restrictions = table.Column<string>(type: "TEXT", nullable: true),
                    technical_requirements = table.Column<string>(type: "TEXT", nullable: true),
                    registration_deadline = table.Column<long>(type: "INTEGER", nullable: true),
                    cancellation_policy = table.Column<string>(type: "TEXT", nullable: true),
                    refund_policy = table.Column<string>(type: "TEXT", nullable: true),
                    sponsor_information = table.Column<string>(type: "TEXT", nullable: true),
                    settings = table.Column<string>(type: "TEXT", nullable: false),
                    created_at = table.Column<long>(type: "INTEGER", nullable: false),
                    started_at = table.Column<long>(type: "INTEGER", nullable: true),
                    completed_at = table.Column<long>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_events", x => x.id);
                    table.ForeignKey(
                        name: "FK_events_users_host_id",
                        column: x => x.host_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "fun_facts",
                columns: table => new
                {
                    id = table.Column<string>(type: "TEXT", nullable: false),
                    event_id = table.Column<string>(type: "TEXT", nullable: false),
                    title = table.Column<string>(type: "TEXT", nullable: false),
                    content = table.Column<string>(type: "TEXT", nullable: false),
                    order_index = table.Column<int>(type: "INTEGER", nullable: false),
                    is_active = table.Column<bool>(type: "INTEGER", nullable: false),
                    created_at = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fun_facts", x => x.id);
                    table.ForeignKey(
                        name: "FK_fun_facts_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "questions",
                columns: table => new
                {
                    id = table.Column<string>(type: "TEXT", nullable: false),
                    event_id = table.Column<string>(type: "TEXT", nullable: false),
                    type = table.Column<string>(type: "TEXT", nullable: false),
                    question = table.Column<string>(type: "TEXT", nullable: false),
                    options = table.Column<string>(type: "TEXT", nullable: false),
                    correct_answer = table.Column<string>(type: "TEXT", nullable: false),
                    explanation = table.Column<string>(type: "TEXT", nullable: true),
                    points = table.Column<int>(type: "INTEGER", nullable: false),
                    time_limit = table.Column<int>(type: "INTEGER", nullable: false),
                    difficulty = table.Column<string>(type: "TEXT", nullable: false),
                    category = table.Column<string>(type: "TEXT", nullable: true),
                    background_image_url = table.Column<string>(type: "TEXT", nullable: true),
                    ai_generated = table.Column<bool>(type: "INTEGER", nullable: false),
                    order_index = table.Column<int>(type: "INTEGER", nullable: false),
                    created_at = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_questions", x => x.id);
                    table.ForeignKey(
                        name: "FK_questions_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "teams",
                columns: table => new
                {
                    id = table.Column<string>(type: "TEXT", nullable: false),
                    event_id = table.Column<string>(type: "TEXT", nullable: false),
                    name = table.Column<string>(type: "TEXT", nullable: false),
                    table_number = table.Column<int>(type: "INTEGER", nullable: true),
                    max_members = table.Column<int>(type: "INTEGER", nullable: false),
                    created_at = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_teams", x => x.id);
                    table.ForeignKey(
                        name: "FK_teams_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "event_images",
                columns: table => new
                {
                    id = table.Column<string>(type: "TEXT", nullable: false),
                    question_id = table.Column<string>(type: "TEXT", nullable: false),
                    unsplash_image_id = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    image_url = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    thumbnail_url = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    attribution_text = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    attribution_url = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    download_tracking_url = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    width = table.Column<int>(type: "INTEGER", nullable: false),
                    height = table.Column<int>(type: "INTEGER", nullable: false),
                    color = table.Column<string>(type: "TEXT", maxLength: 7, nullable: true),
                    size_variant = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    usage_context = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    download_tracked = table.Column<bool>(type: "INTEGER", nullable: false),
                    created_at = table.Column<string>(type: "TEXT", nullable: false),
                    last_used_at = table.Column<string>(type: "TEXT", nullable: false),
                    expires_at = table.Column<string>(type: "TEXT", nullable: true),
                    selected_by_user_id = table.Column<string>(type: "TEXT", nullable: true),
                    search_context = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_event_images", x => x.id);
                    table.ForeignKey(
                        name: "FK_event_images_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_event_images_users_selected_by_user_id",
                        column: x => x.selected_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "participants",
                columns: table => new
                {
                    id = table.Column<string>(type: "TEXT", nullable: false),
                    event_id = table.Column<string>(type: "TEXT", nullable: false),
                    team_id = table.Column<string>(type: "TEXT", nullable: true),
                    name = table.Column<string>(type: "TEXT", nullable: false),
                    participant_token = table.Column<string>(type: "TEXT", nullable: false),
                    joined_at = table.Column<string>(type: "TEXT", nullable: false),
                    last_active_at = table.Column<string>(type: "TEXT", nullable: false),
                    is_active = table.Column<bool>(type: "INTEGER", nullable: false),
                    can_switch_team = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_participants", x => x.id);
                    table.ForeignKey(
                        name: "FK_participants_events_event_id",
                        column: x => x.event_id,
                        principalTable: "events",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_participants_teams_team_id",
                        column: x => x.team_id,
                        principalTable: "teams",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "responses",
                columns: table => new
                {
                    id = table.Column<string>(type: "TEXT", nullable: false),
                    participant_id = table.Column<string>(type: "TEXT", nullable: false),
                    question_id = table.Column<string>(type: "TEXT", nullable: false),
                    answer = table.Column<string>(type: "TEXT", nullable: false),
                    is_correct = table.Column<bool>(type: "INTEGER", nullable: false),
                    points = table.Column<int>(type: "INTEGER", nullable: false),
                    response_time = table.Column<int>(type: "INTEGER", nullable: true),
                    time_remaining = table.Column<int>(type: "INTEGER", nullable: true),
                    submitted_at = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_responses", x => x.id);
                    table.ForeignKey(
                        name: "FK_responses_participants_participant_id",
                        column: x => x.participant_id,
                        principalTable: "participants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_responses_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_event_images_created_at",
                table: "event_images",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_event_images_download_tracked",
                table: "event_images",
                column: "download_tracked");

            migrationBuilder.CreateIndex(
                name: "IX_event_images_question_id",
                table: "event_images",
                column: "question_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_event_images_selected_by_user_id",
                table: "event_images",
                column: "selected_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_event_images_unsplash_image_id",
                table: "event_images",
                column: "unsplash_image_id");

            migrationBuilder.CreateIndex(
                name: "IX_events_host_id",
                table: "events",
                column: "host_id");

            migrationBuilder.CreateIndex(
                name: "IX_fun_facts_event_id",
                table: "fun_facts",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "IX_participants_event_id",
                table: "participants",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "IX_participants_participant_token",
                table: "participants",
                column: "participant_token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_participants_team_id",
                table: "participants",
                column: "team_id");

            migrationBuilder.CreateIndex(
                name: "IX_questions_event_id",
                table: "questions",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "IX_responses_participant_id",
                table: "responses",
                column: "participant_id");

            migrationBuilder.CreateIndex(
                name: "IX_responses_question_id",
                table: "responses",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "IX_teams_event_id",
                table: "teams",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_username",
                table: "users",
                column: "username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "event_images");

            migrationBuilder.DropTable(
                name: "fun_facts");

            migrationBuilder.DropTable(
                name: "responses");

            migrationBuilder.DropTable(
                name: "participants");

            migrationBuilder.DropTable(
                name: "questions");

            migrationBuilder.DropTable(
                name: "teams");

            migrationBuilder.DropTable(
                name: "events");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
