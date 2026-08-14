namespace PrivateHospitalSystem.Entities
{
    public class Prescription
    {
        public Guid Id { get; set; }

        public Guid PatientId { get; set; }
        public Patient? Patient { get; set; }

        public Guid DoctorId { get; set; }
        public Doctor? Doctor { get; set; }

        public Guid? AppointmentId { get; set; }
        public Appointment? Appointment { get; set; }

        public string MedicationName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty; 
        public string Instructions { get; set; } = string.Empty; 

        public DateTime PrescribedAt { get; set; } = DateTime.UtcNow;
    }
}