namespace PrivateHospitalSystem.DTOs
{
    public class CreateSurgeryDto
    {
        public Guid PatientId { get; set; }
        public Guid RoomId { get; set; }
        public string ProcedureName { get; set; } = string.Empty;
        public DateTime ScheduledAt { get; set; }
        public int DurationMinutes { get; set; } = 60;
        public string? Notes { get; set; }
    }
}