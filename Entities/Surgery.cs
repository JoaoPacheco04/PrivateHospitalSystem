namespace PrivateHospitalSystem.Entities
{
    public enum SurgeryStatus
    {
        Scheduled,
        InProgress,
        Completed,
        Cancelled
    }

    public class Surgery
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }
        public Patient? Patient { get; set; }

        public Guid RoomId { get; set; } 
        public Room? Room { get; set; }

        public string ProcedureName { get; set; } = string.Empty; 
        public DateTime ScheduledAt { get; set; }
        public int DurationMinutes { get; set; } = 60;

        public SurgeryStatus Status { get; set; } = SurgeryStatus.Scheduled;
        public string? Notes { get; set; }

        // Equipa cirúrgica (relação muitos-para-muitos com Doctor)
        public ICollection<SurgeryTeamMember> Team { get; set; } = new List<SurgeryTeamMember>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}