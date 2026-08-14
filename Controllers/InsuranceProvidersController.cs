using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InsuranceProvidersController : ControllerBase
    {
            private readonly PrivateHospitalDbContext _context;
        public InsuranceProvidersController (PrivateHospitalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InsuranceProvider>>> GetInsuranceProviders()
        {
            return await _context.InsuranceProviders.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InsuranceProvider>> GetInsuranceProvider(Guid id)
        {
            var provider = await _context.InsuranceProviders
                .Include(p => p.Coverages)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (provider == null)
                return NotFound();

            return provider;
        }

        [HttpPost]
        public async Task<ActionResult<InsuranceProvider>> CreateInsuranceProvider(InsuranceProvider provider)
        {
            provider.Id = Guid.NewGuid();
            _context.InsuranceProviders.Add(provider);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInsuranceProvider), new { id = provider.Id }, provider);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInsuranceProvider(Guid id, InsuranceProvider provider)
        {
            if (id != provider.Id)
                return BadRequest();

            _context.Entry(provider).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInsuranceProvider(Guid id)
        {
            var provider = await _context.InsuranceProviders.FindAsync(id);
            if (provider == null) return NotFound();

            _context.InsuranceProviders.Remove(provider);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
