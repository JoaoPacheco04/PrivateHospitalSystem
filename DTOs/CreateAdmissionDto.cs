namespace PrivateHospitalSystem.DTOs
{
    public class CreateAdmissionDto
    {
        public Guid PatientId { get; set; }
        public Guid BedId { get; set; }
        public string? Reason { get; set; }
    }
}