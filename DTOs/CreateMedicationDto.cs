namespace PrivateHospitalSystem.DTOs
{
    public class CreateMedicationDto
    {
        public string Name { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
        public int MinimumStockAlert { get; set; } = 10;
    }
}