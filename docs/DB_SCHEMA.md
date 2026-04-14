# Database Schema

Database file: `AppData\Local\DentalApp\data.db`

---

## Table: records

All domain models stored as JSON blobs. One table for all entities.

```sql
CREATE TABLE IF NOT EXISTS records (
  id         TEXT    PRIMARY KEY,
  store      TEXT    NOT NULL,
  data       TEXT    NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_store ON records(store);
```

### store values
| Value          | Entity      |
|----------------|-------------|
| `patients`     | Patient     |
| `appointments` | Appointment |
| `doctors`      | Doctor      |
| `labworks`     | Labwork     |
| `expenses`     | Expense     |

---

## Table: settings

Global clinic settings. Admin-only write access.

```sql
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### Default rows
| key                  | default value                          | notes                          |
|----------------------|----------------------------------------|--------------------------------|
| currency             | DZD                                    |                                |
| clinic_name          | (empty)                                |                                |
| clinic_phone         | (empty)                                |                                |
| clinic_address       | (empty)                                |                                |
| doctor_speciality    | Chirurgien-Dentiste                    | printed on prescriptions       |
| prescription_footer  | (empty)                                | printed at bottom of Rx PDF    |
| start_day_of_wk      | saturday                               | Algeria week starts Saturday   |
| permissions          | [false,false,false,false,false,false]  | JSON array — 6 module flags    |

---

## Table: local_settings

Device-only preferences. Not included in backups.

```sql
CREATE TABLE IF NOT EXISTS local_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### Default rows
| key                | default value | notes                              |
|--------------------|---------------|------------------------------------|
| selected_locale    | ar            | ar / fr / en                       |
| date_format        | dd/MM/yyyy    |                                    |
| selected_theme     | light         | light / dark                       |
| license_key        | (empty)       |                                    |
| license_machine_id | (empty)       | stored after first validation      |
| license_valid      | false         |                                    |
| install_date       | (empty)       | ISO date string — set on first run |

---

## Table: users

```sql
CREATE TABLE IF NOT EXISTS users (
  id            TEXT    PRIMARY KEY,
  email         TEXT    UNIQUE NOT NULL,
  password_hash TEXT    NOT NULL,
  is_admin      INTEGER NOT NULL DEFAULT 0,
  name          TEXT,
  created_at    INTEGER
);
```

---

## JSON shapes — stored in records.data

### Patient
```json
{
  "id": "abc123def456789",
  "title": "Mohammed Benali",
  "archived": false,
  "birth": 1985,
  "gender": 1,
  "phone": "0555123456",
  "email": "",
  "address": "Alger",
  "tags": ["VIP", "orthodontie"],
  "notes": "",
  "teeth": {
    "11": "treated",
    "21": "missing"
  }
}
```

### Appointment
```json
{
  "id": "xyz789abc123456",
  "archived": false,
  "operatorsIDs": ["doctorId1"],
  "patientID": "abc123def456789",
  "preOpNotes": "",
  "postOpNotes": "",
  "prescriptions": ["Amoxicilline 500mg — 1 gélule × 3/jour pendant 7 jours"],
  "price": 5000,
  "paid": 5000,
  "paymentMethod": "cash",
  "imgs": ["xyz789abc123456/photo1.jpg"],
  "date": 28500000,
  "isDone": true
}
```

### Doctor
```json
{
  "id": "doc123456789012",
  "title": "Dr. Karim Meziane",
  "archived": false,
  "dutyDays": ["saturday", "sunday", "monday"],
  "email": "",
  "lockToUserIDs": []
}
```

### Labwork
```json
{
  "id": "lab123456789012",
  "title": "Couronne PFM — dent 16",
  "archived": false,
  "operatorsIDs": ["doc123456789012"],
  "patientID": "abc123def456789",
  "note": "",
  "paid": false,
  "price": 12000,
  "date": 28500100,
  "lab": "Laboratoire Dental Alger",
  "phoneNumber": "0550987654"
}
```

### Expense
```json
{
  "id": "exp123456789012",
  "title": "Consommables janvier",
  "archived": false,
  "note": "",
  "amount": 25000,
  "paid": true,
  "date": 28499000,
  "issuer": "MedSupply SARL",
  "phoneNumber": "",
  "items": ["Gants nitrile x500", "Masques x200"],
  "tags": ["consommables"],
  "operatorsIDs": []
}
```
