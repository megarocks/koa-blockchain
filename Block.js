class Block {
  constructor(idx, timestamp, previousHash, hash, data) {
    this.idx = idx
    this.timestamp = timestamp
    this.previousHash = previousHash
    this.hash = hash
    this.data = data
  }
}

module.exports = Block