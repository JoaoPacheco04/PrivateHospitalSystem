namespace PrivateHospitalSystem.Entities
{
    public enum RoomStatus
    {
        Available,
        Occupied,
        Maintenance
    }

    public class Room
    {
        public Guid Id { get; set; }
        public string RoomNumber { get; set; } = string.Empty; 
        public string? Department { get; set; }

        public RoomStatus Status { get; set; } = RoomStatus.Available;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}