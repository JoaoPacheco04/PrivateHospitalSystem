namespace PrivateHospitalSystem.Entities
{
    public class ProcedurePrice
    {
        public Guid Id { get; set; }
        public string ProcedureType { get; set; } = string.Empty; 
        public decimal Price { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}