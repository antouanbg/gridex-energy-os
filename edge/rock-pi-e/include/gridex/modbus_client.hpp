#pragma once

#include <cstdint>
#include <vector>

namespace gridex {

class ModbusClient {
 public:
  virtual ~ModbusClient() = default;

  virtual bool readCoil(std::uint16_t address) = 0;
  virtual std::uint16_t readHolding(std::uint16_t address) = 0;
  virtual std::vector<std::uint16_t> readInput(std::uint16_t address,
                                               std::uint16_t count) = 0;
  virtual void writeSingle(std::uint16_t address, std::uint16_t value) = 0;
};

}  // namespace gridex

