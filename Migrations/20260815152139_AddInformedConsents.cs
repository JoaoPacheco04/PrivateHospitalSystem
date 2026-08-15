using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrivateHospitalSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddInformedConsents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InformedConsents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SurgeryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProcedureDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RisksExplained = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PatientSigned = table.Column<bool>(type: "bit", nullable: false),
                    SignedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WitnessedByDoctorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InformedConsents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InformedConsents_Doctors_WitnessedByDoctorId",
                        column: x => x.WitnessedByDoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InformedConsents_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InformedConsents_Surgeries_SurgeryId",
                        column: x => x.SurgeryId,
                        principalTable: "Surgeries",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_InformedConsents_PatientId",
                table: "InformedConsents",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_InformedConsents_SurgeryId",
                table: "InformedConsents",
                column: "SurgeryId");

            migrationBuilder.CreateIndex(
                name: "IX_InformedConsents_WitnessedByDoctorId",
                table: "InformedConsents",
                column: "WitnessedByDoctorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InformedConsents");
        }
    }
}
