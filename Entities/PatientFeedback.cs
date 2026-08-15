namespace PrivateHospitalSystem.Entities
{
    public class PatientFeedback
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }
        public Patient? Patient { get; set; }

        public Guid? AppointmentId { get; set; } 
        public Guid? AdmissionId { get; set; } 

        public int Rating { get; set; } 
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}