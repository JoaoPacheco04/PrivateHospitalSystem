namespace PrivateHospitalSystem.DTOs
{
    public class CreateMedicalExamDto
    {
        public Guid PatientId { get; set; }
        public Guid DoctorId { get; set; }
        public string ExamType { get; set; } = string.Empty;
    }
}