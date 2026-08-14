namespace PrivateHospitalSystem.DTOs
{
    public class CreatePrescriptionDto
    {
        public Guid PatientId {  get; set; }
        public Guid DoctorId { get; set; }
        public Guid? AppointmentId { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;

        public string Instructions { get; set;  } = string.Empty;
    }
}
