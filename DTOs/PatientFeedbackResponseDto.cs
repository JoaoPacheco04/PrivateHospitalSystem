namespace PrivateHospitalSystem.DTOs
{
    public class PatientFeedbackResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid? AppointmentId { get; set; }
        public Guid? AdmissionId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}