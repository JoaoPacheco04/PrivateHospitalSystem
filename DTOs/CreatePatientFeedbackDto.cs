using System.ComponentModel.DataAnnotations;

namespace PrivateHospitalSystem.DTOs
{
    public class CreatePatientFeedbackDto
    {
        [Required]
        public Guid PatientId { get; set; }

        public Guid? AppointmentId { get; set; }
        public Guid? AdmissionId { get; set; }

        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }
    }
}