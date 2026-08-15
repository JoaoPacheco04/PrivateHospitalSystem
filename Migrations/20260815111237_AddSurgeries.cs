using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrivateHospitalSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddSurgeries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Surgeries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoomId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProcedureName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScheduledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Surgeries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Surgeries_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Surgeries_Rooms_RoomId",
                        column: x => x.RoomId,
                        principalTable: "Rooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SurgeryTeamMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SurgeryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DoctorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurgeryTeamMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurgeryTeamMembers_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SurgeryTeamMembers_Surgeries_SurgeryId",
                        column: x => x.SurgeryId,
                        principalTable: "Surgeries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Surgeries_PatientId",
                table: "Surgeries",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_Surgeries_RoomId",
                table: "Surgeries",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_SurgeryTeamMembers_DoctorId",
                table: "SurgeryTeamMembers",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_SurgeryTeamMembers_SurgeryId",
                table: "SurgeryTeamMembers",
                column: "SurgeryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SurgeryTeamMembers");

            migrationBuilder.DropTable(
                name: "Surgeries");
        }
    }
}
