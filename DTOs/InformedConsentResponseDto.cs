namespace PrivateHospitalSystem.DTOs
{
    public class InformedConsentResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid? SurgeryId { get; set; }
        public string ProcedureDescription { get; set; } = string.Empty;
        public string RisksExplained { get; set; } = string.Empty;
        public bool PatientSigned { get; set; }
        public DateTime? SignedAt { get; set; }
        public string WitnessedByDoctorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}