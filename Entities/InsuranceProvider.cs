using PrivateHospitalSystem.Entities;

public class InsuranceProvider
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<InsuranceCoverage> Coverages { get; set; } = new List<InsuranceCoverage>();
    public ICollection<Patient> Patients { get; set; } = new List<Patient>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}