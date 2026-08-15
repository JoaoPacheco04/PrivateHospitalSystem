namespace PrivateHospitalSystem.DTOs
{
    public class AddSurgeryTeamMemberDto
    {
        public Guid DoctorId { get; set; }
        public string Role { get; set; } = string.Empty;
    }
}