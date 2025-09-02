# Excel Template Guide for College Data Import

## 📁 **Expected Excel Structure**

Your Excel file should have the following sheets:

### 🏫 **Sheet 1: Colleges**
Required columns:
- `name` - College name (e.g., "A J Institute of Medical Sciences & Research Centre, Mangalore")
- `city` - City name (e.g., "Mangalore")
- `state` - State name (e.g., "Karnataka")
- `college_type` - Type of college (MEDICAL, DENTAL, DNB, MULTI, PARAMEDICAL)
- `management_type` - Management type (GOVERNMENT, PRIVATE, TRUST, DEEMED, AUTONOMOUS)

Optional columns:
- `code` - College code if available
- `district` - District name
- `address` - Full address
- `pincode` - 6-digit pincode
- `establishment_year` - Year college was established
- `university` - Affiliated university
- `website` - College website URL
- `email` - Contact email
- `phone` - Contact phone
- `accreditation` - MCI, DCI, NABH, etc.

### 📚 **Sheet 2: Programs**
Required columns:
- `college_name` - Must match exactly with college name from Colleges sheet
- `program_name` - Course name (e.g., "MBBS", "BDS", "MD General Medicine")
- `level` - Program level (UG, PG, DIPLOMA, FELLOWSHIP, CERTIFICATE)
- `course_type` - Course type (MEDICAL, DENTAL, DNB, PARAMEDICAL)
- `entrance_exam` - Required entrance exam (NEET, NEET-PG, AIIMS, JIPMER)

Optional columns:
- `specialization` - Specialization area (e.g., "General Medicine", "Surgery")
- `duration` - Duration in months (e.g., 66 for MBBS, 36 for MD)
- `total_seats` - Total seat capacity
- `fee_structure` - Fee information

### 📊 **Sheet 3: Cutoffs (Optional)**
This sheet is ready for when you have official quota data. Columns:
- `college_name` - Must match college name
- `program_name` - Must match program name
- `year` - Academic year (e.g., 2024)
- `round` - Counselling round (e.g., r1, r2)
- `authority` - Conducting authority (e.g., NEET)
- `quota` - Quota type (GENERAL, OBC, SC, ST, EWS, PWD)
- `category` - Category (GENERAL, OBC, SC, ST, EWS, PWD)
- `opening_rank` - Opening rank
- `closing_rank` - Closing rank
- `seats_available` - Seats available in this quota

## 📋 **Sample Data Format**

### Colleges Sheet Example:
| name | city | state | college_type | management_type | establishment_year |
|------|------|-------|--------------|-----------------|-------------------|
| A J Institute of Medical Sciences & Research Centre, Mangalore | Mangalore | Karnataka | MEDICAL | TRUST | 2002 |
| A.B. SHETTY MEMORIAL INSTITUTE OF DENTAL SCIENCES, MANGALORE | MANGALORE | KARNATAKA | DENTAL | PRIVATE | 1985 |

### Programs Sheet Example:
| college_name | program_name | level | course_type | entrance_exam | duration | total_seats |
|--------------|--------------|-------|-------------|---------------|----------|-------------|
| A J Institute of Medical Sciences & Research Centre, Mangalore | MBBS | UG | MEDICAL | NEET | 66 | 150 |
| A J Institute of Medical Sciences & Research Centre, Mangalore | MD General Medicine | PG | MEDICAL | NEET-PG | 36 | 20 |

## 🚀 **How to Use**

1. **Prepare your Excel file** with the above structure
2. **Run the import script**:
   ```bash
   node import-excel-data.js path/to/your/file.xlsx
   ```
3. **Check the validation report** for any errors
4. **Review the import summary** to see what was imported

## ✅ **Data Validation Features**

- **Automatic data cleaning** (trims whitespace, handles NA values)
- **State name standardization** (converts codes to full names)
- **Data type validation** (ensures numbers are numeric, emails are valid)
- **Relationship validation** (ensures programs link to existing colleges)
- **Error reporting** with row numbers and specific issues

## 🔧 **Tips for Best Results**

1. **Use consistent naming** - College names must match exactly between sheets
2. **Standardize values** - Use the exact values listed in the column descriptions
3. **Check for duplicates** - Remove duplicate college entries
4. **Validate data** - Ensure all required fields are filled
5. **Test with small sample** - Import a few records first to test the format

## 📞 **Need Help?**

If you encounter issues:
1. Check the validation error report (validation-errors.csv)
2. Ensure column names match exactly
3. Verify data types (numbers for numeric fields)
4. Check that college names are consistent between sheets
