using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Doctor")]
    public class DischargeSummariesController : ControllerBase
    {
        private readonly IDischargeSummaryService _service;

        public DischargeSummariesController(IDischargeSummaryService service)
        {
            _service = service;
        }

        [HttpGet("admission/{admissionId}")]
        public async Task<ActionResult<DischargeSummaryResponseDto>> GetByAdmission(Guid admissionId)
        {
            var result = await _service.GetByAdmissionAsync(admissionId);
            if (result == null) return NotFound();
            return result;
        }

        [HttpPost]
        public async Task<ActionResult<DischargeSummaryResponseDto>> Create(CreateDischargeSummaryDto dto)
        {
            var (result, error) = await _service.CreateAsync(dto);
            if (error != null) return BadRequest(error);
            return Ok(result);
        }
    }
}