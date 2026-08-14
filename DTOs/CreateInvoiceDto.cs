namespace PrivateHospitalSystem.DTOs
{
    public class CreateInvoiceDto
    {
        public Guid PatientId { get; set; }
        public string ProcedureType { get; set; } = string.Empty;
    }
}