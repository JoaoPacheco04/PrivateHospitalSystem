namespace PrivateHospitalSystem.DTOs
{
    public class MedicalExamResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string ExamType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Result { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}