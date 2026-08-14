namespace PrivateHospitalSystem.Entities
{
    public class Doctor
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty; 
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Email { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<DoctorSpecialty> Specialties { get; set; } = new List<DoctorSpecialty>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}