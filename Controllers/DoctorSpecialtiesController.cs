using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.Entities;
namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorSpecialtiesController : ControllerBase
    {
        private readonly PrivateHospitalDbContext _context;

        public DoctorSpecialtiesController(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DoctorSpecialty>>> GetDoctorSpecialties()
        {
            return await _context.DoctorSpecialties.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<DoctorSpecialty>> CreateDoctorSpecialty(DoctorSpecialty doctorSpecialty)
        {
            doctorSpecialty.Id = Guid.NewGuid();
            _context.DoctorSpecialties.Add(doctorSpecialty);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDoctorSpecialties), doctorSpecialty);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctorSpecialty(Guid id)
        {
            var doctorSpecialty = await _context.DoctorSpecialties.FindAsync(id);
            if (doctorSpecialty == null) return NotFound();

            _context.DoctorSpecialties.Remove(doctorSpecialty);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}