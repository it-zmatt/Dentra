# Print Templates

## Prescription PDF structure
All PDFs rendered in French. Direction: LTR.

### Header
- Clinic name (from `settings.clinic_name`)
- Doctor name + speciality (from `settings.doctor_speciality`)
- Clinic address + phone (from `settings.clinic_address`, `settings.clinic_phone`)
- Date (dd/MM/yyyy format)

### Patient block
- "Patient:" + patient full name
- "Âge:" + computed age from birth year
- Horizontal rule

### Prescription body
- Each prescription line as free text (v1)
- Example: "Amoxicilline 500mg — 1 gélule × 3/jour pendant 7 jours"
- Structured fields (medication name, dosage, frequency, duration) are a v2 addition

### Footer
- `settings.prescription_footer` text
- "Signature du médecin:" + blank line

---

## Patient record print
Same French header as prescription.
Full patient info, appointment history summary, outstanding balance.

### Patient info block
- Full name, age, gender
- Phone, address
- Tags

### Appointment history
- Table: date | operator | price | paid | balance
- Total outstanding at bottom

### Outstanding balance
- Total price across all done appointments
- Total paid across all done appointments
- Difference (positive = underpaid, negative = overpaid)
