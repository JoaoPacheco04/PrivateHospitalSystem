namespace PrivateHospitalSystem.DTOs
{
    public class DischargeSummaryResponseDto
    {
        public Guid Id { get; set; }
        public Guid AdmissionId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string Diagnosis { get; set; } = string.Empty;
        public string TreatmentSummary { get; set; } = string.Empty;
        public string? MedicationOnDischarge { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public string IssuedByDoctorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}