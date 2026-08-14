namespace PrivateHospitalSystem.DTOs
{
    public class CreateProcedurePriceDto
    {
        public string ProcedureType { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}