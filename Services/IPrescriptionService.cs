using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IPrescriptionService
    {
        Task<List<PrescriptionResponseDto>> GetByPatientAsync(Guid patientId);
        Task<PrescriptionResponseDto> CreateAsync(CreatePrescriptionDto dto);
    }
}