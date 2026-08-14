namespace PrivateHospitalSystem.Entities
{
    public class InsuranceCoverage
    {
        public Guid Id { get; set; }

        public Guid InsuranceProviderId { get; set; }
        public InsuranceProvider? InsuranceProvider { get; set; }

        public string ProcedureType { get; set; } = string.Empty;
        public decimal CoveragePercentage { get; set; }
    }
}