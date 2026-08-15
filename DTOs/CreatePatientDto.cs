using System.ComponentModel.DataAnnotations;

namespace PrivateHospitalSystem.DTOs
{
    public class CreatePatientDto
    {
        [Required(ErrorMessage = "Full name is required.")]
        [MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        [MaxLength(20)]
        public string Gender { get; set; } = string.Empty;

        [Required]
        [Phone(ErrorMessage = "Invalid phone number.")]
        public string PhoneNumber { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public string? Email { get; set; }

        [Required]
        [MaxLength(300)]
        public string Address { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? NIF { get; set; }

        [MaxLength(20)]
        public string? HealthNumber { get; set; }

        [MaxLength(150)]
        public string? EmergencyContactName { get; set; }

        [Phone]
        public string? EmergencyContactPhone { get; set; }

        public string? Allergies { get; set; }
        public string? MedicalNotes { get; set; }

        public Guid? InsuranceProviderId { get; set; }
        [MaxLength(50)]
        public string? PolicyNumber { get; set; }
    }
}