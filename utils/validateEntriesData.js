function checkObject(data) {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new Error("Data must be an object")
    }
  }
  function checkMisssingAndUnexpectedKeys(expectedKeys,dataKeys) {
    const missingKeys = expectedKeys.filter((key) => !dataKeys.include(key))
    if (missingKeys.length > 0) {
      throw new Error(`Missing values ${missingKeys.join(", ")}`);
    }
  
    const unexpectedKeys = dataKeys.filter((key) => !expectedKeys.includes(key))
    if (unexpectedKeys.length > 0) {
      throw new Error(`Unexpected values ${unexpectedKeys.join(", ")}`)
    }
  }
  
  export default function validateEntriesData(data) {
    checkObject(data);
    const expectedKeys = [
      "entry_date",
      "description",
      "latitude",
      "longitude"
    ];
  
    const dataKeys = Object.keys(data)
  
    checkMisssingAndUnexpectedKeys(expectedKeys, dataKeys);
  
    const { entry_date, description, latitude, longitude } = data;
  
    if (typeof entry_date !== "string" || isNaN(Date.parse(entry_date))) {
      throw new Error(
        "entry_date valide date string"
      )
    }
  
    if (typeof description !== "string" || description.trim() === "" || description.length > 255) {
      throw new Error(
        "Description must be a non-empty string with value 255 "
      )
    }
  
    if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
      throw new Error("Latitude must be a number between -90 and 90");
    }
  
    if (typeof longitude !== "number" || longitude < -180 || longitude > 180) {
      throw new Error("Longitude must be a number between -180 and 180");
    }
  }