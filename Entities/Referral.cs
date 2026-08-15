namespace PrivateHospitalSystem.Entities
{
    public enum ReferralStatus
    {
        Pending,
        Accepted,
        Completed
    }

    public class Referral
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }
        public Patient? Patient { get; set; }

        public Guid ReferringDoctorId { get; set; } 
        public Doctor? ReferringDoctor { get; set; }

        public Guid ReferredToDoctorId { get; set; } 
        public Doctor? ReferredToDoctor { get; set; }

        public string Reason { get; set; } = string.Empty;
        public string? Notes { get; set; }

        public ReferralStatus Status { get; set; } = ReferralStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}