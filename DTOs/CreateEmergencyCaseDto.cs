namespace PrivateHospitalSystem.DTOs
{
    public class CreateEmergencyCaseDto
    {
        public Guid PatientId { get; set; }
        public string Complaint { get; set; } = string.Empty;
        public int Priority { get; set; } = 2; 
    }
}