using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TriviaSpark.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRolesSystemWithDataMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Add the role_id column to users table (nullable initially)
            migrationBuilder.AddColumn<string>(
                name: "role_id",
                table: "users",
                type: "TEXT",
                nullable: true);

            // 2. Create roles table
            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    id = table.Column<string>(type: "TEXT", nullable: false),
                    name = table.Column<string>(type: "TEXT", nullable: false),
                    description = table.Column<string>(type: "TEXT", nullable: true),
                    created_at = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles", x => x.id);
                });

            // 3. Insert default roles
            var adminRoleId = System.Guid.NewGuid().ToString();
            var userRoleId = System.Guid.NewGuid().ToString();
            var currentTime = System.DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

            migrationBuilder.InsertData(
                table: "roles",
                columns: new[] { "id", "name", "description", "created_at" },
                values: new object[,]
                {
                    { adminRoleId, "Admin", "Full administrative access to the system", currentTime },
                    { userRoleId, "User", "Standard user access", currentTime }
                });

            // 4. Assign default User role to all existing users
            migrationBuilder.Sql($"UPDATE users SET role_id = '{userRoleId}' WHERE role_id IS NULL");

            // 5. Create indexes
            migrationBuilder.CreateIndex(
                name: "IX_users_role_id",
                table: "users",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_roles_name",
                table: "roles",
                column: "name",
                unique: true);

            // 6. Add foreign key constraint
            migrationBuilder.AddForeignKey(
                name: "FK_users_roles_role_id",
                table: "users",
                column: "role_id",
                principalTable: "roles",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_users_roles_role_id",
                table: "users");

            migrationBuilder.DropTable(
                name: "roles");

            migrationBuilder.DropIndex(
                name: "IX_users_role_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "role_id",
                table: "users");
        }
    }
}
