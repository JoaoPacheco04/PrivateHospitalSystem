namespace PrivateHospitalSystem.DTOs
{
    public class AdmissionResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid BedId { get; set; }
        public string BedNumber { get; set; } = string.Empty;
        public DateTime AdmittedAt { get; set; }
        public DateTime? DischargedAt { get; set; }
        public string? Reason { get; set; }
    }
}