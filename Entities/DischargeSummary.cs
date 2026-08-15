namespace PrivateHospitalSystem.Entities
{
    public class DischargeSummary
    {
        public Guid Id { get; set; }

        public Guid AdmissionId { get; set; }
        public Admission? Admission { get; set; }

        public string Diagnosis { get; set; } = string.Empty;
        public string TreatmentSummary { get; set; } = string.Empty;
        public string? MedicationOnDischarge { get; set; }
        public DateTime? FollowUpDate { get; set; }

        public Guid IssuedByDoctorId { get; set; }
        public Doctor? IssuedByDoctor { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}