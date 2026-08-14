namespace PrivateHospitalSystem.DTOs
{
    public class DoctorResponseDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Email { get; set; }
        public bool IsActive { get; set; }
        public List<string> Specialties { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }
}