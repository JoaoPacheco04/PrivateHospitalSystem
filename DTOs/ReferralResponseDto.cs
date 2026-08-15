namespace PrivateHospitalSystem.DTOs
{
    public class ReferralResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid ReferringDoctorId { get; set; }
        public string ReferringDoctorName { get; set; } = string.Empty;
        public Guid ReferredToDoctorId { get; set; }
        public string ReferredToDoctorName { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}