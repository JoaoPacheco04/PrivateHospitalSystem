namespace PrivateHospitalSystem.DTOs
{
    public class CreateInsuranceCoverageDto
    {
        public Guid InsuranceProviderId { get; set; }
        public string ProcedureType { get; set; } = string.Empty;
        public decimal CoveragePercentage { get; set; }
    }
}