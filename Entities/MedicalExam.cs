namespace PrivateHospitalSystem.Entities
{
    public enum ExamStatus
    {
        Requested,
        Completed
    }

    public class MedicalExam
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }
        public Patient? Patient { get; set; }

        public Guid DoctorId { get; set; }
        public Doctor? Doctor { get; set; }

        public string ExamType { get; set; } = string.Empty; 
        public ExamStatus Status { get; set; } = ExamStatus.Requested;

        public string? Result { get; set; } 
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
    }
}