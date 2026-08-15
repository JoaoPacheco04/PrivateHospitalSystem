namespace PrivateHospitalSystem.Entities
{
    public class AuditLog
    {
        public Guid Id { get; set; }

        public string Action { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public Guid? EntityId { get; set; }

        public Guid? PerformedByUserId { get; set; }
        public string? PerformedByName { get; set; }

        public string? Details { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}