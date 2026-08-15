using System.ComponentModel.DataAnnotations;

namespace PrivateHospitalSystem.DTOs
{
    public class CreateAppointmentDto
    {
        [Required]
        public Guid PatientId { get; set; }

        [Required]
        public Guid DoctorId { get; set; }

        [Required]
        public Guid RoomId { get; set; }

        [Required]
        public DateTime ScheduledAt { get; set; }

        [Range(5, 240, ErrorMessage = "Duration must be between 5 and 240 minutes.")]
        public int DurationMinutes { get; set; } = 30;

        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}