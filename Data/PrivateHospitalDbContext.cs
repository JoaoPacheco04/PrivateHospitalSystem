using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Data
{
    public class PrivateHospitalDbContext : DbContext
    {
        public PrivateHospitalDbContext(DbContextOptions<PrivateHospitalDbContext> options)
            : base(options)
        {
        }

        public DbSet<Patient> Patients { get; set; }
        public DbSet<InsuranceProvider> InsuranceProviders { get; set; }
        public DbSet<InsuranceCoverage> InsuranceCoverages { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Specialty> Specialties { get; set; }
        public DbSet<DoctorSpecialty> DoctorSpecialties { get; set; }
        public DbSet<Bed> Beds { get; set; }
        public DbSet<Admission> Admissions { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<MedicalExam> MedicalExams { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<InsuranceCoverage>()
                .Property(c => c.CoveragePercentage)
                .HasPrecision(5, 2);
        }
    }
}