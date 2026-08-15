namespace PrivateHospitalSystem.Entities
{
    public class Medication
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty; 
        public int StockQuantity { get; set; }
        public int MinimumStockAlert { get; set; } = 10; 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}