namespace PrivateHospitalSystem.DTOs
{
    public class CompleteEmergencyCaseDto
    {
        public bool RequiresAdmission { get; set; } = false;
        public Guid? BedId { get; set; } 
        public string? AdmissionReason { get; set; }
    }
}