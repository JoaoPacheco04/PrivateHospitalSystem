namespace PrivateHospitalSystem.DTOs
{
    public class SurgeryResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string ProcedureName { get; set; } = string.Empty;
        public DateTime ScheduledAt { get; set; }
        public int DurationMinutes { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public List<string> Team { get; set; } = new(); 
    }
}