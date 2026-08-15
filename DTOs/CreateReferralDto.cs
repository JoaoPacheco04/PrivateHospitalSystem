namespace PrivateHospitalSystem.DTOs
{
    public class CreateReferralDto
    {
        public Guid PatientId { get; set; }
        public Guid ReferringDoctorId { get; set; }
        public Guid ReferredToDoctorId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}