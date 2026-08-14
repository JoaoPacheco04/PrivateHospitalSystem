namespace PrivateHospitalSystem.Entities
{
    public class Admission
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }
        public Patient? Patient { get; set; }

        public Guid BedId { get; set; }
        public Bed? Bed { get; set; }

        public DateTime AdmittedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DischargedAt { get; set; } 

        public string? Reason { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}