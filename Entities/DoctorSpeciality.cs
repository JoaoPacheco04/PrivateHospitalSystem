namespace PrivateHospitalSystem.Entities
{
    public class DoctorSpecialty
    {
        public Guid Id { get; set; }

        public Guid DoctorId { get; set; }
        public Doctor? Doctor { get; set; }

        public Guid SpecialtyId { get; set; }
        public Specialty? Specialty { get; set; }
    }
}