namespace PrivateHospitalSystem.Entities
{
    public class Notification
    {
        public Guid Id { get; set; }

        public Guid? PatientId { get; set; } 
        public Patient? Patient { get; set; }

        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}