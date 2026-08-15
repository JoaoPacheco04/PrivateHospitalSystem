namespace PrivateHospitalSystem.DTOs
{
    public class CreateInformedConsentDto
    {
        public Guid PatientId { get; set; }
        public Guid? SurgeryId { get; set; }
        public string ProcedureDescription { get; set; } = string.Empty;
        public string RisksExplained { get; set; } = string.Empty;
        public Guid WitnessedByDoctorId { get; set; }
    }
}