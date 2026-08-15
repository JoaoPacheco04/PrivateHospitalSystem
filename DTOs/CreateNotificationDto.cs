namespace PrivateHospitalSystem.DTOs
{
    public class CreateNotificationDto
    {
        public Guid? PatientId { get; set; }
        public Guid? DoctorId { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}