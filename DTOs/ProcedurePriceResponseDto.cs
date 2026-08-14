namespace PrivateHospitalSystem.DTOs
{
    public class ProcedurePriceResponseDto
    {
        public Guid Id { get; set; }
        public string ProcedureType { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}