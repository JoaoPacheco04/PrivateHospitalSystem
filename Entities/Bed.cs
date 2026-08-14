namespace PrivateHospitalSystem.Entities
{

    public enum BedStatus
    {
        Available,
        Occupied,
        Maintenance
    }
    public class Bed
    {
        public Guid Id { get; set; }
        public string BedNumber { get; set; } = string.Empty; 
        public string Department { get; set; } = string.Empty; 

        public BedStatus Status { get; set; } = BedStatus.Available;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
