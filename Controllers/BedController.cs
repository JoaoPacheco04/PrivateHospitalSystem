using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BedsController : ControllerBase
    {
        private readonly PrivateHospitalDbContext _context;

        public BedsController(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Bed>>> GetBeds()
        {
            return await _context.Beds.ToListAsync();
        }

        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<Bed>>> GetAvailableBeds()
        {
            return await _context.Beds
                .Where(b => b.Status == BedStatus.Available)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Bed>> GetBed(Guid id)
        {
            var bed = await _context.Beds.FindAsync(id);
            if (bed == null) return NotFound();
            return bed;
        }

        [HttpPost]
        public async Task<ActionResult<Bed>> CreateBed(Bed bed)
        {
            bed.Id = Guid.NewGuid();
            _context.Beds.Add(bed);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBed), new { id = bed.Id }, bed);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBed(Guid id, Bed bed)
        {
            if (id != bed.Id) return BadRequest();

            _context.Entry(bed).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}