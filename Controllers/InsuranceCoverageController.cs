using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InsuranceCoveragesController : ControllerBase
    {
        private readonly PrivateHospitalDbContext _context;

        public InsuranceCoveragesController(PrivateHospitalDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<InsuranceCoverage>>> GetInsuranceCoverages()
        {
            return await _context.InsuranceCoverages.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InsuranceCoverage>> GetInsuranceCoverage(Guid id)
        {
            var coverage = await _context.InsuranceCoverages
                .Include(c => c.InsuranceProvider)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (coverage == null)
                return NotFound();

            return coverage;
        }

        [HttpPost]
        public async Task<ActionResult<InsuranceCoverage>> CreateInsuranceCoverage(InsuranceCoverage coverage)
        {
            coverage.Id = Guid.NewGuid();
            _context.InsuranceCoverages.Add(coverage);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInsuranceCoverage), new { id = coverage.Id }, coverage);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInsuranceCoverage(Guid id, InsuranceCoverage coverage)
        {
            if (id != coverage.Id)
                return BadRequest();

            _context.Entry(coverage).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInsuranceCoverage(Guid id)
        {
            var coverage = await _context.InsuranceCoverages.FindAsync(id);
            if (coverage == null) return NotFound();

            _context.InsuranceCoverages.Remove(coverage);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
