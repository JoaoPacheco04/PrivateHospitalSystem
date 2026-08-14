namespace PrivateHospitalSystem.DTOs
{
    public class InsuranceProviderResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
        public bool IsActive { get; set; }
        public List<InsuranceCoverageResponseDto> Coverages { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }
}