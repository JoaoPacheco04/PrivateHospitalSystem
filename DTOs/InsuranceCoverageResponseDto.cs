namespace PrivateHospitalSystem.DTOs
{
    public class InsuranceCoverageResponseDto
    {
        public Guid Id { get; set; }
        public Guid InsuranceProviderId { get; set; }
        public string ProcedureType { get; set; } = string.Empty;
        public decimal CoveragePercentage { get; set; }
    }
}