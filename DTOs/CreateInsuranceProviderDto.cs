namespace PrivateHospitalSystem.DTOs
{
    public class CreateInsuranceProviderDto
    {
        public string Name { get; set; } = string.Empty;
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
    }
}