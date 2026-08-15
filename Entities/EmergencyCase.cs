namespace PrivateHospitalSystem.Entities
{
    public enum TriagePriority
    {
        NonUrgent = 1,
        Standard = 2,
        Urgent = 3,
        VeryUrgent = 4,
        Immediate = 5
    }

    public enum EmergencyStatus
    {
        Waiting,
        InProgress,
        Completed
    }

    public class EmergencyCase
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }
        public Patient? Patient { get; set; }

        public Guid? DoctorId { get; set; } 
        public Doctor? Doctor { get; set; }

        public string Complaint { get; set; } = string.Empty; 
        public TriagePriority Priority { get; set; } = TriagePriority.Standard;
        public EmergencyStatus Status { get; set; } = EmergencyStatus.Waiting;

        public DateTime ArrivedAt { get; set; } = DateTime.UtcNow;
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}