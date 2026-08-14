using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpecialtiesController : ControllerBase
    {
        private readonly PrivateHospitalDbContext _context;

        public SpecialtiesController(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Specialty>>> GetSpecialties()
        {
            return await _context.Specialties.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Specialty>> CreateSpecialty(Specialty specialty)
        {
            specialty.Id = Guid.NewGuid();
            _context.Specialties.Add(specialty);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSpecialties), specialty);
        }
    }
}
