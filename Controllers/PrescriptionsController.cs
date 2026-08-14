using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrescriptionsController : ControllerBase
    {
        private readonly IPrescriptionService _service;

        public PrescriptionsController(IPrescriptionService service)
        {
            _service = service;
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<List<PrescriptionResponseDto>>> GetByPatient(Guid patientId)
        {
            return await _service.GetByPatientAsync(patientId);
        }

        [HttpPost]
        public async Task<ActionResult<PrescriptionResponseDto>> CreatePrescription(CreatePrescriptionDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }
    }
}