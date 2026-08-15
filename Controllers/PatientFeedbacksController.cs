using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientFeedbacksController : ControllerBase
    {
        private readonly IPatientFeedbackService _service;

        public PatientFeedbacksController(IPatientFeedbackService service)
        {
            _service = service;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<List<PatientFeedbackResponseDto>>> GetAll()
        {
            return await _service.GetAllAsync();
        }

        [HttpGet("average-rating")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<double>> GetAverageRating()
        {
            return await _service.GetAverageRatingAsync();
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Staff,Patient")]
        public async Task<ActionResult<PatientFeedbackResponseDto>> Create(CreatePatientFeedbackDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }
    }
}