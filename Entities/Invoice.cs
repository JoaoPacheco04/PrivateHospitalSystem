namespace PrivateHospitalSystem.Entities
{
    public enum InvoiceStatus
    {
        Pending,
        Paid,
        Cancelled
    }

    public class Invoice
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }
        public Patient? Patient { get; set; }

        public string ProcedureType { get; set; } = string.Empty; 
        public decimal TotalAmount { get; set; }
        public decimal InsuranceCoveredAmount { get; set; }
        public decimal PatientAmount { get; set; } 

        public InvoiceStatus Status { get; set; } = InvoiceStatus.Pending;

        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }
    }
}