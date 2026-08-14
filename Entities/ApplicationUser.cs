using Microsoft.AspNetCore.Identity;

namespace PrivateHospitalSystem.Entities
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; 

        public Guid? PatientId { get; set; }

        public Guid? DoctorId { get; set; }
    }
}