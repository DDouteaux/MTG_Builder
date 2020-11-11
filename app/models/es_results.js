class EsResult {
    constructor(setCode, numberAdded, numberUpdated, numberErrors) {
      this.setCode = setCode;
      this.numberAdded = numberAdded;
      this.numberUpdated = numberUpdated;
      this.numberErrors = numberErrors;
    }
}

module.exports = EsResult