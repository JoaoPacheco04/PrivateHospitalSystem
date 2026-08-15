namespace PrivateHospitalSystem.DTOs
{
    public class MedicationResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
        public int MinimumStockAlert { get; set; }
        public bool IsLowStock => StockQuantity <= MinimumStockAlert;
    }
}