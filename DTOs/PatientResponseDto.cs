namespace PrivateHospitalSystem.DTOs
{
    public class PatientResponseDto
    {
        public Guid Id { get; set; }
        public string PatientNumber { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string Address { get; set; } = string.Empty;

        public string? NIF { get; set; }
        public string? HealthNumber { get; set; }

        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? Allergies { get; set; }
        public string? MedicalNotes { get; set; }

        public Guid? InsuranceProviderId { get; set; }
        public string? InsuranceProviderName { get; set; }
        public string? PolicyNumber { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}