namespace PrivateHospitalSystem.Entities
{
    public class SurgeryTeamMember
    {
        public Guid Id { get; set; }

        public Guid SurgeryId { get; set; }
        public Surgery? Surgery { get; set; }

        public Guid DoctorId { get; set; }
        public Doctor? Doctor { get; set; }

        public string Role { get; set; } = string.Empty; 
    }
}