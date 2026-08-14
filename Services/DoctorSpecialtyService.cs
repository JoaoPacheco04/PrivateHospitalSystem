using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class DoctorSpecialtyService : IDoctorSpecialtyService
    {
        private readonly PrivateHospitalDbContext _context;

        public DoctorSpecialtyService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> CreateAsync(Guid doctorId, Guid specialtyId)
        {
            var link = new DoctorSpecialty
            {
                Id = Guid.NewGuid(),
                DoctorId = doctorId,
                SpecialtyId = specialtyId
            };

            _context.DoctorSpecialties.Add(link);
            await _context.SaveChangesAsync();

            return link.Id;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var link = await _context.DoctorSpecialties.FindAsync(id);
            if (link == null) return false;

            _context.DoctorSpecialties.Remove(link);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}