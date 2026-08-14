namespace PrivateHospitalSystem.Services
{
    public interface IDoctorSpecialtyService
    {
        Task<Guid> CreateAsync(Guid doctorId, Guid specialtyId);
        Task<bool> DeleteAsync(Guid id);
    }
}