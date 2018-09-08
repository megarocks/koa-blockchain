const Block = require('./Block')
const cryptoJs = require('crypto-js')

class BlockChain {
  constructor () {
    this.blocks = [this.getGenesisBlock()]
  }

  static isValidBlock(block, prevBlock) {
    if (block.idx !== prevBlock.idx + 1) {
      return false
    }
    if (block.previousHash !== prevBlock.hash) {
      return false
    }
    const expectedHash = BlockChain.calculateHashForBlock(block)
    if (block.hash !== expectedHash) {
      return false
    }

    return true
  }

  static calculateHash(idx, timestamp, previousHash, data) {
    return cryptoJs.SHA256(
      String(idx)
      + String(timestamp)
      + String(previousHash)
      + JSON.stringify(data)
    ).toString()
  }

  static calculateHashForBlock(block) {
    return BlockChain.calculateHash(block.idx, block.timestamp, block.previousHash, block.data)
  }

  getGenesisBlock() {
    const genesisBlock = new Block(
      0,
      1524846795251,
      "0",
      "0",
      "node js bootcamp genesis block"
    )
    const genesisHash = BlockChain.calculateHashForBlock(genesisBlock)
    genesisBlock.hash = genesisHash
    return genesisBlock
  }

  getLatestBlock() {
    return this.blocks[this.blocks.length - 1]
  }

  generateNextBlock(data) {
    const prevBlock = this.getLatestBlock()
    const nextIdx = prevBlock.idx + 1
    const nextTimestamp = new Date().getTime()
    const nextHash = BlockChain.calculateHash(
      nextIdx,
      nextTimestamp,
      prevBlock.hash,
      data
    )
    return new Block(
      nextIdx, nextTimestamp, prevBlock.hash, nextHash, data
    )
  }

  addBlock(block) {
    const prevBlock = this.getLatestBlock()
    if (BlockChain.isValidBlock(block, prevBlock)) {
      this.blocks.push(block)
      return true
    } else {
      return false
    }
  }

}

module.exports = BlockChain