class Suspicion {
  constructor(combination,suspector) {
    this._combination=combination;
    this._suspector=suspector;
  }
  get combination(){
    return this._combination;
  }
  get suspector(){
    return this._suspector;
  }
}

module.exports = Suspicion;
