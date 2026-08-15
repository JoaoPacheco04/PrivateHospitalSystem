using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Data
{
    public class PrivateHospitalDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
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
        public DbSet<ProcedurePrice> ProcedurePrices { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Medication> Medications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<InsuranceCoverage>()
                .Property(c => c.CoveragePercentage)
                .HasPrecision(5, 2);

            modelBuilder.Entity<ProcedurePrice>()
                .Property(p => p.Price)
                .HasPrecision(10, 2);

            modelBuilder.Entity<Invoice>().Property(i => i.TotalAmount).HasPrecision(10, 2);
            modelBuilder.Entity<Invoice>().Property(i => i.InsuranceCoveredAmount).HasPrecision(10, 2);
            modelBuilder.Entity<Invoice>().Property(i => i.PatientAmount).HasPrecision(10, 2);
        }
    }
}