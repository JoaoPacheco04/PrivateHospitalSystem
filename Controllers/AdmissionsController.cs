using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdmissionsController : ControllerBase
    {
        private readonly PrivateHospitalDbContext _context;

        public AdmissionsController(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Admission>>> GetAdmissions()
        {
            return await _context.Admissions.ToListAsync();
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<Admission>>> GetActiveAdmissions()
        {
            return await _context.Admissions
                .Include(a => a.Patient)
                .Include(a => a.Bed)
                .Where(a => a.DischargedAt == null)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Admission>> CreateAdmission(Admission admission)
        {
            var bed = await _context.Beds.FindAsync(admission.BedId);
            if (bed == null || bed.Status != BedStatus.Available)
                return BadRequest("Bed is not available.");

            admission.Id = Guid.NewGuid();
            admission.AdmittedAt = DateTime.UtcNow;
            bed.Status = BedStatus.Occupied;

            _context.Admissions.Add(admission);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAdmissions), admission);
        }

        [HttpPatch("{id}/discharge")]
        public async Task<IActionResult> DischargePatient(Guid id)
        {
            var admission = await _context.Admissions.FindAsync(id);
            if (admission == null) return NotFound();

            admission.DischargedAt = DateTime.UtcNow;

            var bed = await _context.Beds.FindAsync(admission.BedId);
            if (bed != null) bed.Status = BedStatus.Available;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}