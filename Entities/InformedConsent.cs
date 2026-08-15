namespace PrivateHospitalSystem.Entities
{
    public class InformedConsent
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }
        public Patient? Patient { get; set; }

        public Guid? SurgeryId { get; set; } 
        public Surgery? Surgery { get; set; }

        public string ProcedureDescription { get; set; } = string.Empty;
        public string RisksExplained { get; set; } = string.Empty;

        public bool PatientSigned { get; set; } = false;
        public DateTime? SignedAt { get; set; }

        public Guid WitnessedByDoctorId { get; set; }
        public Doctor? WitnessedByDoctor { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}