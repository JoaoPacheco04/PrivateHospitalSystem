namespace PrivateHospitalSystem.DTOs
{
    public class InvoiceResponseDto
    {
        public Guid Id { get; set; }
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string ProcedureType { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal InsuranceCoveredAmount { get; set; }
        public decimal PatientAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; }
        public DateTime? PaidAt { get; set; }
    }
}