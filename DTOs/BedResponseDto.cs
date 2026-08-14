namespace PrivateHospitalSystem.DTOs
{
    public class BedResponseDto
    {
        public Guid Id { get; set; }
        public string BedNumber { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}