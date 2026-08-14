namespace PrivateHospitalSystem.Entities
{
    public class Specialty
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public ICollection<DoctorSpecialty> DoctorSpecialties { get; set; } = new List<DoctorSpecialty>();
    }
}