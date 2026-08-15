namespace PrivateHospitalSystem.DTOs
{
    public class CreateDischargeSummaryDto
    {
        public Guid AdmissionId { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public string TreatmentSummary { get; set; } = string.Empty;
        public string? MedicationOnDischarge { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public Guid IssuedByDoctorId { get; set; }
    }
}