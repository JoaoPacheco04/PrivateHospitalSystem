using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrivateHospitalSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorIdToNotification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DoctorId",
                table: "Notifications",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_DoctorId",
                table: "Notifications",
                column: "DoctorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Doctors_DoctorId",
                table: "Notifications",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Doctors_DoctorId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_DoctorId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "DoctorId",
                table: "Notifications");
        }
    }
}
