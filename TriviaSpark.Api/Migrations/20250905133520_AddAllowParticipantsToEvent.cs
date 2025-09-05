using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TriviaSpark.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAllowParticipantsToEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "allow_participants",
                table: "events",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "allow_participants",
                table: "events");
        }
    }
}
