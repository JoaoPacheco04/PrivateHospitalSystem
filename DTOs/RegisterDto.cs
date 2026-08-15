using System.ComponentModel.DataAnnotations;

namespace PrivateHospitalSystem.DTOs
{
    public class RegisterDto
    {
        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(Admin|Staff|Doctor|Patient)$", ErrorMessage = "Role must be Admin, Staff, Doctor or Patient.")]
        public string Role { get; set; } = string.Empty;

        public Guid? PatientId { get; set; }
    }
}